# 轻盈现代风重设计 — 对齐 Vant 原生风格

> 从粗野主义全面回退，拥抱 Vant 4 原生设计语言。设计"消失"，让内容成为焦点。

## 设计基调

- **目标**：轻盈、干净、克制——去掉所有粗黑线、硬阴影、衬线标题
- **对齐**：与 Vant 4 原生组件完全一致，自定页面不再"割裂"

## 色彩 — 对齐 Vant

| 变量 | 旧值 | 新值 | 说明 |
|------|------|------|------|
| `--color-text` | `#1A1A1A` | `#323233` | Vant 正文色 |
| `--color-text-secondary` | `#666666` | `#969799` | Vant 辅助色 |
| `--color-text-light` | `#999999` | `#C8C9CC` | Vant 占位色 |
| `--color-border` | `#1A1A1A` | `#EBEDF0` | Vant 分隔线色 |
| `--color-bg` | `#FFFFFF` | `#F7F8FA` | Vant 页面底色 |
| `--color-bg-white` | `#FFFFFF` | `#FFFFFF` | 无变化 |
| `--color-star-inactive` | `#D0D0D0` | `#EBEDF0` | 更淡 |
| `--color-primary` | `#FF6B35` | `#FF6B35` | 保持不变 |

## 半径 — 恢复柔和

| 变量 | 旧值 | 新值 |
|------|------|------|
| `--radius-sm` | `2px` | `4px` |
| `--radius-md` | `4px` | `10px` |
| `--radius-lg` | `8px` | `16px` |
| `--radius-round` | `4px` | `999px` |

## 删除的变量

```css
--shadow-hard, --shadow-hard-sm, --border-thick  ← 全部删除
```

## 字体

- 所有文字使用系统无衬线栈（不覆盖 `font-family`）
- 在 `global.css` 中删除 `letter-spacing: -0.01em`、`line-height: 1.5` 覆盖

## 全局 — global.css 清理

1. 删除 body 上的 `letter-spacing`、`line-height` 覆盖
2. 删除所有 `.van-toast` 覆盖（恢复 Vant 原生半透明黑底白字）
3. 删除 `:root { --van-* }` 块（约 8 行）

## 页面头部

主页面 `.page-header` 和子页面 `:deep(.van-nav-bar)`：
- `border-bottom: 1px solid var(--color-border)`（淡灰细线）
- 正文无衬线字体，`font-weight: 600`

## FAB

- `border-radius: 50%`（恢复圆形）
- `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)`（柔和阴影）
- 删除 active 态 `translate/box-shadow` 变化

## TabBar

- `border-top: 1px solid var(--color-border)`（细灰线）
- 激活态：`color: var(--color-primary)` + `font-weight: 400`（恢复品牌色，去掉粗黑）
- `height: 50px`（恢复常规高度）

## 卡片与列表

所有卡片（统计 summary-card/section、ReviewCard、店铺列表项）：
- `border: none`（无边框）
- `border-radius: var(--radius-md)`（10px）
- `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04)`（极轻微阴影）
- 删除 active 态 `translate/box-shadow`

ReviewCard 底部分隔：`border-bottom: 1px solid var(--color-border)`

## 分组标签

- 删除衬线字体、粗底线、padding-bottom 覆盖
- 恢复 `font-weight: 500` + 纯色文字

## 表单

- PlaceForm 分类网格项：`border: var(--border-thick)` → `border: none`
- PlaceForm active 态：删除 `box-shadow: var(--shadow-hard-sm)`
- ReviewQuick 提交按钮：删除硬阴影覆盖

## 锁屏页

- 图标：`border-radius: var(--radius-md); border: var(--border-thick)` → `border-radius: 50%; border: none; background: rgba(255, 107, 53, 0.1)`
- 标题：删除衬线 `font-family`，恢复 `font-size: var(--font-size-xl); font-weight: 600`

## 数字键盘

- `.key--number`：删除 `border: var(--border-thick)`

## 地图页

- 搜索栏 `box-shadow: var(--shadow-hard)` → `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- 定位按钮：删除 `border`，`border-radius: var(--radius-md)` → `50%`，恢复柔和阴影

## PlaceCard

- `box-shadow: var(--shadow-hard); border: var(--border-thick)` → `box-shadow: 0 -2px 16px rgba(0,0,0,0.08)`
- `border-radius: var(--radius-md)` → `var(--radius-lg)`
- close-btn：`border-radius: var(--radius-md)` → `50%`

## 统计页

- summary-card / section：`border: var(--border-thick); box-shadow: var(--shadow-hard)` → `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`

## MapPickerPage + PlaceDetailPage

- bottom-bar：`border-top: var(--border-thick)` → `border-top: 1px solid var(--color-border)`

## 不改的部分

- 所有 `<script>` 逻辑、路由、数据模型
