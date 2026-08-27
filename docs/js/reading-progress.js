/**
 * 阅读进度条（正文右侧竖条，滚动时出现，停止滚动 1.2 秒后自动消失）
 * - 位于正文右侧边缘（right:0），从上往下随滚动进度增长
 * - 默认隐藏（opacity 0）；滚动时淡入（opacity 0.6），
 *   停止滚动 1.2 秒后自动淡出（opacity 0）
 * - 亮/暗色自动跟随主题（颜色用 CSS 变量 --theme-color，见 theme.css）
 * - 路由切换后自动归零重算
 */
(function () {
  "use strict";

  var bar = document.createElement("div");
  bar.className = "reading-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var hideTimer = null;
  var HIDE_DELAY = 1200; // 停止滚动后多久淡出（ms）

  function update() {
    var el = document.documentElement;
    var scrollable = el.scrollHeight - el.clientHeight;
    var pct = scrollable > 0 ? Math.min(100, (el.scrollTop / scrollable) * 100) : 0;
    // 竖条：高度 = 视口高度 × 进度百分比
    bar.style.height = (pct * el.clientHeight / 100) + "px";
  }

  function show() {
    bar.style.opacity = "0.6";
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      bar.style.opacity = "0";
      hideTimer = null;
    }, HIDE_DELAY);
  }

  window.addEventListener("scroll", function () {
    update();
    show();
  }, { passive: true });
  window.addEventListener("resize", update);

  requestAnimationFrame(update);
})();
