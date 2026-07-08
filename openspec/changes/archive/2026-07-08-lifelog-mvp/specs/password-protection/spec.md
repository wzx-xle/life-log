## ADDED Requirements

### Requirement: 用户可以创建 4 位数字密码
系统 SHALL 允许用户通过设置页面设置 4 位数字密码。

#### Scenario: 成功创建密码
- **WHEN** 用户输入 4 位密码并两次输入一致
- **THEN** 系统 SHALL 将 SHA-256(盐值 + 密码) 哈希值存储到 localStorage

#### Scenario: 密码确认不一致
- **WHEN** 用户输入 4 位密码但两次输入不一致
- **THEN** 系统 SHALL 显示错误提示"两次密码不一致，请重新设置"并清空两个输入框

#### Scenario: 输入非数字字符
- **WHEN** 用户输入非数字字符
- **THEN** 系统 SHALL 拒绝输入（仅允许数字）

### Requirement: 用户可以用密码解锁应用
当密码锁开启且应用启动或从后台返回超时时，系统 SHALL 显示锁屏页面。

#### Scenario: 正确密码解锁应用
- **WHEN** 用户输入正确的 4 位密码
- **THEN** 系统 SHALL 导航到目标页面

#### Scenario: 错误密码增加错误计数
- **WHEN** 用户输入错误的 4 位密码（连续错误 < 5 次）
- **THEN** 系统 SHALL 清空输入并增加错误计数

#### Scenario: 连续 5 次错误触发 30 秒锁定
- **WHEN** 用户连续 5 次输入错误密码
- **THEN** 系统 SHALL 禁用数字键盘并显示 30 秒倒计时

#### Scenario: 锁定时间结束
- **WHEN** 30 秒锁定计时器到期
- **THEN** 系统 SHALL 将错误计数重置为 0，重新启用键盘，允许重新输入

### Requirement: 用户可以修改密码
系统 SHALL 允许已认证用户在设置页面修改密码。

#### Scenario: 成功修改密码
- **WHEN** 用户正确输入当前密码，然后输入新 4 位密码并确认一致
- **THEN** 系统 SHALL 更新存储的密码哈希值

#### Scenario: 当前密码错误
- **WHEN** 用户输入错误的当前密码
- **THEN** 系统 SHALL 显示错误信息并阻止修改

### Requirement: 应用在配置的超时后自动锁定
系统 SHALL 在应用从后台返回且超过配置的空闲时间后自动锁定。

#### Scenario: 在超时时间内返回
- **WHEN** 应用在配置的自动锁定时间内返回前台
- **THEN** 系统 SHALL 不显示锁屏

#### Scenario: 超出超时时间返回
- **WHEN** 应用在配置的自动锁定时间之后返回前台
- **THEN** 系统 SHALL 显示锁屏

#### Scenario: 可配置自动锁定时间
- **WHEN** 用户选择自动锁定时间（立即、1 分钟、5 分钟、15 分钟）
- **THEN** 系统 SHALL 保存选择并在后续后台切换时应用

### Requirement: 用户可以通过清除所有数据重置密码
系统 SHALL 提供清除所有数据的密码重置选项。

#### Scenario: 确认后重置密码
- **WHEN** 用户在设置中选择"重置密码"并确认警告对话框
- **THEN** 系统 SHALL 清除所有 localStorage 密码数据和所有 IndexedDB 业务数据，将应用恢复到首次使用状态

#### Scenario: 取消重置密码
- **WHEN** 用户选择"重置密码"但取消确认对话框
- **THEN** 系统 SHALL 不清除任何数据
