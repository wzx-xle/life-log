## 背景

LifeLog 是一个全新的 PWA 应用，无现有代码库——本文档从零开始建立完整架构。应用完全运行在客户端，无后端，数据存储在 IndexedDB 和 localStorage 中。主要交付形式为移动优先、可安装的 PWA Web 应用。

## 目标 / 非目标

**目标：**
- 定义一个模块化、可测试的全客户端 Vue 3 PWA 架构
- 建立数据层（Dexie.js 封装的 IndexedDB）、状态管理（Pinia）和 UI 组件层次
- 支持离线优先：所有应用逻辑无需网络；地图瓦片通过 Service Worker 缓存
- 实现提案中定义的 9 项能力，职责清晰分离

**非目标：**
- 服务端渲染或 API 后端
- 用户账号或认证（密码锁仅为本地）
- 推送通知
- 实时协作或同步（预留未来）
- 通过 Capacitor/React Native 实现原生应用（仅 PWA）

## 关键决策

### 框架与构建
- **Vue 3 + Vite + TypeScript**：选择 Vue 而非 React 因为更轻量的包体积和 Composition API 的易用性；Vite 提供亚秒级 HMR 和原生 TS 支持
- **Vant 4**：专为移动端优化的 Vue 3 组件库；避免从零构建表单、对话框、标签栏等
- **postcss-px-to-viewport**：自动将 px 转换为 vw 单位；消除移动端手动响应式断点的需求

### 数据层
- **Dexie.js 替代原生 IndexedDB**：基于 Promise 的 API，支持实时查询、批量操作和 schema 版本管理；避免 IndexedDB 回调繁重的原生 API
- **双表 schema**（`places`、`reviews`）使用逻辑外键（`placeId`）；通过 Pinia store 连接查询避免复杂 join
- **照片以 base64 存储**：比 File API + Object URL 更简单，便于离线持久化；Compressor.js 控制单张照片在 200KB 以内

### 地图
- **高德地图 JSAPI 2.0**：国内最全面的地图提供商，支持 POI 搜索、地理编码和完善的移动端支持；通过动态脚本注入加载（不打包），减小 vendor chunk
- **通过 `useMap` 组合式函数进行地图抽象**：封装高德地图生命周期、标记管理和搜索；允许未来更换地图提供商而不影响视图层

### 状态管理
- **Pinia 替代 Vuex**：更轻量、TypeScript 类型推断更好、无 mutations 模板代码
- **Store 作为直读缓存**：视图从 Pinia 读取数据；store 在变更时同步写入 Dexie；避免对已加载数据的重复数据库查询

### 安全
- **Web Crypto API 实现 SHA-256**：零依赖的密码哈希；原生浏览器实现避免引入加密库
- **固定盐值 + 哈希存储在 localStorage**：盐值为应用内硬编码常量；通过手动比较循环实现常量时间比较（避免字符串 `===` 的时序攻击）

### PWA
- **vite-plugin-pwa** + `autoUpdate`：构建时预缓存静态资源；运行时缓存高德地图瓦片（Network First，7 天过期）和 API 调用（Network First，24 小时过期）
- **Standalone 显示模式**：无浏览器 UI，锁定竖屏

## 风险 / 权衡

- **base64 照片存储 → IndexedDB 配额压力**：通过压缩（单张 200KB 上限、每条实体 2MB）和设置中的导出/备份推荐来缓解
- **高德地图 JSAPI 依赖 → 离线地图降级**：Network First 策略缓存已访问过的瓦片；未访问区域离线显示灰色瓦片。对于地图驱动型 UX 是可接受的权衡
- **无后端 → 无数据恢复**：唯一缓解措施是导出功能；密码重置设计为毁灭性操作
- **移动端 CSS 视口单位 → 桌面端显示拉伸**：可接受，目标设备为移动端；桌面调试为次要

## 部署

### 部署方式
- **FTP 上传到自建服务器根目录**：纯静态部署，`npm run build` 产出 `dist/`，上传即可
- **构建产物目录结构**：
  ```
  dist/
  ├── index.html
  ├── manifest.json
  ├── sw.js              # Service Worker（vite-plugin-pwa 生成）
  ├── assets/            # 打包后的 JS/CSS/图片
  └── ...                # PWA 图标等静态资源
  ```

### 环境变量管理
- **高德地图 Key**：通过 `VITE_AMAP_KEY` 环境变量注入，编译时内联到代码
  - 本地开发：`VITE_AMAP_KEY` 写入 `.env.local`（gitignore）
  - 生产构建：`VITE_AMAP_KEY` 写入 `.env.production`（gitignore，不上传仓库）
- **`vite.config.ts` 配置 `base: '/'`**：根目录部署，所有资源路径以 `/` 为基准

### SPA 路由回退
- Vue Router 使用 `createWebHistory` 模式（推荐），路径 `/reviews`、`/stats` 等需要服务器将所有请求回退到 `index.html`
- **服务器配置由用户自行处理**（Nginx 用 `try_files`，Apache 用 `.htaccess`），不纳入项目文件
- 备选方案：若服务器不支持，可降级为 `createWebHashHistory`（`/#/reviews`），但影响 SEO 和 PWA manifest 的 `start_url` 配置
