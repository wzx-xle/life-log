# 粗野主义/独立杂志风重设计 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 LifeLog 前端视觉语言从默认 Vant 风格翻新为粗野主义/独立杂志风：白底 + 粗黑边框 + 硬偏移阴影 + 衬线标题。

**Architecture:** 分四阶段渐进式改造。第一阶段改全局 CSS 变量打底，第二阶段统一四个主页面的头部/卡片/FAB，第三阶段统一五个子页面的 nav-bar 和表单元素，第四阶段收尾锁屏页/地图页/键盘组件。

**Tech Stack:** Vue 3 + Vant 4 + PostCSS px→vw (viewportWidth: 320) + CSS 变量

## 全局约束

- 所有色值、间距、半径必须使用 CSS 变量（`var(--xxx)`），禁止裸 `px` 值出现在组件样式中
- PostCSS px→vw 会将 320px 基准的 px 转为 vw；CSS 变量定义中的 px 值也会被转换，但 `var()` 引用不会
- 改动仅限 `<style scoped>` 和 `src/assets/styles/*.css`，不修改任何 `.ts` / `<script>` 逻辑
- 每个任务结束后运行 `npx vue-tsc -b --noEmit` 验证类型安全

---

### Task 1: CSS 变量与全局样式

**涉及文件:**
- Modify: `src/assets/styles/variables.css`
- Modify: `src/assets/styles/global.css`

**改动内容:**

#### 1.1 `variables.css` — 色彩、半径、阴影

将以下变量值逐一替换：

| 变量 | 旧值 | 新值 |
|------|------|------|
| `--color-text` | `#333333` | `#1A1A1A` |
| `--color-text-secondary` | `#999999` | `#666666` |
| `--color-text-light` | `#CCCCCC` | `#999999` |
| `--color-border` | `#EBEBEB` | `#1A1A1A` |
| `--color-bg` | `#F5F5F5` | `#FFFFFF` |
| `--color-star-inactive` | `#E5E5E5` | `#D0D0D0` |
| `--radius-sm` | `4px` | `2px` |
| `--radius-md` | `8px` | `4px` |
| `--radius-lg` | `12px` | `8px` |
| `--radius-round` | `999px` | `4px` |

在 `:root` 块末尾新增三个变量：

```css
--shadow-hard: 4px 4px 0 #1A1A1A;
--shadow-hard-sm: 2px 2px 0 #1A1A1A;
--border-thick: 2px solid #1A1A1A;
```

#### 1.2 `global.css` — 全局排版与 Vant 变量覆盖

修改 `body` 选择器，追加排版属性：

```css
body {
  /* ...现有属性不变... */
  letter-spacing: -0.01em;
  line-height: 1.5;
}
```

在 `global.css` 末尾追加全局 Vant CSS 变量覆盖：

```css
:root {
  --van-button-radius: var(--radius-md);
  --van-button-default-height: 44px;
  --van-tag-radius: var(--radius-md);
  --van-dialog-radius: var(--radius-md);
  --van-dialog-border: var(--border-thick);
  --van-popup-round-radius: var(--radius-lg);
  --van-field-border-width: 2px;
}
```

在 `global.css` 末尾追加全局 Toast 硬阴影覆盖（替换现有 `.van-toast` 块）：

```css
.van-toast {
  color: var(--color-text) !important;
  background: var(--color-bg-white) !important;
  border: var(--border-thick) !important;
  box-shadow: var(--shadow-hard) !important;
  border-radius: var(--radius-md) !important;
}
.van-toast--text,
.van-toast--html {
  min-height: auto !important;
  padding: 8px 12px !important;
}
.van-toast__text {
  line-height: 1.4 !important;
}
```

#### 1.3 验证

```bash
npx vue-tsc -b --noEmit
```

#### 1.4 提交

```bash
git add src/assets/styles/variables.css src/assets/styles/global.css
git commit -m "style: 全局 CSS 变量翻新 — 粗野主义色彩/半径/阴影/边框"
```

