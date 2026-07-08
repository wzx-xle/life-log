## Why

当前 6 个分类是硬编码的，用户无法根据自己的消费习惯自定义分类（如"理发"、"健身房"、"宠物"等）。设置页缺少分类管理入口，`custom` 字段只是一个自由文本补充，没有形成真正的自定义分类体系。需要在设置页增加分类管理功能，让用户能够增删改自定义分类。

## What Changes

- 新增自定义分类数据模型，存储在 IndexedDB 中
- 设置页增加"分类管理"入口，进入分类管理页面（或弹窗）
- 支持新增自定义分类（名称 + 颜色/图标）
- 支持编辑/删除已有自定义分类
- 自定义分类与预设分类在店铺表单中统一展示和筛选
- 删除自定义分类时，允许将该分类下的店铺迁移到其他分类
- 预设分类不可编辑或删除
- 保持对旧数据的兼容（已有 `custom` 字段的店铺不受影响）

## Capabilities

### New Capabilities
- `custom-category-crud`: 自定义分类的创建、编辑、删除，持久化在 IndexedDB
- `category-management-ui`: 设置页的分类管理入口和分类列表管理界面

### Modified Capabilities
<!-- 现有 spec 无变化，均为新增能力 -->

## Impact

- `src/types/index.ts`：新增 `CustomCategory` 接口，修改 `Category` 类型以兼容动态分类
- `src/db/index.ts`：新增 `categories` 表或使用 localStorage 存储自定义分类
- `src/composables/useDatabase.ts`：新增自定义分类 CRUD 方法
- `src/views/SettingsPage.vue`：增加分类管理入口
- `src/components/place/PlaceForm.vue`：分类选择器需同时展示预设和自定义分类
- 统计页、筛选栏等使用分类的地方需要适配动态分类
