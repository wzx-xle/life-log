## ADDED Requirements

### Requirement: 统计面板显示消费概览
系统 SHALL 显示摘要卡片，包含总评价数、店铺总数和总消费金额。

#### Scenario: 加载时显示概览卡片
- **WHEN** 用户导航到统计页面
- **THEN** 系统 SHALL 计算并显示总评价数、去重店铺数和总消费金额

### Requirement: 统计面板显示消费趋势图
系统 SHALL 显示过去 12 个月的月度消费折线图。

#### Scenario: 趋势图渲染月度消费
- **WHEN** 统计页面加载
- **THEN** 系统 SHALL 渲染折线图，显示过去 12 个月每月的消费金额

#### Scenario: 长按显示月度详情
- **WHEN** 用户长按趋势图上的数据点
- **THEN** 系统 SHALL 显示该月的具体消费金额

### Requirement: 统计面板显示分类消费占比
系统 SHALL 显示按消费金额统计的各分类占比饼图。

#### Scenario: 饼图显示分类占比
- **WHEN** 统计页面加载
- **THEN** 系统 SHALL 渲染饼图，显示按店铺分类的总消费金额占比

#### Scenario: 点击饼图扇区下钻
- **WHEN** 用户点击饼图中的扇区
- **THEN** 系统 SHALL 显示该分类下的店铺及其消费金额

### Requirement: 统计面板显示评分分布
系统 SHALL 显示综合评价分布柱状图（1-5 星）。

#### Scenario: 评分柱状图渲染
- **WHEN** 统计页面加载
- **THEN** 系统 SHALL 渲染柱状图，显示各综合评分的评价数量（1 到 5 分）

### Requirement: 统计面板显示常去店铺 Top5
系统 SHALL 显示评价次数最多的前 5 个店铺排名列表。

#### Scenario: Top5 列表渲染
- **WHEN** 统计页面加载
- **THEN** 系统 SHALL 按评价次数降序显示前 5 个店铺

#### Scenario: 点击导航到店铺详情
- **WHEN** 用户点击 Top5 列表中的店铺
- **THEN** 系统 SHALL 导航到该店铺的详情页

### Requirement: 统计面板提供足迹地图入口
系统 SHALL 提供按钮导航到地图视图，仅显示有评价的店铺。

#### Scenario: 足迹地图按钮导航
- **WHEN** 用户点击足迹地图按钮
- **THEN** 系统 SHALL 导航到地图页面
