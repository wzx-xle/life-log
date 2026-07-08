## ADDED Requirements

### Requirement: 用户可以添加快速评价
系统 SHALL 允许用户添加快速评价，包含评分、可选简短笔记、金额和照片。

#### Scenario: 创建快速评价
- **WHEN** 用户选择店铺、输入 1-5 星评分并提交
- **THEN** 系统 SHALL 将评价保存到 IndexedDB

#### Scenario: 快速评价含简短笔记
- **WHEN** 用户输入不超过 500 字符的文本内容
- **THEN** 系统 SHALL 保存包含该文本内容的评价

#### Scenario: 快速评价内容超过 500 字符
- **WHEN** 用户输入超过 500 字符
- **THEN** 系统 SHALL 阻止提交并显示字符限制错误

### Requirement: 用户可以添加详细评价
系统 SHALL 允许用户添加详细评价，包含多维度评分、消费项目和标签。

#### Scenario: 创建完整详细评价
- **WHEN** 用户填写店铺、日期、4 维度评分（服务、环境、性价比、综合）、内容（最多 2000 字）、金额、消费项目、标签、会再光顾选择和照片
- **THEN** 系统 SHALL 将评价保存到 IndexedDB

#### Scenario: 详细评价内容超过 2000 字符
- **WHEN** 用户输入超过 2000 字符
- **THEN** 系统 SHALL 阻止提交并显示字符限制错误

### Requirement: 星级评分交互遵循点击选择行为
系统 SHALL 实现点击星星选择连续多颗星的评分交互。

#### Scenario: 点击第 N 颗星选中 1-N
- **WHEN** 用户点击第 N 颗星
- **THEN** 第 1 到第 N 颗星 SHALL 被填充/高亮

#### Scenario: 点击已选中的星取消所有
- **WHEN** 用户点击已选中的最高星
- **THEN** 所有星星 SHALL 变为未选中（0 星评分）

### Requirement: 用户可以编辑评价
系统 SHALL 允许用户编辑已有评价的任何字段。

#### Scenario: 编辑并保存评价
- **WHEN** 用户修改评价字段并保存
- **THEN** 系统 SHALL 更新 IndexedDB 中的评价

### Requirement: 用户可以删除评价
系统 SHALL 允许用户删除评价。

#### Scenario: 从列表删除评价
- **WHEN** 用户在评价列表项上左滑并确认删除
- **THEN** 系统 SHALL 从 IndexedDB 移除该评价

#### Scenario: 从详情页删除评价
- **WHEN** 用户在评价详情/编辑页点击删除按钮并确认
- **THEN** 系统 SHALL 从 IndexedDB 移除该评价
