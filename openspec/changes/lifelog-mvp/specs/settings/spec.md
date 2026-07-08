## ADDED Requirements

### Requirement: 设置页面提供安全管理
系统 SHALL 提供安全设置，包括密码锁开关、修改密码、自动锁定配置和密码重置。

#### Scenario: 密码锁开关
- **WHEN** 用户切换密码锁开/关
- **THEN** 系统 SHALL 启用或禁用密码保护并更新 localStorage

#### Scenario: 修改密码导航
- **WHEN** 用户点击"修改密码"
- **THEN** 系统 SHALL 导航到密码修改流程

#### Scenario: 自动锁定时间选择
- **WHEN** 用户选择自动锁定时间选项
- **THEN** 系统 SHALL 持久化选择并在后续后台切换时应用

#### Scenario: 重置密码进入毁灭性流程
- **WHEN** 用户点击"重置密码"
- **THEN** 系统 SHALL 显示警告，确认后执行数据清除

### Requirement: 设置页面提供偏好配置
系统 SHALL 提供默认评价模式和地图缩放级别的偏好设置。

#### Scenario: 默认评价模式选择
- **WHEN** 用户选择默认评价模式（快速或详细）
- **THEN** 系统 SHALL 在添加新评价时使用该模式作为默认值

#### Scenario: 地图缩放级别选择
- **WHEN** 用户选择默认地图缩放级别
- **THEN** 系统 SHALL 在初始化地图时应用该缩放级别

### Requirement: 设置页面显示关于信息
系统 SHALL 显示应用名称、版本号和隐私声明。

#### Scenario: 关于区域显示
- **WHEN** 用户查看设置页面
- **THEN** 系统 SHALL 显示应用名称"LifeLog"、版本号，以及所有数据本地存储、不上传的声明
