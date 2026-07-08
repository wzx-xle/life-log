# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # 开发服务器 (vite)
npm run build        # 类型检查 + 构建 (vue-tsc → vite build)
npm run typecheck    # 仅类型检查
npm run test         # 运行单元测试 (vitest)
npm run test:watch   # 监听模式运行测试
npm run deploy       # 构建 + FTP上传到服务器
```

构建前必须通过 `vue-tsc -b`，`strict: true` + `noUnusedLocals: true`，未使用的导入会导致构建失败。

## 技术栈

- **Vue 3** Composition API (`<script setup lang="ts">`)
- **Vant 4** 组件通过 `unplugin-vue-components` + `@vant/auto-import-resolver` 自动按需导入，模板中直接用 `<van-*>` 无需手动 import
- **Hash 路由** (`createWebHashHistory`)，URL 格式 `/#/reviews`
- **路径别名** `@` → `src/`
- **Dexie.js** 操作 IndexedDB，数据库 `LifeLogDB`，两个表 `places` / `reviews`
- **高德地图 JSAPI 2.0** 动态脚本加载（不打包），仅用于店铺地址选点页面 (`MapPickerPage`)。Key 通过 `import.meta.env.VITE_AMAP_KEY` 注入

## CSS 体系

`postcss-px-to-viewport-8-plugin`，基准 `viewportWidth: 320`。所有 CSS 中的 `px` 值编译时转为 `vw`。

`src/assets/styles/variables.css` 定义 CSS 变量（颜色、字号、间距），通过 `global.css` 的 `@import` 引入。**CSS 变量定义的 `px` 值会被 PostCSS 转换**，但 `var()` 引用不会——所以 CSS 变量定义用 px，组件里用 `var()` 引用即可。

Vant 的默认样式也会被 PostCSS 转换，字号会自动适配。

## 环境变量

- `.env.production`（gitignore）：`VITE_AMAP_KEY=你的Key`
- `.env.ftp`（gitignore）：FTP 部署凭证

## 数据层

- `src/db/index.ts`：Dexie 实例，导出 `db`
- `src/composables/useDatabase.ts`：全部 CRUD + 聚合查询
- 照片：Compressor.js 压缩后以 base64 存储在 IndexedDB
- 密码：Web Crypto API SHA-256 加盐哈希，存在 localStorage
- 店铺删除时事务性级联删除关联评价

## 关键模式

**编辑页回填数据**：父组件异步加载数据后设置 reactive ref，子组件用 `watch(() => props.xxx, handler, { immediate: true })` 监听，不要仅依赖 `onMounted`。

**跨页面传数据**：`src/composables/mapPickState.ts` 用共享 reactive ref，MapPickerPage 设置值，父页面 watch 响应。不用 sessionStorage（因为 `router.back()` 不触发 `onMounted`）。

**`defineOptions({ name: '...' })`** 用于 Vue DevTools 中的组件名（`<script setup>` 默认不暴露名称）。

## 部署

`scripts/deploy.mjs` 使用 `basic-ftp`：先构建，清空远端根目录，上传 `dist/*`。FTP 凭证在 `.env.ftp` 中，不进仓库。

## 行为准则

**Tradeoff:** 这些准则偏向谨慎而非速度。对简单任务可自行判断。

### 1. 先思考再编码

**不要假设。不要隐藏困惑。明确表达权衡。**

实现前：
- 明确陈述假设。如果不确定，询问。
- 如果存在多种解释，列出它们——不要默默选择。
- 如果存在更简单的方法，说出来。必要时提出异议。
- 如果有不清楚的地方，停下来。指出困惑之处。询问。

### 2. 简单优先

**用最少代码解决问题。不要做推测性工作。**

- 不添加超出需求的功能。
- 不为一次性使用创建抽象。
- 不需要未被要求的"灵活性"或"可配置性"。
- 不为不可能的场景做错误处理。
- 如果你写了 200 行但可以缩减到 50 行，重写它。

自问："一个资深工程师会说这过于复杂吗？"如果会，简化。

### 3. 精确修改

**只修改必要的。只清理自己造成的混乱。**

编辑已有代码时：
- 不要"改进"相邻的代码、注释或格式。
- 不要重构没有坏的东西。
- 匹配已有风格，即使你会以不同方式写。
- 如果发现无关的废弃代码，提出来——但不要删除。

当你的改动产生孤立代码时：
- 删除你的改动导致不再使用的导入/变量/函数。
- 除非被要求，否则不要删除已有的废弃代码。

检验标准：每个改动的行都应该直接追溯到用户的需求。

### 4. 目标驱动执行

**定义成功标准。循环直到验证通过。**

将任务转化为可验证的目标：
- "添加验证" → "为无效输入编写测试，然后使其通过"
- "修复 bug" → "编写可复现的测试，然后使其通过"
- "重构 X" → "确保测试在重构前后都通过"

对于多步骤任务，简要说明计划：
```
1. [步骤] → 验证: [检查项]
2. [步骤] → 验证: [检查项]
3. [步骤] → 验证: [检查项]
```

强大的成功标准让你能独立循环。薄弱的标准（"搞好就行"）需要不断澄清。
