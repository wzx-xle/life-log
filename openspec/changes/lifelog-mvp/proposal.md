## 为什么

LifeLog 解决了一个隐私优先、纯本地的线下服务场所体验记录需求。目前没有一款轻量级 PWA 能够结合详细评价追踪和完整离线能力，且无需账号或云存储。本 MVP 使用户能够构建一个完全由自己掌控的个人消费日记。

## 变更内容

- 使用 Vue 3 + TypeScript + Vite 搭建移动优先的 PWA 项目
- 实现 4 位数字密码锁：SHA-256 哈希、自动锁定、暴力破解防护（5 次错误 → 30 秒锁定）
- 实现店铺完整 CRUD：分类（6 种 + 自定义）、照片压缩、标签、地图选点
- 实现详细评价记录：4 维度评分、消费项目、标签、会再光顾；编辑/删除
- 构建评价浏览列表：按时间分组（今天/昨天/本周/更早）、分类筛选、排序、关键词搜索
- 构建店铺管理列表：浏览所有店铺、点击进入详情
- 构建统计面板：ECharts 图表（趋势、分类占比、评分分布）、Top5 常去店铺
- 实现数据管理：JSON 导出、导入（合并/覆盖）、清除全部数据
- 添加 PWA 支持：vite-plugin-pwa、预缓存 + 运行时缓存
- 配置设置页面：密码锁、自动锁定时间、修改/重置密码、关于信息
- FTP 部署脚本：`npm run deploy` 一键构建并上传到服务器
- Hash 路由模式：避免 SPA 刷新 404

## 能力

### 新增能力
- `password-protection`：4 位应用密码锁，支持密码创建/修改/重置、自动锁定计时器、暴力破解锁定
- `place-management`：店铺的增删改查，含名称、分类（6 种预设 + 自定义）、地址、经纬度、电话、营业时间、标签、照片（最多 9 张，自动压缩）、地图选点
- `review-records`：详细评价模式（4 维度评分 + 综合推荐、消费项目、标签、会再光顾）；编辑/删除
- `review-browsing`：按时间分组的列表视图，支持分类筛选、排序（时间/评分）、关键词搜索、左滑删除
- `place-detail`：店铺详情页，含照片轮播、综合评分、信息、操作（导航、拨打电话）、关联评价列表、编辑/删除
- `stats-dashboard`：摘要卡片、月度消费趋势折线图、分类饼图、评分分布柱状图、常去店铺 Top5
- `data-management`：JSON 导出（含版本号）、导入（合并/覆盖模式）、清除全部数据（含确认）
- `settings`：安全设置（密码开关、修改、自动锁定、重置）、关于信息
- `deployment`：FTP 部署脚本，`npm run deploy` 一键构建 + 上传

### 修改的能力
*（无——这是新项目。）*

## 影响

- 新项目脚手架：Vue 3 + Vite + TypeScript + Vant 4 + Pinia + Vue Router + Dexie.js
- 新增依赖：高德地图 JSAPI 2.0、ECharts 5、Compressor.js、vite-plugin-pwa、postcss-px-to-viewport、basic-ftp、unplugin-vue-components
- 数据完全存储在 IndexedDB（通过 Dexie.js，places + reviews 两张表）和 localStorage（设置项）
- 无服务端变更——纯客户端、离线优先的 PWA
