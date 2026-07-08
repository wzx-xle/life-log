## ADDED Requirements

### Requirement: 记录新增页固定标题
记录新增/编辑页的标题栏 SHALL 固定在视口顶部，不随内容滚动。

#### Scenario: 记录新增页标题固定
- **WHEN** 用户在记录新增页向下滚动填写表单
- **THEN** 标题栏（van-nav-bar）保持在视口顶部可见

#### Scenario: 记录编辑页标题固定
- **WHEN** 用户在记录编辑页向下滚动
- **THEN** 标题栏保持在视口顶部可见
