# 主题增强 + 暗色模式切换 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将博客从 vue.css 迁移到 docsify-themeable，实现暗色模式切换，并在首页增加 Hero 区域。

**Architecture:** 用 docsify-themeable 的 theme-simple.css 替换 vue.css，通过 CSS 变量控制亮/暗两套配色。暗色模式切换逻辑写在独立 JS 文件中，注入到侧边栏底部。首页模板改为带 Hero 区域的卡片式排版。

**Tech Stack:** Docsify 4, docsify-themeable, CSS Variables, localStorage, prefers-color-scheme

---

### Task 1: 创建自定义主题 CSS

**Files:**
- Create: `docs/css/theme.css`

- [ ] **Step 1: 创建 `docs/css/theme.css`**

```css
/* ============================================
   docsify-themeable 自定义主题
   品牌色: #B55A5A (亮色) / #e8a0bf (暗色)
   字体: LXGW WenKai + Maple Mono CN
   ============================================ */

/* --- 亮色模式变量 --- */
:root {
  --base-background-color: #fefcf9;
  --base-text-color: #2c2c2c;
  --base-font-family: "LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif;
  --base-font-weight: 500;

  --sidebar-width: 260px;
  --sidebar-background: #faf7f3;
  --sidebar-border-color: rgba(181, 90, 90, 0.12);
  --sidebar-nav-link-color--active: #B55A5A;
  --sidebar-nav-link-font-weight--active: 700;
  --sidebar-nav-link-color: #555;

  --heading-color: #B55A5A;
  --link-color: #B55A5A;
  --strong-color: #B55A5A;

  --code-font-family: "Maple Mono CN", monospace;
  --code-background: #f5f0eb;
  --code-inline-background: #f5f0eb;

  --blockquote-border-color: #B55A5A;
  --blockquote-color: #666;

  --table-border-color: #eee;
  --table-header-background: #faf7f3;

  --search-input-background: #fff;
  --search-input-border-color: #ddd;

  --theme-color: #B55A5A;

  --pagination-link-color: #B55A5A;

  --transition-duration: 0.3s;
}

/* --- 暗色模式变量 --- */
[data-theme="dark"] {
  --base-background-color: #1a1a2e;
  --base-text-color: #d4d4d8;

  --sidebar-background: #16162a;
  --sidebar-border-color: rgba(255, 255, 255, 0.08);
  --sidebar-nav-link-color--active: #e8a0bf;
  --sidebar-nav-link-color: #a1a1aa;

  --heading-color: #e8a0bf;
  --link-color: #e8a0bf;
  --strong-color: #e8a0bf;

  --code-background: #252540;
  --code-inline-background: #252540;

  --blockquote-border-color: #e8a0bf;
  --blockquote-color: #a1a1aa;

  --table-border-color: rgba(255, 255, 255, 0.1);
  --table-header-background: #252540;

  --search-input-background: #252540;
  --search-input-border-color: rgba(255, 255, 255, 0.15);

  --theme-color: #e8a0bf;

  --pagination-link-color: #e8a0bf;
}

/* --- 基础样式 --- */
body {
  font-family: var(--base-font-family);
  color: var(--base-text-color);
  font-weight: var(--base-font-weight);
  background: var(--base-background-color);
  transition: background var(--transition-duration), color var(--transition-duration);
}

strong, b {
  color: var(--strong-color) !important;
  font-weight: 800 !important;
}

code, pre {
  font-family: var(--code-font-family);
}

/* --- 侧边栏 --- */
.sidebar {
  background: var(--sidebar-background);
  border-right: 1px solid var(--sidebar-border-color);
  transition: background var(--transition-duration), border-color var(--transition-duration);
}

.sidebar-nav li a {
  color: var(--sidebar-nav-link-color);
  transition: color var(--transition-duration);
}

.sidebar-nav li a:hover,
.sidebar-nav li.active > a {
  color: var(--sidebar-nav-link-color--active);
  font-weight: var(--sidebar-nav-link-font-weight--active, 700);
}

.sidebar-nav .app-name {
  color: var(--theme-color);
  font-weight: bold;
  transition: color var(--transition-duration);
}

/* --- Hero 区域 --- */
.hero-section {
  text-align: center;
  padding: 32px 20px;
  margin-bottom: 24px;
  background: linear-gradient(135deg, rgba(181, 90, 90, 0.06), rgba(181, 90, 90, 0.02));
  border-radius: 12px;
  transition: background var(--transition-duration);
}

[data-theme="dark"] .hero-section {
  background: linear-gradient(135deg, rgba(232, 160, 191, 0.08), rgba(232, 160, 191, 0.02));
}

.hero-section h1 {
  font-size: 2em;
  color: var(--theme-color);
  margin: 0 0 4px;
  border: none;
}

.hero-section .hero-subtitle {
  color: #888;
  font-size: 0.95em;
}

[data-theme="dark"] .hero-section .hero-subtitle {
  color: #71717a;
}

/* --- 文章列表卡片 --- */
.article-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  transition: background var(--transition-duration), box-shadow var(--transition-duration);
}

[data-theme="dark"] .article-card {
  background: #252540;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.article-card h3 {
  color: var(--theme-color);
  font-size: 1em;
  margin: 0 0 12px;
}

.article-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f5f0eb;
  font-size: 0.9em;
  line-height: 2;
}

[data-theme="dark"] .article-item {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.article-item:last-child {
  border-bottom: none;
}

.article-item .article-date {
  color: #aaa;
  font-size: 0.85em;
}

[data-theme="dark"] .article-item .article-date {
  color: #71717a;
}

/* --- 联系信息 --- */
.contact-info {
  text-align: center;
  font-size: 0.9em;
  color: #888;
  margin-top: 16px;
}

.contact-info a {
  color: var(--theme-color);
}

/* --- 暗色模式切换按钮 --- */
.darkmode-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 20px 12px 12px;
  padding: 8px 14px;
  background: rgba(181, 90, 90, 0.08);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  color: var(--sidebar-nav-link-color);
  font-family: var(--base-font-family);
  transition: background 0.2s, color 0.2s;
  width: calc(100% - 24px);
}

.darkmode-toggle:hover {
  background: rgba(181, 90, 90, 0.15);
}

[data-theme="dark"] .darkmode-toggle {
  background: rgba(232, 160, 191, 0.1);
}

[data-theme="dark"] .darkmode-toggle:hover {
  background: rgba(232, 160, 191, 0.18);
}

/* --- 最后更新时间 --- */
.update-time {
  color: gray;
  font-size: 12px;
  text-align: left;
  margin-top: 20px;
  padding: 10px;
  border-top: 1px solid #eee;
  transition: border-color var(--transition-duration);
}

[data-theme="dark"] .update-time {
  border-top-color: rgba(255, 255, 255, 0.08);
}

/* --- Shiki 代码块 --- */
pre.shiki {
  position: relative;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: var(--code-font-family);
  font-size: 14px;
  line-height: 1.6;
  transition: background var(--transition-duration);
}

pre.shiki code {
  font-family: inherit;
  background: none;
}

pre.shiki .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  background: rgba(128, 128, 128, 0.3);
  color: #999;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

pre.shiki:hover .copy-btn {
  opacity: 1;
}

[data-theme="dark"] pre.shiki .copy-btn {
  color: #aaa;
}

/* --- 搜索框 --- */
.search input {
  background: var(--search-input-background);
  border: 1px solid var(--search-input-border-color);
  color: var(--base-text-color);
  transition: background var(--transition-duration), border-color var(--transition-duration), color var(--transition-duration);
}

/* --- 分页 --- */
.pagination a {
  color: var(--pagination-link-color);
}
```

