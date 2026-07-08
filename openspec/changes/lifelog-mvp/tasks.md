## 1. 项目脚手架

- [x] 1.1 使用 Vue 3 + Vite + TypeScript 初始化项目，集成 Vant 4、Vue Router、Pinia、Dexie.js、ECharts、vite-plugin-pwa、Compressor.js、postcss-px-to-viewport
- [x] 1.2 配置 tsconfig.json，启用严格模式和路径别名
- [x] 1.3 配置 vite.config.ts：PWA 插件、postcss-px-to-viewport、resolve 别名、base 路径 `/`
- [x] 1.3a 创建 `.env.production` 文件（gitignore），配置 `VITE_AMAP_KEY`
- [x] 1.3b 创建 `.gitignore`，忽略 `.env.production`、`.env.local`、`dist/`
- [x] 1.4 按设计规范创建项目目录结构（components/、composables/、db/、router/、stores/、types/、utils/、views/）
- [x] 1.5 创建全局 CSS 变量（variables.css），包含分类颜色、主题色和间距比例
- [x] 1.6 创建 global.css，包含基础重置、排版和工具类
- [x] 1.7 设置 PWA 资源：favicon、logo-192x192.png、logo-512x512.png、maskable icon
- [x] 1.8 创建 manifest.json 配置

## 2. 数据层（Dexie.js + 类型定义）

- [x] 2.1 定义 TypeScript 接口：Place、Review、Rating、ConsumptionItem、ExportData
- [x] 2.2 创建 Dexie 数据库类（LifeLogDB），包含 places 和 reviews 表的 schema、索引和版本管理
- [x] 2.3 实现数据库 CRUD 操作，封装为组合式函数（useDatabase）
- [x] 2.4 实现事务性删除：在一个事务中删除店铺及其所有关联评价
- [x] 2.5 导出工具：将所有数据导出为 JSON，包含 version、exportDate、placeName 字段
- [x] 2.6 导入工具：校验 JSON 格式，合并/覆盖模式，placeId 重新映射
- [x] 2.7 实现加密工具：通过 Web Crypto API 计算 SHA-256(盐值 + 密码) 哈希，支持常量时间比较

## 3. 路由与导航

- [x] 3.1 定义路由表：/lock、/、/reviews、/reviews/add、/reviews/edit/:id、/places/:id、/places/add、/places/edit/:id、/stats、/settings
- [x] 3.2 实现全局路由守卫处理密码锁：锁定状态重定向到 /lock，携带目标路径作为 query 参数
- [x] 3.3 构建底部标签栏导航组件，包含 4 个标签：地图、记录、统计、设置
- [x] 3.4 实现标签栏显隐逻辑：主标签页显示，子页面隐藏

## 4. 密码锁模块

- [x] 4.1 构建数字键盘组件（0-9、删除、确认按钮），支持触感反馈
- [x] 4.2 构建锁屏视图，包含密码输入圆点、数字键盘、错误提示区域和锁定倒计时
- [x] 4.3 创建 useLock 组合式函数：管理锁定状态、错误计数、锁定计时器、自动锁定时间戳、解锁验证
- [x] 4.4 实现设置中的密码创建流程：输入 → 确认 → 哈希 → 存储
- [x] 4.5 实现密码修改流程：验证当前密码 → 输入新密码 → 确认 → 更新哈希
- [x] 4.6 实现自动锁定计时器：visibilitychange 事件 → 时间戳比较 → 锁定触发
- [x] 4.7 实现密码重置：警告对话框 → 清除 localStorage 密码键值 + 清空 IndexedDB
- [x] 4.8 实现连续 5 次错误后的 30 秒锁定，含倒计时显示

## 5. 地图模块

- [x] 5.1 创建 useMap 组合式函数：动态加载高德地图 JSAPI、创建地图实例、管理生命周期
- [x] 5.2 构建 MapView 组件：挂载地图容器、渲染标记、处理手势
- [x] 5.3 构建 PlaceMarker：带分类图标的彩色圆形标记，点击触发信息卡片
- [x] 5.4 构建 PlaceCard：标记点击后弹出的信息卡片，显示店铺名称、评分、分类、操作按钮
- [x] 5.5 实现标记同步：店铺数据变更时通过 Pinia store 添加/更新/删除标记
- [x] 5.6 实现用户定位：Geolocation API 请求、定位按钮、蓝色圆点标记
- [x] 5.7 实现搜索：搜索栏带防抖的高德 POI 查询、建议下拉列表、选中后地图居中
- [x] 5.8 实现地图空白处长按：显示"在此位置添加新店铺"选项、携带坐标跳转添加店铺表单
- [x] 5.9 实现店铺表单中的地图选点器：十字准星模式、拖动选择、逆地理编码

## 6. 店铺管理

- [x] 6.1 构建 PlaceForm 组件，包含所有字段：名称、分类选择器（6 种预设 + 自定义输入）、地址（含地图选点）、电话、营业时间、标签、照片选择器
- [x] 6.2 在 PlaceForm 中实现照片处理：相机/相册选择、Compressor.js 压缩、base64 存储、最多 9 张
- [x] 6.3 实现表单校验：必填字段、最大长度检查、自定义分类名称要求
- [x] 6.4 构建添加店铺页面（PlaceAddView）：PlaceForm 创建模式，保存 → IndexedDB → store → 地图更新
- [x] 6.5 构建编辑店铺页面（PlaceEditView）：PlaceForm 编辑模式，预填数据，保存 → 更新 → 地图同步
- [x] 6.6 实现删除店铺：确认对话框显示关联评价数量

