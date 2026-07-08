# LifeLog

记录你的本地生活消费体验。

![version](https://img.shields.io/badge/version-1.0.1-orange)

LifeLog 是一款**本地优先**的生活体验日记 PWA，帮助你记录去过的店铺、消费体验、评分和照片。所有数据仅存储在浏览器中，无需注册，无需联网。

## 功能

- **评价记录** — 评分、文字感受、消费金额、消费明细、照片、标签，支持快捷模式和完整模式
- **店铺管理** — 分类管理（6 大预设分类 + 自定义分类）、地址、电话、营业时间、高德地图选点
- **数据统计** — 消费趋势图、分类占比饼图、评分分布柱状图、常去店铺 TOP5
- **密码锁** — Web Crypto API SHA-256 加盐哈希，支持自动锁定，保护隐私数据
- **沉浸式地图** — 高德地图标注所有店铺位置，足迹一目了然
- **数据导入/导出** — JSON 格式完整备份与恢复
- **PWA** — 可安装到桌面，离线可用
- **移动端适配** — PostCSS px→vw 自动适配，Vant 4 组件库

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API, `<script setup>`) |
| 语言 | TypeScript (strict mode) |
| 路由 | Vue Router (Hash 模式) |
| 状态管理 | Pinia |
| UI 组件 | Vant 4 (按需自动导入) |
| 数据库 | IndexedDB via Dexie.js |
| 图表 | ECharts 5 |
| 地图 | 高德地图 JSAPI 2.0 |
| 构建 | Vite + vue-tsc |
| 测试 | Vitest + @vue/test-utils |
| PWA | vite-plugin-pwa |

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 运行测试
npm run test

# 构建
npm run build

# 部署
npm run deploy
```

### 环境变量

创建 `.env.production`：

```
VITE_AMAP_KEY=你的高德地图Key
```

创建 `.env.ftp`（FTP 部署用）：

```
FTP_HOST=
FTP_USER=
FTP_PASSWORD=
```

## 项目结构

```
src/
├── assets/styles/     # CSS 变量、全局样式
├── components/        # 公共组件
│   ├── common/        # TabBar 等通用组件
│   ├── place/         # 店铺相关组件
│   ├── review/        # 评价相关组件
│   └── stats/         # 统计图表组件
├── composables/       # 组合式函数 (useDatabase, useLock, useCategoryDisplay)
├── db/                # Dexie 数据库定义与初始化
├── router/            # 路由配置
├── stores/            # Pinia store
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数 (导出/导入)
└── views/             # 页面组件
```

## 数据模型

应用基于两个核心实体：

- **Place (店铺)** — 名称、分类、地址、坐标、电话、标签、照片
- **Review (评价)** — 关联店铺、日期、评分 (服务/环境/性价比/综合)、内容、消费金额、消费明细、照片

所有数据存储在浏览器 IndexedDB 中。照片通过 Compressor.js 压缩后以 base64 存储。使用单盐值 + SHA-256 哈希存储密码，盐值存在 localStorage。

## 架构决策

- **本地优先** — 不依赖服务器，数据完全在用户浏览器中
- **Hash 路由** — `createWebHashHistory`，兼容静态文件部署
- **PostCSS px→vw** — 基于 320px 视口自动转换，CSS 变量中的 px 值也会被转换
- **密码安全** — 密码永不明文存储，仅保留加盐哈希用于验证

## 许可

MIT
