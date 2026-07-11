## Context

现有地图选点链路：`MapPickerPage` 通过 `AMap.PlaceSearch.searchNearBy` 拿到周边 POI 列表，每项已含 `name`/`address`/坐标。用户选中一项或"当前位置"后，`selectedResult`（computed）产出 `{ lat, lng, address }`，确认时写入共享 ref `mapPickResult`，父页 `PlaceAddPage` / `PlaceEditPage` 的 `applyPickResult` 监听并回填 `form.address/lat/lng`。POI 的 `name` 在 `selectedResult` 处被丢弃。

本次仅需把已有的 `name` 透传到回填端，属单模块内的小改动，无外部依赖、无数据模型变更。

## Goals / Non-Goals

**Goals:**
- 选中周边 POI 确认后，店铺名称自动回填为 POI 名称。
- 选中"当前位置"（无 POI 名）时不影响名称字段。
- 添加页与编辑页行为一致。

**Non-Goals:**
- 不改动地图 UI 布局、检索逻辑、节流策略。
- 不改动数据库结构与提交逻辑。
- 不为"名称与地址来自不同选点"做特殊 UI（一次选点一次回填即可）。

## Decisions

**决策 1：在 `selectedResult` 携带 `name`，中心模式置空字符串。**
- POI 模式：`name = selectedPoi.name`。中心模式：`name = ''`（"当前位置"无真实 POI 名，回填时以空判定跳过覆盖）。
- 备选：中心模式回填中心地址作名称——弃用，地址串不适合当店铺名，且会污染用户已填名称。

**决策 2：回填覆盖策略——`name` 非空则覆盖 `form.name`，为空则不动。**
- 用户主动选中具体 POI = 明确意图用该名，覆盖（即使已手填）合理且可预期。
- 中心模式/取消不产生 `name`，保留用户已填名称，符合最小意外原则。
- 备选：仅当 `form.name` 为空才回填——弃用，会让"改选另一个 POI 想同步换名"失效，反直觉。

**决策 3：扩展共享结果类型而非新增字段通道。**
- `mapPickResult` 类型由 `{lat,lng,address}` 改为 `{lat,lng,address,name}`，两个父页共用一处 `applyPickResult` 逻辑各自加一行 `if (val.name) form.name = val.name`。
- 保持既有共享 ref 往返模式（`mapPickState.ts`），不引入 sessionStorage / query 传参。

**决策 4：地图入口改为名称字段上方的独立醒目按钮。**
- 一次选点同时填「名称 + 地址」，按钮不再从属于任一字段。故从地址字段的 `#button` 槽移出，独立成整行按钮置于名称字段上方，文案「从地图选择店铺」，明确「地图选店为主路径、手动输入为兜底」。
- 备选：留在地址字段仅改文案——弃用，视觉归属与「填两个字段」的实际行为错位（即本次 explore 的线索 1 起因）。移到名称字段旁作 button 槽——次优，仍暗示「只填名称」。
- 仅改 `PlaceForm.vue` 模板与相关样式，`handlePickLocation` 逻辑与 `pickLocation` 事件不变。

## Risks / Trade-offs

**已接受的取舍：地图选点为准，手动修改兜底。**
选中具体 POI 即回填/覆盖店铺名称，新增与编辑一视同仁、不做特殊分支。核心理由是名称字段始终可编辑——用户选完点若不满意，返回表单手动改一字段即可，成本极低。故「覆盖了已手填名称」「编辑时覆盖了原店名」均不视为隐患，而是可预期、可撤销的默认行为。选"当前位置"或取消时因无 POI 名称，自然不动名称字段。

- [POI 名称可能过长/含冗余（如含分店后缀）] → 店铺名称字段已有 `maxlength=50` 约束，超长自然截断；不做额外清洗，保持所见即所得，用户可自行精简。