## 7. 评价 CRUD

- [x] 7.1 构建 RatingStar 组件：点击选择、切换取消、实心/空心样式
- [x] 7.2 构建 ReviewQuick 表单：店铺选择器、评分、简短内容（最多 500 字）、金额、照片
- [x] 7.3 构建 ReviewFull 表单：店铺选择器、日期选择器、4 维度评分、内容（最多 2000 字）、金额、消费项目动态列表、标签、会再光顾单选、照片
- [x] 7.4 构建消费项目子表单：可添加/删除的项目行，包含名称和价格字段
- [x] 7.5 构建 AddReviewPage：快速/详细模式切换，提交 → 保存到 IndexedDB
- [x] 7.6 构建编辑评价流程：预填的 ReviewFull/ReviewQuick 表单，保存 → 更新 IndexedDB
- [x] 7.7 实现评价删除：列表左滑删除、详情/编辑页删除按钮、确认对话框

## 8. 评价浏览

- [x] 8.1 构建 ReviewCard 组件：店铺名称、分类色点、评分、内容摘要（50 字）、金额、标签
- [x] 8.2 构建 ReviewListPage：按时间分组列表（今天/昨天/本周/更早），空状态引导
- [x] 8.3 构建分类筛选栏：横向滚动、吸顶、实时筛选
- [x] 8.4 构建排序切换：时间/评分，高亮当前排序方式
- [x] 8.5 构建关键词搜索栏：按店铺名称或内容实时过滤，无结果提示

## 9. 店铺详情

- [x] 9.1 构建 PlaceDetailPage：照片轮播（或占位图）、综合评分 + 计数、地址、电话（可点击拨打）、营业时间、标签
- [x] 9.2 在店铺详情中构建关联评价列表：该店铺所有评价，可点击编辑
- [x] 9.3 构建底部固定操作栏："编辑店铺"和"写记录"按钮
- [x] 9.4 实现导航按钮：打开地图应用跳转到店铺坐标
- [x] 9.5 实现数据响应式：评价 CRUD 实时更新综合统计

## 10. 统计面板

- [x] 10.1 构建 StatsPage 布局：摘要卡片、图表、Top5 列表、足迹地图入口
- [x] 10.2 构建 TrendChart（ECharts 折线图）：12 个月度消费趋势，长按显示详情
- [x] 10.3 构建 CategoryPie（ECharts 饼图）：分类消费占比，扇区可点击下钻
- [x] 10.4 构建 RatingBar（ECharts 柱状图）：1-5 星评分分布
- [x] 10.5 构建常去店铺 Top5 列表：按评价次数排序，可点击跳转店铺详情
- [x] 10.6 构建足迹地图入口按钮 → 跳转地图页面
- [x] 10.7 实现数据刷新：每次进入页面时重新计算统计

## 11. 设置

- [x] 11.1 构建 SettingsPage 布局，包含分组区域：安全设置、偏好设置、关于
- [x] 11.2 实现安全设置区域：密码锁开关、修改密码导航、自动锁定时间选择器、重置密码含警告
- [x] 11.3 实现偏好设置区域：默认评价模式选择器、地图缩放级别选择器
- [x] 11.4 实现关于区域：应用名称、版本号、隐私声明文字

## 12. 数据管理

- [x] 12.1 实现数据导出：从 IndexedDB 读取所有店铺和评价数据，构建含 version/exportDate/placeName 的 JSON，触发浏览器下载
- [x] 12.2 实现数据导入：文件选择器 → JSON 解析 → 格式校验 → 模式选择（合并/覆盖） → 导入含 ID 重映射 → 结果摘要
- [x] 12.3 实现"清除所有数据"：警告对话框 → 清空 IndexedDB + 非密码相关 localStorage

## 13. PWA 与 Service Worker

- [x] 13.1 配置 vite-plugin-pwa：静态资源预缓存、manifest 设置
- [x] 13.2 配置运行时缓存：高德地图 API（Network First，24h）、高德瓦片（Network First，7d）、第三方资源（Stale While Revalidate，24h）
- [x] 13.3 实现自动更新：SW 检测到新版本时提示用户刷新
- [x] 13.4 测试离线功能：静态资源无网络可加载，IndexedDB CRUD 离线可工作

## 14. 部署配置

- [x] 14.1 配置 `.env.production` 文件（gitignore），写入 `VITE_AMAP_KEY=用户的Key`
- [x] 14.2 配置 `.gitignore`：忽略 `.env.production`、`.env.local`、`dist/`、`node_modules/`
- [x] 14.3 确保 `vite.config.ts` 中 `base: '/'`（根目录部署）
- [x] 14.4 执行 `npm run build` 验证构建产物位于 `dist/` 目录
- [x] 14.5 确认 Nginx 配置 `try_files $uri /index.html;` 或 Apache `.htaccess` 已就绪（用户自行处理）

## 15. 打磨与横切关注点

- [x] 15.1 添加页面切换动画（Vue Router 过渡动画）
- [x] 15.2 为异步操作（数据库读取、地图初始化、照片压缩）实现加载状态
- [x] 15.3 添加错误处理：数据库错误、地图加载失败、导入格式错误
- [x] 15.4 在移动端视口（375px 宽度）测试并验证所有布局
- [x] 15.5 运行类型检查并修复所有 TypeScript 错误
- [x] 15.6 确认无未使用的导入或死代码（来自脚手架生成的内容）
