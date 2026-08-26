// 把 Obsidian 知识库（vault）的「基础知识」目录同步到博客 docs/note/知识库/。
// 可重复执行，每次都是一次完整的镜像同步：
//   1. vault 里新增/修改的笔记转换后复制过来
//   2. vault 里删除的笔记从博客中同步删除
//   3. 内容未变化的文件不重写（git diff 保持干净）
// 转换规则（Obsidian → 博客约定）：
//   - front-matter 的 created 改名为 date（update-sidebar.js 以 date 为发布日期）
//   - 文件/目录名中的空格 → 下划线（check-spaces.js 强制）
//   - 双链 [[目标|显示]] → 标准 Markdown 链接（按「相对当前文件」解析目标）
//   - 嵌入 ![[图片|描述]] → 标准 Markdown 图片
// 同步完成后自动重建侧边栏与首页（node scripts/update-sidebar.js）。
//
// 用法：npm run sync:vault
//   或指定源目录：node scripts/sync-vault.js --source "E:\obdsin\笔记\基础知识"

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { formatDate } = require("./update-sidebar.js");

// 源：vault 中的「基础知识」目录（00.Inbox 草稿、根目录元数据文件等不上博客）
const DEFAULT_SOURCE = "E:\\obdsin\\笔记\\基础知识";
const TARGET_DIR = path.join(__dirname, "..", "docs", "note", "知识库");

// 源目录内不迁移的子目录名（vault 的旧版归档，不上博客）
const EXCLUDE_DIRS = new Set(["_归档"]);
// 不迁移的文件扩展名（Obsidian 多维表格文件）
const EXCLUDE_EXTS = new Set([".base"]);

/* ================= 纯转换函数（供单测） ================= */

// 文件/目录名中的空格 → 下划线
function toSnakeName(name) {
  return name.replace(/ /g, "_");
}

// 相对路径（POSIX 风格）逐段做空格 → 下划线转换
function convertPath(relPath) {
  return relPath.split("/").map(toSnakeName).join("/");
}

// front-matter：created 改名为 date。
// 博客口径：date = 发布日、updated = 最后更新；vault 口径是 created/updated，
// 这里只改名，其余字段（tags 等）原样保留（index.html 渲染前会剥掉整个 front-matter）。
// 无 front-matter 或块内没有 created/date 时，用 fallbackDate（源文件 mtime）补写。
function convertFrontMatter(content, fallbackDate) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return "---\ndate: " + fallbackDate + "\n---\n\n" + content;
  }
  const block = match[1];
  if (/^date:/m.test(block)) return content; // 已是博客口径
  let newBlock;
  if (/^created:.*$/m.test(block)) {
    newBlock = block.replace(/^created:(.*)$/m, "date:$1");
  } else {
    newBlock = "date: " + fallbackDate + "\n" + block;
  }
  // match[0] 含首尾两对 ---，重组时闭合的 --- 不能丢
  return "---\n" + newBlock + "\n---" + content.slice(match[0].length);
}

