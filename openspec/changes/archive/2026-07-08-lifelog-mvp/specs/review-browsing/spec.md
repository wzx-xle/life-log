## ADDED Requirements

### Requirement: 评价列表按时间分组
系统 SHALL 按时间段（今天、昨天、本周、更早）分组显示评价，组内按日期降序排列。

#### Scenario: 空状态显示引导
- **WHEN** 没有评价时
- **THEN** 系统 SHALL 显示"还没有体验记录，去地图上添加吧"

#### Scenario: 评价按时间分组
- **WHEN** 评价跨越不同时间段
- **THEN** 系统 SHALL 将它们分组到"今天"、"昨天"、"本周"、"更早"标题下

### Requirement: 用户可以按分类筛选评价
系统 SHALL 在评价列表上方提供横向可滚动的分类筛选栏。

#### Scenario: 按分类筛选
- **WHEN** 用户点击分类标签（全部、餐饮、住宿等）
- **THEN** 列表 SHALL 筛选为仅显示该分类店铺的评价

#### Scenario: 筛选栏吸顶
- **WHEN** 用户滚动评价列表
- **THEN** 分类筛选栏 SHALL 保持在顶部可见（吸顶定位）

### Requirement: 用户可以对评价排序
系统 SHALL 允许按时间、评分或距离对评价排序。

#### Scenario: 按时间排序（默认）
- **WHEN** 用户选择时间排序
- **THEN** 评价 SHALL 按日期降序排列

#### Scenario: 按评分排序
- **WHEN** 用户选择评分排序
- **THEN** 评价 SHALL 按综合评分降序排列

### Requirement: 用户可以按关键词搜索评价
系统 SHALL 允许按店铺名称或评价内容搜索评价。

#### Scenario: 搜索实时过滤
- **WHEN** 用户在搜索栏输入
- **THEN** 系统 SHALL 过滤匹配关键词（店铺名称或评价内容）的评价，按日期降序排列

#### Scenario: 无搜索结果
- **WHEN** 搜索关键词无匹配评价
- **THEN** 系统 SHALL 显示"未找到相关记录"
