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
  async function updateShikiTheme(theme) {
    const blocks = document.querySelectorAll("pre.shiki");
    if (blocks.length === 0) return;

    const shikiTheme = theme === DARK ? "catppuccin-mocha" : "catppuccin-latte";
    // 复用 index.html 中的 shiki 懒加载器（版本 URL 只在那里维护一处，避免两处漂移）
    if (!window.loadShiki) return;
    const { codeToHtml } = await window.loadShiki();

    const tasks = Array.from(blocks).map(async (pre) => {
      const code = pre.querySelector("code");
      if (!code) return;
      // 首次高亮前 docsify 输出 lang-xxx，Shiki 高亮后变为 language-xxx，两者都要兼容
      const langClass = Array.from(code.classList).find(
        (c) => c.startsWith("lang-") || c.startsWith("language-")
      );
      const lang = langClass ? langClass.replace(/^lang(uage)?-/, "") : "text";
      try {
        pre.outerHTML = await codeToHtml(code.textContent, { lang, theme: shikiTheme });
      } catch (e) {
        // fallback: keep current
      }
    });

    await Promise.all(tasks);
    if (typeof addCopyButtonsToShiki === "function") {
      addCopyButtonsToShiki();
    }
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
