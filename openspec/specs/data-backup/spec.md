# data-backup Specification

## Purpose
TBD - created by archiving change fix-qa-defects-260710. Update Purpose after archive.
## Requirements
### Requirement: 数据导出可用

设置页点击"导出数据" SHALL 直接触发一次 JSON 备份文件的下载（调用已存在的导出逻辑），而非发出无人监听的组件事件。导出文件 MUST 包含全部店铺（`places`）与记录（`reviews`）数据。自定义分类表（`customCategories`）不在本次导出范围内（已知缺口，见 design）。

#### Scenario: 点击导出下载文件

- **WHEN** 用户在设置页点击"导出数据"
- **THEN** 浏览器下载一个 `lifelog_backup_<日期>.json` 文件，内容包含当前所有店铺与记录

### Requirement: 数据导入可用

设置页点击"导入数据" SHALL 弹出文件选择对话框，读取用户选择的 JSON 文件并校验格式后导入。格式非法时 MUST 给出提示且不写入数据；成功后 MUST 提示导入的店铺与记录数量。

#### Scenario: 点击导入弹出文件选择

- **WHEN** 用户在设置页点击"导入数据"
- **THEN** 弹出系统文件选择对话框，允许选择 JSON 文件

#### Scenario: 导入合法备份

- **WHEN** 用户选择一个格式合法的备份 JSON
- **THEN** 数据被导入，界面提示导入的店铺与记录数量

#### Scenario: 导入非法文件被拒绝

- **WHEN** 用户选择一个格式不合法的文件
- **THEN** 界面提示文件格式错误，且不改动现有数据

