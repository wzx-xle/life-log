## 背景

LifeLog 是一个全新的 PWA 应用，无现有代码库——本文档从零开始建立完整架构。应用完全运行在客户端，无后端，数据存储在 IndexedDB 和 localStorage 中。主要交付形式为移动优先、可安装的 PWA Web 应用。

## 目标 / 非目标

**目标：**
- 定义一个模块化、可测试的全客户端 Vue 3 PWA 架构
- 建立数据层（Dexie.js 封装的 IndexedDB）、状态管理（Pinia）和 UI 组件层次
- 支持离线优先：所有应用逻辑无需网络；地图瓦片通过 Service Worker 缓存
- 实现评价管理、店铺管理、统计三大核心流程

**非目标：**
- 服务端渲染或 API 后端
- 用户账号或认证（密码锁仅为本地）
- 推送通知
- 实时协作或同步（预留未来）
- 通过 Capacitor/React Native 实现原生应用（仅 PWA）

## 关键决策

### 框架与构建
- **Vue 3 + Vite + TypeScript**：选择 Vue 而非 React 因为更轻量的包体积和 Composition API 的易用性；Vite 提供亚秒级 HMR 和原生 TS 支持
- **Vant 4**：专为移动端优化的 Vue 3 组件库；通过 `unplugin-vue-components` + `@vant/auto-import-resolver` 实现按需自动导入
- **postcss-px-to-viewport**：自动将 px 转换为 vw 单位，基准屏宽 320px；消除移动端手动响应式断点的需求，同时自然放大字号

### 路由
- **Hash 模式（`createWebHashHistory`）**：避免 SPA 在无服务器配置的静态托管下刷新出现 404

### 数据层
- **Dexie.js 替代原生 IndexedDB**：基于 Promise 的 API，支持实时查询、批量操作和 schema 版本管理
- **双表 schema**（`places`、`reviews`）使用逻辑外键（`placeId`）；通过 Pinia store 连接查询避免复杂 join
- **照片以 base64 存储**：Compressor.js 压缩（质量 60%、最大宽 800px），单张控制在 200KB 以内

### 地图（仅用于选点）
- **高德地图 JSAPI 2.0**：仅用于店铺地址的地图选点页面，点击地图移动标记，确认后逆地理编码获取地址
- **动态脚本注入加载**（不打包），减小 vendor chunk

### 状态管理
- **Pinia**：比 Vuex 更轻量、TypeScript 类型推断更好
- **Store 作为直读缓存**：视图从 Pinia 读取数据；store 在变更时同步写入 Dexie

### 安全
- **Web Crypto API 实现 SHA-256**：零依赖的密码哈希
- **固定盐值 + 哈希存储在 localStorage**：常量时间比较防止时序攻击

### PWA
- **vite-plugin-pwa** + `autoUpdate`：预缓存静态资源 + 高德地图运行时缓存

## 风险 / 权衡

- **base64 照片存储 → IndexedDB 配额压力**：压缩 + 导出备份推荐缓解
- **Hash 路由 → URL 有 `#` 标记**：在静态托管下可接受的权衡
- **无后端 → 无数据恢复**：唯一缓解是导出功能；密码重置为毁灭性操作

## 部署

### 部署方式
- **FTP 上传到自建服务器根目录**：`npm run build` → `node scripts/deploy.mjs` 上传 `dist/`
- FTP 凭证存储在 `.env.ftp`（已 gitignore），不在仓库中

### 环境变量
- `VITE_AMAP_KEY`：高德地图 Key，写入 `.env.production`（gitignore）
- Vite `base: '/'`、postcss viewportWidth: 320
