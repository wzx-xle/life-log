## ADDED Requirements

### Requirement: 路由切换时回到顶部
系统 SHALL 在路由切换（包括前进、后退、Tab 切换）后将页面滚动位置重置到顶部。

#### Scenario: 从记录页切换到统计页
- **WHEN** 用户在记录页向下滚动后点击底部「统计」标签
- **THEN** 页面自动滚动到顶部

#### Scenario: 从店铺列表进入店铺详情后返回
- **WHEN** 用户在店铺列表页浏览后点击某个店铺进入详情，然后返回
- **THEN** 返回后页面滚动位置在顶部

#### Scenario: Hash 路由内导航
- **WHEN** 用户在应用内通过 hash 路由切换页面（如 `/#/reviews` → `/#/stats`）
- **THEN** 页面滚动到顶部