- [ ] **Step 2: 创建目录并确认文件**

Run: `mkdir -p docs/css && cat docs/css/theme.css | wc -l`
Expected: 文件存在，行数约 200+

- [ ] **Step 3: Commit**

```bash
git add docs/css/theme.css
git commit -m "feat: add custom theme CSS with light/dark mode variables"
```

---

### Task 2: 创建暗色模式切换脚本

**Files:**
- Create: `docs/js/darkmode.js`

- [ ] **Step 1: 创建 `docs/js/darkmode.js`**

```javascript
/**
 * 暗色模式切换器
 * - 首次访问：跟随系统偏好 (prefers-color-scheme)
 * - 用户切换后：记住选择 (localStorage)
 * - 按钮注入到侧边栏底部
 */
(function () {
  "use strict";

  const STORAGE_KEY = "docsify-theme";
  const DARK = "dark";
  const LIGHT = "light";

  // 获取初始主题
  function getInitialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return DARK;
    }
    return LIGHT;
  }

  // 应用主题
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateToggleButton(theme);
    updateShikiTheme(theme);
  }

  // 切换主题
  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || LIGHT;
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // 更新按钮文字
  function updateToggleButton(theme) {
    const btn = document.querySelector(".darkmode-toggle");
    if (!btn) return;
    btn.innerHTML = theme === DARK ? "☀️ 亮色模式" : "🌙 暗色模式";
  }

  // Shiki 暗色主题切换
  function updateShikiTheme(theme) {
    if (!window.shikiHighlight) return;
    const blocks = document.querySelectorAll("pre.shiki");
    if (blocks.length === 0) return;

    const shikiTheme = theme === DARK ? "catppuccin-mocha" : "catppuccin-latte";
    blocks.forEach(async (pre) => {
      const code = pre.querySelector("code");
      if (!code) return;
      const lang = Array.from(code.classList)
        .find((c) => c.startsWith("lang-"))
        ?.replace("lang-", "") || "text";
      try {
        const { codeToHtml } = await import("https://cdn.jsdelivr.net/npm/shiki@1/+esm");
        pre.outerHTML = await codeToHtml(code.textContent, { lang, theme: shikiTheme });
        addCopyButtonsToShiki();
      } catch (e) {
        // fallback: keep current
      }
    });
  }

  // 注入切换按钮到侧边栏
  function injectToggleButton() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".darkmode-toggle")) return;

    const btn = document.createElement("button");
    btn.className = "darkmode-toggle";
    btn.addEventListener("click", toggleTheme);
    sidebar.appendChild(btn);

    const theme = document.documentElement.getAttribute("data-theme") || LIGHT;
    updateToggleButton(theme);
  }

  // 初始化
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Docsify 插件形式注入按钮
  function darkmodePlugin(hook) {
    hook.doneEach(function () {
      injectToggleButton();
    });
  }

  // 注册到 docsify
  if (window.$docsify) {
    window.$docsify.plugins = (window.$docsify.plugins || []).concat(darkmodePlugin);
  }

  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }
})();
```