---

### Task 2: 主页面头部与分组标签

**涉及文件:**
- Modify: `src/views/ReviewListPage.vue`
- Modify: `src/views/PlaceListPage.vue`
- Modify: `src/views/StatsPage.vue`
- Modify: `src/views/SettingsPage.vue`
- Modify: `src/components/common/TabBar.vue`

**改动内容:**

#### 2.1 ReviewListPage.vue

`.sort-bar`: `border-bottom: 1px solid var(--color-border)` → `border-bottom: var(--border-thick)`

`.filter-tab`: `border-radius: var(--radius-round)` → `border-radius: var(--radius-md)`

`.group-label`: 追加衬线字体与粗底线：

```css
.group-label {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
  border-bottom: var(--border-thick);
  padding-bottom: var(--spacing-xs);
}
```

`.fab`: `border-radius: 50%` → `border-radius: var(--radius-md)`, `box-shadow: 0 2px 8px rgba(...)` → `box-shadow: var(--shadow-hard)`，新增 active 态：

```css
.fab:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-hard-sm);
}
```

#### 2.2 PlaceListPage.vue

`.page-header`: `border-bottom: 1px solid var(--color-border)` → `border-bottom: var(--border-thick)`

`.page-title`: 追加衬线字体 `font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;`

`.group-label`: 同 ReviewListPage（衬线 + 粗底线）

`.fab`: 同 ReviewListPage（方角 + 硬阴影 + active）

#### 2.3 StatsPage.vue

`.page-header`: `border-bottom: 1px solid var(--color-border)` → `border-bottom: var(--border-thick)`

`.page-title`: 追加衬线字体

`.summary-card` 和 `.section`: 去掉 `box-shadow: 0 1px 4px rgba(0,0,0,0.06)`，改为：

```css
border: var(--border-thick);
box-shadow: var(--shadow-hard);
border-radius: var(--radius-md);
```

#### 2.4 SettingsPage.vue

`.page-header`: `border-bottom: 1px solid var(--color-border)` → `border-bottom: var(--border-thick)`

`.page-title`: 追加衬线字体

#### 2.5 TabBar.vue

`.tab-bar`: `border-top: 1px solid var(--color-border)` → `border-top: var(--border-thick)`

`.tab-item.active .tab-label`: `color: var(--color-primary)` → `color: var(--color-text); font-weight: 700`

#### 2.6 验证 + 提交

```bash
npx vue-tsc -b --noEmit
git add src/views/ReviewListPage.vue src/views/PlaceListPage.vue src/views/StatsPage.vue src/views/SettingsPage.vue src/components/common/TabBar.vue
git commit -m "style: 主页面头部粗黑线 + 衬线标题 + 分组标签底线 + FAB 方角硬阴影"
```

---

### Task 3: 列表卡片风格统一

**涉及文件:**
- Modify: `src/components/review/ReviewCard.vue`
- Modify: `src/views/PlaceListPage.vue`（列表分隔线）

**改动内容:**

#### 3.1 ReviewCard.vue

`.review-card`: `border-bottom: 1px solid var(--color-border)` → `border: var(--border-thick); border-radius: var(--radius-md); box-shadow: var(--shadow-hard); margin: var(--spacing-sm) var(--spacing-lg)`（卡片不再无边无际，而是有框有边的独立块）

为了在列表页中卡片之间有间距，每个 `.review-card` 需要 `margin`。为了不让第一个卡片上方没有间距，最外层用 `padding-top` 撑开。

ReviewListPage 中每张 ReviewCard 外层是 `v-for`，卡片自带 margin 即可形成间距。

#### 3.2 PlaceListPage.vue 列表项

`.place-item`: `border-bottom: 1px solid var(--color-border)` → `border: var(--border-thick); border-radius: var(--radius-md); margin: var(--spacing-sm) var(--spacing-lg)`。

点击态追加：
```css
.place-item:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-hard-sm);
}
```

#### 3.3 验证 + 提交

