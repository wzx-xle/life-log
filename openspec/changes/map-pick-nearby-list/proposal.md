## Why

当前地图选点是"中心落点 + 逆地理编码"模式：用户要把地图中心对准目标点，只能拿到中心点的一条格式化地址，精度依赖对准、可选项单一。改为"周边地址列表选择"更贴近外卖/打车类 App 的选址习惯——地图缩小展示更大范围，列出当前中心周边的地点，用户从列表里挑一个更省事、更准。

## What Changes

- **地图缩小**：初始缩放级别调小（如 16 → 15），展示更大范围周边。
- **周边地址列表**：地图下方新增可滚动的周边地点列表，通过 `AMap.PlaceSearch.searchNearBy` 拉取当前地图中心周边的 POI（名称 + 地址 + 距离）。
- **列表随中心刷新**：拖动地图（moveend）后列表更新为新中心周边；保留点击地图/拖动改变中心的能力。
- **保留精确落点**：列表首项固定为"当前中心位置"（中心点逆地理编码地址），等价于原落点选址，不丢精度。
- **选择即选中**：用户点选列表项高亮为选中项，地图定位到该项；选中项的地址与经纬度作为结果。
- **确认回填**：点击确认，把选中项的地址回填到店铺地址输入框——**跨页返回契约 `{lat, lng, address}` 不变**，父页面回填逻辑无需改动。

## Capabilities

### New Capabilities
- `map-nearby-address-pick`: 地图选点页以"地图 + 周边地址列表"方式选址：列出中心周边地点、支持选择与确认回填，替代原单一中心落点模式。

### Modified Capabilities
<!-- map-location-pick（回填管路）属另一 change 的能力，本次不改其需求，仅复用其 {lat,lng,address} 返回契约。 -->

## Impact

- **页面**：`src/views/MapPickerPage.vue`（主要改动：布局拆分为上下、接入 PlaceSearch、列表选择交互）。
- **AMAP**：脚本 URL 追加 `AMap.PlaceSearch` 插件；安全密钥 `_AMapSecurityConfig` 已具备，PlaceSearch 属 Web 服务同样受其覆盖。
- **返回契约/父页面**：`mapPickState`、`PlaceAddPage`/`PlaceEditPage` 回填逻辑**不变**（仍消费 `{lat, lng, address}`）。
- **配额**：PlaceSearch 计入高德 key 的 Web 服务调用量（随拖动检索），需注意节流。
