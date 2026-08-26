// sync-vault.js 的单元测试（Node 内置 test runner，零依赖）。
// 运行：npm test（即 node --test scripts/）
// 覆盖重点：Obsidian → 博客的三类转换（front-matter 改名、空格转下划线、双链转标准链接）

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { toSnakeName, convertPath, convertFrontMatter, convertWikiLinks, buildFileIndex } = require("./sync-vault.js");

/* ================= toSnakeName / convertPath ================= */

test("toSnakeName: 文件名中的空格转下划线", () => {
  assert.strictEqual(toSnakeName("Claude Code 使用指南"), "Claude_Code_使用指南");
  assert.strictEqual(toSnakeName("无空格"), "无空格");
});

test("convertPath: 路径逐段转换空格", () => {
  assert.strictEqual(convertPath("a b/c d.md"), "a_b/c_d.md");
  assert.strictEqual(convertPath("Linux/01.简介.md"), "Linux/01.简介.md");
});

/* ================= convertFrontMatter ================= */

test("convertFrontMatter: created 改名为 date，其余字段保留", () => {
  const src = "---\ntags:\n  - Linux\ncreated: 2026-05-01\nupdated: 2026-08-02\n---\n\n正文";
  const out = convertFrontMatter(src, "2026-09-01");
  // 精确匹配：闭合的 --- 不能丢（历史 bug：重组时丢失闭合 ---，
  // 导致 update-sidebar.js 误判无 front-matter 又补写了一块）
  assert.strictEqual(
    out,
    "---\ntags:\n  - Linux\ndate: 2026-05-01\nupdated: 2026-08-02\n---\n\n正文"
  );
});

test("convertFrontMatter: 已有 date 时原样返回", () => {
  const src = "---\ndate: 2026-01-01\n---\n正文";
  assert.strictEqual(convertFrontMatter(src, "2026-09-01"), src);
});

test("convertFrontMatter: 无 front-matter 时用 fallback 补写", () => {
  const out = convertFrontMatter("# 标题", "2026-09-01");
  assert.strictEqual(out, "---\ndate: 2026-09-01\n---\n\n# 标题");
});

test("convertFrontMatter: 有 front-matter 但无 created/date 时插入 fallback", () => {
  const out = convertFrontMatter("---\ntags:\n  - x\n---\n正文", "2026-09-01");
  assert.match(out, /^date: 2026-09-01$/m);
  assert.match(out, /^tags:/m);
});

/* ================= convertWikiLinks ================= */

test("convertWikiLinks: 嵌入图片（带描述）", () => {
  const index = new Map([["Linux/assets/截图.png", "Linux/assets/截图.png"]]);
  const { content } = convertWikiLinks("![[assets/截图.png|连接流程]]", "Linux/02.环境搭建.md", index);
  assert.strictEqual(content, "![连接流程](assets/截图.png)");
});

test("convertWikiLinks: 嵌入图片（无描述）", () => {
  const index = new Map([["Linux/assets/截图.png", "Linux/assets/截图.png"]]);
  const { content } = convertWikiLinks("![[assets/截图.png]]", "Linux/02.环境搭建.md", index);
  assert.strictEqual(content, "![](assets/截图.png)");
});

test("convertWikiLinks: 笔记链接（带显示名，相对当前目录）", () => {
  const index = new Map([["Linux/01.简介.md", "Linux/01.简介.md"]]);
  const { content } = convertWikiLinks("[[Linux/01.简介|第一章]]", "总索引.md", index);
  assert.strictEqual(content, "[第一章](Linux/01.简介.md)");
});

test("convertWikiLinks: 笔记链接（无显示名时用文件名，相对父目录）", () => {
  const index = new Map([["Python/进阶/09.数据结构.md", "Python/进阶/09.数据结构.md"]]);
  const { content } = convertWikiLinks("[[../Python/进阶/09.数据结构]]", "数据结构/数据结构.md", index);
  assert.strictEqual(content, "[09.数据结构](../Python/进阶/09.数据结构.md)");
});

