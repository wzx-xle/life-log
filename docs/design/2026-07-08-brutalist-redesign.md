# 粗野主义 / 独立杂志风重设计

> LifeLog 前端视觉语言全面翻新。方向：白色底 + 粗黑边框 + 硬偏移阴影 + 衬线标题，灵感来自独立出版、地下杂志、复印 zine 的美学。

## 设计基调

- **场景**：日常消费记录（路边摊、便利店、理发店、小餐馆都记）
- **人格**：反精致、反算法、接地气、有态度
- **浓度**：克制点缀——功能性 App 骨架不变，字体、边框、阴影换性格

## 色彩

| 变量 | 旧值 | 新值 | 用途 |
|------|------|------|------|
| `--color-text` | `#333` | `#1A1A1A` | 主文字，接近纯黑 |
| `--color-text-secondary` | `#999` | `#666` | 次要文字，加深对比 |
| `--color-text-light` | `#CCC` | `#999` | 辅助文字 |
| `--color-border` | `#EBEBEB` | `#1A1A1A` | 边框改为纯黑 |
| `--color-bg` | `#F5F5F5` | `#FFFFFF` | 页面背景改为纯白 |
| `--color-bg-white` | `#FFFFFF` | `#FFFFFF` | 无变化 |
| `--color-primary` | `#FF6B35` | `#FF6B35` | 保留橙红，够大胆 |
| `--color-star-inactive` | `#E5E5E5` | `#D0D0D0` | 非激活星星，加深以增强白底对比 |
| 新增 | — | `#1A1A1A` | 结构性黑色 |

## 字体

- **标题**：衬线栈 — `"Noto Serif SC", "Source Han Serif SC", "SimSun", serif`
  - 用于 `.page-title`、分组标签、大号数字
- **正文**：系统无衬线栈（保持现有），但字距收紧、行高调整
  - `letter-spacing: -0.01em`，`line-height: 1.5`

## 空间与排版

### 全局调整

全局 CSS 变量变更：

| 变量 | 旧值 | 新值 | 说明 |
|------|------|------|------|
| `--radius-sm` | `4px` | `2px` | 微调 |
| `--radius-md` | `8px` | `4px` | 卡片、按钮统一 |
| `--radius-lg` | `12px` | `8px` | 弹出层 |
| `--radius-round` | `999px` | `4px` | 不再有纯圆形，FAB 也方角微圆 |

新增全局变量：

```css
--shadow-hard: 4px 4px 0 #1A1A1A;
--shadow-hard-sm: 2px 2px 0 #1A1A1A;
--border-thick: 2px solid #1A1A1A;
```

### 卡片模式

所有卡片（统计页 section、店铺列表项、评价卡片、分类卡片）统一：

```css
.card {
  background: var(--color-bg-white);
  border: var(--border-thick);            /* 2px solid #1A1A1A */
  border-radius: var(--radius-md);        /* 4px */
  box-shadow: var(--shadow-hard);         /* 4px 4px 0 #1A1A1A */
  /* 无模糊，纯偏移硬阴影 */
}
```

按下/激活态：向右下偏移 2px，阴影缩小：
```css
.card:active {
  transform: translate(2px, 2px);
  box-shadow: var(--shadow-hard-sm);      /* 2px 2px 0 #1A1A1A */
}
```

### 列表分隔

店铺列表、评价列表——卡片之间不再用细灰线分隔，改为卡片自带粗黑边框，卡片间用间距分隔（`gap`），不需要额外的分隔线。

### 页面头部

所有标题统一为 `.page-header` 模式（替代混用的 `.page-header` / `van-nav-bar` sticky）：

```css
.page-header {
  padding: var(--spacing-lg);
  background: var(--color-bg-white);
  border-bottom: var(--border-thick);     /* 2px，非 1px */
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  font-family: "Noto Serif SC", "Source Han Serif SC", "SimSun", serif;
  font-size: var(--font-size-xxl);
  font-weight: 700;
  color: var(--color-text);
}
```

主页面（ReviewListPage / PlaceListPage / StatsPage / SettingsPage）保持 `.page-header` + `.page-title`。子页面（AddReviewPage / PlaceAddPage / PlaceEditPage / CategoryManagePage / PlaceDetailPage）保持 `van-nav-bar`，通过 `:deep(.van-nav-bar) { border-bottom: var(--border-thick); }` 覆盖 Vant 默认底部边线，与主页面头部边框视觉一致。

### 主页面分组标签

记录页时间分组 / 店铺页分类分组的标签，加粗底线强调：

```css
.group-label {
  font-family: "Noto Serif SC", serif;
  font-weight: 700;
  border-bottom: var(--border-thick);
  padding-bottom: var(--spacing-xs);
}
```

### FAB 按钮

- `border-radius: var(--radius-md)`（4px，不再圆形）
- `box-shadow: var(--shadow-hard)`
- 颜色保持 `var(--color-primary)`
- active：`transform: translate(2px, 2px)` + `box-shadow: var(--shadow-hard-sm)`

### TabBar

- 顶部 `var(--border-thick)`（替代当前的 1px 灰线）
- 激活态标签：字体 `font-weight: 700`，颜色 `var(--color-text)`
- 非激活态：`color: var(--color-text-light)`

### 表单元素

- `van-field` 底部分割线 `var(--border-thick)`
- 聚焦时 `var(--border-thick)` + 颜色覆盖 `var(--color-primary)`
- `van-button`：`border-radius: var(--radius-md)`（4px），primary 加硬阴影，active 偏移缩小

### 其他 Vant 组件

**van-search**（记录页搜索栏）：
- `border-radius: var(--radius-md)`（4px）
- 输入框边框 `var(--border-thick)`

**van-tag**（标签组件）：
- `border-radius: var(--radius-md)`（4px，不再是圆角胶囊）
- 可关闭标签的关闭按钮同样方角

**van-popup**（底部弹出层）：
- 顶部左右两个圆角 `border-radius: var(--radius-md) var(--radius-md) 0 0`（当前 `round` prop 自动处理）
- 弹出层内部标题与内容的分隔线用 `var(--border-thick)`

**van-dialog**（确认对话框）：
- `border-radius: var(--radius-md)`（4px）
- 边框 `var(--border-thick)`，替代默认圆角无边框样式

### 统计页图表

- ECharts 图表配置不变
- 图表容器卡片统一方角 + 硬阴影

### 空状态

- `van-empty` 描述文字颜色 `var(--color-text)`（黑色，非灰色）
- 字号可稍加大

### 地图页与选点页

- 地图页保持全屏无标题
- 选点页底部按钮条加 `var(--border-thick)` 顶部边框分隔

### LockScreen

- 顶部加 "LifeLog" 大标题（衬线、粗黑）
- 数字键盘按键从圆角改为 `var(--radius-md)`

## 不改的部分

- 数据模型、路由、业务逻辑
- Vant 4 组件库本身
- PostCSS px→vw 配置
- PWA 配置
- IndexedDB 结构
- Compressor.js 图片压缩逻辑

## 实施策略

1. **第一阶段**：更新 `variables.css`（颜色、半径、新阴影/边框变量）
2. **第二阶段**：统一四个主页面 + TabBar + FAB
3. **第三阶段**：统一子页面（表单页）的 van-nav-bar 和表单元素
4. **第四阶段**：图表容器、空状态、地图页、LockScreen 收尾

每个阶段可独立提交和验证。
