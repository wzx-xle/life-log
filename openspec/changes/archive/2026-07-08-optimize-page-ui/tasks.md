## 1. 页面回到顶部

- [x] 1.1 在 `src/router/index.ts` 中添加 `scrollBehavior`，返回 `{ top: 0 }`

## 2. 导航栏调整

- [x] 2.1 在 `src/components/common/TabBar.vue` 中移除 `{ name: 'add', label: '添加', icon: 'plus' }` 标签项
- [x] 2.2 移除 `onTabClick` 中 `add` 相关的处理逻辑

## 3. 记录页悬浮添加按钮

- [x] 3.1 在 `src/views/ReviewListPage.vue` 模板中添加右下角悬浮圆形 + 按钮（position: fixed）
- [x] 3.2 悬浮按钮点击后跳转到 AddReviewPage（`router.push({ name: 'addReview' })`）
- [x] 3.3 确保悬浮按钮不被 TabBar 遮挡（bottom 值考虑 TabBar 高度 + safe-area）

## 4. 店铺页优化

- [x] 4.1 将 `src/views/PlaceListPage.vue` 的 `.page-header` 改为 sticky 定位（position: sticky; top: 0）
- [x] 4.2 移除头部右侧的 + 图标，改为右下角悬浮按钮（position: fixed）
- [x] 4.3 添加分类分组逻辑：按 `place.category` + `place.customCategory` 分组，使用 `useCategoryDisplay` 获取标签
- [x] 4.4 分组 UI 参考 ReviewListPage 的 group-header 样式（标签 + 数量 + 列表项）

## 5. 统计页和设置页固定头部

- [x] 5.1 重构 `src/views/StatsPage.vue` 的 `.page-title` 为全宽 sticky 头部（白色背景 + 底部分割线 + 内 padding），与 ReviewListPage 的 sort-bar 模式一致
- [x] 5.2 重构 `src/views/SettingsPage.vue` 的 `.page-title` 为全宽 sticky 头部（白色背景 + 底部分割线 + 内 padding），与 ReviewListPage 的 sort-bar 模式一致
