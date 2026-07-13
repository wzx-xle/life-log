import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebdavSync } from './useWebdavSync'
import { db } from '@/db'
import type { Place, Review, CustomCategory } from '@/types'
import type { SyncManifest } from '@/utils/syncSerialize'

// 内存 WebDAV mock：用 Map 当存储，处理 PROPFIND/MKCOL/PUT/GET/DELETE
function createMockDav() {
  const store = new Map<string, string>()
  const puts: string[] = []
  const resp = (status: number, body = ''): Response =>
    ({ ok: status >= 200 && status < 300, status, text: async () => body } as unknown as Response)

  const fetchImpl = vi.fn(async (url: string, init: any) => {
    const path = new URL(url).pathname
    switch (init.method) {
      case 'MKCOL':
        return resp(201)
      case 'PROPFIND':
        return store.has(path) ? resp(207) : resp(404)
      case 'PUT':
        store.set(path, init.body as string)
        puts.push(path)
        return resp(201)
      case 'GET': {
        const t = store.get(path)
        return t === undefined ? resp(404) : resp(200, t)
      }
      case 'DELETE':
        store.delete(path)
        return resp(204)
      default:
        return resp(405)
    }
  })
  return { store, puts, fetchImpl }
}

// 用无额外路径的 host，使 mock 存储键即 /lifelog/... 便于断言
const config = { url: 'https://nas.test', username: 'u', password: 'p', rootPath: '/lifelog/' }

const cat: CustomCategory = { id: 1, name: '餐饮', color: '#FF6B35', createdAt: new Date('2026-01-01') }
const place: Place = {
  id: 10, name: '来今雨轩', category: 'restaurant', address: '中山公园', lat: 39.9, lng: 116.3,
  createdAt: new Date('2026-06-01'), updatedAt: new Date('2026-06-02'),
}
const rJul: Review = { id: 100, placeId: 10, date: new Date('2026-07-15'), rating: { overall: 5 }, createdAt: new Date('2026-07-15') }
const rJun: Review = { id: 101, placeId: 10, date: new Date('2026-06-20'), rating: { overall: 4 }, createdAt: new Date('2026-06-20') }

async function seed() {
  await db.customCategories.clear(); await db.places.clear(); await db.reviews.clear()
  await db.customCategories.bulkPut([cat])
  await db.places.bulkPut([place])
  await db.reviews.bulkPut([rJul, rJun])
}

describe('useWebdavSync 端到端编排（内存 WebDAV）', () => {
  let dav: ReturnType<typeof createMockDav>

  beforeEach(async () => {
    localStorage.clear()
    dav = createMockDav()
    vi.stubGlobal('fetch', dav.fetchImpl)
    localStorage.setItem('lifelog_webdav', JSON.stringify(config))
    await seed()
  })
  afterEach(() => vi.unstubAllGlobals())

  it('上传产出 manifest 与各分文件', async () => {
    const { upload } = useWebdavSync()
    await upload()
    const paths = [...dav.store.keys()]
    expect(paths).toContain('/lifelog/manifest.json')
    expect(paths).toContain('/lifelog/categories.json')
    expect(paths).toContain('/lifelog/places.json')
    expect(paths).toContain('/lifelog/reviews/2026-07.json')
    expect(paths).toContain('/lifelog/reviews/2026-06.json')
    // manifest 记录所有数据文件
    const m = JSON.parse(dav.store.get('/lifelog/manifest.json')!) as SyncManifest
    expect(m.files.map((f) => f.path).sort()).toEqual(
      ['categories.json', 'places.json', 'reviews/2026-06.json', 'reviews/2026-07.json'],
    )
  })

  it('增量：仅改动某月记录时只重传该分片与 manifest', async () => {
    const { upload } = useWebdavSync()
    await upload() // 首次全量
    dav.puts.length = 0 // 清空计数

    // 改动 7 月的一条记录
    await db.reviews.update(100, { rating: { overall: 3 } })
    await upload()

    expect(dav.puts).toContain('/lifelog/reviews/2026-07.json')
    expect(dav.puts).toContain('/lifelog/manifest.json')
    // 未变化的分片/文件不重传
    expect(dav.puts).not.toContain('/lifelog/reviews/2026-06.json')
    expect(dav.puts).not.toContain('/lifelog/categories.json')
    expect(dav.puts).not.toContain('/lifelog/places.json')
  })

  it('删除整月记录后再上传会清理陈旧分片', async () => {
    const { upload } = useWebdavSync()
    await upload()
    expect(dav.store.has('/lifelog/reviews/2026-06.json')).toBe(true)

    await db.reviews.delete(101) // 删掉 6 月唯一记录
    await upload()

    expect(dav.store.has('/lifelog/reviews/2026-06.json')).toBe(false)
    const m = JSON.parse(dav.store.get('/lifelog/manifest.json')!) as SyncManifest
    expect(m.files.some((f) => f.path === 'reviews/2026-06.json')).toBe(false)
  })

  it('恢复覆盖本地并保留 id 与引用', async () => {
    const { upload, restore } = useWebdavSync()
    await upload()

    // 破坏本地：清空 + 塞入不相干数据
    await db.customCategories.clear(); await db.places.clear(); await db.reviews.clear()
    await db.places.bulkPut([{ ...place, id: 999, name: '脏数据' }])

    await restore()

    const places = await db.places.toArray()
    const reviews = await db.reviews.toArray()
    const cats = await db.customCategories.toArray()
    expect(cats).toHaveLength(1)
    expect(places.map((p) => p.id).sort()).toEqual([10]) // 脏数据被覆盖清除
    expect(reviews).toHaveLength(2)
    // 引用完整 + 日期 revive
    const jul = reviews.find((r) => r.id === 100)!
    expect(jul.placeId).toBe(10)
    expect(jul.date).toBeInstanceOf(Date)
  })

  it('校验失败时中止恢复且不写本地', async () => {
    const { upload, restore } = useWebdavSync()
    await upload()
    // 篡改远端 places.json 但不更新 manifest → 哈希不符
    dav.store.set('/lifelog/places.json', '[]')

    await seed() // 本地已知数据
    await expect(restore()).rejects.toThrow(/校验失败/)

    // 本地未被部分写入，仍是种子数据
    expect(await db.places.count()).toBe(1)
    expect(await db.reviews.count()).toBe(2)
  })
})
