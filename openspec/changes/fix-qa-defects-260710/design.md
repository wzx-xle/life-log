## Context

`docs/tests/report_260710.md` 记录了 12 个缺陷。经源码核实，它们并非彼此孤立，而是收敛到少数几个根因。本设计说明各根因与修复方式，供实现阶段直接落地。

关键事实（源码核实）：
- 应用无 `<keep-alive>`（`App.vue` 用 `<transition mode="out-in">` 包裹 `<component>`），任何路由跳转都会卸载/重挂当前页。
- IndexedDB 的 structured clone 无法克隆 Vue reactive **Proxy**；根对象经 `{ ...form }` 展开后已是纯对象，但通过代理读到的**嵌套数组/对象**仍是 Proxy。
- 解锁界面 `LockScreen.vue` 硬编码只接受 4 位数字并自动提交，`NumberKeyboard` 也只有 0–9 与删除键。

## Goals / Non-Goals

**Goals:**
- 修复报告中全部 12 个缺陷。
- 对"保存失败"采用**数据层统一根因修复**，避免逐个调用点打补丁、防止复发。
- 密码体验与解锁界面自洽（消除"密码位数/字符与解锁界面不匹配"的潜在阻断）。

**Non-Goals:**
- 不引入 `<keep-alive>` 或改动全局路由/过渡架构（回填改用挂载时读取即可，改动面更小）。
- 不扩展导出格式（如把 `customCategories` 纳入备份）——属既有限制，本次不改；见"已知缺口"。
- 不改动 Dexie schema，不做数据迁移。
- **不重构"重置密码"的数据语义**。现状 `resetPassword` 会清空全部店铺与记录（等同恢复出厂），忘记 PIN 的用户将丢失全部数据。本次仅修复"取消后开关状态错乱"，不改动"重置即删库"的行为——"找回/重置的正确产品设计"是独立议题，另行提案。

## 已知缺口（本次不修，如实记录）

- **备份不含自定义分类**：`exportData` 仅导出 `places` + `reviews`，不含 `customCategories` 表。换设备导入后，店铺的 `customCategory` 字符串仍在，但分类的颜色/定义丢失，渲染回退默认色。本次只修"导出/导入不响应"的接线问题，不扩展备份内容。
- **重置密码即删库**：见 Non-Goals。

## Decisions

### 决策 1：在数据层深度解包响应式代理（修复 3 处"保存失败"）

**根因**：
- 店铺：`PlaceAddPage`/`PlaceEditPage` 把 `data.tags`、`data.photos`（通过 reactive 代理读出的**数组 Proxy**）直接放进待写对象；`db.places.add()` 结构化克隆 Proxy 抛 `DataCloneError`。空数组时被转为 `undefined` 故无照片/标签时不报错——这解释了"加了标签/图片才失败"。
- 记录：`ReviewFull` 的 `items: [...consumptionItems.value]` 虽展开出纯数组，但**元素**仍是 reactive 对象 Proxy，同样克隆失败；`tags`（字符串）与 `photos`（字符串）为原始值故不受影响。

**方案**：在 `useDatabase` 中新增一个深度解包函数，并在 `addPlace`/`updatePlace`/`addReview`/`updateReview`（以及 `addCustomCategory`/`updateCustomCategory`）写库前调用。

```ts
import { toRaw } from 'vue'
function deepToRaw<T>(v: T): T {
  if (Array.isArray(v)) return v.map(deepToRaw) as unknown as T
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    const raw = toRaw(v as any)
    const out: any = {}
    for (const k in raw) out[k] = deepToRaw(raw[k])
    return out
  }
  return v
}
```

**为何不用 `JSON.parse(JSON.stringify())`**：会把 `Date` 序列化为字符串，破坏 `createdAt/updatedAt/date` 索引的类型一致性（旧数据为 `Date`）。`deepToRaw` 显式跳过 `Date`，递归解包数组与普通对象，保留类型。

**为何放数据层而非调用点**：这是系统性根因，未来任何"把响应式数据写库"的路径都会受益；单点 `[...arr]`/`toRaw` 易遗漏、易复发。改动集中在 `useDatabase`，符合"根因修复"。

**替代方案**：在每个提交处手动 `structuredClone(toRaw(...))`——被否，分散且仍可能漏掉嵌套层级。

### 决策 2：统一照片项结构（修复两处预览问题）

**根因**：
- 记录（`ReviewFull`）上传项只设 `url`（base64），未设 `isImage`；Vant 按 URL 扩展名判断是否图片，`data:` URL 不含扩展名 → 当作非图片，显示 `data:image...` 文本。
- 店铺（`PlaceForm`）上传项只设 `content`+`isImage`，缩略图正常但全屏预览取不到图源 → 空白 `1/0`。

**方案**（已对照 Vant 4.10 源码定稿）：两个表单统一构造上传项为 `{ url: base64, isImage: true, status: 'done' }`——`url` 一个字段即同时喂饱两条取图路径，`isImage` 绕过扩展名误判。存库时抽取 `item.url` 字符串数组。

