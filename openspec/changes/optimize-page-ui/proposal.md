## Why

当前页面布局和交互存在多处不一致：各页面的头部样式不统一、添加记录的入口位置不够便捷、店铺列表缺乏分类组织、页面切换时滚动位置不重置。此次优化统一了页面头部、添加按钮交互模式以及列表分组展示方式，提升使用体验的一致性。

## What Changes

- 路由切换时自动回到页面顶部
- 移除导航栏中单独的添加记录入口，在记录页右下角新增悬浮圆形 + 按钮
- 记录页悬浮按钮带圆角样式，固定在视口右下角
- 店铺页顶部标题改为固定头部（sticky header）
- 店铺页顶部右侧的添加按钮移至右下角悬浮按钮
- 店铺按分类进行分组展示，参考记录页按日/周分组的 UI 模式
- 统计页新增固定头部标题
- 设置页新增固定头部标题

## Capabilities

### New Capabilities
- `scroll-to-top`: 路由切换时自动将页面滚动到顶部
- `review-fab`: 记录页右下角悬浮圆形 + 按钮，替代导航栏中的添加记录入口
- `place-list-enhancements`: 店铺页固定头部、悬浮添加按钮、按分类分组展示
- `page-headers`: 统计页和设置页新增固定头部标题

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `src/router/index.ts`：路由配置添加 scrollBehavior
- `src/views/ReviewListPage.vue`：移除导航栏添加入口相关的逻辑，添加悬浮按钮
- `src/views/PlaceListPage.vue`：头部改为 sticky、添加按钮移至右下角悬浮、添加分类分组逻辑
- `src/views/StatsPage.vue`：添加固定头部标题
- `src/views/SettingsPage.vue`：添加固定头部标题
- 导航栏/TabBar 组件：可能涉及移除添加记录入口
