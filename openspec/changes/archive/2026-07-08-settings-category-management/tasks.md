## 1. 数据层

- [x] 1.1 在 `src/db/index.ts` 中新增 `customCategories` 表，处理 schema 升级（version 2）
- [x] 1.2 在 `src/composables/useDatabase.ts` 中新增自定义分类 CRUD 方法（getAllCustomCategories、addCustomCategory、updateCustomCategory、deleteCustomCategory）
- [x] 1.3 实现编辑分类名称时批量更新关联 Place 的 `customCategory` 字段

## 2. 分类管理页面

- [x] 2.1 创建 `src/views/CategoryManagePage.vue`：列表展示自定义分类（名称 + 颜色圆点），空状态提示，新增按钮
- [x] 2.2 实现新增/编辑表单弹窗：名称输入 + 预设颜色选择 + 自定义色值输入
- [x] 2.3 实现删除功能：确认弹窗 + 删除逻辑
- [x] 2.4 添加路由 `/settings/categories`（`name: 'categoryManage'`），设置页跳转

## 3. 设置页入口

- [x] 3.1 在 `SettingsPage.vue` 的"数据管理"区段增加"分类管理"入口

## 4. 分类选择器适配

- [x] 4.1 修改 `PlaceForm.vue` 分类选择器：在预设分类后追加自定义分类选项，选中自定义分类时设置 `category: 'custom'` + `customCategory`
- [x] 4.2 修改店铺列表、详情、统计等使用分类的地方，支持显示自定义分类的颜色

## 5. 筛选与统计适配

- [x] 5.1 店铺列表分类筛选栏支持按自定义分类过滤（匹配 `customCategory` 字段）
- [x] 5.2 统计页分类饼图等图表适配自定义分类（展示 `customCategory` 值）

## 6. 验证

- [x] 6.1 `npm run typecheck` 通过
- [x] 6.2 `npm run build` 通过
- [x] 6.3 编写单元测试：useCategoryDisplay（9 个）、useDatabase 自定义分类 CRUD（7 个），共 16 个测试
- [ ] 6.4 手动测试：创建自定义分类 → 店铺表单选择 → 列表展示 → 筛选 → 编辑分类 → 删除分类