```bash
npx vue-tsc -b --noEmit
git add src/components/review/ReviewCard.vue src/views/PlaceListPage.vue
git commit -m "style: 评价卡片和店铺列表项改为粗黑边框 + 硬阴影 + 独立卡片块"
```

---

### Task 4: 子页面 nav-bar 粗黑线统一

**涉及文件:**
- Modify: `src/views/AddReviewPage.vue`
- Modify: `src/views/PlaceAddPage.vue`
- Modify: `src/views/PlaceEditPage.vue`
- Modify: `src/views/CategoryManagePage.vue`
- Modify: `src/views/PlaceDetailPage.vue`

**改动内容:**

五个页面都在 `.page-wrapper :deep(.van-nav-bar)` 块中新增 `border-bottom: var(--border-thick)`。

#### 4.1 AddReviewPage.vue

当前：
```css
.page-wrapper :deep(.van-nav-bar) {
  position: sticky;
  top: 0;
  z-index: 10;
}
```

追加 `border-bottom: var(--border-thick);`

#### 4.2 PlaceAddPage.vue

同 4.1。

此外取消按钮 `.cancel-wrap` 上方加 `border-top: var(--border-thick)` 让按钮区与表单区分隔。保持 `margin-top: var(--spacing-md)` 即可。

#### 4.3 PlaceEditPage.vue

同 4.1 + 4.2。

#### 4.4 CategoryManagePage.vue

同 4.1。

#### 4.5 PlaceDetailPage.vue

当前 `.page-wrapper :deep(.van-nav-bar)` 只有 `background: var(--color-bg-white)`。改为：

```css
.page-wrapper :deep(.van-nav-bar) {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-bg-white);
  border-bottom: var(--border-thick);
}
```

同时移除模板中 `left-text="返回"`（第 113 行 `van-nav-bar title="店铺详情" left-text="返回"` → `van-nav-bar title="店铺详情"`）。

页面底部的 `.bottom-bar`：`border-top: 1px solid var(--color-border)` → `border-top: var(--border-thick)`。

#### 4.6 验证 + 提交

```bash
npx vue-tsc -b --noEmit
git add src/views/AddReviewPage.vue src/views/PlaceAddPage.vue src/views/PlaceEditPage.vue src/views/CategoryManagePage.vue src/views/PlaceDetailPage.vue
git commit -m "style: 子页面 van-nav-bar 底部统一粗黑线 + PlaceDetailPage sticky + 去返回文字"
```

---

### Task 5: 表单组件与弹出层

**涉及文件:**
- Modify: `src/components/place/PlaceForm.vue`
- Modify: `src/components/review/ReviewFull.vue`
- Modify: `src/components/review/ReviewQuick.vue`（如果使用了表单元素）

**注意:** `ReviewQuick.vue` 是轻量级表单，同样需要检查。

**改动内容:**

#### 5.1 PlaceForm.vue

分类网格项（`.category-item`）：`border-radius: var(--radius-md)` 已存在，追加 `border: var(--border-thick)`。

`.category-item.active`：追加 `box-shadow: var(--shadow-hard-sm)`。

`.form-actions` 中的提交按钮：`box-shadow: var(--shadow-hard)`。

新增分类弹窗 `.new-cat-actions` 中按钮同上。

#### 5.2 ReviewFull.vue

`.form-actions` 中的提交按钮：`box-shadow: var(--shadow-hard)`。

地点选择弹出框 `.picker-title`：`border-bottom: 1px solid var(--color-border)` → `border-bottom: var(--border-thick)`。

`.picker-footer`：`border-top: 1px solid var(--color-border)` → `border-top: var(--border-thick)`。

`.picker-cat.active`：`border-left-color: var(--color-primary)` → 保持，追加 `font-weight: 700`。

#### 5.3 ReviewQuick.vue

需要有类似按钮的区域。如果有提交按钮，同样加 `box-shadow: var(--shadow-hard)`。

（先 typecheck 确认不存在后跳过）

#### 5.4 验证 + 提交

