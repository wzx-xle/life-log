## ADDED Requirements

### Requirement: 设置页入口
系统 SHALL 在设置页增加"分类管理"入口，点击后导航至分类管理页面。

#### Scenario: 点击进入分类管理
- **WHEN** 用户在设置页点击"分类管理"
- **THEN** 导航至分类管理页面（独立页面，非弹窗）

### Requirement: 自定义分类列表
系统 SHALL 在分类管理页面以列表形式展示所有自定义分类。
每个列表项 MUST 显示分类名称和颜色标记。
列表为空时 SHALL 显示空状态提示。

#### Scenario: 展示已有分类
- **WHEN** 用户已创建自定义分类
- **THEN** 列表展示所有自定义分类，每项包含颜色圆点和名称

#### Scenario: 空列表
- **WHEN** 用户尚未创建任何自定义分类
- **THEN** 显示空状态提示"暂无自定义分类，点击下方按钮创建"

### Requirement: 新增分类入口
系统 SHALL 在分类管理页面提供新增分类按钮，点击后弹出表单。

#### Scenario: 打开新增表单
- **WHEN** 用户点击"新增分类"按钮
- **THEN** 弹出表单，包含名称输入框和颜色选择器

### Requirement: 分类表单
系统 SHALL 提供新增/编辑分类的表单，包含名称输入和颜色选择。
颜色选择器 MUST 提供预设颜色选项供快速选择，同时支持自定义色值输入。

#### Scenario: 选择预设颜色
- **WHEN** 用户在颜色选择器中点击预设颜色
- **THEN** 颜色值更新为所选颜色

#### Scenario: 输入自定义色值
- **WHEN** 用户手动输入 CSS 色值（如 `#FF6B35`）
- **THEN** 颜色值更新为输入值

### Requirement: 编辑分类操作
系统 SHALL 在分类列表中每个分类项的右侧提供编辑操作入口。
点击编辑后弹出与新增相同的表单，预填当前名称和颜色。

#### Scenario: 打开编辑表单
- **WHEN** 用户点击某分类的编辑按钮
- **THEN** 弹出编辑表单，预填该分类的名称和颜色

### Requirement: 删除分类操作
系统 SHALL 在分类列表中每个分类项的右侧提供删除操作入口。
删除前 SHALL 弹出确认对话框。

#### Scenario: 确认删除
- **WHEN** 用户点击删除按钮并在确认对话框中确认
- **THEN** 该分类从列表中移除

### Requirement: 分类在店铺表单中展示
系统 SHALL 在店铺新增/编辑表单的分类选择器中，在预设分类下方展示自定义分类。
自定义分类的选中值对应 `category: 'custom'` + `customCategory: <分类名称>`。

#### Scenario: 选择自定义分类
- **WHEN** 用户在店铺表单中选择某自定义分类
- **THEN** Place 的 `category` 字段设置为 `'custom'`，`customCategory` 字段设置为该分类名称

#### Scenario: 分类颜色展示
- **WHEN** 店铺列表、详情、统计中涉及自定义分类的店铺
- **THEN** 使用自定义分类定义的颜色展示

### Requirement: 分类筛选支持
系统 SHALL 在店铺列表的筛选栏中支持按自定义分类筛选。
筛选逻辑 SHALL 匹配 Place 的 `customCategory` 字段。

#### Scenario: 按自定义分类筛选
- **WHEN** 用户在筛选栏选择某自定义分类
- **THEN** 列表展示 `customCategory` 等于该分类名称的店铺
