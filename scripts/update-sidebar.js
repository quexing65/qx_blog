const fs = require("fs");
const path = require("path");

const NOTE_DIR = path.join(__dirname, "..", "docs", "note");
const DOCS_DIR = path.join(__dirname, "..", "docs");
const SIDEBAR_FILE = path.join(DOCS_DIR, "_sidebar.md");
const HOME_FILE = path.join(DOCS_DIR, "home.md");
const TEMPLATE_FILE = path.join(__dirname, "template.md");

const IGNORE_DIRS = new Set(["archive"]);

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function toDisplayName(name) {
  return name.replace(/_/g, "\\_");
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
        const folderTime = children.reduce((max, c) => (c.modifyTime > max ? c.modifyTime : max), "0000-00-00");
        result.push({
          type: "folder",
          name: entry.name,
          children: children,
          modifyTime: folderTime,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const filePath = path.join(dir, entry.name);
      const stats = fs.statSync(filePath);
      result.push({
        type: "file",
        title: toDisplayName(entry.name.replace(/\.md$/, "")),
        path: "note/" + relativePath.replace(/\\/g, "/"),
        modifyTime: formatDate(stats.mtime),
      });
    }
  }

  result.sort((a, b) => {
    if (a.type === "folder" && b.type === "folder") {
      return a.name.localeCompare(b.name);
    }
    if (a.type === "file" && b.type === "file") {
      return b.modifyTime.localeCompare(a.modifyTime);
    }
    return a.type === "folder" ? -1 : 1;
  });

  return result;
}

function renderList(items, level = 0, showTime = false) {
  const indent = "  ".repeat(level);
  let content = "";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.type === "folder") {
      if (showTime) {
        content += `<div class="article-folder">${toDisplayName(item.name)}</div>\n`;
      } else {
        content += `${indent}- ${toDisplayName(item.name)}\n`;
      }
      content += renderList(item.children, level + 1, showTime);
      if (level === 0 && i < items.length - 1) {
        content += "\n";
      }
    } else {
      if (showTime) {
        content += `<div class="article-item"><span><a href="${item.path}">${item.title}</a></span><span class="article-date">${item.modifyTime}</span></div>\n`;
      } else {
        content += `${indent}- [${item.title}](${item.path})\n`;
      }
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
  return files.sort((a, b) => b.modifyTime.localeCompare(a.modifyTime));
}

const structure = scanDirectory(NOTE_DIR);

fs.writeFileSync(SIDEBAR_FILE, renderList(structure, 0, false));
console.log(`已更新: ${SIDEBAR_FILE}`);

// 首页用扁平化文章列表（不分文件夹，按日期排序）
const templateContent = fs.readFileSync(TEMPLATE_FILE, "utf-8");
const allFiles = collectAllFiles(structure);
const homeContent = allFiles
  .map((f) => `- [${f.title}](${f.path}) <span class="article-date">${f.modifyTime}</span>`)
  .join("\n");
fs.writeFileSync(HOME_FILE, templateContent.replace("{{ARTICLE_LIST}}", homeContent.trimEnd()));
console.log(`已更新: ${HOME_FILE}`);

console.log(`共 ${structure.length} 个分类`);
