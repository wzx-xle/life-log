## Context

现状 `MapPickerPage.vue`：全屏地图 + 中心固定图钉 + 顶部地址条（中心逆地理编码）+ 底部确认/取消。确认时把 `mapInstance.getCenter()` 与 `addressText` 组成 `{lat,lng,address}` 写入 `mapPickResult` 并 `router.back()`。父页面（PlaceAddPage/PlaceEditPage）在挂载/watch 时消费该结果回填。

AMAP 已加载 `AMap.Geocoder`、`AMap.Geolocation`，安全密钥 `_AMapSecurityConfig` 已在脚本加载前注入。`AMap.PlaceSearch` 尚未加载。

## Goals / Non-Goals

**Goals:**
- 地图缩小 + 周边地址列表选择 + 确认回填。
- 复用现有返回契约 `{lat,lng,address}`，父页面零改动。
- 不丢精确落点能力（列表首项=当前中心）。

**Non-Goals:**
- 不做关键字搜索地址（仅"周边"列表；关键字搜索可后续单开）。
- 不改跨页传参机制（仍用 `mapPickState`）。
- 不改父页面回填逻辑。

## Decisions

### 决策 1：用 `AMap.PlaceSearch.searchNearBy` 拉周边列表

在脚本 URL 追加 `AMap.PlaceSearch` 插件。检索：`placeSearch.searchNearBy('', [lng, lat], radius, cb)`，`radius` 取约 1000m，`pageSize` 约 20。回调 `result.poiList.pois` 每项含 `name`、`address`、`location`(lng/lat)、`distance`。

**替代**：`Geocoder` 配 `extensions:'all'` 返回 `regeocode.pois`——被否为"主列表"来源：POI 数量/排序不如 PlaceSearch 可控；但仍用 Geocoder 取中心"格式化地址"作为列表首项（当前位置）。

### 决策 2：列表驱动 + 两种选择模式

**交互模型：列表驱动**——选择以列表点选为真理源，中心图钉仅作视觉锚点，不承担选择语义。

列表项统一为 `{ name, address, lng, lat, distance? }`：首项=当前位置（中心），其后=PlaceSearch 周边 POI 按距离升序。

选择态 `selected` 有**两种模式**：
- **中心跟随**（"当前位置"首项）：`selected` 表示"地图中心"，其 `{lat,lng,address}` 随中心实时更新（`moveend` 刷新）。这是服务 **GPS 漂移纠偏**的关键——拖地图纠偏时选择无摩擦地跟着走。
- **冻结 POI**：点选某个周边 POI，把其 `{lat,lng,address}` 拷入 `selected` 并**定死**，之后地图移动/刷新一律不改动它。

默认（定位完成后）= **中心跟随**。点"当前位置"首项 → 切回中心跟随；点某 POI → 冻结到它。列表高亮 = 其坐标 ≈ `selected`（中心跟随时高亮首项）。

**不会死循环**：老病根是"moveend 强制把选择重置到首项"——这条不要。这里 moveend 只让**处于中心跟随模式**的选择随中心走，**已冻结的 POI 一律不碰**（点 POI 后即便顺手 `setCenter` 过去也不动它）。

确认区上方显示"已选：<地址>"摘要，使选择在列表刷新/滚走后仍可见。确认时用 `selected` 的 `{lat,lng,address}` 返回；`address` 文案见 Open Questions。

### 决策 3：列表随中心刷新 + 节流

`moveend` 后以新中心并发刷新"中心地址"(Geocoder) 与"周边列表"(PlaceSearch)，做**节流/防抖**（如 400–500ms，参考 `useMap.searchPOI` 的 300ms 防抖）。刷新更新候选列表；对 `selected`：**仅当处于"中心跟随"模式时**其坐标/地址随中心更新，处于"冻结 POI"模式时不动。

### 决策 4：布局

上下 flex 布局：地图上部（约 45–55vh），列表下部 `overflow-y:auto` 占剩余空间；底部保留确认/取消条。地图仍保留中心图钉（视觉锚点，同时点击/拖动改变中心）。初始 `zoom` 由 16 调至 15（更广视野，具体值实现时目测微调）。

### 决策 5：返回契约不变

确认时 `mapPickResult.value = { lat, lng, address }`（取自选中项）。`mapPickState`、父页面回填逻辑零改动。取消 `mapPickResult.value = null`（同现状）。

## Risks / Trade-offs

- **[POI 列表不含目标精确地址]** POI 多为商户/地标，非任意门牌 → 保留"当前中心"首项作为精确落点兜底；用户仍可拖图对准后选首项。
- **[PlaceSearch 服务配额]** 随拖动检索计入 key 调用量 → 节流 + 合理 radius/pageSize 控制频次。
- **[headless/网络受限下 PlaceSearch 失败]** → 兜底：检索失败时列表仅保留"当前中心"项，不阻断选择（见 spec 兜底场景）。

## Open Questions

- 列表项地址文案：仅 `address` 还是 `name + address`？倾向 `name` 为主、`address` 为副行展示；实现时按可读性定。
- 初始缩放具体值（15 vs 14）与地图/列表高度占比——实现时目测微调，不影响能力。

> 已定：交互模型=**列表驱动 + 两种选择模式**——"当前位置"首项为中心跟随（服务 GPS 漂移纠偏），周边 POI 为冻结快照；moveend 只让中心跟随项随中心走、不碰已冻结 POI（消除死循环）。拖动重搜保留。关键字搜索不在本次范围（见 Non-Goals）。
