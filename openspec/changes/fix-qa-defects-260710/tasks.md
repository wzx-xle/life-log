## 1. 数据层：深度解包（修复 3 处保存失败）

- [x] 1.0 先复现并确认根因：触发一次"加标签保存"，确认控制台抛 `DataCloneError`（排除索引/schema 等其他原因），再动手 —— 以单测复现：`DataCloneError: [object Array] could not be cloned`
- [x] 1.1 在 `src/composables/useDatabase.ts` 新增 `deepToRaw`（递归解包 reactive/ref，保留 `Date`）
- [x] 1.2 在 `addPlace`/`updatePlace`/`addReview`/`updateReview`/`addCustomCategory`/`updateCustomCategory` 写库前对入参调用 `deepToRaw`
- [x] 1.3 验证：店铺加标签保存成功、店铺加照片保存成功、记录加消费明细提交成功且可读回；`npm run test` 通过（新增 `useDatabase-reactive.test.ts`，19 tests 全绿）

## 2. 照片预览统一

- [x] 2.1 `PlaceForm.vue`：上传项统一为 `{ url: base64, isImage: true, status: 'done' }`，`syncFormPhotos` 从 `item.url` 抽取 base64 字符串
- [x] 2.2 `ReviewFull.vue`：`afterRead`/`applyReviewData` 生成的照片项对齐同一结构（`url` + `isImage`），提交时从 `url` 抽取 base64
- [x] 2.3 验证：编辑已含照片的记录时缩略图不再显示 `data:image` 文本；店铺照片全屏预览显示图片且计数为 `1/1`，可关闭（最终构建后人工复验）

## 3. 地图选点回填

- [x] 3.1 `PlaceAddPage.vue`：在 `onMounted`（`await nextTick()`）读取并应用 `mapPickResult`，应用后清空；保留 `watch`
- [x] 3.2 `PlaceEditPage.vue`：`onMounted` 加载店铺后调用一次 `applyPickResult(mapPickResult.value)`
- [x] 3.3 验证：新增/编辑店铺 → 地图选点确认 → 返回后地址与经纬度已回填；取消选点不覆盖原值；不发生二次旧值覆盖（最终构建后人工复验）

## 4. 密码 4 位 PIN 与解锁体验一致

- [x] 4.1 抽出/复用"圆点 + `NumberKeyboard`"的 4 位 PIN 录入（供解锁与设置共用）
- [x] 4.2 `SettingsPage.vue`：创建密码改为 PIN 输入 + 确认（两次 4 位一致），校验规则改为恰好 4 位数字，调用 `createPassword`
- [x] 4.3 `SettingsPage.vue`：修改密码改为 PIN 输入（当前 4 位 + 新 4 位 + 确认）
- [x] 4.4 验证：设置密码只能输 4 位数字、无系统英文键盘；新设 PIN 可在解锁界面成功解锁

## 5. 解锁删除键回退图标

- [x] 5.1 `NumberKeyboard.vue`：删除键改为回退（⌫）样式图标（内置图标或内联 SVG），行为不变
- [x] 5.2 验证：删除键显示回退样式，点击删除最近一位

## 6. 重置密码取消后状态一致

- [x] 6.1 `useLock.ts`：`resetPassword()` 返回 `boolean`（重置成功 `true`，取消 `false`）
- [x] 6.2 `SettingsPage.vue`：`handleResetPwd` 仅在返回 `true` 时置 `pwdEnabled.value = false`
- [x] 6.3 验证：点重置后取消 → 开关仍开启，刷新不回跳；确认 → 开关关闭且刷新保持

## 7. 自动锁定选择器默认值

- [x] 7.1 `SettingsPage.vue`：为 `van-picker` 绑定当前 `autoLockMinutes`（`v-model` 选中值或 `:default-index`）
- [x] 7.2 验证：当前为"5分钟"时打开选择器高亮"5分钟"而非"立即"

## 8. 导出/导入接线

- [x] 8.1 `SettingsPage.vue`：移除 `$emit('export')`，改为调用 `useExport().downloadExport()`
- [x] 8.2 `SettingsPage.vue`：新增隐藏 `<input type="file" accept="application/json">`，"导入数据"触发选择
- [x] 8.3 读取文件 → `JSON.parse` → `useImport().validateFormat` 校验；合法则弹"合并/覆盖"选择并调用对应导入；非法 `showToast` 提示
- [x] 8.4 导入成功后刷新受影响的列表/状态并提示导入数量
- [x] 8.5 验证：导出下载 JSON；导入弹出文件选择、合法文件导入成功并提示数量、非法文件被拒且不改数据

## 10. 地图逆地理编码（真机联调发现，AMAP 安全密钥）

真机验证时发现：回填管路修好后暴露出地址恒为占位"定位中..."。根因（高德官方文档确认）——JSAPI 2.0 对 2021-12-02 后申请的 key 强制要求**安全密钥**（`_AMapSecurityConfig.securityJsCode`，须在脚本加载前设置），否则 Geocoder/Geolocation 等 Web 服务调用失败；本仓库全局缺失该配置。

- [x] 10.1 `.env.production` 增加 `VITE_AMAP_SECURITY_CODE`（32 位安全密钥，由需求方提供）；`vite-env.d.ts` 补类型
- [x] 10.2 `MapPickerPage.vue`：加载 JSAPI 前注入 `window._AMapSecurityConfig = { securityJsCode }`
- [x] 10.3 `useMap.ts`：同样在加载前注入（`MapPage` 的逆地理/POI 搜索同源问题）
- [x] 10.4 次要缺陷：`MapPickerPage` 定位失败时对默认中心兜底逆地理编码，避免地址停在占位
- [x] 10.5 验证（生产 E2E）：地图选点地址解析为真实地址"北京市东城区东华门街道…台基厂头条10号院"并正确回填；请求已带 `jscode=`；定位失败仍能出地址（兜底生效）

## 9. 收尾验证

- [x] 9.1 `npm run typecheck` 通过（注意 `noUnusedLocals`：清理因改动产生的未用导入/变量）
- [x] 9.2 `npm run build` 通过
- [x] 9.3 对照 `docs/tests/report_260710.md` 逐条复验 12 个缺陷已修复

## 验证日志（Playwright 真机 E2E，对线上 https://lifelog.wxyz.ren）

以 `playwright-core` + 本机 Chrome、移动端模拟，对**已部署的生产站**逐条驱动验证，全部通过、零应用级控制台报错：

- 保存失败 ×3：店铺标签+照片保存成功并入列表；记录含消费明细保存成功（E2E）+ `useDatabase-reactive.test.ts` 单测复现 `DataCloneError`→修复转绿
- 照片：上传缩略图正常渲染（非 `data:image` 文本）；店铺照片全屏预览计数 `1 / 1`、图片正常（原 `1/0` 空白已修）
- 密码：设置为 4 位数字 PIN 键盘、输满进"确认"步、设置成功；解锁删除键为 ⌫ 回退图标；锁屏→输 PIN→成功解锁离开 `/lock`
- 重置密码点"取消"后开关仍开启（`aria-checked=true`）
- 自动锁定选择器打开高亮"5分钟"
- 导出下载合法 JSON（places/reviews）；导入合法文件→"导入成功：N 个店铺，M 条记录"，非法文件被拒
- 地图选点：确认返回后地址由空变非空，**回填管路已修**（原"没带回内容"）

> 一处环境限制：本次 E2E 服务器无法访问 AMAP（`ERR_CONNECTION_RESET`），故选点地址回填显示占位"定位中..."而非真实地理编码。回填机制本身已验证；**真实地理编码地址需在能访问 AMAP 的真机上确认**。