- [ ] **Step 2: 创建目录并确认文件**

Run: `mkdir -p docs/js && cat docs/js/darkmode.js | wc -l`
Expected: 文件存在，行数约 90+

- [ ] **Step 3: Commit**

```bash
git add docs/js/darkmode.js
git commit -m "feat: add dark mode toggle with localStorage persistence"
```

---

### Task 3: 修改 index.html — 替换主题并集成暗色模式

**Files:**
- Modify: `docs/index.html`

- [ ] **Step 1: 替换 CSS 引用（第 10 行附近）**

将：
```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css" />
```

替换为：
```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify-themeable@0/dist/css/theme-simple.css" />
```

- [ ] **Step 2: 添加自定义主题 CSS 引用**

在 `theme-simple.css` 引用之后，添加：
```html
<!-- 自定义主题变量和样式 -->
<link rel="stylesheet" href="css/theme.css" />
```

- [ ] **Step 3: 移除与 theme.css 冲突的内联样式**

删除 `<style>` 标签中以下已迁移到 theme.css 的样式块：
- `:root` 变量块
- `body` 字体样式
- `strong, b` 样式
- `code, pre` 样式
- `.update-time` 样式
- `pre.shiki` 及其子元素样式（`.copy-btn` 等）

保留 `<style>` 标签本身（可能有其他样式需要保留），但清空已迁移的部分。

- [ ] **Step 4: 替换 Shiki 插件中的主题**

在 Shiki 模块脚本中，将 `theme: "catppuccin-latte"` 改为根据当前主题动态选择：

将：
```javascript
window.shikiHighlight = async (code, lang) => {
  lang = lang.toLowerCase();
  lang = langMap[lang] || lang || "text";
  try {
    return await codeToHtml(code, { lang, theme: "catppuccin-latte" });
  } catch (e) {
    console.warn(`Shiki: Language "${lang}" not found, fallback to text`);
    return await codeToHtml(code, { lang: "text", theme: "catppuccin-latte" });
  }
};
```

替换为：
```javascript
window.shikiHighlight = async (code, lang) => {
  lang = lang.toLowerCase();
  lang = langMap[lang] || lang || "text";
  const currentTheme = document.documentElement.getAttribute("data-theme") === "dark"
    ? "catppuccin-mocha"
    : "catppuccin-latte";
  try {
    return await codeToHtml(code, { lang, theme: currentTheme });
  } catch (e) {
    console.warn(`Shiki: Language "${lang}" not found, fallback to text`);
    return await codeToHtml(code, { lang: "text", theme: currentTheme });
  }
};
```

