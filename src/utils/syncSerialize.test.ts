import { describe, it, expect } from 'vitest'
import { buildFiles, buildManifest, parseBundle, sha256Hex, SYNC_SCHEMA_VERSION } from './syncSerialize'
import type { Place, Review, CustomCategory } from '@/types'

const cat: CustomCategory = { id: 1, name: '餐饮', color: '#FF6B35', createdAt: new Date('2026-01-01T00:00:00Z') }
const place: Place = {
  id: 10, name: '来今雨轩', category: 'restaurant', address: '中山公园',
  lat: 39.9, lng: 116.3, createdAt: new Date('2026-06-01T00:00:00Z'), updatedAt: new Date('2026-06-02T00:00:00Z'),
}
const rJul: Review = { id: 100, placeId: 10, date: new Date('2026-07-15T10:00:00Z'), rating: { overall: 5 }, createdAt: new Date('2026-07-15T10:00:00Z') }
const rJun: Review = { id: 101, placeId: 10, date: new Date('2026-06-20T10:00:00Z'), rating: { overall: 4 }, createdAt: new Date('2026-06-20T10:00:00Z') }

describe('syncSerialize', () => {
  describe('buildFiles', () => {
    it('分类/店铺各一文件，记录按月分片', () => {
      const files = buildFiles({ categories: [cat], places: [place], reviews: [rJul, rJun] })
      const paths = files.map((f) => f.path)
      expect(paths).toContain('categories.json')
      expect(paths).toContain('places.json')
      expect(paths).toContain('reviews/2026-07.json')
      expect(paths).toContain('reviews/2026-06.json')
      // 归月正确
      const jul = files.find((f) => f.path === 'reviews/2026-07.json')!
      expect(jul.count).toBe(1)
      expect(JSON.parse(jul.text)[0].id).toBe(100)
    })

    it('空记录不产出记录分片', () => {
      const files = buildFiles({ categories: [], places: [], reviews: [] })
      expect(files.map((f) => f.path)).toEqual(['categories.json', 'places.json'])
      expect(files.some((f) => f.path.startsWith('reviews/'))).toBe(false)
    })
  })

  describe('buildManifest', () => {
    it('结构完整且哈希稳定', async () => {
      const files = buildFiles({ categories: [cat], places: [place], reviews: [rJul] })
      const m = await buildManifest(files, '1.0.4', '2026-07-11T00:00:00Z')
      expect(m.schemaVersion).toBe(SYNC_SCHEMA_VERSION)
      expect(m.appVersion).toBe('1.0.4')
      expect(m.files).toHaveLength(3)
      const catEntry = m.files.find((f) => f.path === 'categories.json')!
      expect(catEntry.hash).toBe(await sha256Hex(files.find((f) => f.path === 'categories.json')!.text))
      expect(catEntry.size).toBeGreaterThan(0)
    })

    it('内容不变则哈希不变', async () => {
      const a = buildFiles({ categories: [cat], places: [place], reviews: [rJul] })
      const b = buildFiles({ categories: [cat], places: [place], reviews: [rJul] })
      const ma = await buildManifest(a, '1.0.4', 'x')
      const mb = await buildManifest(b, '1.0.4', 'y') // lastSync 不同不影响文件哈希
      expect(ma.files.map((f) => f.hash)).toEqual(mb.files.map((f) => f.hash))
    })
  })

  describe('parseBundle round-trip', () => {
    it('往返后数据一致且日期 revive 为 Date', () => {
      const files = buildFiles({ categories: [cat], places: [place], reviews: [rJul, rJun] })
      const map = new Map(files.map((f) => [f.path, f.text]))
      const bundle = parseBundle(map)

      expect(bundle.categories).toHaveLength(1)
      expect(bundle.places).toHaveLength(1)
      expect(bundle.reviews).toHaveLength(2)

      // 日期是 Date 实例，且值正确
      expect(bundle.reviews[0].date).toBeInstanceOf(Date)
      expect(bundle.places[0].createdAt).toBeInstanceOf(Date)
      expect(bundle.categories[0].createdAt).toBeInstanceOf(Date)
      const jul = bundle.reviews.find((r) => r.id === 100)!
      expect(jul.date.getTime()).toBe(rJul.date.getTime())
      // 引用关系保留
      expect(jul.placeId).toBe(place.id)
    })
  })
})
