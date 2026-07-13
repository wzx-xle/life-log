## Why

目前数据仅存于单一浏览器的 IndexedDB，换设备/清缓存即丢失，现有备份只能手动下载 JSON 文件再手动导入，跨设备迁移繁琐。用户希望把数据同步到自有的 WebDAV 服务（群晖/自建），实现「上传备份、换设备下载恢复」。同时现有导出遗漏了自定义分类，本次一并纳入持久化。

## What Changes

- 新增 **WebDAV 单向备份/恢复** 能力：把本地数据上传到用户配置的 WebDAV 目录；换设备时从 WebDAV 下载并覆盖本地。多设备以「谁最后上传谁为准」，不做双向合并（明确非目标）。
- 数据在 WebDAV 上**分文件存放**：`categories.json`（分类）、`places.json`（店铺）、`reviews/YYYY-MM.json`（记录按月分片，含照片 base64）、`manifest.json`（清单：版本、时间戳、各文件内容哈希与记录数）。
- **上传增量优化**：依据 `manifest.json` 中各文件内容哈希，仅上传发生变化的分片，避免每次全量重传照片。
- 设置页新增「WebDAV 同步」入口：配置服务地址/账号/密码、测试连接、手动「上传」「下载恢复」，并展示上次同步时间。
- 补齐**自定义分类**的备份（现有 JSON 导出缺失此项）。
- 凭证以 WebDAV Basic Auth 方式使用，配置存于 localStorage（纯前端固有局限，需在文档标注明文/弱混淆风险）。

## Capabilities

### New Capabilities

- `webdav-sync`: WebDAV 单向备份与恢复——连接配置与校验、分文件的上传（增量）、下载覆盖恢复、清单与冲突（覆盖）确认。

### Modified Capabilities

（无：现有导出/导入能力未建立 spec，不在本变更内修改其 spec。）

## Impact

- 新增 `src/composables/useWebdavSync.ts`（或 `src/utils/webdav*`）：WebDAV 客户端（PROPFIND/MKCOL/PUT/GET + Basic Auth）、序列化/分片、manifest 比对、上传/下载编排。
- 新增设置页 WebDAV 同步 UI（`src/views/SettingsPage.vue` 增区块或新页面）。
- 复用/扩展 `useDatabase` 的批量读写（导入恢复需覆盖写 places/reviews/customCategories）。
- 需要用户在 WebDAV 服务端放行 **CORS**（群晖/反代可配），否则浏览器直连失败——文档需明确前置条件与自建代理兜底方案。
- 数据格式版本号沿用应用版本；`manifest.json` 引入 schema 版本以便日后演进。
