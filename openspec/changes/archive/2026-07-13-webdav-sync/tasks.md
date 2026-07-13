## 1. WebDAV 客户端

- [x] 1.1 新增 `src/utils/webdavClient.ts`：基于 `fetch` 封装 `propfind/mkcol/put/get/delete/exists`，Basic Auth 头，统一错误封装（区分网络/CORS/认证/404）
- [x] 1.2 单元测试：用 `vi.stubGlobal('fetch', ...)` mock，覆盖 Basic Auth 头拼接、404→exists=false、CORS/网络错误分类

## 2. 序列化、分片与清单

- [x] 2.1 新增 `src/utils/syncSerialize.ts`：从 `db` 读全量 → 生成 `categories.json` / `places.json` / `reviews/<YYYY-MM>.json` 内容（按 `review.date` 归月，缺失兜底 `createdAt`）
- [x] 2.2 内容哈希工具：复用 Web Crypto SHA-256 对每个文件文本求哈希；构造 `manifest`（schema 版本、appVersion、lastSync、files[]{path,hash,count,size}）
- [x] 2.3 单元测试：分片归月正确、空数据不产出记录分片、manifest 结构与哈希稳定

## 3. 上传（增量）与下载（恢复）编排

- [x] 3.1 新增 `src/composables/useWebdavSync.ts`：`testConnection()` / `upload()` / `restore()` / 读写本地配置（localStorage `lifelog_webdav`）
- [x] 3.2 `upload()`：确保目录存在（MKCOL 根与 `reviews/`）→ 拉远端 manifest → 按哈希仅 PUT 变化/新增分片 → DELETE 陈旧分片 → 最后 PUT `manifest.json`
- [x] 3.3 `restore()`：GET manifest → GET 各数据文件 → 校验哈希（不符/缺失则中止）→ Dexie 事务清空并 `bulkPut`（显式主键，保留 id/引用）分类/店铺/记录
- [x] 3.4 上次同步时间：成功后写入本地并供 UI 读取

## 4. 设置页同步 UI

- [x] 4.1 新增独立页 `SettingsSyncPage.vue` + 路由 `/settings/sync`；`SettingsPage.vue` 数据管理区块加入口 cell（右侧显示上次同步时间/「未配置」）
- [x] 4.2 连接配置区：地址/账号/密码（含显示/隐藏切换）/根目录表单 + 保存 + 测试连接
- [x] 4.3 同步操作区：「上传备份」「下载恢复」；恢复前 `showConfirmDialog` 强确认（明示覆盖本地、丢失未上传改动）；未配置时点操作引导去填配置
- [x] 4.4 上传/恢复按 manifest 文件显示分片级进度（如「2026-07 (3/12)」）；展示上次同步时间；测试连接失败对 CORS 错误给可区分提示
- [x] 4.5 补齐自定义分类：确认上传/恢复链路覆盖 `customCategories`（现有导出遗漏项）
- [x] 4.6 更新关于区块隐私文案：「不会上传至任何服务器」→「默认仅存本地；开启 WebDAV 同步后会上传到你配置的服务」

## 5. 验证

- [x] 5.1 `npm run typecheck` 与 `npm run test` 通过（40 测试全过，含 webdav/serialize/sync 编排共 21 项）
- [x] 5.2 「测试连接」UI 通、错误提示路径已验证（playwright）；**真实群晖连接成功待用户实测**（需服务端 CORS）
- [x] 5.3 上传编排由集成测试全覆盖：全量产出 manifest/分片、仅改一条只重传对应月份分片、删除整月清理陈旧分片；**真实 WebDAV 往返待用户实测**
- [x] 5.4 恢复编排由集成测试全覆盖：覆盖本地并保留 id/引用、日期 revive、哈希校验失败中止不写本地；恢复确认框 playwright 验证生效；**真实往返待用户实测**
- [x] 5.5 「测试连接」对不可达/被拒服务给出可区分的跨域(CORS)提示 —— playwright 验证 toast 命中
