/**
 * 右侧目录（方案B，样式见 css/toc.css，说明见仓库根目录 右侧目录方案.md）
 * - 每篇文章渲染完成后（docsify doneEach），收集正文里的 h2/h3/h4
 *   （docsify 已为每个标题生成锚点 id），生成两套界面，由 CSS 按宽度各自显隐：
 *   桌面（≥1280px）：目录占右侧独立栏位，展开时正文让位变窄（body.toc-open），
 *                   右缘收缩键控制，状态存 localStorage
 *   窄屏（<1280px）：目录不占位；右下角浮动"目录"按钮，点开底部弹出面板，
 *                   点标题项关闭面板并跳转（点遮罩 / ✕ / Esc 同样关闭）
 * - 点击目录项平滑滚动到对应标题；滚动时高亮"当前正在读"的小节
 * - 标题少于 3 个的页面不显示任何目录 UI（首页因此自动跳过）
 * - 注册方式：docsify 到 DOMContentLoaded 才读取 window.$docsify 初始化，
 *   本脚本在 body 末尾同步执行、先于该时机，因此可直接 push 进 plugins
 */
(function () {
  "use strict";

  var MIN_HEADINGS = 3; // 标题数不足则不显示目录
  var SCROLL_OFFSET = 40; // 点击跳转时标题距视口顶部的留白（px）
  var SPY_LINE = 120; // 标题顶部越过这条线（距视口顶 px）即视为"正在读"
  var STORAGE_KEY = "qx-toc-open"; // 桌面收缩状态持久化键，默认展开
  var DESKTOP_MIN = 1280; // 桌面右栏的最小视口宽度，须与 toc.css 媒体查询一致

  var box = null; // 桌面目录面板 <nav>（标题即切换按钮）
  var fab = null; // 手机右下角"目录"按钮 <button>
  var sheet = null; // 手机底部弹出面板 <div>
  var backdrop = null; // 面板后的半透明遮罩 <div>
  var sheetList = null; // 面板里的标题列表 <div>
  var sheetThumb = null; // 面板滚动条滑块 <div>
  var thumbHideTimer = null; // 滑块自动隐藏计时器
  var THUMB_HIDE_DELAY = 1200; // 滑块隐藏延迟（ms）
  var items = []; // { el: 正文标题元素, link: 桌面目录项, sheetLink: 手机面板项 }
  var open = readOpen();
  var ticking = false;

  function readOpen() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "0";
    } catch (e) {
      return true;
    }
  }

  function saveOpen(v) {
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch (e) {
      /* 隐私模式等场景下存不了就算了，本次会话内仍然生效 */
    }
  }

  // 把桌面展开/收起状态落到 DOM：body 类控制正文让位与目录显隐（过渡见 toc.css）
  function applyOpen() {
    document.body.classList.toggle("toc-open", open);
    requestAnimationFrame(highlight);
    setTimeout(highlight, 300);
  }

  // 当前正在读第几个标题：取最后一个顶部已越过判定线的标题；
  // 页面滚到底时最后一节可能始终越不过判定线，强制高亮最后一项
  function activeIndex() {
    var idx = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].el.getBoundingClientRect().top <= SPY_LINE) idx = i;
    }
    var doc = document.documentElement;
    var atBottom = doc.scrollHeight - doc.scrollTop - doc.clientHeight < 4;
    if (atBottom && items.length) idx = items.length - 1;
    return idx;
  }

  function highlight() {
    if (!items.length || !box) return;
    var idx = activeIndex();
    var list = box.querySelector(".page-toc-list");
    for (var i = 0; i < items.length; i++) {
      items[i].link.classList.toggle("active", i === idx);
    }
    // 目录超出自身高度时：把高亮项滚进目录可视区（只滚目录，不动页面）
    if (list && idx >= 0) {
      var link = items[idx].link;
      var top = link.offsetTop;
      if (top < list.scrollTop + 8) {
        list.scrollTop = top - 8;
      } else if (top + link.offsetHeight > list.scrollTop + list.clientHeight - 8) {
        list.scrollTop = top + link.offsetHeight - list.clientHeight + 8;
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      highlight();
    });
  }

  /* ============ 手机：底部弹出面板 ============ */

  function sheetOpen() {
    if (!sheet || sheet.classList.contains("open")) return;
    sheet.classList.add("open");
    backdrop.classList.add("show");
    document.body.classList.add("toc-sheet-open"); // 锁住背景滚动
    // 打开时高亮当前阅读位置，并把该项滚进面板可视区
    var idx = activeIndex();
    for (var i = 0; i < items.length; i++) {
      items[i].sheetLink.classList.toggle("active", i === idx);
    }
    if (idx > 0) {
      requestAnimationFrame(function () {
        sheetList.scrollTop = Math.max(0, items[idx].sheetLink.offsetTop - 60);
      });
    }
  }

  function sheetClose() {
    if (!sheet) return;
    sheet.classList.remove("open");
    backdrop.classList.remove("show");
    document.body.classList.remove("toc-sheet-open");
  }

  // 视口拉宽到桌面尺寸时收起面板（避免残留 overflow 锁）
  window.addEventListener("resize", function () {
    if (window.innerWidth >= DESKTOP_MIN) sheetClose();
  });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") sheetClose();
  });

  function hide() {
    items = [];
    if (box) box.hidden = true;
    if (fab) fab.hidden = true;
    sheetClose();
    document.body.classList.remove("toc-open");
  }

  // 初次加载、切换文章、搜索跳转后都会触发，每次全量重建
  function build() {
    sheetClose();
    var main = document.querySelector(".markdown-section");
    var heads = main ? main.querySelectorAll("h2, h3, h4") : [];
    if (heads.length < MIN_HEADINGS) return hide();

    // ---- 桌面：目录面板（小胶囊+大胶囊中心对称） ----
    if (!box) {
      box = document.createElement("nav");
      box.className = "page-toc";
      box.setAttribute("aria-label", "本文目录");

      // 小胶囊（收起时显示）
      var title = document.createElement("div");
      title.className = "page-toc-title";
      title.textContent = "目录";
      title.setAttribute("role", "button");
      title.setAttribute("tabindex", "0");
      title.addEventListener("click", function () {
        open = true;
        saveOpen(open);
        applyOpen();
      });
      title.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open = true;
          saveOpen(open);
          applyOpen();
        }
      });
      box.appendChild(title);

      // 大胶囊（展开时显示）
      var toggle = document.createElement("div");
      toggle.className = "page-toc-toggle";
      toggle.textContent = "收起目录";
      toggle.setAttribute("role", "button");
      toggle.setAttribute("tabindex", "0");
      toggle.addEventListener("click", function () {
        open = false;
        saveOpen(open);
        applyOpen();
      });
      toggle.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open = false;
          saveOpen(open);
          applyOpen();
        }
      });
      box.appendChild(toggle);

      var list = document.createElement("div");
      list.className = "page-toc-list";
      box.appendChild(list);

      document.body.appendChild(box);
    }
    box.hidden = false;

    // ---- 手机：右下角按钮 + 底部面板 + 遮罩 ----
    if (!fab) {
      fab = document.createElement("button");
      fab.type = "button";
      fab.className = "toc-fab";
      fab.textContent = "目录";
      fab.addEventListener("click", sheetOpen);
      document.body.appendChild(fab);
    }
    if (!sheet) {
      backdrop = document.createElement("div");
      backdrop.className = "toc-sheet-backdrop";
      backdrop.addEventListener("click", sheetClose);
      document.body.appendChild(backdrop);

      sheet = document.createElement("div");
      sheet.className = "toc-sheet";
      sheet.setAttribute("role", "dialog");
      sheet.setAttribute("aria-label", "本文目录");
      var head = document.createElement("div");
      head.className = "toc-sheet-head";
      var headTitle = document.createElement("span");
      headTitle.className = "toc-sheet-title";
      headTitle.textContent = "目录";
      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "toc-sheet-close";
      closeBtn.textContent = "✕";
      closeBtn.setAttribute("aria-label", "关闭目录");
      closeBtn.addEventListener("click", sheetClose);
      head.appendChild(headTitle);
      head.appendChild(closeBtn);
      sheet.appendChild(head);

      sheetList = document.createElement("div");
      sheetList.className = "toc-sheet-list";
      sheet.appendChild(sheetList);

      // 自定义滚动条滑块（替代浏览器自带滚动条）
      sheetThumb = document.createElement("div");
      sheetThumb.className = "toc-sheet-thumb";
      sheet.appendChild(sheetThumb);

      // 监听面板列表滚动 → 更新滑块位置 + 显示/隐藏
      sheetList.addEventListener("scroll", function () {
        var el = sheetList;
        var ratio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
        var thumbH = Math.max(24, (el.clientHeight / el.scrollHeight) * el.clientHeight);
        // 滑块在 sheet 内（与 list 同级），top 需加上 list 在 sheet 内的偏移
        var listOffsetTop = el.offsetTop || 0;
        var thumbTop = listOffsetTop + ratio * (el.clientHeight - thumbH);
        sheetThumb.style.height = thumbH + "px";
        sheetThumb.style.top = thumbTop + "px";
        sheetThumb.style.opacity = "0.5";
        if (thumbHideTimer) clearTimeout(thumbHideTimer);
        thumbHideTimer = setTimeout(function () {
          sheetThumb.style.opacity = "0";
          thumbHideTimer = null;
        }, THUMB_HIDE_DELAY);
      }, { passive: true });

      document.body.appendChild(sheet);
    }
    fab.hidden = false;
    sheetList.innerHTML = "";

    // ---- 同一份数据生成两份目录项 ----
    items = [];
    heads.forEach(function (h) {
      var jump = function () {
        var top = h.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top: top, behavior: "smooth" });
      };

      var link = document.createElement("button");
      link.type = "button";
      link.className = "page-toc-item level-" + h.tagName.toLowerCase();
      link.title = h.textContent; // 目录里超长省略，完整标题放悬浮提示
      link.textContent = h.textContent;
      link.addEventListener("click", jump);
      list.appendChild(link);

      var sheetLink = document.createElement("button");
      sheetLink.type = "button";
      sheetLink.className = "toc-sheet-item level-" + h.tagName.toLowerCase();
      sheetLink.textContent = h.textContent;
      sheetLink.addEventListener("click", function () {
        sheetClose();
        jump();
      });
      sheetList.appendChild(sheetLink);

      items.push({ el: h, link: link, sheetLink: sheetLink });
    });

    // 按记忆的展开状态布局本页（首帧即决定正文宽度，避免闪动）
    applyOpen();
    requestAnimationFrame(highlight); // 构建完立即定位当前高亮（如刷新后停在文章中部）
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  if (window.$docsify && Array.isArray(window.$docsify.plugins)) {
    window.$docsify.plugins.push(function (hook) {
      hook.doneEach(build);
    });
  }
})();
