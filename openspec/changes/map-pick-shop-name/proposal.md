## Why

地图选点页的每个周边地点本就带有名称（POI 名，通常即店铺名），但确认回填时名称被丢弃，只回传了地址与坐标。用户添加店铺时仍要手动再输一遍店铺名称，重复且易与地图上选中的地点不一致。让选中的地点名称一并回填店铺名称，可一步完成「名称 + 地址」的填写。

## What Changes

- 店铺表单的地图入口由「地址字段内的『地图选点』按钮」改为「名称字段上方独立一行的醒目按钮『从地图选择店铺』」，体现「地图选点为主路径、手动输入为兜底」。
- 地图选点确认时，除地址与坐标外，一并返回选中地点的**名称**。
- 选中某个周边 POI 后确认返回，店铺表单的**店铺名称**自动回填/覆盖为该 POI 名称。
- 选中列表首项「当前位置」（中心点，无 POI 名称）时，**不改动**店铺名称字段，仅回填地址与坐标。
- 选点结果结构由 `{ lat, lng, address }` 扩展为 `{ lat, lng, address, name }`（**BREAKING** 内部约定：`map-nearby-address-pick` 原要求"结构不变"被放宽）。
- 添加店铺页与编辑店铺页共用同一回填逻辑，一并生效并保持一致。

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `map-nearby-address-pick`: 放宽"返回结果结构不变"的约束，返回结构新增可选 `name` 字段；新增"选中 POI 时其名称回填店铺名称、选中当前位置时不改动名称"的回填要求。

## Impact

- `src/components/place/PlaceForm.vue`：地图入口按钮从地址字段 button 槽移出，改为名称字段上方独立一行按钮，文案「从地图选择店铺」。
- `src/composables/mapPickState.ts`：`mapPickResult` 类型新增 `name`。
- `src/views/MapPickerPage.vue`：`selectedResult` 在 POI 模式下携带 `name`，中心模式下 `name` 为空。
- `src/views/PlaceAddPage.vue` / `src/views/PlaceEditPage.vue`：`applyPickResult` 在 `name` 非空时回填 `form.name`。
- 无数据库结构变更、无对外接口变更。
