/**
 * 阅读进度条（两套，均由本脚本创建）
 * 1. 顶部常驻横条（.reading-progress）：始终可见，宽度随滚动进度增长
 * 2. 右侧滚动竖条（.scroll-indicator）：默认隐藏，滚动时淡入，
 *    停止滚动 1.2 秒后自动淡出
 */
(function () {
  "use strict";

  /* ---- 顶部常驻横条 ---- */
  var topBar = document.createElement("div");
  topBar.className = "reading-progress";
  topBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(topBar);

  function updateTop() {
    var el = document.documentElement;
    var scrollable = el.scrollHeight - el.clientHeight;
    var pct = scrollable > 0 ? Math.min(100, (el.scrollTop / scrollable) * 100) : 0;
    topBar.style.width = pct + "%";
  }

  /* ---- 右侧滚动竖条（小滑块，跟随滚动位置移动） ---- */
  var sideBar = document.createElement("div");
  sideBar.className = "scroll-indicator";
  sideBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(sideBar);

  var hideTimer = null;
  var HIDE_DELAY = 1200;

  function updateSide() {
    var el = document.documentElement;
    var scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) { sideBar.style.height = "0px"; return; }
    var ratio = el.scrollTop / scrollable;
    var thumbH = Math.max(24, (el.clientHeight / (el.scrollHeight)) * el.clientHeight);
    var thumbTop = ratio * (el.clientHeight - thumbH);
    sideBar.style.height = thumbH + "px";
    sideBar.style.top = thumbTop + "px";
  }

  function showSide() {
    sideBar.style.opacity = "0.5";
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      sideBar.style.opacity = "0";
      hideTimer = null;
    }, HIDE_DELAY);
  }

  /* ---- 统一事件 ---- */
  window.addEventListener("scroll", function () {
    updateTop();
    updateSide();
    showSide();
  }, { passive: true });

  window.addEventListener("resize", function () {
    updateTop();
    updateSide();
  });

  requestAnimationFrame(function () {
    updateTop();
    updateSide();
  });
})();
