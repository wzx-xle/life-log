## Why

在完成上一轮全局 UI 模式统一后，部分子页面的细节仍然存在不一致和交互不便：标题栏样式不统一、地点选择弹出框操作效率低、新增店铺页缺少快捷分类入口、分类管理页内容与标题贴边。此轮调整针对这些细节进行打磨，提升表单页面的操作体验。

## What Changes

- 记录新增页（AddReviewPage）：标题栏改为 sticky 固定头部、内容区顶部留白加大（`var(--spacing-sm)` → `var(--spacing-lg)`）
- 记录新增页地点选择弹出框：移除「+ 新建店铺」按钮，改为左右两列布局（左列分类筛选 + 右列对应店铺列表），弹出框高度增大至至少显示 5 项
- 新增店铺页（PlaceAddPage）：标题栏改为 sticky、返回按钮仅保留箭头不显示「返回」文字、表单底部新增取消按钮、分类选项末尾增加一个仅显示「+」的新增分类按钮
- 分类管理页（CategoryManagePage）：标题栏改为 sticky、返回按钮仅保留箭头不显示「返回」文字、内容区顶部增加留白

## Capabilities

### New Capabilities
- `add-review-sticky-header`: 记录新增/编辑页固定标题
- `place-picker-two-column`: 地点选择弹出框改为两列布局，移除新建按钮
- `place-add-enhancements`: 新增店铺页标题固定、返回按钮去文字、取消按钮、分类 + 按钮
- `category-manage-enhancements`: 分类管理页标题固定、返回按钮去文字、内容顶部留白

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `src/views/AddReviewPage.vue`：van-nav-bar 改为 sticky 模式，样式统一为已有的 page-header 模式
- `src/components/review/ReviewFull.vue`：van-action-sheet 改为自定义弹出层，两列布局（左分类 + 右列表）
- `src/views/PlaceAddPage.vue`：van-nav-bar 去掉 left-text、提交/取消按钮布局
- `src/components/place/PlaceForm.vue`：分类网格末尾增加 + 按钮，点击弹出新增分类框
- `src/views/CategoryManagePage.vue`：van-nav-bar 去掉 left-text、sticky、内容区 padding-top