源码依据：
- 全屏预览 `Uploader.previewImage` 构造 `images = modelValue.filter(isImageFile).map(i => i.url).filter(Boolean)`——**只读 `url`**。这解释了店铺"1/0 空白"：旧结构只有 `content` 无 `url`，`map` 全变 `undefined` 被 `filter(Boolean)` 清空。
- 缩略图 `UploaderPreviewItem` 用 `src = objectUrl || content || url`——有 `url` 即可命中。
- `isImageFile` 判定优先级 `isImage → file.type → url(扩展名正则) → content(data:image 前缀)`。base64 data URL 无扩展名，正则不匹配，故记录"只设 url 无 isImage"时被判为非图 → 显示 `data:image...` 文本。补 `isImage: true` 后此路直接短路为真。

结论：`content` 字段是多余的（`url` 已覆盖缩略图与全屏），去掉以保持最简。

### 决策 3：挂载时主动应用选点结果（修复地图选点回填）

**根因**：无 keep-alive，选点确认 → 写 `mapPickResult` → `router.back()` → 父页面**重新挂载** → 新注册的 `watch(mapPickResult)` 非 immediate，错过已存在的值。

**方案**：把"应用选点结果"抽成函数，在 `onMounted`（`await nextTick()` 确保子表单 ref 就绪）时若 `mapPickResult.value` 存在即应用并清空；保留 `watch` 以覆盖极端情况。`PlaceAddPage` 与 `PlaceEditPage` 同样处理（`PlaceEditPage` 已有 `applyPickResult`，只需在 `onMounted` 里加载店铺后调用一次）。

**替代方案**：引入 `<keep-alive>`——被否，影响面大且与现有 `mode="out-in"` 过渡冲突。

### 决策 4：密码统一为 4 位数字 PIN，复用解锁键盘

**根因/隐患**：解锁只接受 4 位数字，但创建密码允许 4–20 位任意字符——设了 6 位或含字母的密码后**永远无法解锁**。这不仅是"键盘是英文的"体验问题，而是功能自洽问题。

**方案**：创建/修改密码改为 4 位数字 PIN，录入 UI 复用与解锁一致的数字键盘 + 圆点显示。实现上把 `LockScreen` 里"圆点 + `NumberKeyboard`"的录入片段复用（抽成可复用片段/内联到设置页的弹窗），创建流程为：输入 4 位 → 再次确认 4 位 → 一致则 `createPassword`。校验规则由"≥4 位任意"改为"恰好 4 位数字"。

**替代方案**：给现有 `van-field` 加 `type="digit"`——被否，仍是系统键盘、且不满足"与解锁一致"，也未根治位数不一致。

### 决策 5：`resetPassword` 返回结果，UI 据此更新开关

**根因**：`useLock.resetPassword` 在确认框被取消时 `catch` 后静默 `return`，但 `SettingsPage.handleResetPwd` 无条件执行 `pwdEnabled.value = false`，导致取消后开关错误关闭（localStorage 未变 → 刷新回跳）。

**方案**：`resetPassword()` 返回 `boolean`（确认并重置成功为 `true`，取消为 `false`）；`handleResetPwd` 仅在 `true` 时置 `pwdEnabled.value = false`。

### 决策 6：自动锁定选择器同步默认值

**方案**：为 `van-picker` 绑定当前值（Vant 4 用 `v-model` 绑定选中值数组，或 `:default-index`）。用 `pickerValue = ref([autoLockMinutes.value])` 双向绑定；打开时即高亮当前项。

### 决策 7：接线导出/导入（修复无反应）

**根因**：`SettingsPage` 用 `$emit('export')`/`$emit('import')`，作为路由组件无父级监听，事件丢弃。

**方案**：在 `SettingsPage` 内直接使用 `useExport().downloadExport()`；导入新增隐藏 `<input type="file" accept="application/json">`，点击触发选择，`FileReader` 读入 → `JSON.parse` → `useImport().validateFormat` 校验 → 合法则询问"合并/覆盖"并调用 `importMerge`/`importOverwrite`，非法则 `showToast` 提示。完成后刷新相关列表状态。

### 决策 8：解锁删除键改回退图标

**方案**：`NumberKeyboard` 删除键由 `van-icon name="delete"` 换为回退（⌫）样式。Vant 内置图标无标准 backspace，实现时优先选用合适的内置图标；若无则内联一个 ⌫ SVG。行为不变。

## Risks / Trade-offs

- **[`deepToRaw` 遗漏特殊类型]** 若未来记录中出现 `Blob`/`File`/`Map` 等 → 目前数据仅含原始值/数组/普通对象/`Date`，已覆盖；新增复杂类型时需扩展该函数。
- **[4 位 PIN 是行为收窄]** 已与需求方确认采用 4 位 PIN。现有用户若已设置了非 4 位/含字母密码（历史上本就无法解锁），迁移无损；无需数据迁移，但 UI 文案需明确"4 位数字"。
- **[导入覆盖模式]** `importOverwrite` 会清空并重建 places/reviews → 通过"合并/覆盖"二次确认降低误操作风险。

## Open Questions

- 密码 PIN 录入 UI 是"复用组件片段"还是"设置页内联复刻"？倾向抽出可复用的"PIN 录入"以供解锁与设置共用，但若复用成本高则内联，二者对用户体验一致性无差异。（实现细节，可在 apply 阶段定夺。）

> 已解决：① 密码采用 4 位数字 PIN（需求方确认）。② Vant 全屏预览只读 `url`，photo 项定为 `{ url, isImage: true }`（对照 Vant 4.10 源码）。
