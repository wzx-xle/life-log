## ADDED Requirements

### Requirement: 用户可以导出数据为 JSON
系统 SHALL 将所有店铺和评价数据导出为可下载的 JSON 文件。

#### Scenario: 导出生成有效 JSON 文件
- **WHEN** 用户在设置中点击"导出数据"
- **THEN** 系统 SHALL 生成包含 version、exportDate、places 数组（含所有字段）、reviews 数组（含 placeName 字段）的 JSON 文件，并触发浏览器下载

#### Scenario: 导出文件名格式
- **WHEN** 导出文件被下载
- **THEN** 文件 SHALL 命名为 lifelog_backup_YYYY-MM-DD.json

### Requirement: 用户可以导入 JSON 数据
系统 SHALL 允许从之前导出的 JSON 文件导入数据。

#### Scenario: 有效文件显示模式选择
- **WHEN** 用户选择格式正确的有效 .json 文件
- **THEN** 系统 SHALL 提示用户选择"合并"或"覆盖"导入模式

#### Scenario: 合并导入追加数据
- **WHEN** 用户选择合并模式
- **THEN** 系统 SHALL 导入店铺和评价，自动生成新 ID 避免冲突，并更新评价中的 placeId 引用

#### Scenario: 覆盖导入替换所有数据
- **WHEN** 用户选择覆盖模式
- **THEN** 系统 SHALL 在导入前清除所有现有店铺和评价数据

#### Scenario: 导入显示结果摘要
- **WHEN** 导入完成
- **THEN** 系统 SHALL 显示导入的店铺数和评价数摘要

#### Scenario: 拒绝无效格式
- **WHEN** 所选文件缺少有效字段（无 version、places 或 reviews）
- **THEN** 系统 SHALL 拒绝导入并显示错误信息

### Requirement: 用户可以清除所有数据
系统 SHALL 允许用户在确认后清除所有业务数据。

#### Scenario: 确认后清除数据
- **WHEN** 用户点击"清除所有数据"并确认警告对话框
- **THEN** 系统 SHALL 清空 IndexedDB 中所有店铺和评价数据，并清除 localStorage 中非密码相关的设置

#### Scenario: 取消清除数据
- **WHEN** 用户点击"清除所有数据"但取消确认对话框
- **THEN** 系统 SHALL 不修改任何数据
