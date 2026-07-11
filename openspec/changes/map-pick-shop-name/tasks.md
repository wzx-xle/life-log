## 1. 扩展选点结果类型

- [x] 1.1 `src/composables/mapPickState.ts`：将 `mapPickResult` 类型由 `{ lat; lng; address }` 改为 `{ lat; lng; address; name }`

## 2. 选点页携带名称

- [x] 2.1 `src/views/MapPickerPage.vue`：`selectedResult` 在 POI 模式下返回 `name: selectedPoi.name`，中心模式下返回 `name: ''`

## 3. 回填店铺名称

- [x] 3.1 `src/views/PlaceAddPage.vue`：`applyPickResult` 中在 `val.name` 非空时设置 `form.name = val.name`
- [x] 3.2 `src/views/PlaceEditPage.vue`：同步 `applyPickResult` 逻辑，`val.name` 非空时回填 `form.name`

## 4. 调整表单地图入口

- [x] 4.1 `src/components/place/PlaceForm.vue`：从地址字段的 `#button` 槽移除「地图选点」按钮
- [x] 4.2 `src/components/place/PlaceForm.vue`：在名称字段上方新增独立一行按钮，文案「从地图选择店铺」，点击调用现有 `handlePickLocation`；补充对应样式

## 5. 验证

- [x] 5.1 `npm run typecheck` 通过（结果类型扩展后各处引用无类型错误）
- [x] 5.2 手动验证：新增店铺 → 点顶部「从地图选择店铺」→ 选中一个周边 POI → 确认返回，店铺名称与地址均回填 —— **生产环境 playwright 实测通过**（选「来今雨轩茶社」→ 名称覆盖手填值、地址回填）
- [x] 5.3 手动验证：选中"当前位置"确认返回，仅地址回填、已填名称不变；点击取消返回不改动任何字段 —— **生产环境 playwright 实测通过**（当前位置→名称保留、地址更新；选 POI 后取消→均不变）
