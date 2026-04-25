const fs = require("fs");
const path = require("path");

const NOTE_DIR = path.join(__dirname, "..", "docs", "note");
const DOCS_DIR = path.join(__dirname, "..", "docs");
const SIDEBAR_FILE = path.join(DOCS_DIR, "_sidebar.md");
const HOME_FILE = path.join(DOCS_DIR, "home.md");
const TEMPLATE_FILE = path.join(__dirname, "template.md");

/**
 * 将文件名转换为显示标题
 * 例如: "git_命令.md" -> "git 命令"
 */
function fileNameToTitle(fileName) {
  return fileName.replace(/\.md$/, "").replace(/_/g, " ");
}

/**
 * 递归扫描目录，获取所有 markdown 文件结构
 * @param {string} dir - 要扫描的目录路径
 * @param {string} basePath - 相对路径前缀
 * @returns {Array} - 目录结构数组
 */
function scanDirectory(dir, basePath = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      // 递归扫描子目录
      const children = scanDirectory(path.join(dir, entry.name), relativePath);
      // 只添加非空目录
      if (children.length > 0) {
        result.push({
          type: "folder",
          name: entry.name,
          children: children,
        });
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      // 添加 markdown 文件
      result.push({
        type: "file",
        title: fileNameToTitle(entry.name),
        path: "note/" + relativePath.replace(/\\/g, "/"),
      });
    }
  }

  return result;
}

/**
 * 将目录结构渲染为 markdown 侧边栏格式
 * @param {Array} items - 目录结构数组
 * @param {number} level - 缩进层级
 * @returns {string} - markdown 字符串
 */
function renderSidebar(items, level = 0) {
  const indent = "  ".repeat(level);
  let content = "";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.type === "folder") {
      // 渲染文件夹标题：将下划线替换为空格用于展示（如"API_代理"显示为"API 代理"），文件链接路径仍使用原始文件夹名
      content += `${indent}- ${item.name.replace(/_/g, " ")}\n`;
      // 递归渲染子项
      content += renderSidebar(item.children, level + 1);
      // 顶级文件夹之间添加空行
      if (level === 0 && i < items.length - 1) {
        content += "\n";
      }
    } else {
      // 渲染文件链接
      content += `${indent}- [${item.title}](${item.path})\n`;
    }
  }

  return content;
}

// 主程序
const structure = scanDirectory(NOTE_DIR);
const sidebarContent = renderSidebar(structure);

// 更新 _sidebar.md
fs.writeFileSync(SIDEBAR_FILE, sidebarContent);
console.log(`✅ 侧边栏已更新: ${SIDEBAR_FILE}`);

// 读取模板文件并生成 home.md
const templateContent = fs.readFileSync(TEMPLATE_FILE, "utf-8");
const homeContent = templateContent.replace("{{ARTICLE_LIST}}", sidebarContent);
fs.writeFileSync(HOME_FILE, homeContent);
console.log(`✅ 首页已更新: ${HOME_FILE}`);

console.log(`📁 共 ${structure.length} 个分类`);
