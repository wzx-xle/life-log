## ADDED Requirements

### Requirement: 用户可以添加新店铺
系统 SHALL 允许用户添加新店铺，包含名称、分类、地址、坐标和可选字段。

#### Scenario: 成功创建店铺
- **WHEN** 用户填写所有必填字段（名称、分类、地址、经纬度）并提交
- **THEN** 系统 SHALL 将店铺保存到 IndexedDB 并在地图上添加新标记

#### Scenario: 必填字段为空
- **WHEN** 用户提交时缺少必填字段
- **THEN** 系统 SHALL 显示校验错误并阻止提交

#### Scenario: 店铺名称超过 50 字符
- **WHEN** 用户输入超过 50 个字符的店铺名称
- **THEN** 系统 SHALL 截断或拒绝并显示错误信息

#### Scenario: 自定义分类需要自定义名称
- **WHEN** 用户选择分类"自定义"
- **THEN** 系统 SHALL 要求输入自定义分类名称

#### Scenario: 添加店铺时上传照片
- **WHEN** 用户在创建店铺时附带照片（最多 9 张）
- **THEN** 系统 SHALL 通过 Compressor.js 压缩每张照片（质量 60%、最大 800px）并以 base64 字符串存储

### Requirement: 用户可以编辑店铺
系统 SHALL 允许用户编辑已有店铺的任何字段。

#### Scenario: 成功更新店铺
- **WHEN** 用户修改店铺字段并保存
- **THEN** 系统 SHALL 更新 IndexedDB 中的店铺、更新 updatedAt 时间戳、同步地图标记

#### Scenario: 分类变更更新标记颜色
- **WHEN** 用户更改店铺分类
- **THEN** 地图标记颜色 SHALL 更新以匹配新分类

### Requirement: 用户可以删除店铺
系统 SHALL 允许用户删除店铺及其所有关联评价。

#### Scenario: 删除店铺前确认
- **WHEN** 用户发起店铺删除
- **THEN** 系统 SHALL 显示确认对话框，说明将删除的关联评价数量

#### Scenario: 删除店铺移除关联评价
- **WHEN** 用户确认删除店铺
- **THEN** 系统 SHALL 在单个事务中从 IndexedDB 删除店铺及其所有关联评价
