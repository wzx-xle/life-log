## ADDED Requirements

### Requirement: 导航栏移除添加记录入口
导航栏 TabBar SHALL 不再包含「添加」标签入口。

#### Scenario: TabBar 显示标签
- **WHEN** 用户在记录/店铺/统计/设置任一主页面
- **THEN** 底部 TabBar 只显示「记录」「店铺」「统计」「设置」四个标签，不显示「添加」标签

### Requirement: 记录页悬浮添加按钮
记录页 SHALL 在右下角显示一个圆形悬浮按钮，用于添加新记录。

#### Scenario: 悬浮按钮可见
- **WHEN** 用户在记录页（ReviewListPage）
- **THEN** 页面右下角显示一个圆形 + 悬浮按钮，固定在视口右下角，不被滚动影响

#### Scenario: 点击悬浮按钮添加记录
- **WHEN** 用户点击记录页右下角的悬浮 + 按钮
- **THEN** 导航到添加记录页面（AddReviewPage）

#### Scenario: 悬浮按钮不被 TabBar 遮挡
- **WHEN** 记录页显示悬浮按钮
- **THEN** 悬浮按钮位于 TabBar 上方，不被遮挡
