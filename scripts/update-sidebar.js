const fs = require("fs");
const path = require("path");

const NOTE_DIR = path.join(__dirname, "..", "docs", "note");
const DOCS_DIR = path.join(__dirname, "..", "docs");
const SIDEBAR_FILE = path.join(DOCS_DIR, "_sidebar.md");
const HOME_FILE = path.join(DOCS_DIR, "home.md");
const TEMPLATE_FILE = path.join(__dirname, "template.md");

const IGNORE_DIRS = new Set(["archive"]);

// 首页文章流排除的顶级分类：知识库从 vault 整体同步（scripts/sync-vault.js），
// 篇幅大且非按时间消费的内容，首页不收录，从侧边栏「知识库」分类进入
const HOME_EXCLUDE_DIRS = new Set(["知识库"]);

// 文件名以「数字.」开头（如 01.xxx）视为教程编号章节：
// 同目录内排在无编号文件之前，按编号升序（01→02→10），
// 与「最新在前」的日期倒序互补，保证教程系列的阅读顺序
function chapterNumber(name) {
  const m = name.match(/^(\d+)\./);
  return m ? Number(m[1]) : null;
}

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

// 把 front-matter 的 updated 字段刷成指定日期（提交钩子用）：
// 已有 updated 就改值；没有就插到 date 行之后（date 也没有则追加在块尾）。
// 无 front-matter、或刷完内容无变化时返回 null（调用方跳过写回）
function setUpdatedField(content, dateStr) {
  const stripped = content.replace(/^\uFEFF/, "");
  const match = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const eol = stripped.includes("\r\n") ? "\r\n" : "\n";
  const fm = match[1];
  const updatedLine = "updated: " + dateStr;
  const existing = fm.match(/^(updated:[^\r\n]*)/m);
  const dateLine = fm.match(/^(date:[^\r\n]*)/m);
  let newFm;
  if (existing) {
    newFm = fm.replace(existing[0], updatedLine);
  } else if (dateLine) {
    newFm = fm.replace(dateLine[0], dateLine[0] + eol + updatedLine);
  } else {
    newFm = fm + eol + updatedLine;
  }
  const rebuilt = "---" + eol + newFm + eol + "---" + stripped.slice(match[0].length);
  return rebuilt === stripped ? null : rebuilt;
}

// 解析 git diff -z 的输出：路径以 \0 分隔（末尾带一个多余的 \0）。
// 必须用 -z 的原因：它同时关闭 quotepath 转义——core.quotepath 默认 true 时
// 中文路径会被双引号包裹并做八进制转义（"docs/note/\347\274..."），
// 导致下游 .endsWith(".md") 失配、整个刷新流程被静默跳过
// （2026-09-09 的历史 bug：仓库内 84 篇文章路径全含中文，无一生效）
function parseStagedPaths(output) {
  return output.split("\0").filter(Boolean);
}

// 取暂存区里处于修改（M）状态的文章路径（提交钩子用）。
// -z 的理由见 parseStagedPaths 注释：中文路径必须原样输出。
// cwd 可注入：单测传临时仓库路径，让测试执行的就是这段生产代码本身
function listStagedModifiedArticles(cwd = process.cwd()) {
  const { execFileSync } = require("child_process");
  return parseStagedPaths(
    execFileSync(
      "git",
      ["diff", "--cached", "--name-only", "--diff-filter=M", "-z", "--", "docs/note/"],
      { encoding: "utf-8", cwd }
    )
  );
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
        // 带 / 前缀的绝对路径：index.html 开了 relativePath（相对链接按当前
        // 页面解析），侧边栏/首页链接若不带 / 在深层页面会被拼到当前目录下
        path: "/note/" + relativePath.replace(/\\/g, "/"),
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
      // 编号章节优先按编号排（见 chapterNumber 注释），其余按日期倒序
      // 注意：文件项只有 title（去 .md、下划线转空格后的显示名），编号前缀不受影响
      const na = chapterNumber(a.title);
      const nb = chapterNumber(b.title);
      if (na !== null || nb !== null) {
        if (na === null) return 1;
        if (nb === null) return -1;
        return na - nb;
      }
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
      // 注意：输出必须保持全紧致（条目间不留空行）。markdown 解析器会把空行
      // 分隔的「松散列表」条目文本包进 <p>，紧致列表则保留裸文本——裸文本
      // 结构下所有层级的文件夹/文件才能共用同一套行内图标 CSS（li::before），
      // 混用两种结构会导致部分层级图标错位或丢失
      content += `${indent}- ${toDisplayName(item.name)}\n`;
      content += renderList(item.children, level + 1);
    } else {
      content += `${indent}- [${item.title}](${item.path})\n`;
    }
  }

  return content;
}

// 收集所有文章（扁平化，按日期排序）。
// excludeDirs：按分类名排除的目录（首页文章流用，侧边栏渲染不走这里）
function collectAllFiles(items, excludeDirs = new Set()) {
  const files = [];
  for (const item of items) {
    if (item.type === "folder") {
      if (excludeDirs.has(item.name)) continue;
      files.push(...collectAllFiles(item.children, excludeDirs));
    } else {
      files.push(item);
    }
  }
  return files.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
}

// 供测试 require 使用；直接执行（npm run update）时才跑主流程
module.exports = { formatDate, toDisplayName, readFrontMatter, setUpdatedField, parseStagedPaths, listStagedModifiedArticles, scanDirectory, renderList, collectAllFiles };

if (require.main === module) {
  // 提交钩子入口（.git/hooks/pre-commit 调用）：把暂存区里有改动的文章的
  // updated 刷成今天。必须跑在主流程之前，home.md 才能吃到新日期。
  // 只处理 M（内容修改）状态的文件：新增文章的 date 本来就是今天，无需重复
  if (process.argv.includes("--touch-updated")) {
    const today = formatDate(new Date());
    for (const name of listStagedModifiedArticles()) {
      if (!name.endsWith(".md")) continue;
      const filePath = path.join(DOCS_DIR, name.slice("docs/".length));
      const next = setUpdatedField(fs.readFileSync(filePath, "utf-8"), today);
      if (next !== null) {
        fs.writeFileSync(filePath, next, "utf-8");
        console.log("已刷新 updated: " + today + " (" + name + ")");
      }
    }
  } else {
    const structure = scanDirectory(NOTE_DIR);

    fs.writeFileSync(SIDEBAR_FILE, renderList(structure));
    console.log(`已更新: ${SIDEBAR_FILE}`);

    // 首页用扁平化文章列表（不分文件夹，按 updated/date 排序，知识库等分类不进首页）
    const templateContent = fs.readFileSync(TEMPLATE_FILE, "utf-8");
    const allFiles = collectAllFiles(structure, HOME_EXCLUDE_DIRS);
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
  }
}
