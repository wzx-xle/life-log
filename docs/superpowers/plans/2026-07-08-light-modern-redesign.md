# 轻盈现代风重设计 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 从粗野主义全面回退为轻盈现代风，对齐 Vant 4 原生设计语言。

**Architecture:** 两阶段执行。Task 1 改 `variables.css` + `global.css` 打底，Task 2 一次性改所有页面/组件（10 文件），把粗野主义元素全部替换为 Vant 原生风格。

**Tech Stack:** Vue 3 + Vant 4 + PostCSS px→vw (viewportWidth: 320)

## 全局约束

- 所有色值、间距、半径使用 CSS 变量
- 改动仅限 `<style scoped>` 和 `src/assets/styles/*.css`，不修改任何 `.ts` / `<script>` 逻辑
- 每个任务结束后运行 `npx vue-tsc -b --noEmit`

---

### Task 1: CSS 变量 + global.css 回归 Vant 原生

**Files:** `src/assets/styles/variables.css`, `src/assets/styles/global.css`

#### Step 1: variables.css — 恢复 Vant 对齐的色彩和半径

```css
:root {
  --color-primary: #FF6B35;
  --color-restaurant: #FF6B35;
  --color-hotel: #4A90D9;
  --color-retail: #52C41A;
  --color-service: #8B5CF6;
  --color-entertainment: #F5A623;
  --color-custom: #9E9E9E;

  --color-star-active: #FF6B35;
  --color-star-inactive: #EBEDF0;

  --color-bg: #F7F8FA;
  --color-bg-white: #FFFFFF;
  --color-text: #323233;
  --color-text-secondary: #969799;
  --color-text-light: #C8C9CC;
  --color-border: #EBEDF0;
  --color-danger: #EE0A24;
  --color-success: #07C160;

  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-xxl: 24px;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;

  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-round: 999px;

  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-top: env(safe-area-inset-top, 0px);
}
```

删除 `--shadow-hard`、`--shadow-hard-sm`、`--border-thick`。

#### Step 2: global.css — 删除粗野主义入侵

删除 body 上的 `letter-spacing: -0.01em;` 和 `line-height: 1.5;`。

删除 `.van-toast` 全部覆盖块（约 10 行，恢复 Vant 原生半透明黑底白字）。

删除 `:root { --van-* }` 块（约 8 行 Vant 变量覆盖）。

#### Step 3: 验证 + 提交

```bash
npx vue-tsc -b --noEmit
git add src/assets/styles/variables.css src/assets/styles/global.css
git commit -m "style: CSS 变量回归 Vant 原生 — 删除粗野主义色彩/阴影/边框变量"
```

---

### Task 2: 全部页面/组件 style 回退

**Files:** 10 文件一次性改，确保模式一致。

| # | 文件 | 改动 |
|---|------|------|
| 1 | `src/components/common/TabBar.vue` | `border-top: 1px solid var(--color-border)`; height 56→50px; 删除 padding-top; active color 恢复 `var(--color-primary)`; 删除 font-weight: 700 |
| 2 | `src/App.vue` | padding-bottom 56→50px |
| 3 | `src/views/ReviewListPage.vue` | FAB 恢复 `border-radius: 50%` + `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`; 删除 :active 块; sort-bar border-bottom 恢复 1px solid; filter-tab 恢复 `border-radius: var(--radius-round)`; group-label 删除 font-family/border-bottom/padding-bottom |
| 4 | `src/views/PlaceListPage.vue` | page-header border-bottom 恢复 1px solid; page-title 删除 font-family; group-label 同上; place-item 删除 border/border-radius/box-shadow/margin/:active — 恢复简单 border-bottom; FAB 同 3 |
| 5 | `src/views/StatsPage.vue` | page-header 恢复 1px solid; page-title 删除 font-family; summary-card/section 删除 border — 恢复 `box-shadow: 0 1px 3px rgba(0,0,0,0.04)` |
| 6 | `src/views/SettingsPage.vue` | page-header 恢复 1px solid; page-title 删除 font-family |
| 7 | `src/components/review/ReviewCard.vue` | 恢复 `border-bottom: 1px solid var(--color-border)`; 删除 border/border-radius/box-shadow/margin/:active |
| 8 | `src/views/PlaceDetailPage.vue` | nav-bar border-bottom 恢复 1px solid; bottom-bar 恢复 1px solid |
| 9 | `src/components/place/PlaceForm.vue` | category-item 删除 border; active 删除 box-shadow |
| 10 | `src/components/review/ReviewFull.vue` | picker-title/footer 恢复 1px solid; picker-cat.active 删除 font-weight: 700 |
| 11 | `src/components/review/ReviewQuick.vue` | 删除 .form-actions :deep(.van-button--primary) 硬阴影块 |
| 12 | `src/views/AddReviewPage.vue` | nav-bar border-bottom 恢复 1px solid |
| 13 | `src/views/PlaceAddPage.vue` | nav-bar border-bottom 恢复 1px solid |
| 14 | `src/views/PlaceEditPage.vue` | nav-bar border-bottom 恢复 1px solid |
| 15 | `src/views/CategoryManagePage.vue` | nav-bar border-bottom 恢复 1px solid |
| 16 | `src/views/LockScreen.vue` | lock-icon 恢复 `border-radius: 50%; border: none; background: rgba(255,107,53,0.1)`; lock-title 删除 font-family |
| 17 | `src/components/lock/NumberKeyboard.vue` | key--number 删除 border |
| 18 | `src/views/MapPage.vue` | search-bar box-shadow 恢复柔和; locate-btn 删除 border + 恢复 `border-radius: 50%` + 柔和 shadow |
| 19 | `src/views/MapPickerPage.vue` | bottom-bar 恢复 `border-top: 1px solid var(--color-border)` |
| 20 | `src/components/map/PlaceCard.vue` | place-card 恢复 `box-shadow: 0 -2px 16px rgba(0,0,0,0.08); border-radius: var(--radius-lg)`; 删除 border; close-btn 恢复 `border-radius: 50%` |

具体改动值参考全局约束中的 CSS 变量定义和 spec 中的组件规范。

#### 验证 + 提交

```bash
npx vue-tsc -b --noEmit
npm run build
git add -A
git commit -m "style: 轻盈现代风—删除所有粗野主义元素，对齐 Vant 原生风格"
```
