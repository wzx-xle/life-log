# webdav-sync Specification

## Purpose
TBD - created by archiving change webdav-sync. Update Purpose after archive.
## Requirements
### Requirement: WebDAV 连接配置与校验

用户 SHALL 能在设置中填写 WebDAV 服务地址、账号、密码与根目录路径，并保存到本地。系统 SHALL 提供「测试连接」以校验凭证与可达性；当因跨域（CORS）被拒时，SHALL 给出可区分的提示，指引用户在服务端放行跨域。

#### Scenario: 保存有效配置

- **WHEN** 用户填写地址/账号/密码/根目录并点击保存
- **THEN** 配置持久化到本地，下次进入设置时回显（密码字段可回显或以掩码呈现）

#### Scenario: 测试连接成功

- **WHEN** 用户点击「测试连接」且凭证与网络正常、服务端已放行跨域
- **THEN** 提示连接成功

#### Scenario: 跨域被拒的可区分提示

- **WHEN** 「测试连接」因浏览器跨域限制失败（无响应头/`Failed to fetch`）
- **THEN** 提示明确指向「服务端未放行跨域（CORS）」，而非泛化的网络错误

### Requirement: 数据分文件布局与清单

上传的数据 SHALL 在 WebDAV 根目录下分文件存放：`categories.json`（自定义分类）、`places.json`（店铺）、`reviews/<YYYY-MM>.json`（按月分片的记录，含照片）。系统 SHALL 维护 `manifest.json` 作为权威清单，至少包含 schema 版本、应用版本、上次同步时间，以及每个数据文件的内容哈希与记录数。

#### Scenario: 记录按月分片

- **WHEN** 上传记录数据
- **THEN** 每条记录按其日期归入 `reviews/<YYYY-MM>.json`，同月记录写入同一文件

#### Scenario: 清单描述所有数据文件

- **WHEN** 一次上传完成
- **THEN** `manifest.json` 列出当前所有数据文件及其内容哈希与记录数，且最后写入以指向一致的快照

### Requirement: 单向上传（按哈希增量）

用户触发上传时，系统 SHALL 以本地数据为准，将分类、店铺、记录写入 WebDAV。系统 SHALL 依据远端 `manifest.json` 的内容哈希，仅上传发生变化或新增的文件，并删除远端已不再存在的记录分片；`manifest.json` SHALL 在数据文件写入之后最后更新。

#### Scenario: 仅上传变化的分片

- **WHEN** 本地仅某个月份的记录发生变化后触发上传
- **THEN** 仅该月份分片与 `manifest.json` 被重新写入，未变化的其它分片不重传

#### Scenario: 清理陈旧分片

- **WHEN** 某月份记录全部被删除后触发上传
- **THEN** 远端对应的 `reviews/<YYYY-MM>.json` 被删除，且不再出现在新的 `manifest.json` 中

#### Scenario: 首次上传自动建目录

- **WHEN** 根目录或 `reviews/` 子目录在 WebDAV 上尚不存在时触发上传
- **THEN** 系统先创建所需目录再写入文件，上传成功

### Requirement: 下载覆盖恢复

用户触发下载恢复时，系统 SHALL 从 WebDAV 读取 `manifest.json` 及其列出的数据文件，校验内容哈希后，在单个事务内清空并重写本地的分类、店铺、记录。恢复 SHALL 保留原记录与店铺的主键 ID 以维持引用关系。恢复为破坏性操作，执行前 SHALL 要求用户二次确认并明示「本地未上传的改动会丢失」。

#### Scenario: 恢复前二次确认

- **WHEN** 用户点击「下载恢复」
- **THEN** 弹出确认对话框，明示将用云端数据覆盖本地、本地未上传改动会丢失；用户取消则不改动本地

#### Scenario: 覆盖写入并保持引用完整

- **WHEN** 用户确认恢复且云端数据校验通过
- **THEN** 本地分类/店铺/记录被云端数据覆盖，记录的 `placeId` 仍正确指向对应店铺

#### Scenario: 校验失败中止

- **WHEN** 某数据文件内容哈希与 `manifest.json` 不符或文件缺失
- **THEN** 中止恢复并提示失败，不对本地数据做部分写入

### Requirement: 自定义分类纳入备份

同步 SHALL 覆盖自定义分类（`customCategories`），上传与恢复均包含分类数据，补齐既有 JSON 导出对分类的遗漏。

#### Scenario: 分类随同步往返

- **WHEN** 用户新增自定义分类后上传，并在另一环境下载恢复
- **THEN** 恢复后的环境包含该自定义分类

### Requirement: 同步状态展示

设置中的同步入口 SHALL 展示上次同步（上传/恢复）的时间，便于用户在「最后上传为准」的单向模型下人工判断。

#### Scenario: 展示上次同步时间

- **WHEN** 用户完成一次上传或恢复后再次进入同步入口
- **THEN** 显示最近一次同步的时间

