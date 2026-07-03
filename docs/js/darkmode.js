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
