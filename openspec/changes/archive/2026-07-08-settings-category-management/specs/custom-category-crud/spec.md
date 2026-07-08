## ADDED Requirements

### Requirement: 存储自定义分类数据表
系统 SHALL 在 IndexedDB `LifeLogDB` 中新增 `customCategories` 表，存储用户创建的自定义分类。
表结构 MUST 包含字段：`id`（自增主键）、`name`（分类名称，唯一）、`color`（CSS 色值）、`createdAt`（创建时间）。

#### Scenario: 首次启动时表初始化
- **WHEN** 应用首次启动或从旧版本升级
- **THEN** `customCategories` 表自动创建，初始为空（不预填数据）

#### Scenario: 数据持久化
- **WHEN** 用户创建自定义分类后关闭并重新打开应用
- **THEN** 之前创建的自定义分类仍然存在

### Requirement: 创建自定义分类
系统 SHALL 允许用户创建自定义分类，需提供名称和颜色。
名称 MUST 唯一，不能与已有自定义分类重名。

#### Scenario: 成功创建
- **WHEN** 用户输入唯一名称和颜色后确认
- **THEN** 新分类保存到 `customCategories` 表，在分类选择器中可见

#### Scenario: 重名创建失败
- **WHEN** 用户输入的名称与已有自定义分类名称相同
- **THEN** 系统提示"分类名称已存在"，不创建重复分类

#### Scenario: 空名称创建失败
- **WHEN** 用户未输入名称或输入空白名称
- **THEN** 系统提示"请输入分类名称"，不创建分类

### Requirement: 编辑自定义分类
系统 SHALL 允许用户编辑已有自定义分类的名称和颜色。
编辑名称时 MUST 检查是否与其他自定义分类重名。
编辑名称时 SHALL 同步更新所有使用该分类名称的 Place 的 `customCategory` 字段。

#### Scenario: 成功编辑名称和颜色
- **WHEN** 用户修改分类名称和颜色后确认
- **THEN** 分类信息更新，所有关联 Place 的 `customCategory` 字段同步更新

#### Scenario: 编辑名称与其他分类重名
- **WHEN** 用户将分类名称改为已有分类名称
- **THEN** 系统提示"分类名称已存在"，不保存

#### Scenario: 仅编辑颜色
- **WHEN** 用户仅修改颜色不修改名称
- **THEN** 分类颜色更新，不触发 Place 同步

### Requirement: 删除自定义分类
系统 SHALL 允许用户删除自定义分类。
删除时 MUST 确认操作。
删除后，关联 Place 的 `customCategory` 字段 SHALL 保留原值（不影响已有数据）。

#### Scenario: 删除并确认
- **WHEN** 用户选择删除某自定义分类并确认
- **THEN** 分类从表中移除，使用该分类的 Place 保留其 `customCategory` 值

#### Scenario: 取消删除
- **WHEN** 用户选择删除某自定义分类但取消确认
- **THEN** 分类保持不变

### Requirement: 预设分类只读
系统 SHALL 保持预设分类（restaurant、hotel、retail、service、entertainment、custom）为只读，不可编辑或删除。
自定义分类管理仅操作 `customCategories` 表，不影响预设分类。

#### Scenario: 预设分类不可见
- **WHEN** 用户进入分类管理页面
- **THEN** 仅显示自定义分类列表，预设分类不在管理界面中出现