- [ ] **Step 5: 添加 darkmode.js 引用**

在 `</body>` 之前，Shiki 模块脚本之后，添加：
```html
<!-- 暗色模式切换 -->
<script src="js/darkmode.js"></script>
```

- [ ] **Step 6: Commit**

```bash
git add docs/index.html
git commit -m "feat: integrate themeable + dark mode into index.html"
```

---

### Task 4: 更新首页模板 — 添加 Hero 区域

**Files:**
- Modify: `scripts/template.md`

- [ ] **Step 1: 修改 `scripts/template.md`**

将当前内容：
```markdown
# 欢迎来到我的博客

> 一个基于 [Docsify](https://docsify.js.org) 的极简静态博客

## 文章列表

{{ARTICLE_LIST}}

## 联系我

- 邮箱：quexing65@gmail.com
- GitHub：[quexing65](https://github.com/quexing65)
```

替换为：
```markdown
<div class="hero-section">
  <h1>𝓺𝓾𝓮𝔁𝓲𝓷𝓰</h1>
  <div class="hero-subtitle">记录与分享 · 技术 · 生活</div>
</div>

## 📌 最新文章

{{ARTICLE_LIST}}

<div class="contact-info">
  📧 quexing65@gmail.com · <a href="https://github.com/quexing65">GitHub</a>
</div>
```

- [ ] **Step 2: 更新 `scripts/update-sidebar.js` 中的文章列表渲染**

修改 `renderList` 函数，让顶层文章列表使用卡片式排版。找到 `renderList` 函数，将文件类型的渲染逻辑改为生成 HTML 卡片格式。

具体来说，当 `showTime === true` 且 `level === 0` 时，文章列表项用 `<div class="article-item">` 包裹：

在 `renderList` 函数中，将：
```javascript
const timeStr = showTime && item.modifyTime ? ` ${item.modifyTime}` : "";
content += `${indent}- [${item.title}](${item.path})${timeStr}\n`;
```

替换为：
```javascript
if (showTime && level === 0) {
  content += `<div class="article-item"><span>[${item.title}](${item.path})</span><span class="article-date">${item.modifyTime}</span></div>\n`;
} else {
  const timeStr = showTime && item.modifyTime ? ` ${item.modifyTime}` : "";
  content += `${indent}- [${item.title}](${item.path})${timeStr}\n`;
}
```

- [ ] **Step 3: 运行脚本重新生成首页**

Run: `node scripts/update-sidebar.js`
Expected: 输出 "已更新: .../docs/_sidebar.md" 和 "已更新: .../docs/home.md"

- [ ] **Step 4: 确认生成的 `docs/home.md` 包含 Hero 区域**

Run: `head -20 docs/home.md`
Expected: 包含 `<div class="hero-section">` 和文章列表

- [ ] **Step 5: Commit**

```bash
git add scripts/template.md scripts/update-sidebar.js docs/home.md docs/_sidebar.md
git commit -m "feat: add hero section and card-style article list to homepage"
```

---

### Task 5: 端到端验证

- [ ] **Step 1: 本地预览博客**

Run: `docsify serve docs`
Expected: 无报错，浏览器打开 http://localhost:3000

- [ ] **Step 2: 验证亮色模式**

检查项：
- 首页 Hero 区域居中显示，品牌色 #B55A5A
- 文章列表卡片式排版，日期右对齐
- 侧边栏品牌名突出
- 字体为霞鹜文楷
- 强烈文字为 #B55A5A

- [ ] **Step 3: 验证暗色模式切换**

检查项：
- 侧边栏底部有 "🌙 暗色模式" 按钮
- 点击后切换为深色背景 + 粉色点缀
- 按钮文字变为 "☀️ 亮色模式"
- 切换无闪烁，过渡平滑

- [ ] **Step 4: 验证持久化**

检查项：
- 刷新页面后主题保持
- 关闭浏览器重新打开，主题仍然保持

- [ ] **Step 5: 验证插件兼容性**

检查项：
- 搜索功能正常
- 图片缩放正常
- KaTeX 公式正常
- Mermaid 图表正常
- 代码高亮正常（亮色用 catppuccin-latte，暗色用 catppuccin-mocha）

- [ ] **Step 6: 最终 Commit**

```bash
git add -A
git commit -m "feat: complete theme enhancement with dark mode support"
```
