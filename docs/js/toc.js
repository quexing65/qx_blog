/**
 * 右侧悬浮目录（方案A，样式见 css/toc.css，方案说明见仓库根目录 右侧目录方案.md）
 * - 每篇文章渲染完成后（docsify doneEach），收集正文里的 h2/h3/h4
 *   （docsify 已为每个标题生成锚点 id），在视口右侧空白处生成标题目录
 * - 点击目录项平滑滚动到对应标题；滚动时高亮"当前正在读"的小节
 * - 标题少于 3 个的页面不显示（首页因此自动跳过）；窄屏由 CSS 隐藏
 * - 亮/暗色自动跟随主题：颜色全部引用 CSS 变量，无需两套配色
 * - 注册方式：docsify 到 DOMContentLoaded 才读取 window.$docsify 初始化，
 *   本脚本在 body 末尾同步执行、先于该时机，因此可直接 push 进 plugins
 */
(function () {
  "use strict";

  var MIN_HEADINGS = 3; // 标题数不足则不显示目录
  var SCROLL_OFFSET = 40; // 点击跳转时标题距视口顶部的留白（px）
  var SPY_LINE = 120; // 标题顶部越过这条线（距视口顶 px）即视为"正在读"

  var box = null; // 目录容器 <nav>，全程唯一，切页复用
  var items = []; // { el: 正文标题元素, link: 目录按钮 }，build 时重建
  var ticking = false;

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

  function hide() {
    items = [];
    if (box) box.hidden = true;
  }

  // 初次加载、切换文章、搜索跳转后都会触发，每次全量重建
  function build() {
    var main = document.querySelector(".markdown-section");
    var heads = main ? main.querySelectorAll("h2, h3, h4") : [];
    if (heads.length < MIN_HEADINGS) return hide();

    if (!box) {
      box = document.createElement("nav");
      box.className = "page-toc";
      box.setAttribute("aria-label", "本文目录");
      document.body.appendChild(box);
    }
    box.hidden = false;
    box.innerHTML = "";

    var title = document.createElement("div");
    title.className = "page-toc-title";
    title.textContent = "目录";
    box.appendChild(title);

    var list = document.createElement("div");
    list.className = "page-toc-list";
    box.appendChild(list);

    items = [];
    heads.forEach(function (h) {
      var link = document.createElement("button");
      link.type = "button";
      link.className = "page-toc-item level-" + h.tagName.toLowerCase();
      link.title = h.textContent; // 目录里超长省略，完整标题放悬浮提示
      link.textContent = h.textContent;
      link.addEventListener("click", function () {
        var top = h.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
      list.appendChild(link);
      items.push({ el: h, link: link });
    });

    // 构建完立即定位当前高亮（如刷新后停在文章中部）
    requestAnimationFrame(highlight);
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  if (window.$docsify && Array.isArray(window.$docsify.plugins)) {
    window.$docsify.plugins.push(function (hook) {
      hook.doneEach(build);
    });
  }
})();
