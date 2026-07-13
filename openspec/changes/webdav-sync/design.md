## Context

应用是纯前端 SPA：Vue 3 + Dexie(IndexedDB)，静态托管，无自有后端。三张表 `places`、`reviews`、`customCategories`；照片以 base64 存于 `photos[]`。已有 `useExport`（下载 JSON）/`useImport`（合并/覆盖导入），但导出漏了 `customCategories`。

用户诉求：把数据备份到自有 WebDAV（群晖/自建），换设备可恢复。已确认：**单向备份/恢复**（非双向）、**含照片**、目标服务可自行放行 CORS。

关键约束：
- **CORS**：浏览器发 WebDAV 请求属跨域，服务端须返回 `Access-Control-Allow-*`（含对 `PROPFIND/PUT/MKCOL` 与 `Authorization` 头的放行）。群晖/反代可配置；否则需自建代理。此为用户侧前置条件。
- **无服务端逻辑**：一切在浏览器完成，凭证只能存本地。
- **照片体积大**：单一 reviews 文件会膨胀，故按月分片 + 按哈希增量上传。

## Goals / Non-Goals

**Goals:**
- 配置并校验 WebDAV 连接（地址/账号/密码、测试连接）。
- 上传：本地数据 → WebDAV，分文件存放，仅传变化分片。
- 下载恢复：WebDAV → 本地，覆盖式，恢复前二次确认。
- 分类/店铺/记录分文件，记录按 `YYYY-MM` 分片，照片随记录同步。
- 补齐自定义分类的备份。

**Non-Goals:**
- 不做双向增量同步、不做冲突自动合并（多设备「最后上传为准」）。
- 不做自动定时后台同步（首版仅手动触发；预留「上次同步时间」展示）。
- 不做端到端加密（凭证与数据明文/弱混淆存储，文档标注风险）。
- 不实现 CORS 代理（仅在文档给出方案，由用户在服务端解决）。

## Decisions

**决策 1：WebDAV 客户端自己用 `fetch` 实现，不引第三方库。**
- 只需少数动作：`PROPFIND`（列目录/判存在）、`MKCOL`（建目录）、`PUT`（写文件）、`GET`（读文件）、`DELETE`（清理陈旧分片）。Basic Auth = `Authorization: Basic base64(user:pass)`。
- 备选：引入 `webdav` npm 库——弃用，体积与依赖不值当，且其对浏览器 CORS 无帮助。

**决策 2：WebDAV 上的文件布局。**
```
<root>/                       # 用户配置的根目录，如 /lifelog/
  manifest.json               # 清单：schema 版本、appVersion、lastSync、files[]{path,hash,count,size}
  categories.json             # CustomCategory[]
  places.json                 # Place[]
  reviews/
    2026-07.json              # 该月 Review[]（含 base64 照片）
    2026-06.json
    ...
```
- 记录按 `review.date` 的 `YYYY-MM` 分片；无 date 兜底用 `createdAt`。
- `manifest.json` 是同步的权威索引：每个数据文件记录内容哈希（如 SHA-256，复用 Web Crypto）、记录数、大小。

**决策 3：单向上传 = 全量重建 manifest + 按哈希增量 PUT。**
- 上传流程：本地读全量 → 生成各文件内容与哈希 → 拉取远端 `manifest.json`（若有）→ 对比哈希，仅 `PUT` 变化/新增文件 → 删除远端已不存在的分片 → 最后 `PUT` 新 `manifest.json`（末尾写，保证原子指向一致）。
- 好处：照片未变的月份不重传；语义仍是「本地为准的一次快照」，无双向复杂度。
- 备选：每次全量覆盖所有文件——弃用，照片重复上传浪费流量。

**决策 4：下载恢复 = 覆盖式，强二次确认。**
- 恢复流程：读远端 `manifest.json` → 逐个 `GET` 数据文件 → 校验哈希 → 在一个 Dexie 事务里**清空并重写** `customCategories/places/reviews`。
- 恢复会丢弃本地未上传的改动，故 UI 必须弹强确认（`showConfirmDialog`），提示「将用云端数据覆盖本地，本地未上传的改动会丢失」。
- 备选：合并恢复——超出单向备份范畴（要冲突处理），归入非目标。

**决策 5：ID 与引用完整性。**
- `review.placeId` 引用 `place.id`。恢复时须保留原自增 ID：用 Dexie `bulkPut`（带显式主键）而非 `bulkAdd`，确保 place/review 关系不错位。
- 上传/下载都保留 `id`；`manifest` 不重编号。

**决策 6：凭证与配置存储。**
- WebDAV `{url, username, password, rootPath}` 存 localStorage（key 如 `lifelog_webdav`）。密码需用于 Basic Auth，无法只存哈希——明文/弱混淆存储，文档标注「请仅用于自有服务、建议用应用专用密码」。
- 与现有锁密码（SHA-256）机制独立，不复用。

**决策 7：CORS 作为前置条件在文档与 UI 提示。**
- 「测试连接」失败时区分网络错误与 CORS 错误（后者常表现为 `TypeError: Failed to fetch` + 无响应头），给出「请检查服务端是否放行跨域」的提示与文档链接。

**决策 8：同步 UI 形态（explore 共识）。**
- **独立页** `/settings/sync`（类比「分类管理」用 `router.push`），设置页「数据管理」区块加一行入口 cell，右侧显示上次同步时间或「未配置」。配置项多，内嵌设置页会拥挤。
- 页面分三区：连接配置（地址/账号/密码/根目录 + 保存 + 测试连接）、同步操作（上传备份 / 下载恢复）、状态（上次同步时间）。
- **分片级进度**：上传/恢复按 manifest 文件逐个显示进度（如「2026-07 (3/12)」），因含照片单文件可能数 MB，纯转圈易被误判为卡死。
- 密码字段提供「显示/隐藏」切换（群晖密码长，盲填易错）。
- 未配置时点上传/恢复 → 引导去填配置，而非报错。
- 关于区块隐私文案需更新：现有「不会上传至任何服务器」在开启同步后不成立，改为「默认仅存本地；开启 WebDAV 同步后会上传到你配置的服务」。

## Risks / Trade-offs

- [CORS 未放行导致直连失败] → 「测试连接」明确报错并指引服务端配置；README/设置页说明；非目标内不代做代理。
- [覆盖式恢复误删本地新数据] → 恢复前强二次确认 + 文案明示；上传入口就近，鼓励先上传再恢复。
- [凭证明文存 localStorage] → 文档标注风险，建议应用专用密码；同机他人可读属既有威胁模型（本地锁另管）。
- [大照片单文件仍可能偏大] → 按月分片通常足够；若单月记录极多，后续可再按大小二次分片（预留 manifest 的 files[] 结构可扩展，不在本版实现）。
- [多设备「最后上传为准」会覆盖对方改动] → 单向模式的固有取舍，已与用户确认；UI 展示 lastSync 供人工判断。
- [WebDAV 服务差异（PROPFIND 返回体/状态码不一）] → 客户端只依赖最小行为（存在性判断可用 GET 404 兜底），减少对 PROPFIND 解析的依赖。

## Open Questions

- 根目录不存在时自动 `MKCOL` 创建，还是要求用户预建？（倾向自动创建 `reviews/` 子目录，根目录也尝试创建。）
- 是否需要「仅上传/仅下载」之外的「查看云端清单」只读视图？（首版可省，`manifest` 已含足够信息，后续可加。）