test("convertWikiLinks: 目标文件名带空格时映射为下划线路径", () => {
  const index = new Map([["00.Inbox/Claude Code 使用指南.md", "00.Inbox/Claude_Code_使用指南.md"]]);
  const { content } = convertWikiLinks("[[../00.Inbox/Claude Code 使用指南|指南]]", "基础知识/总索引.md", index);
  assert.strictEqual(content, "[指南](../00.Inbox/Claude_Code_使用指南.md)");
});

test("convertWikiLinks: 目标未迁移时保留原样并给出警告", () => {
  const { content, warnings } = convertWikiLinks("[[不存在]]", "a.md", new Map());
  assert.strictEqual(content, "[[不存在]]");
  assert.strictEqual(warnings.length, 1);
});

test("convertWikiLinks: 正文中的普通 Markdown 链接不受影响", () => {
  const { content, warnings } = convertWikiLinks("[标题](a.md) 和 ![图片](b.png)", "a.md", new Map());
  assert.strictEqual(content, "[标题](a.md) 和 ![图片](b.png)");
  assert.strictEqual(warnings.length, 0);
});

test("convertWikiLinks: 代码块与行内代码里的 [[...]] 不转换", () => {
  const index = new Map([["open.md", "open.md"]]); // 故意让短名可命中，验证代码片段确实被跳过
  const src = "```python\ndf = df[['open', 'close']]\n```\n行内 `[[open]]` 也不动";
  const { content, warnings } = convertWikiLinks(src, "Pandas/04.运算.md", index);
  assert.strictEqual(content, src);
  assert.strictEqual(warnings.length, 0);
});

test("convertWikiLinks: vault 根路径写法（以源目录名开头）", () => {
  const index = new Map([["Python/关于Python.md", "Python/关于Python.md"]]);
  const { content } = convertWikiLinks(
    "[[基础知识/Python/关于Python|Python 总览]]",
    "Python/Web开发/关于Web开发.md",
    index,
    "基础知识"
  );
  assert.strictEqual(content, "[Python 总览](../关于Python.md)");
});

test("convertWikiLinks: 最短名链接（文件名全库唯一匹配）", () => {
  const index = new Map([
    ["Python/关于Python.md", "Python/关于Python.md"],
    ["Python/基础/关于Python基础.md", "Python/基础/关于Python基础.md"],
  ]);
  const { content } = convertWikiLinks("[[关于Python]]", "Python/基础/关于Python基础.md", index);
  assert.strictEqual(content, "[关于Python](../关于Python.md)");
});

test("convertWikiLinks: 最短名歧义时不解析，保留原样", () => {
  const index = new Map([
    ["A/重名.md", "A/重名.md"],
    ["B/重名.md", "B/重名.md"],
  ]);
  // 从第三方目录引用，相对路径解析不到，只能走最短名兜底，而短名有两个同名文件
  const { content, warnings } = convertWikiLinks("[[重名]]", "C/x.md", index);
  assert.strictEqual(content, "[[重名]]");
  assert.strictEqual(warnings.length, 1);
});

/* ================= buildFileIndex（临时目录端到端） ================= */

let tmpDir;

test.beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qx-vault-test-"));
});

test.afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("buildFileIndex: 生成「源路径 → 下划线路径」映射，跳过隐藏与排除项", () => {
  fs.mkdirSync(path.join(tmpDir, "Linux", "assets"), { recursive: true });
  fs.mkdirSync(path.join(tmpDir, "Python", "_归档"), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, "Linux", "01.简介.md"), "x");
  fs.writeFileSync(path.join(tmpDir, "Linux", "assets", "源课件 图.png"), "x");
  fs.writeFileSync(path.join(tmpDir, "Python", "_归档", "旧版.md"), "x");
  fs.writeFileSync(path.join(tmpDir, "未命名.base"), "x");

  const index = buildFileIndex(tmpDir);

  assert.strictEqual(index.get("Linux/01.简介.md"), "Linux/01.简介.md");
  assert.strictEqual(index.get("Linux/assets/源课件 图.png"), "Linux/assets/源课件_图.png");
  assert.strictEqual(index.size, 2); // _归档 与 .base 均被排除
});
