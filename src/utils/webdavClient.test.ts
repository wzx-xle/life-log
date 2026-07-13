import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WebdavClient, WebdavError, basicAuthHeader } from './webdavClient'

const config = {
  url: 'https://nas.example.com/dav/',
  username: 'lifelog',
  password: 'p@ss',
  rootPath: '/lifelog/',
}

function res(status: number, body = ''): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  } as unknown as Response
}

describe('webdavClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  describe('basicAuthHeader', () => {
    it('拼接 Basic 头并支持非 ASCII', () => {
      expect(basicAuthHeader('a', 'b')).toBe(`Basic ${btoa('a:b')}`)
      // 中文密码不抛错且可解码回原文
      const h = basicAuthHeader('用户', '密码')
      expect(h.startsWith('Basic ')).toBe(true)
      const decoded = new TextDecoder().decode(
        Uint8Array.from(atob(h.slice(6)), (c) => c.charCodeAt(0)),
      )
      expect(decoded).toBe('用户:密码')
    })
  })

  it('每个请求带 Authorization 头', async () => {
    fetchMock.mockResolvedValue(res(207))
    const client = new WebdavClient(config)
    await client.exists('manifest.json')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBe(basicAuthHeader('lifelog', 'p@ss'))
  })

  it('URL 拼接去重斜杠并落在根目录下', async () => {
    fetchMock.mockResolvedValue(res(200, '{}'))
    const client = new WebdavClient(config)
    await client.get('reviews/2026-07.json')
    const [url] = fetchMock.mock.calls[0]
    expect(url).toBe('https://nas.example.com/dav/lifelog/reviews/2026-07.json')
  })

  describe('exists', () => {
    it('207 → true', async () => {
      fetchMock.mockResolvedValue(res(207))
      expect(await new WebdavClient(config).exists('x.json')).toBe(true)
    })
    it('404 → false', async () => {
      fetchMock.mockResolvedValue(res(404))
      expect(await new WebdavClient(config).exists('x.json')).toBe(false)
    })
  })

  describe('get', () => {
    it('404 → null', async () => {
      fetchMock.mockResolvedValue(res(404))
      expect(await new WebdavClient(config).get('x.json')).toBeNull()
    })
    it('200 → 文本', async () => {
      fetchMock.mockResolvedValue(res(200, '{"a":1}'))
      expect(await new WebdavClient(config).get('x.json')).toBe('{"a":1}')
    })
  })

  describe('错误分类', () => {
    it('fetch reject → network（CORS/网络不可区分）', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
      await expect(new WebdavClient(config).get('x.json')).rejects.toMatchObject({
        name: 'WebdavError',
        kind: 'network',
      })
    })
    it('401 → auth', async () => {
      fetchMock.mockResolvedValue(res(401))
      await expect(new WebdavClient(config).get('x.json')).rejects.toMatchObject({ kind: 'auth' })
    })
    it('500 PUT → http', async () => {
      fetchMock.mockResolvedValue(res(500))
      await expect(new WebdavClient(config).put('x.json', '{}')).rejects.toBeInstanceOf(WebdavError)
    })
  })

  describe('ensureDir', () => {
    it('逐级 MKCOL 根与子目录，405 已存在被忽略', async () => {
      fetchMock.mockResolvedValue(res(405)) // 全部已存在
      const client = new WebdavClient(config)
      await client.ensureDir('reviews')
      const calls = fetchMock.mock.calls.map(([u, i]) => `${i.method} ${u}`)
      expect(calls).toContain('MKCOL https://nas.example.com/dav/lifelog/')
      expect(calls).toContain('MKCOL https://nas.example.com/dav/lifelog/reviews/')
    })
  })
})
