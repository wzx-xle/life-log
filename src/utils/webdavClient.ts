// 极简 WebDAV 客户端：只覆盖同步所需的动作（propfind/mkcol/put/get/delete/exists）。
// 纯 fetch 实现，不引第三方库；浏览器直连需服务端放行 CORS（含 PROPFIND/PUT/MKCOL 与 Authorization 头）。

export interface WebdavConfig {
  url: string // 服务基础地址，如 https://nas.example.com/dav
  username: string
  password: string
  rootPath: string // 数据根目录，如 /lifelog/
}

export type WebdavErrorKind = 'network' | 'auth' | 'notfound' | 'http' | 'unknown'

export class WebdavError extends Error {
  kind: WebdavErrorKind
  status?: number
  constructor(kind: WebdavErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'WebdavError'
    this.kind = kind
    this.status = status
  }
}

// Basic Auth 头，兼容非 ASCII 账号/密码（先 UTF-8 编码再 base64）。
export function basicAuthHeader(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return `Basic ${btoa(binary)}`
}

// 规范化路径拼接：去重斜杠，保留末尾斜杠语义由调用方控制。
function joinPath(...parts: string[]): string {
  const joined = parts.join('/').replace(/\/{2,}/g, '/')
  return joined.startsWith('/') ? joined : `/${joined}`
}

export class WebdavClient {
  private base: string // 去掉尾斜杠的基础地址
  private root: string // 以 / 开头结尾的根目录
  private auth: string

  constructor(config: WebdavConfig) {
    this.base = config.url.replace(/\/+$/, '')
    const r = config.rootPath.trim() || '/'
    this.root = `/${r.replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/')
    this.auth = basicAuthHeader(config.username, config.password)
  }

  // 相对根目录的资源完整 URL
  private urlFor(rel: string): string {
    return this.base + joinPath(this.root, rel)
  }

  private async request(method: string, url: string, body?: BodyInit, headers?: Record<string, string>): Promise<Response> {
    let res: Response
    try {
      res = await fetch(url, {
        method,
        headers: { Authorization: this.auth, ...headers },
        body,
      })
    } catch {
      // 浏览器层面 CORS 失败与网络不可达都表现为 TypeError: Failed to fetch，无法程序化区分。
      throw new WebdavError('network', '网络不可达或服务端未放行跨域(CORS)')
    }
    if (res.status === 401 || res.status === 403) {
      throw new WebdavError('auth', '认证失败，请检查账号或密码', res.status)
    }
    return res
  }

  // 判断资源是否存在（PROPFIND depth 0，404 视为不存在）
  async exists(rel: string): Promise<boolean> {
    const res = await this.request('PROPFIND', this.urlFor(rel), undefined, { Depth: '0' })
    if (res.status === 404) return false
    if (res.ok || res.status === 207) return true
    throw new WebdavError('http', `PROPFIND 失败 (${res.status})`, res.status)
  }

  // 创建集合（目录）；逐级创建从根到 rel 的所有层级，已存在(405/301)忽略。
  async ensureDir(rel = ''): Promise<void> {
    const full = joinPath(this.root, rel)
    const segs = full.split('/').filter(Boolean)
    let acc = ''
    for (const s of segs) {
      acc += `/${s}`
      const res = await this.request('MKCOL', this.base + `${acc}/`)
      // 201 创建成功；405/301 已存在；其它非 2xx 视为错误
      if (!res.ok && res.status !== 405 && res.status !== 301) {
        throw new WebdavError('http', `创建目录失败 ${acc} (${res.status})`, res.status)
      }
    }
  }

  async put(rel: string, text: string): Promise<void> {
    const res = await this.request('PUT', this.urlFor(rel), text, { 'Content-Type': 'application/json; charset=utf-8' })
    if (!res.ok) throw new WebdavError('http', `上传失败 ${rel} (${res.status})`, res.status)
  }

  // 读取文本；404 返回 null
  async get(rel: string): Promise<string | null> {
    const res = await this.request('GET', this.urlFor(rel))
    if (res.status === 404) return null
    if (!res.ok) throw new WebdavError('http', `下载失败 ${rel} (${res.status})`, res.status)
    return res.text()
  }

  async delete(rel: string): Promise<void> {
    const res = await this.request('DELETE', this.urlFor(rel))
    // 404 视为已不存在，成功
    if (!res.ok && res.status !== 404) throw new WebdavError('http', `删除失败 ${rel} (${res.status})`, res.status)
  }
}
