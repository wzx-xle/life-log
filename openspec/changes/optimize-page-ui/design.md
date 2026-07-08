## Context

当前应用各页面在头部样式、添加按钮位置、列表分组展示等方面缺乏一致性。此设计统一这些 UI 模式，提升交互体验。

当前状态：
- 路由切换时有 page-slide 动画，但不重置滚动位置
- 导航栏 TabBar 有一个独立的「添加」标签，点击跳转到 AddReviewPage
- 记录页 ReviewListPage 无浮动按钮
- 店铺页 PlaceListPage 有普通页面头部，+ 按钮在右侧
- 店铺列表为平铺列表，无分组
- 统计页和设置页有标题但非固定头部

约束：Vue 3 + Vant 4 + PostCSS px→vw（viewportWidth: 320），CSS 变量 px 值会被转换。

## Goals / Non-Goals

**Goals:**
- 路由切换后页面自动回到顶部
- 移除 TabBar 中的「添加」标签，在记录页添加右下角悬浮 + 按钮
- 记录页悬浮按钮：圆形、圆角、固定在视口右下角
- 店铺页头部改为 sticky，+ 按钮移至右下角悬浮
- 店铺列表按分类分组展示（参考记录页分组 UI）
- 统计页和设置页标题改为 sticky 头部

**Non-Goals:**
- 不改变添加记录/店铺的流程
- 不改变数据模型或 API
- 不改变其他页面的布局
- 不新增任何依赖

## Decisions

### 1. 页面回到顶部：使用 `scrollBehavior`

Vue Router 原生支持 `scrollBehavior`，在路由配置中返回 `{ top: 0 }` 即可。无需在每个组件中使用 `onMounted` + `window.scrollTo`。

```ts
// router/index.ts
scrollBehavior() {
  return { top: 0 }
}
```

### 2. TabBar 移除「添加」标签

从 `tabs` 数组中移除 `{ name: 'add', label: '添加', icon: 'plus' }`，同时移除 `onTabClick` 中对应的处理逻辑。这是纯移除，不涉及新增逻辑。

### 3. 记录页悬浮添加按钮

在 ReviewListPage 模板中添加一个固定在右下角的圆形按钮，使用 Vant 的 `<van-button>` 或自定义 div + `<van-icon name="plus">`。按钮通过 `position: fixed; bottom: 60px; right: 16px;` + `z-index` 实现悬浮。

点击后跳转到 AddReviewPage (`router.push({ name: 'addReview' })`)，与原 TabBar 添加按钮行为一致。

### 4. 店铺页头部 sticky + 分类分组 + 悬浮按钮

**Sticky header**：将 `.page-header` 添加 `position: sticky; top: 0; z-index: 10; background: var(--color-bg-white);` 即可固定在顶部。

**分类分组**：参考 ReviewListPage 的 `reviewGroups` 计算属性模式，按 `place.category` + `place.customCategory` 分组。使用已有的 `getLabel()` 作为分组标签。分组标签数据来源：预设分类 `CATEGORY_LIST` + 自定义分类。

分组 UI 与记录页一致：group-header（标签 + 数量）+ 列表项。

**悬浮按钮**：与记录页 FAB 同模式，固定在右下角，点击跳转 `addPlace`。

### 5. 统计页和设置页固定头部

统一采用记录页 `sort-bar` 的 sticky 模式：**白色背景 + 底部分割线 + 全宽 + 内 padding**。

具体调整：
- 将 `.page-title` 独立为全宽 sticky header 元素，不再被外层容器的 padding 包裹
- 样式：`position: sticky; top: 0; z-index: 10; background: var(--color-bg-white); border-bottom: 1px solid var(--color-border); padding: var(--spacing-lg);`
- 外层容器移除顶部 padding，内部内容区保留原有 padding

## Risks / Trade-offs

- **ScrollBehavior 与过渡动画**：Vue Router 的 `scrollBehavior` 在 `<transition>` 中可能有时机问题。如遇到，可改用 `router.afterEach` + `window.scrollTo` 作为 fallback。
- **TabBar 移除「添加」后布局变化**：从 5 个标签变为 4 个，间距自动调整（`justify-content: space-around`），视觉上更宽松，符合预期。
- **店铺页分类分组**：空分类组不应显示。如果某分类下无店铺，跳过该组。
- **FAB 与 safe-area**：需确保悬浮按钮不被 TabBar 遮挡也不被 safe-area 裁切。`bottom` 值需考虑 TabBar 高度（50px）+ safe-area padding。