// Obsidian 双链/嵌入 → 标准 Markdown。
// fileIndex: Map<源相对路径, 目标相对路径>（buildFileIndex 生成）
// currentRelPath: 当前 md 在源目录中的相对路径（POSIX 风格）
// vaultPrefix: 源目录名（如「基础知识」），用于解析以 vault 根路径写出的链接
// 链接目标解析顺序（与 Obsidian 的链接解析规则对应）：
//   1. 相对当前文件（含 ../ 写法）
//   2. 以源目录名开头的 vault 根路径（如 [[基础知识/Python/关于Python]]）
//   3. 文件名全库唯一匹配（如 [[关于Python]]）
// 解析不到目标（未迁移/已删除）时保留原样并记录 warning。
// 代码块/行内代码里的 [[...]] 一律不动（Pandas 笔记里 df[['open','close']]
// 之类的列表取值语法不是 wikilink）。
function convertWikiLinks(content, currentRelPath, fileIndex, vaultPrefix = "") {
  const warnings = [];

  // 预建「文件名 → 源相对路径」索引（按目标路径去重），用于最短名链接兜底
  const byBasename = new Map();
  const seen = new Set();
  for (const key of fileIndex.keys()) {
    const value = fileIndex.get(key);
    if (seen.has(value)) continue;
    seen.add(value);
    const base = path.posix.basename(key);
    if (!byBasename.has(base)) byBasename.set(base, []);
    byBasename.get(base).push(key);
  }

  const resolve = (target) => {
    const tryPath = (p) => {
      const n = path.posix.normalize(p);
      if (fileIndex.has(n)) return n;
      if (fileIndex.has(n + ".md")) return n + ".md";
      return null;
    };
    // 1. 相对当前文件
    let hit = tryPath(path.posix.join(path.posix.dirname(currentRelPath), target));
    // 2. vault 根路径写法（以源目录名开头）
    if (!hit && vaultPrefix && target.startsWith(vaultPrefix + "/")) {
      hit = tryPath(target.slice(vaultPrefix.length + 1));
    }
    // 3. 文件名全库唯一匹配
    if (!hit) {
      const base = path.posix.basename(target);
      for (const b of [base, base + ".md"]) {
        const hits = byBasename.get(b);
        if (hits && hits.length === 1) return hits[0];
      }
    }
    return hit;
  };

  // 先按「围栏代码块 / 行内代码」切分，代码片段原样保留
  const segments = content.split(/(```[\s\S]*?```|`[^`\n]*`)/g);
  const converted = segments
    .map((seg, i) => {
      if (i % 2 === 1) return seg; // 代码片段，跳过不处理
      return seg.replace(/(!?)\[\[([^\]\n]+)\]\]/g, (whole, bang, inner) => {
        const barIdx = inner.indexOf("|");
        const targetPart = barIdx === -1 ? inner : inner.slice(0, barIdx);
        const display = barIdx === -1 ? "" : inner.slice(barIdx + 1).trim();

        let target = targetPart.trim();
        let anchor = "";
        const hashIdx = target.indexOf("#");
        if (hashIdx !== -1) {
          anchor = target.slice(hashIdx); // 含 #（标题锚点）
          target = target.slice(0, hashIdx);
        }

        const hit = resolve(target);
        if (!hit) {
          warnings.push(currentRelPath + " → [[" + targetPart + "]] 目标未迁移或不存在，已保留原样");
          return whole;
        }

        // 目标侧路径（已做下划线转换），再换算成相对当前文件的 URL
        const from = convertPath(currentRelPath);
        let url = path.posix.relative(path.posix.dirname(from), fileIndex.get(hit));
        url = url.replace(/ /g, "%20");

        if (bang) {
          return "![" + display + "](" + url + anchor + ")";
        }
        const text = display || path.posix.basename(hit).replace(/\.md$/, "");
        return "[" + text + "](" + url + anchor + ")";
      });
    })
    .join("");
  return { content: converted, warnings };
}

// 遍历源目录，返回 Map：源相对路径 → 目标相对路径（空格转下划线）
function buildFileIndex(dir) {
  const index = new Map();
  const walk = (abs, rel) => {
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const childRel = rel ? rel + "/" + entry.name : entry.name;
      const childAbs = path.join(abs, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        walk(childAbs, childRel);
      } else if (entry.isFile()) {
        if (EXCLUDE_EXTS.has(path.extname(entry.name).toLowerCase())) continue;
        index.set(childRel, convertPath(childRel));
      }
    }
  };
  walk(dir, "");
  return index;
}

/* ================= 主流程 ================= */

// 删除目标目录中不在 wanted 集合内的文件和空目录（镜像同步的删除侧），返回删除文件数
function pruneTarget(targetDir, wanted) {
  if (!fs.existsSync(targetDir)) return 0;
  let removed = 0;
  const walk = (abs) => {
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      const child = path.join(abs, entry.name);
      if (entry.isDirectory()) {
        walk(child);
        if (fs.readdirSync(child).length === 0) fs.rmdirSync(child);
      } else if (entry.isFile() && !wanted.has(child)) {
        fs.unlinkSync(child);
        removed++;
      }
    }
  };
  walk(targetDir);
  return removed;
}

function main() {
  const args = process.argv.slice(2);
  const sourceIdx = args.indexOf("--source");
  const source =
    sourceIdx !== -1 && args[sourceIdx + 1] ? args[sourceIdx + 1] : DEFAULT_SOURCE;

  if (!fs.existsSync(source)) {
    console.error("源目录不存在: " + source);
    console.error('用法: node scripts/sync-vault.js --source "E:\\obdsin\\笔记\\基础知识"');
    process.exit(1);
  }

  const fileIndex = buildFileIndex(source);

  // 1. 逐文件转换，得到目标应有序列（目标绝对路径 → 内容 Buffer）
  const wanted = new Map();
  const linkWarnings = [];
  for (const [srcRel, dstRel] of fileIndex) {
    const srcAbs = path.join(source, srcRel);
    const dstAbs = path.join(TARGET_DIR, dstRel);
    if (srcRel.endsWith(".md")) {
      // 剥 BOM、统一 LF 行尾，之后的所有转换都在此基础上进行
      const raw = fs.readFileSync(srcAbs, "utf-8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
      const mtime = formatDate(fs.statSync(srcAbs).mtime);
      const content = convertFrontMatter(raw, mtime);
      const { content: withLinks, warnings } = convertWikiLinks(
        content,
        srcRel,
        fileIndex,
        path.basename(source)
      );
      linkWarnings.push(...warnings);
      wanted.set(dstAbs, Buffer.from(withLinks, "utf-8"));
    } else {
      wanted.set(dstAbs, fs.readFileSync(srcAbs));
    }
  }

  // 2. 镜像清理：vault 里删掉的内容从博客里移除
  const removed = pruneTarget(TARGET_DIR, wanted);

  // 3. 写入：内容有变化才写，保证重复执行幂等
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  for (const [dstAbs, buf] of wanted) {
    const exists = fs.existsSync(dstAbs);
    if (exists && fs.readFileSync(dstAbs).equals(buf)) {
      unchanged++;
      continue;
    }
    fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
    fs.writeFileSync(dstAbs, buf);
    if (exists) updated++;
    else created++;
  }

  const mdCount = [...fileIndex.keys()].filter((p) => p.endsWith(".md")).length;
  console.log(
    "知识库同步完成: 新增 " + created + " · 更新 " + updated + " · 删除 " + removed +
    " · 未变 " + unchanged + "（笔记 " + mdCount + " 篇，资源 " + (fileIndex.size - mdCount) + " 个）"
  );
  if (linkWarnings.length > 0) {
    console.log("链接警告 " + linkWarnings.length + " 条（目标未迁移，原样保留）:");
    for (const w of linkWarnings) console.log("  - " + w);
  }

  // 4. 重建侧边栏与首页，让知识库的增删改体现在导航里
  const res = spawnSync(process.execPath, [path.join(__dirname, "update-sidebar.js")], {
    stdio: "inherit",
  });
  if (res.status !== 0) process.exit(res.status);
}

module.exports = { toSnakeName, convertPath, convertFrontMatter, convertWikiLinks, buildFileIndex };

if (require.main === module) {
  main();
}
