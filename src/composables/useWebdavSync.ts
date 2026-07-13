// WebDAV 单向同步编排：上传（按哈希增量）/ 下载覆盖恢复 / 连接测试 / 本地配置与上次同步时间。
import { db } from '@/db'
import { WebdavClient, type WebdavConfig } from '@/utils/webdavClient'
import {
  buildFiles,
  buildManifest,
  parseBundle,
  sha256Hex,
  type SyncManifest,
} from '@/utils/syncSerialize'

// 与 package.json / exportData 保持一致（仅作 manifest 信息展示）
const APP_VERSION = '1.0.5'
const CONFIG_KEY = 'lifelog_webdav'
const LASTSYNC_KEY = 'lifelog_webdav_lastsync'

export interface LastSync {
  time: string // ISO
  action: 'upload' | 'restore'
}

// 进度回调：当前完成数 / 总数 / 当前文件标签
export type SyncProgress = (current: number, total: number, label: string) => void

export function useWebdavSync() {
  const getConfig = (): WebdavConfig | null => {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as WebdavConfig
    } catch {
      return null
    }
  }

  const saveConfig = (cfg: WebdavConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
  }

  const isConfigured = (): boolean => {
    const c = getConfig()
    return !!c && !!c.url && !!c.username
  }

  const getLastSync = (): LastSync | null => {
    const raw = localStorage.getItem(LASTSYNC_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as LastSync
    } catch {
      return null
    }
  }

  const setLastSync = (action: 'upload' | 'restore') => {
    localStorage.setItem(LASTSYNC_KEY, JSON.stringify({ time: new Date().toISOString(), action }))
  }

  // 连接测试：能完成一次 PROPFIND（无论根目录是否已存在）即视为凭证与网络可达。
  // 失败会抛 WebdavError（kind: network/auth/http），交由 UI 区分提示。
  const testConnection = async (cfg: WebdavConfig): Promise<void> => {
    const client = new WebdavClient(cfg)
    await client.exists('') // 404（根未建）也算连通，不抛错
  }

  const readBundle = async () => ({
    categories: await db.customCategories.toArray(),
    places: await db.places.toArray(),
    reviews: await db.reviews.toArray(),
  })

  // 上传：本地为准，按哈希仅传变化分片，清理陈旧记录分片，最后写 manifest。
  const upload = async (onProgress?: SyncProgress): Promise<void> => {
    const cfg = getConfig()
    if (!cfg) throw new Error('未配置 WebDAV')
    const client = new WebdavClient(cfg)

    const bundle = await readBundle()
    const files = buildFiles(bundle)
    const manifest = await buildManifest(files, APP_VERSION, new Date().toISOString())
    const localEntry = new Map(manifest.files.map((e) => [e.path, e]))

    // 确保根与 reviews 目录存在
    await client.ensureDir('reviews')

    // 拉远端 manifest 做哈希对比
    const remoteText = await client.get('manifest.json')
    const remote: SyncManifest | null = remoteText ? (JSON.parse(remoteText) as SyncManifest) : null
    const remoteHash = new Map((remote?.files ?? []).map((e) => [e.path, e.hash]))

    const changed = files.filter((f) => remoteHash.get(f.path) !== localEntry.get(f.path)!.hash)
    const localPaths = new Set(files.map((f) => f.path))
    const stale = (remote?.files ?? []).filter((e) => e.path.startsWith('reviews/') && !localPaths.has(e.path))

    const total = changed.length + stale.length + 1 // +1: manifest
    let done = 0

    for (const f of changed) {
      await client.put(f.path, f.text)
      onProgress?.(++done, total, f.path)
    }
    for (const e of stale) {
      await client.delete(e.path)
      onProgress?.(++done, total, `删除 ${e.path}`)
    }
    await client.put('manifest.json', JSON.stringify(manifest))
    onProgress?.(++done, total, 'manifest.json')

    setLastSync('upload')
  }

  // 下载恢复：校验哈希后，事务内清空并覆盖写本地（保留主键 id 维持引用）。破坏性操作，UI 需先确认。
  const restore = async (onProgress?: SyncProgress): Promise<void> => {
    const cfg = getConfig()
    if (!cfg) throw new Error('未配置 WebDAV')
    const client = new WebdavClient(cfg)

    const manifestText = await client.get('manifest.json')
    if (!manifestText) throw new Error('云端没有可恢复的备份')
    const manifest = JSON.parse(manifestText) as SyncManifest

    const total = manifest.files.length + 1 // +1: 写入本地
    let done = 0
    const fileTexts = new Map<string, string>()
    for (const entry of manifest.files) {
      const text = await client.get(entry.path)
      if (text === null) throw new Error(`云端缺少文件：${entry.path}`)
      if ((await sha256Hex(text)) !== entry.hash) throw new Error(`文件校验失败：${entry.path}`)
      fileTexts.set(entry.path, text)
      onProgress?.(++done, total, entry.path)
    }

    const bundle = parseBundle(fileTexts)
    await db.transaction('rw', db.customCategories, db.places, db.reviews, async () => {
      await db.customCategories.clear()
      await db.places.clear()
      await db.reviews.clear()
      await db.customCategories.bulkPut(bundle.categories)
      await db.places.bulkPut(bundle.places)
      await db.reviews.bulkPut(bundle.reviews)
    })
    onProgress?.(++done, total, '写入本地')

    setLastSync('restore')
  }

  return { getConfig, saveConfig, isConfigured, getLastSync, testConnection, upload, restore }
}
