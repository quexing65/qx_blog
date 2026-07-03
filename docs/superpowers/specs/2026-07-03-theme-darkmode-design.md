# 主题增强 + 暗色模式切换 设计文档

## 概述

将博客主题从 Docsify 默认的 `vue.css` 迁移到 `docsify-themeable`，并实现暗色模式切换功能。保留现有的 LXGW WenKai 字体、Maple Mono CN 代码字体、以及 `#B55A5A` 品牌色。

## 回退方案

改动前已创建分支 `backup-before-theme-change`（指向 `0ca72d8`）。不满意时执行：

```bash
git checkout main
git reset --hard backup-before-theme-change
```

## 改动范围

### 修改文件

| 文件 | 改动说明 |
|------|----------|
| `docs/index.html` | 替换主题 CSS 引用，添加暗色模式脚本，调整插件配置 |

### 新增文件

| 文件 | 用途 |
|------|------|
| `docs/css/theme.css` | 自定义主题变量（亮色/暗色两套）、排版优化、侧边栏样式 |
| `docs/js/darkmode.js` | 暗色模式切换逻辑、localStorage 持久化、系统偏好检测 |

## 设计细节

### 1. 主题引入

- 移除 `vue.css`，引入 `docsify-themeable` 的 `theme-simple.css`
- 保留现有的 LXGW WenKai 和 Maple Mono CN 字体引入
- 保留现有的 KaTeX、Shiki、Mermaid 等插件

### 2. CSS 变量体系

在 `docs/css/theme.css` 中定义两套变量：

**亮色模式 (`:root`)**

```css
:root {
  --base-background-color: #fefcf9;
  --base-text-color: #2c2c2c;
  --sidebar-width: 260px;
  --sidebar-background: #faf7f3;
  --sidebar-border-color: rgba(181, 90, 90, 0.12);
  --heading-color: #B55A5A;
  --link-color: #B55A5A;
  --code-background: #f5f0eb;
  --blockquote-border-color: #B55A5A;
  --search-input-background: #fff;
  --theme-color: #B55A5A;
}
```

**暗色模式 (`[data-theme="dark"]`)**

```css
[data-theme="dark"] {
  --base-background-color: #1a1a2e;
  --base-text-color: #d4d4d8;
  --sidebar-background: #16162a;
  --sidebar-border-color: rgba(255, 255, 255, 0.08);
  --heading-color: #e8a0bf;
  --link-color: #e8a0bf;
  --code-background: #252540;
  --blockquote-border-color: #e8a0bf;
  --search-input-background: #252540;
  --theme-color: #e8a0bf;
}
```

### 3. 暗色模式切换

**UI 位置：** 侧边栏底部，品牌名下方

**切换逻辑：**

```
首次访问 → 检查 localStorage
  ├── 有存储值 → 使用存储的主题
  └── 无存储值 → 检测系统偏好 (prefers-color-scheme)
        ├── dark → 暗色模式
        └── light/无 → 亮色模式
```

**实现方式：**

- 点击按钮 → 切换 `document.documentElement.dataset.theme`
- 同步写入 `localStorage.setItem('theme', 'dark'|'light')`
- 切换时加 `transition: background 0.3s, color 0.3s` 避免闪烁

### 4. 排版优化

- 首页增加居中 Hero 区域（标题 + 副标题）
- 文章列表改用卡片式排版，日期右对齐
- 侧边栏品牌名使用主题色突出
- 强烈文字（`<strong>`）保持 `#B55A5A`（暗色模式下为 `#e8a0bf`）
- 代码块在暗色模式下使用深色背景

### 5. 插件兼容性

现有插件保持不变：
- KaTeX 数学公式
- Mermaid 图表
- Shiki 代码高亮（需要在暗色模式下切换主题）
- 搜索、分页、图片缩放、字数统计、更新时间
- 点击红心特效

**Shiki 暗色适配：** 在 `darkmode.js` 中监听主题切换，Shiki 使用 `catppuccin-mocha` 主题渲染暗色代码块。

## 不做的事情

- 不改动内容文件（`.md`）
- 不改动 `scripts/` 目录的自动化脚本
- 不添加评论系统、RSS、标签系统（后续迭代）
- 不更换字体

## 验收标准

1. 亮色模式外观与当前一致（品牌色、字体、排版）
2. 暗色模式视觉舒适，对比度足够
3. 切换无闪烁，过渡平滑
4. 用户选择被 localStorage 记住
5. 首次访问自动跟随系统偏好
6. 所有现有插件在两种模式下正常工作
7. 移动端侧边栏正常显示
