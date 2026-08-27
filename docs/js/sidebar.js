/* ============================================================
   自定义侧边栏折叠交互（抄自 bw_docsify，依赖 docsify v5）
   依赖：docsify v5 原生 li.group 结构 + css/sidebar.css
   配置：window.$docsify.sidebarDisplayLevel（未配置时默认展开 1 级）
   记忆：用户手动展开/收起的分组存 localStorage，切页后恢复；
         无记录的分组按 sidebarDisplayLevel 决定初始状态
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'sidebar-collapse-state';
  // 取用户上次保存的展开分组集合；解析失败按无记忆处理
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : null;
    } catch (e) {
      return null;
    }
  }
  function saveState(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      /* 隐私模式等写入失败时静默降级为无记忆 */
    }
  }

  // 每次切页后 DOM 重建，展开集合需要重新落到新的 li 上。
  // 用「分组标题文字 + 路径」做 key：不同分类下同名子目录也能区分
  function groupKey(li) {
    var parts = [];
    for (var p = li; p && !p.classList.contains('sidebar-nav'); p = p.parentElement) {
      if (p.tagName === 'LI') {
        // 取 li 的直接文本（不含子列表里的），即分组标题
        var title = '';
        p.childNodes.forEach(function (n) {
          if (n.nodeType === 3) title += n.textContent;
        });
        parts.unshift(title.trim());
      }
    }
    return parts.join('/');
  }

  function initSidebar() {
    // 注意用 ?? 而非 ||：level=0（全部收起）是合法值，|| 会把 0 误当未配置
    var level = (window.$docsify && window.$docsify.sidebarDisplayLevel) ?? 1;
    var openSet = loadState();
    var isFirstInit = openSet === null; // 首次访问：按 level 初始化并落盘
    if (isFirstInit) openSet = new Set();

    document.querySelectorAll('.sidebar-nav ul:not(.app-sub-sidebar) > li.group').forEach(function (li) {
      if (li.dataset.sidebarBound) return;
      li.dataset.sidebarBound = '1';

      var depth = 1;
      for (var p = li.parentElement; p && !p.classList.contains('sidebar-nav'); p = p.parentElement) {
        if (p.tagName === 'LI' && p.classList.contains('group')) depth++;
      }

      var key = groupKey(li);
      // 初始状态：有记忆用记忆；首次访问按深度 vs level
      var open = isFirstInit ? depth <= level : openSet.has(key);
      li.classList.add(open ? 'open' : 'collapse');
      if (isFirstInit && open) openSet.add(key);

      var nestedUl = li.querySelector(':scope > ul');
      li.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        if (nestedUl && nestedUl.contains(e.target)) return;
        var nowOpen = li.classList.toggle('open');
        li.classList.toggle('collapse', !nowOpen);
        // 记录用户选择；saveState 全量写，多分组并发点击也一致
        if (nowOpen) openSet.add(key);
        else openSet.delete(key);
        saveState(openSet);
      });
    });

    if (isFirstInit) saveState(openSet);
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(initSidebar);
  });
})();
