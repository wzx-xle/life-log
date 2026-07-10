## ADDED Requirements

### Requirement: 写入前深度解包响应式代理

数据层在向 IndexedDB 写入 `Place`、`Review`、`CustomCategory` 前，SHALL 将输入对象深度转换为可被结构化克隆算法（structured clone）接受的纯数据，移除所有 Vue reactive/ref 代理包装。转换 MUST 递归处理嵌套数组与嵌套对象，并 MUST 保留 `Date` 实例（不得序列化为字符串），以免破坏基于 `createdAt` / `updatedAt` / `date` 的 Dexie 索引。

#### Scenario: 保存带标签的店铺

- **WHEN** 用户在店铺表单添加一个或多个标签后点击保存
- **THEN** 标签数组被解包为纯字符串数组并成功写入 IndexedDB，不抛出 `DataCloneError`，且列表/详情页能读回标签

#### Scenario: 保存带照片的店铺

- **WHEN** 用户为店铺添加至少一张照片后点击保存
- **THEN** 照片数组被解包为纯 base64 字符串数组并成功写入，不出现"保存失败，请重试"

#### Scenario: 保存带消费明细的记录

- **WHEN** 用户为一条记录添加至少一条消费明细（含 `name`/`price` 的对象）后提交
- **THEN** 消费明细数组中的每个对象被解包为纯对象并成功写入，提交成功且再次打开可读回明细

#### Scenario: 时间字段保持为 Date

- **WHEN** 任意含 `createdAt`/`updatedAt`/`date` 的记录被写入
- **THEN** 这些字段在库中仍为 `Date` 类型，按时间排序与范围查询行为不变