```bash
npx vue-tsc -b --noEmit
git add src/components/place/PlaceForm.vue src/components/review/ReviewFull.vue src/components/review/ReviewQuick.vue
git commit -m "style: 表单组件按钮硬阴影 + 分类网格粗边框 + 弹出层粗黑分隔线"
```

---

### Task 6: 锁屏页、地图页与收尾

**涉及文件:**
- Modify: `src/views/LockScreen.vue`
- Modify: `src/components/lock/NumberKeyboard.vue`
- Modify: `src/views/MapPage.vue`
- Modify: `src/views/MapPickerPage.vue`
- Modify: `src/components/map/PlaceCard.vue`

**改动内容:**

#### 6.1 LockScreen.vue

`.lock-title`: 改为衬线 + 更大：

```css
.lock-title {
  font-size: var(--font-size-xxl);
  color: var(--color-text);
  font-weight: 700;
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
}
```

`.dot`: `border: 2px solid var(--color-border)` 已足够（变量改为粗黑后自动生效，无需额外改动）。

#### 6.2 NumberKeyboard.vue

`.key--number`: 追加 `border: var(--border-thick);`，且 active 态已有 `background: var(--color-border)`（自动变黑，天然效果好）。

#### 6.3 MapPage.vue

`.search-bar :deep(.van-search__content)`：`box-shadow: 0 2px 8px rgba(...)` → `box-shadow: var(--shadow-hard)`。

`.locate-btn`：`box-shadow: 0 2px 8px rgba(...)` → `box-shadow: var(--shadow-hard)`。

#### 6.4 MapPickerPage.vue

`.bottom-bar`：`border-top: 1px solid var(--color-border)` → `border-top: var(--border-thick)`，追加 `border-top: var(--border-thick)`。

#### 6.5 PlaceCard.vue

`.place-card`：`box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.12)` → `box-shadow: var(--shadow-hard)`。追加 `border: var(--border-thick)`。

`.close-btn`：`border-radius: 50%` → `border-radius: var(--radius-md)`。

#### 6.6 验证 + 提交

```bash
npx vue-tsc -b --noEmit
git add src/views/LockScreen.vue src/components/lock/NumberKeyboard.vue src/views/MapPage.vue src/views/MapPickerPage.vue src/components/map/PlaceCard.vue
git commit -m "style: 锁屏页衬线标题 + 键盘粗边框 + 地图页硬阴影 + 选点页粗黑分隔线"
```

---

## 完整变更文件清单

| # | 文件 | 阶段 |
|---|------|------|
| 1 | `src/assets/styles/variables.css` | Task 1 |
| 2 | `src/assets/styles/global.css` | Task 1 |
| 3 | `src/components/common/TabBar.vue` | Task 2 |
| 4 | `src/views/ReviewListPage.vue` | Task 2 |
| 5 | `src/views/PlaceListPage.vue` | Task 2 |
| 6 | `src/views/StatsPage.vue` | Task 2 |
| 7 | `src/views/SettingsPage.vue` | Task 2 |
| 8 | `src/components/review/ReviewCard.vue` | Task 3 |
| 9 | `src/views/AddReviewPage.vue` | Task 4 |
| 10 | `src/views/PlaceAddPage.vue` | Task 4 |
| 11 | `src/views/PlaceEditPage.vue` | Task 4 |
| 12 | `src/views/CategoryManagePage.vue` | Task 4 |
| 13 | `src/views/PlaceDetailPage.vue` | Task 4 |
| 14 | `src/components/place/PlaceForm.vue` | Task 5 |
| 15 | `src/components/review/ReviewFull.vue` | Task 5 |
| 16 | `src/views/LockScreen.vue` | Task 6 |
| 17 | `src/components/lock/NumberKeyboard.vue` | Task 6 |
| 18 | `src/views/MapPage.vue` | Task 6 |
| 19 | `src/views/MapPickerPage.vue` | Task 6 |
| 20 | `src/components/map/PlaceCard.vue` | Task 6 |
