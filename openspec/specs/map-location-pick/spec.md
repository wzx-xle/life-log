# map-location-pick Specification

## Purpose
TBD - created by archiving change fix-qa-defects-260710. Update Purpose after archive.
## Requirements
### Requirement: 选点结果可靠回填表单

从店铺新增/编辑页进入地图选点并确认后，返回时店铺表单 SHALL 用选中的地址与经纬度回填对应字段。由于应用未使用 `<keep-alive>`，父页面在返回时会重新挂载，因此回填逻辑 MUST NOT 仅依赖对共享结果 ref 的非 immediate `watch`；页面 MUST 在挂载后主动读取并应用当前存在的选点结果，且应用后清空该共享结果以避免下次误用。

#### Scenario: 确认选点后回填地址

- **WHEN** 用户在店铺表单点击"地图选点"，在地图上确认某位置后返回
- **THEN** 地址输入框显示该位置的逆地理地址，`lat`/`lng` 同步更新为选中坐标

#### Scenario: 取消选点不覆盖已有内容

- **WHEN** 用户进入地图选点后点击"取消"返回
- **THEN** 店铺表单地址与坐标保持进入选点前的值不变

#### Scenario: 结果只应用一次

- **WHEN** 一次选点结果已回填到表单
- **THEN** 再次进入并取消选点，或重新挂载页面，不会用上一次的旧结果二次覆盖

