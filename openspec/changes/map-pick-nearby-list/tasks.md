## 1. AMAP 接入 PlaceSearch

- [x] 1.1 `MapPickerPage.vue` 的 `AMAP_URL` 追加 `AMap.PlaceSearch` 插件；确认 `_AMapSecurityConfig` 仍在脚本加载前注入
- [x] 1.2 在 `mapInstance.plugin([...])` 中实例化 `PlaceSearch`（`pageSize≈20`），封装 `searchNearBy(center)` 返回 `{name,address,lng,lat,distance}[]`

## 2. 列表数据与刷新

- [x] 2.1 定义列表项类型 `{ name, address, lng, lat, distance? }`；`nearbyList` ref（候选）+ `selected` ref（`{lat,lng,address}`）+ 选择模式标记（中心跟随 | 冻结 POI）
- [x] 2.2 构造候选：首项=当前位置（`name='当前位置'` + 中心 Geocoder 格式化地址），其后接 PlaceSearch 周边结果（按距离升序）
- [x] 2.3 `moveend` 后以新中心刷新候选（中心地址 + 周边列表），加 400–500ms 防抖/节流；`selected` 处于**中心跟随**时随中心更新、处于**冻结 POI** 时不动
- [x] 2.4 兜底：PlaceSearch 失败/空结果时候选仅保留"当前位置"首项，不空白
- [x] 2.5 定位完成后默认 `selected`=中心跟随模式（确认始终有效）

## 3. 布局与交互

- [x] 3.1 页面改上下布局：地图上部（约 45–55vh）+ 列表下部 `overflow-y:auto`；保留底部确认/取消条与中心图钉
- [x] 3.2 初始 `zoom` 由 16 调至 15（目测微调）
- [x] 3.3 点选交互：点"当前位置"首项 → 切中心跟随模式；点某 POI → 冻结其 `{lat,lng,address}` 到 `selected`（可选 `setCenter` 到该项，安全不重置）；高亮 = 坐标≈selected
- [x] 3.4 确认区上方显示"已选：<地址>"摘要，选择在列表滚动/刷新后仍可见
- [x] 3.5 保留点击/拖动地图改变中心的能力；中心跟随模式下拖动即纠偏（选择随中心走，服务 GPS 漂移）

## 4. 确认回填（契约不变）

- [x] 4.1 `onConfirm`：以 `selected` 的 `{lat,lng,address}` 写入 `mapPickResult`，`router.back()`
- [x] 4.2 `onCancel` 维持现状（`mapPickResult=null` + 返回）
- [x] 4.3 确认无 `mapPickState`/父页面回填逻辑改动

## 5. 验证

- [x] 5.1 `npm run typecheck`、`npm run build` 通过
- [x] 5.2 线上真机 E2E：进入选点页有地图+周边列表；点选某项高亮、地图定位；确认后返回店铺表单地址回填为所选项、坐标同步
- [x] 5.3 拖动地图后列表刷新为新周边；取消不改动原地址（真机确认）
- [x] 5.4 兜底：检索失败时仍可选"当前位置"并确认回填

## 6. 真机测试发现并修复

- [x] 6.1 单选高亮多个：同一建筑内多 POI 共享坐标，`isPoiActive` 由坐标相等改为按 POI 唯一 `id` 判定（高德无 id 时兜底用坐标+索引）
- [x] 6.2 锁屏死循环：进选点页时若已超时→锁屏 redirect=map-pick→`unlock` 用 `router.push` 残留锁屏页于历史→`onConfirm` 的 `router.back()` 退回锁屏页而循环。修复：`useLock.unlock` 改 `router.replace`（一并使全站 `router.back()` 安全）。已 Playwright 复现→修复→验证
- [x] 6.3 瓦片请求大量"已取消"：`setCenter` 默认带平移动画，从默认中心飞到用户位置途中一路加载/取消瓦片。改 `setCenter([lng,lat], true)` 关动画直接跳（真机确认churn下降）

## 7. 表单状态保留（去选点返回不丢已填内容）

根因：无 keep-alive，去地图选点时店铺表单页卸载、返回重挂→仅地址经 `mapPickResult` 回填，已填的名称/电话/分类/标签/照片全丢。

- [x] 7.1 `mapPickState.ts` 增加共享草稿 `placeFormDraft`（`PlaceFormData | null`）
- [x] 7.2 `PlaceForm.vue`：`handlePickLocation` 中先把表单快照存入 `placeFormDraft`（数组 tags/photos 深拷贝）再 emit
- [x] 7.3 `PlaceForm.vue`：`onMounted` 若有草稿则恢复到 `form` 并重建照片 `fileList`，随后清空草稿（一次性）
- [x] 7.4 顺序正确：草稿恢复（子 onMounted）先于父应用 `mapPickResult`（父 onMounted），保证新选地址覆盖草稿旧地址
- [x] 7.5 验证：填名称/标签/照片→地图选点→确认返回→名称/标签/照片仍在、地址为新选；取消返回同样保留
