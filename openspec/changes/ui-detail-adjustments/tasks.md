## 1. 记录新增页固定标题

- [x] 1.1 在 `src/views/AddReviewPage.vue` 中添加样式使 van-nav-bar 成为 sticky 定位（`:deep(.van-nav-bar) { position: sticky; top: 0; z-index: 10; }`）
- [x] 1.2 将 `src/views/AddReviewPage.vue` 的 `padding-top: var(--spacing-sm)` 改为 `padding-top: var(--spacing-lg)`，增加内容区与标题栏的间距

## 2. 地点选择弹出框两列布局

- [x] 2.1 在 `src/components/review/ReviewFull.vue` 中将 `van-action-sheet` 替换为 `van-popup`，高度设为 60%，实现左右两列自定义布局
- [x] 2.2 左列：分类标签列表（含「全部」），使用 `useCategoryDisplay` 获取标签；右列：根据选中分类过滤的店铺列表
- [x] 2.3 移除 `placeActions` computed 中的「+ 新建店铺」选项
- [x] 2.4 弹出框底部添加取消按钮关闭 popup

## 3. 新增店铺页优化

- [x] 3.1 在 `src/views/PlaceAddPage.vue` 中设置 van-nav-bar sticky 样式，移除 `left-text="返回"`
- [x] 3.2 在 PlaceForm 下方的 `src/views/PlaceAddPage.vue` 模板中添加取消按钮（`round block plain`，调用 `onCancel`）
- [x] 3.3 在 `src/components/place/PlaceForm.vue` 分类网格末尾增加 + 按钮，点击弹出分类创建表单（名称 + 12 色选择 + 确认/取消）
- [x] 3.4 分类创建成功后刷新 `customCategories` 列表

## 4. 分类管理页优化

- [x] 4.1 在 `src/views/CategoryManagePage.vue` 中设置 van-nav-bar sticky 样式，移除 `left-text="返回"`
- [x] 4.2 为分类管理页内容区添加 `padding-top: var(--spacing-lg)` 顶部留白，与 AddReviewPage 保持一致
