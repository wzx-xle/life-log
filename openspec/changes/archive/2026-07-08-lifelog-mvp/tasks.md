## 1. 项目脚手架

- [x] 1.1 使用 Vue 3 + Vite + TypeScript 初始化项目，集成所有依赖
- [x] 1.2 配置 tsconfig.json，启用严格模式和路径别名
- [x] 1.3 配置 vite.config.ts：PWA、postcss-px-to-viewport(viewportWidth:320)、Vant 按需导入、base 路径 `/`
- [x] 1.3a 创建 `.env.production`（gitignore），配置 `VITE_AMAP_KEY`
- [x] 1.3b 创建 `.env.ftp`（gitignore），配置 FTP 凭证
- [x] 1.4 创建 `.gitignore`
- [x] 1.5 创建项目目录结构
- [x] 1.6 创建全局 CSS 变量（variables.css）：分类颜色、主题色、间距
- [x] 1.7 创建 global.css：基础重置、排版、工具类
- [x] 1.8 生成 PWA 图标（logo-192x192.png、logo-512x512.png、favicon.ico）

## 2. 数据层

- [x] 2.1 定义 TypeScript 接口：Place、Review、Rating、ConsumptionItem、ExportData、Category
- [x] 2.2 创建 Dexie 数据库类（LifeLogDB），places + reviews 表
- [x] 2.3 实现 useDatabase 组合式函数：全部 CRUD + 聚合查询
- [x] 2.4 实现事务性删除（deletePlace）
- [x] 2.5 导出工具：exportData.ts
- [x] 2.6 导入工具：importData.ts（校验 + 合并/覆盖）
- [x] 2.7 加密工具：crypto.ts（SHA-256 + 常量时间比较）

## 3. 路由与导航

- [x] 3.1 定义路由表（Hash 模式）：/lock、/、/places、/places/:id、/places/add、/places/edit/:id、/places/map-pick、/reviews/add、/reviews/edit/:id、/stats、/settings
- [x] 3.2 实现全局路由守卫：密码锁检查
- [x] 3.3 构建底部标签栏（5 个标签：记录/店铺/添加/统计/设置），统一风格
- [x] 3.4 标签栏显隐逻辑：仅主标签页显示

## 4. 密码锁模块

- [x] 4.1 NumberKeyboard 数字键盘组件
- [x] 4.2 LockScreen 锁屏视图
- [x] 4.3 useLock 组合式函数
- [x] 4.4 密码创建流程
- [x] 4.5 密码修改流程
- [x] 4.6 自动锁定计时器
- [x] 4.7 密码重置（清空数据）
- [x] 4.8 30 秒锁定保护

## 5. 地图（仅用于选点）

- [x] 5.1 useMap 组合式函数：AMap 动态加载
- [x] 5.2 MapPickerPage：点击选点 + 定位针 + 逆地理编码
- [x] 5.3 mapPickState 响应式状态：选点结果跨页面传递
- [x] 5.4 默认定位到用户当前位置
- [x] 5.5 确认/取消按钮在底部

## 6. 店铺管理

- [x] 6.1 PlaceForm 组件：全字段表单 + 分类选择 + 地图选点入口
- [x] 6.2 照片处理：Compressor.js 压缩、base64 存储、最多 9 张
- [x] 6.3 表单校验：必填、最大长度、自定义分类
- [x] 6.4 PlaceAddPage：创建模式、保存后返回来源页
- [x] 6.5 PlaceEditPage：编辑模式、删除含关联评价确认
- [x] 6.6 PlaceListPage：店铺列表页（标签栏"店铺"入口）
- [x] 6.7 店铺删除：确认对话框显示关联评价数量

## 7. 评价记录（仅详细模式）

- [x] 7.1 RatingStar 星级评分组件
- [x] 7.2 ReviewFull 表单：4 维度评分 + 消费项目 + 标签 + 会再光顾
- [x] 7.3 消费项目子表单：动态添加/删除
- [x] 7.4 AddReviewPage：添加/编辑模式、watch + immediate 响应异步数据
- [x] 7.5 评价删除：列表左滑确认、详情页删除按钮

## 8. 评价浏览

- [x] 8.1 ReviewCard 组件：分类色点、评分、摘要、金额、标签
- [x] 8.2 ReviewListPage：时间分组、空状态引导
- [x] 8.3 分类筛选栏：横向滚动吸顶
- [x] 8.4 排序切换：时间/评分
- [x] 8.5 关键词搜索

## 9. 店铺详情

- [x] 9.1 PlaceDetailPage：照片轮播、综合评分、信息、标签
- [x] 9.2 关联评价列表
- [x] 9.3 底部固定操作栏：编辑、写记录
- [x] 9.4 导航按钮（打开地图应用）+ 拨号按钮
- [x] 9.5 评价 CRUD 实时更新综合统计

## 10. 统计面板

- [x] 10.1 StatsPage 布局：摘要卡片 + 图表
- [x] 10.2 TrendChart：ECharts 月度消费趋势折线图
- [x] 10.3 CategoryPie：ECharts 分类消费占比饼图
- [x] 10.4 RatingBar：ECharts 评分分布柱状图
- [x] 10.5 常去店铺 Top5 排行
- [x] 10.6 进入页面时重新计算统计

## 11. 设置

- [x] 11.1 SettingsPage 布局：安全设置、数据管理、关于
- [x] 11.2 密码锁开关、自动锁定时间、修改/重置密码
- [x] 11.3 数据导出/导入入口
- [x] 11.4 关于：应用名称、版本号、隐私声明

## 12. 数据管理

- [x] 12.1 JSON 导出：含 version/exportDate/placeName
- [x] 12.2 JSON 导入：校验 + 合并/覆盖模式 + ID 重映射
- [x] 12.3 清除所有数据：确认对话框 → 清空 IndexedDB + localStorage

## 13. PWA

- [x] 13.1 vite-plugin-pwa 配置：预缓存 + manifest
- [x] 13.2 运行时缓存：AMap API(24h)、AMap 瓦片(7d)、第三方(24h)
- [x] 13.3 自动更新提示
- [x] 13.4 离线可用验证

## 14. 部署

- [x] 14.1 创建 FTP 部署脚本（scripts/deploy.mjs）
- [x] 14.2 创建 `.env.ftp` 配置模板（gitignore）
- [x] 14.3 package.json 添加 `deploy` 命令
- [x] 14.4 验证 `npm run deploy` 构建 + 上传流程

## 15. 打磨与重构

- [x] 15.1 页面切换动画
- [x] 15.2 异步加载状态
- [x] 15.3 错误处理改进
- [x] 15.4 Hash 路由模式（解决刷新 404）
- [x] 15.5 移除快速评价模式，统一为详细模式
- [x] 15.6 移除"默认记录模式"和"地图缩放级别"设置项
- [x] 15.7 标签栏统一风格：5 个等大图标 + 文字
- [x] 15.8 viewportWidth 调整为 320：字体更大
- [x] 15.9 MapPicker 改为点击选点 + 小型定位针
- [x] 15.10 类型检查通过，无未使用导入
