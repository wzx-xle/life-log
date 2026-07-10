## Why

测试人员在 2026-07-10 的回归测试（`docs/tests/report_260710.md`）中记录了 12 个缺陷，横跨设置、记录、店铺三个模块。其中三处"保存失败"、店铺/记录照片无法预览、地图选点无法回填、数据导入导出无响应等属于**功能不可用级别**的阻断问题，直接影响核心录入流程。这些缺陷有若干共同根因，需要系统性修复而非逐点打补丁。

## What Changes

- **修复数据写入失败（3 处同源根因）**：店铺标签、店铺照片、消费明细在保存时因把 Vue reactive proxy（嵌套数组/对象）直接交给 IndexedDB 的 structured-clone 而抛 `DataCloneError`。在数据层统一深度解包为纯对象后再写库（保留 `Date` 类型，不破坏索引）。
- **统一照片预览**：店铺照片全屏预览空白（显示 `1/0`）、记录照片缩略图显示成 `data:image...` 文本。统一照片项数据结构为 `{ url, isImage: true }`（对照 Vant 4.10 源码：全屏预览只读 `url`，`isImage` 绕过扩展名误判），使缩略图与全屏预览对 base64 图片都能正常渲染。
- **地图选点回填**：因应用无 `<keep-alive>`，选点返回时父页面重新挂载，非 immediate 的 `watch` 错过已写入的共享结果。在页面挂载时主动读取并应用选点结果。
- **密码体验与解锁一致（含一处潜在阻断）**：解锁界面硬编码只接受 4 位数字，但创建密码允许 4–20 位任意字符——超过 4 位或含字母的密码将永远无法解锁。统一为 **4 位数字 PIN**，创建/修改密码复用与解锁界面一致的数字键盘。
- **解锁键盘删除键**改为回退（backspace ⌫）样式图标。
- **重置密码取消后状态错乱**：取消确认框后开关仍被置为关闭（但 localStorage 未变，刷新后又变回开启）。仅在确实重置成功后才更新开关状态。
- **自动锁定时间选择器默认值**：打开下拉时高亮项与单元格显示值不一致；打开时同步到当前已选值。
- **数据导出/导入接线**：`SettingsPage` 通过 `$emit('export'/'import')` 抛给无人监听的父级，点击无反应。改为直接调用已存在的 `useExport`/`useImport`；导入补上文件选择对话框。

## Capabilities

### New Capabilities
- `data-persistence-integrity`: 写入 IndexedDB 前将响应式代理深度解包为可结构化克隆的纯数据，保证含数组/嵌套对象的记录（标签、照片、消费明细）可靠保存。
- `photo-preview`: 店铺与记录照片上传项的统一数据结构，保证 base64 图片的缩略图与全屏预览均正常显示。
- `map-location-pick`: 地图选点结果在无 keep-alive 情况下可靠回填到店铺新增/编辑表单。
- `security-lock`: 密码创建/修改统一为 4 位数字 PIN 且与解锁界面体验一致；解锁删除键为回退图标；重置密码取消后状态正确；自动锁定选择器默认值同步。
- `data-backup`: 设置页数据导出（下载 JSON）与导入（选择文件 + 合并/覆盖）功能可用。

### Modified Capabilities
<!-- 现有 specs（page-headers / place-list-enhancements / review-fab / scroll-to-top）均与本次缺陷无关，无需求变更。 -->

## Impact

- **数据层**：`src/composables/useDatabase.ts`（新增深度解包并应用于 add/update）。
- **组件/页面**：`src/components/place/PlaceForm.vue`、`src/components/review/ReviewFull.vue`（照片项结构）、`src/views/PlaceAddPage.vue`、`src/views/PlaceEditPage.vue`（选点回填）、`src/views/SettingsPage.vue`（密码 PIN、重置状态、选择器默认值、导入导出接线）、`src/views/LockScreen.vue`/`src/components/lock/NumberKeyboard.vue`（复用键盘、删除键图标）、`src/composables/useLock.ts`（`resetPassword` 返回结果）。
- **已存在但未接线的工具**：`src/utils/exportData.ts`、`src/utils/importData.ts` 将被真正调用。
- **无破坏性数据迁移**：深度解包保留 `Date`，不改动 Dexie schema；已存储的旧数据不受影响。
