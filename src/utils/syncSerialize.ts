// 同步数据的序列化：分类/店铺各一文件，记录按月分片；生成 manifest（含内容哈希）。
// JSON.stringify 会把 Date 转 ISO 字符串，恢复时须 revive 回 Date，否则破坏 Dexie 的 date 索引排序。

import type { Place, Review, CustomCategory } from '@/types'

export const SYNC_SCHEMA_VERSION = 1

export interface SyncFileEntry {
  path: string
  hash: string
  count: number
  size: number
}

export interface SyncManifest {
  schemaVersion: number
  appVersion: string
  lastSync: string
  files: SyncFileEntry[]
}

export interface SyncBundle {
  categories: CustomCategory[]
  places: Place[]
  reviews: Review[]
}

export interface RawFile {
  path: string
  text: string
  count: number
}

// 记录归属月份 key：优先 date，缺失兜底 createdAt
function monthKey(d: Date | string | undefined): string {
  const date = d instanceof Date ? d : new Date(d ?? 0)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// 本地数据 → 待写文件列表（分类、店铺各一，记录按月分片；空记录不产出分片）
export function buildFiles(bundle: SyncBundle): RawFile[] {
  const out: RawFile[] = [
    { path: 'categories.json', text: JSON.stringify(bundle.categories), count: bundle.categories.length },
    { path: 'places.json', text: JSON.stringify(bundle.places), count: bundle.places.length },
  ]
  const byMonth = new Map<string, Review[]>()
  for (const r of bundle.reviews) {
    const k = monthKey(r.date ?? r.createdAt)
    const list = byMonth.get(k)
    if (list) list.push(r)
    else byMonth.set(k, [r])
  }
  for (const k of [...byMonth.keys()].sort()) {
    const list = byMonth.get(k)!
    out.push({ path: `reviews/${k}.json`, text: JSON.stringify(list), count: list.length })
  }
  return out
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

export async function buildManifest(files: RawFile[], appVersion: string, lastSync: string): Promise<SyncManifest> {
  const entries: SyncFileEntry[] = []
  for (const f of files) {
    entries.push({ path: f.path, hash: await sha256Hex(f.text), count: f.count, size: byteLength(f.text) })
  }
  return { schemaVersion: SYNC_SCHEMA_VERSION, appVersion, lastSync, files: entries }
}

// ---- 恢复方向：解析文件文本 → bundle，并把日期字段 revive 回 Date ----

function reviveCategory(c: CustomCategory): CustomCategory {
  return { ...c, createdAt: new Date(c.createdAt) }
}
function revivePlace(p: Place): Place {
  return { ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) }
}
function reviveReview(r: Review): Review {
  return { ...r, date: new Date(r.date), createdAt: new Date(r.createdAt) }
}

export function parseBundle(fileTexts: Map<string, string>): SyncBundle {
  const categories = (JSON.parse(fileTexts.get('categories.json') ?? '[]') as CustomCategory[]).map(reviveCategory)
  const places = (JSON.parse(fileTexts.get('places.json') ?? '[]') as Place[]).map(revivePlace)
  const reviews: Review[] = []
  for (const [path, text] of fileTexts) {
    if (path.startsWith('reviews/')) {
      reviews.push(...(JSON.parse(text) as Review[]).map(reviveReview))
    }
  }
  return { categories, places, reviews }
}
