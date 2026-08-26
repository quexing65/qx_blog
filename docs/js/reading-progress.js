/**
 * 顶部阅读进度条
 * - 固定在视口顶部，宽度随当前页面滚动进度增长
 * - 亮/暗色自动跟随主题（颜色用 CSS 变量 --theme-color，见 theme.css）
 * - 路由切换后自动归零重算（docsify 切页会滚动到顶部，触发 scroll 事件）
 */
(function () {
  "use strict";

  const bar = document.createElement("div");
  bar.className = "reading-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  function update() {
    const el = document.documentElement;
    // 可滚动总高度 = 文档高度 - 视口高度；不可滚动时进度为 0（如首页过短）
    const scrollable = el.scrollHeight - el.clientHeight;
    const pct = scrollable > 0 ? Math.min(100, (el.scrollTop / scrollable) * 100) : 0;
    bar.style.width = pct + "%";
  }

  // passive 提升滚动性能；update 本身只改一个 style，开销可忽略
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  // 初始 + 路由切换后重算（保险起见用 rAF 兜底一帧）
  requestAnimationFrame(update);
})();
