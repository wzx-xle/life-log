## Context

上一轮 `optimize-page-ui` 统一了主页面的 sticky 头部和 FAB 模式，但表单子页面（AddReviewPage、PlaceAddPage）和管理页（CategoryManagePage）仍使用纯 `van-nav-bar`，不支持滚动固定。同时 ReviewFull 组件中的地点选择使用 `van-action-sheet` 的 actions 模式，不支持复杂布局。这些页面需要与主页面保持一致的 sticky 头部模式，并优化交互细节。

## Goals / Non-Goals

**Goals:**
- AddReviewPage 标题栏 sticky 固定
- 地点选择弹出框：两列布局（左分类 + 右店铺），移除「+ 新建店铺」选项，弹窗高度增大
- PlaceAddPage：标题栏 sticky + 返回按钮去文字 + 取消按钮 + 分类末尾 + 按钮
- CategoryManagePage：标题栏 sticky + 返回按钮去文字 + 内容顶部留白

**Non-Goals:**
- 不改变数据流或业务逻辑
- 不新增依赖
- 不修改其他页面的 nav-bar

## Decisions

### 1. 表单页 sticky header 统一采用 `van-nav-bar` + CSS sticky

这三个页面（AddReviewPage、PlaceAddPage、CategoryManagePage）都使用 Vant 的 `<van-nav-bar>`。Vant 的 nav-bar 默认为 static 定位，通过 `:deep(.van-nav-bar)` 覆盖为 `position: sticky; top: 0; z-index: 10` 即可。

与主页面 `.page-header` 的差异：nav-bar 本身带有 border-bottom 和白色背景，只需补充 sticky 属性。

AddReviewPage 和 CategoryManagePage 的内容区与 nav-bar 贴得过近，需统一增加 `padding-top: var(--spacing-lg)`（16px）的顶部留白。

### 2. PlaceAddPage 返回按钮去文字：`left-text` 移除

`van-nav-bar` 的 `left-text` 属性控制箭头旁的文字。移除 `left-text="返回"` 即可只保留箭头。

### 3. 地点选择两列布局：自定义 `van-popup` 替代 `van-action-sheet`

当前 `van-action-sheet` 只能展示扁平 actions 列表（含「+ 新建店铺」选项）。改为 `van-popup` + 自定义两列布局：

```
┌──────────────────────────────┐
│  选择地点                     │
├──────────┬───────────────────┤
│ 全部     │  海底捞           │
│ 餐饮     │  西贝             │
│ 住宿     │  星巴克           │
│ ...      │  ...              │
├──────────┴───────────────────┤
│                        取消  │
└──────────────────────────────┘
```

左列：分类标签列表（含「全部」），点击筛选；右列：对应分类的店铺列表，点击选择。

左列仅显示有关联店铺的分类标签——如果某个分类下没有店铺，该标签不出现。这与 PlaceListPage "空分类组不显示" 的处理一致。分类分组逻辑复用 `useCategoryDisplay` 的 `getLabel()`。

弹出框高度：`height: 60%`（底部弹出）— 确保至少显示 5 个以上店铺项。

弹出框关闭行为：点击 overlay 关闭（`close-on-click-overlay`），选择店铺后手动关闭，底部取消按钮关闭。与 `van-action-sheet` 不同，这些都需要显式处理。

### 4. PlaceAddPage 取消按钮

PlaceForm 底部当前只有「添加店铺」按钮。在 PlaceAddPage 模板中，在 PlaceForm 后额外添加一个取消按钮（与 PlaceForm 同级），与记录页的「提交记录」/「取消」模式一致。

### 5. PlaceForm 分类末尾 + 按钮

在 `allCategoryItems` 的 `v-for` 循环后增加一个固定的 `<div class="category-item category-add-btn">`：
- 点击触发 `showToast` 引导 或 弹出 `van-popup` 内嵌的分类表单
- 逻辑：复用 CategoryManagePage 中的新增分类逻辑（名称 + 颜色选择）
- 新增成功后 `customCategories` 列表需要刷新
- + 按钮样式：与分类项同尺寸但只显示 `+` 号，active 状态时不可加 active

**新增分类弹出框**：在当前页面弹出底部 sheet（`van-popup`），包含名称输入 + 12 色选择 + 确认/取消按钮，直接通过 `useDatabase` 创建分类并刷新 `customCategories`。

### 6. CategoryManagePage + AddReviewPage 内容顶部留白

当前两个页面内容区与 nav-bar 贴得过近（CategoryManagePage 无 padding-top，AddReviewPage 仅 `var(--spacing-sm)` 即 8px）。统一改为 `padding-top: var(--spacing-lg)`（16px），与主页面 `.stats-content` / `.settings-content` 的 padding 值一致，保持 UI 统一。

## Risks / Trade-offs

- **van-action-sheet → van-popup**：取消按钮行为与之前略有不同（action-sheet 自带取消按钮，popup 需要手动添加）。需确保取消按钮交互一致。
- **PlaceForm 新增分类**：新增分类后需重新 `getAllCustomCategories()` 刷新 `customCategories`，否则新分类不会出现在网格中。需确保数据刷新。
- **两列布局滚动**：左列和右列需要独立滚动 (`overflow-y: auto`)，在弹出层中需要合理设置高度。
