const fs = require("fs");
const path = require("path");

const NOTE_DIR = path.join(__dirname, "..", "docs", "note");
const DOCS_DIR = path.join(__dirname, "..", "docs");
const SIDEBAR_FILE = path.join(DOCS_DIR, "_sidebar.md");
const HOME_FILE = path.join(DOCS_DIR, "home.md");
const TEMPLATE_FILE = path.join(__dirname, "template.md");

const IGNORE_DIRS = new Set(["archive"]);

// 用本地时区取日期，而不是 toISOString()（UTC）：
// 否则北京时间 0-8 点创建的文件会被记成前一天的日期
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDisplayName(name) {
  return name.replace(/_/g, " ");
}

// 解析文章头部的 front-matter（--- \n date: YYYY-MM-DD \n updated: YYYY-MM-DD \n ---）。
// 返回 { date, updated }，字段缺失或格式不对时对应值为 null。
// 文章日期以此为准：文件 mtime 在换电脑 / 重新 clone 后会丢失，
// front-matter 跟着内容走，走到哪台电脑都不会变。
function readFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const read = (key) => {
    const line = match[1].match(new RegExp("^" + key + ":\\s*(\\d{4}-\\d{2}-\\d{2})\\s*$", "m"));
    return line ? line[1] : null;
  };
  return { date: read("date"), updated: read("updated") };
}

function scanDirectory(dir, basePath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const children = scanDirectory(path.join(dir, entry.name), relativePath);
      if (children.length > 0) {
        const folderTime = children.reduce((max, c) => (c.sortDate > max ? c.sortDate : max), "0000-00-00");
        result.push({
          type: "folder",
          name: entry.name,
          children: children,
          sortDate: folderTime,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const filePath = path.join(dir, entry.name);
      const stats = fs.statSync(filePath);
      // 读入时剥离 UTF-8 BOM 头（Windows 记事本保存的文件常见）：
      // BOM 会让下方 ^--- 匹配不到 front-matter，导致误判后重复补写
      const content = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
      let meta = readFrontMatter(content);

      // 新文章没有 front-matter：用当前 mtime 自动补写进文件并保存。
      // 日期在第一次生成时即被锁定，之后重跑脚本、改内容、换电脑都不再受 mtime 漂移影响
      if (!meta) {
        const mtimeDate = formatDate(stats.mtime);
        fs.writeFileSync(filePath, "---\ndate: " + mtimeDate + "\n---\n\n" + content, "utf-8");
        meta = { date: mtimeDate, updated: null };
        console.log("已自动补写 front-matter (date: " + mtimeDate + "): " + filePath);
      } else if (!meta.date) {
        console.warn("警告: " + filePath + " 的 front-matter 缺少有效 date 字段，本次按 mtime 显示");
      }

      // publishDate = 发布日期（front-matter 缺失时退回 mtime）
      // sortDate = 排序口径：有 updated（最后内容更新日）用 updated，否则用发布日期
      const publishDate = meta.date || formatDate(stats.mtime);
      result.push({
        type: "file",
        title: toDisplayName(entry.name.replace(/\.md$/, "")),
        path: "note/" + relativePath.replace(/\\/g, "/"),
        publishDate: publishDate,
        updateDate: meta.updated || null,
        sortDate: meta.updated || publishDate,
      });
    }
  }

  result.sort((a, b) => {
    if (a.type === "folder" && b.type === "folder") {
      // 锁定中文排序 locale：不带参数时跟随系统（Windows 中文 = 拼音序，
      // CI Linux 英文环境 = 部首序），两边生成顺序不同会导致 CI drift 校验误报
      return a.name.localeCompare(b.name, "zh-Hans-CN");
    }
    if (a.type === "file" && b.type === "file") {
      return b.sortDate.localeCompare(a.sortDate);
    }
    return a.type === "folder" ? -1 : 1;
  });

  return result;
}

function renderList(items, level = 0) {
  const indent = "  ".repeat(level);
  let content = "";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.type === "folder") {
      content += `${indent}- ${toDisplayName(item.name)}\n`;
      content += renderList(item.children, level + 1);
      if (level === 0 && i < items.length - 1) {
        content += "\n";
      }
    } else {
      content += `${indent}- [${item.title}](${item.path})\n`;
    }
  }

  return content;
}

// 收集所有文章（扁平化，按日期排序）
function collectAllFiles(items) {
  const files = [];
  for (const item of items) {
    if (item.type === "folder") {
      files.push(...collectAllFiles(item.children));
    } else {
      files.push(item);
    }
  }
  return files.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
}

const structure = scanDirectory(NOTE_DIR);

fs.writeFileSync(SIDEBAR_FILE, renderList(structure));
console.log(`已更新: ${SIDEBAR_FILE}`);

// 首页用扁平化文章列表（不分文件夹，按 updated/date 排序）
const templateContent = fs.readFileSync(TEMPLATE_FILE, "utf-8");
const allFiles = collectAllFiles(structure);
const homeContent = allFiles
  .map((f) => {
    // 有 updated 的文章同时展示两个日期，与排序口径一致
    const dateText = f.updateDate
      ? `发布于 ${f.publishDate} · 更新于 ${f.updateDate}`
      : f.publishDate;
    return `- [${f.title}](${f.path}) <span class="article-date">${dateText}</span>`;
  })
  .join("\n");
fs.writeFileSync(HOME_FILE, templateContent.replace("{{ARTICLE_LIST}}", homeContent.trimEnd()));
console.log(`已更新: ${HOME_FILE}`);

console.log(`共 ${structure.length} 个分类`);
