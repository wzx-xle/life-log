# Changelog

LifeLog 所有值得关注的变更记录。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.1] - 2026-07-08

### 新增

- 店铺列表按分类分组展示，参考记录页按时间分组的 UI 模式
- 记录页和店铺页右下角悬浮圆形 + 按钮（FAB），替代原有添加入口

### 变更

- 统一所有页面头部为 sticky 模式（白底 + 底部分割线）
- TabBar 从 5 个标签减少至 4 个（移除单独的「添加」标签）
- 路由切换时自动回到页面顶部
- 导出数据版本号升级至 1.0.1

### 修复

- 记录页和设置页标题字号与其他页面统一（`--font-size-xl` → `--font-size-lg`）

## [1.0.0] - 2026-06

### 新增

- 本地优先的生活体验日记 PWA
- IndexedDB（Dexie.js）数据持久化，支持店铺和评价两个数据表
- Hash 路由，底部 TabBar（记录 / 店铺 / 地图 / 统计 / 设置）
- 评价记录 CRUD：评分、文字、消费金额、消费明细、照片、标签
- 店铺管理 CRUD：分类、地址、电话、营业时间、高德地图选点
- 分类管理：预设 6 大分类 + 自定义分类，预设分类自动初始化到数据库
- 数据统计页：消费趋势图、分类消费占比饼图、评分分布柱状图、常去店铺 TOP5
- 密码锁：Web Crypto API SHA-256 加盐哈希，支持自动锁定
- 照片压缩：Compressor.js 压缩后以 base64 存储在 IndexedDB
- 数据导入/导出
- PostCSS px→vw 移动端适配（viewportWidth: 320）
- Vant 4 组件按需自动导入

[1.0.1]: https://github.com/wzx-xle/life-log/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/wzx-xle/life-log/releases/tag/v1.0.0
