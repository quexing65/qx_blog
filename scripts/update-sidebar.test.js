// update-sidebar.js 的单元测试（Node 内置 test runner，零依赖）。
// 运行：npm test（即 node --test scripts/）
// 覆盖重点：readFrontMatter 的边界用例 + BOM/时区两个历史 bug 的回归测试
// （BOM 重复补写、UTC 时区偏移，见 更新日志.md 2026-08-18）

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { formatDate, toDisplayName, readFrontMatter, scanDirectory, collectAllFiles, renderList } = require("./update-sidebar.js");

/* ================= readFrontMatter ================= */

test("readFrontMatter: 正常 front-matter（只有 date）", () => {
  const meta = readFrontMatter("---\ndate: 2026-08-18\n---\n\n正文");
  assert.deepStrictEqual(meta, { date: "2026-08-18", updated: null });
});

test("readFrontMatter: date + updated 两个字段", () => {
  const meta = readFrontMatter("---\ndate: 2026-07-01\nupdated: 2026-08-02\n---\n正文");
  assert.deepStrictEqual(meta, { date: "2026-07-01", updated: "2026-08-02" });
});

test("readFrontMatter: CRLF 行尾（Windows 保存的文章）", () => {
  const meta = readFrontMatter("---\r\ndate: 2026-08-18\r\n---\r\n\r\n正文");
  assert.deepStrictEqual(meta, { date: "2026-08-18", updated: null });
});

test("readFrontMatter: 无 front-matter 返回 null", () => {
  assert.strictEqual(readFrontMatter("# 标题\n\n正文"), null);
});

test("readFrontMatter: --- 出现在正文中间不算 front-matter", () => {
  assert.strictEqual(readFrontMatter("# 标题\n\n---\n\ndate: 2026-08-18\n\n---"), null);
});

test("readFrontMatter: 有 --- 块但缺 date 字段，date 为 null", () => {
  const meta = readFrontMatter("---\ntitle: 随笔\n---\n正文");
  assert.deepStrictEqual(meta, { date: null, updated: null });
});

test("readFrontMatter: 日期格式不合法（未补零）不算有效 date", () => {
  const meta = readFrontMatter("---\ndate: 2026-8-2\n---\n正文");
  assert.deepStrictEqual(meta, { date: null, updated: null });
});

test("readFrontMatter: front-matter 前有空行则匹配不到", () => {
  assert.strictEqual(readFrontMatter("\n---\ndate: 2026-08-18\n---\n"), null);
});

/* ================= formatDate ================= */

test("formatDate: 个位数月/日补零", () => {
  assert.strictEqual(formatDate(new Date(2026, 6, 7, 15, 0)), "2026-07-07");
});

test("formatDate: 本地午夜后的时间不偏移到前一天（时区 bug 回归）", () => {
  // 旧实现 toISOString() 是 UTC：东八区 00:30 = 前一天 16:30 UTC，会记成前一天
  const meta = readFrontMatter(`---\ndate: ${formatDate(new Date(2026, 7, 18, 0, 30))}\n---\n`);
  assert.strictEqual(meta.date, "2026-08-18");
  assert.strictEqual(formatDate(new Date(2026, 7, 18, 0, 30)), "2026-08-18");
});

/* ================= toDisplayName ================= */

test("toDisplayName: 下划线转空格", () => {
  assert.strictEqual(toDisplayName("win_e"), "win e");
  assert.strictEqual(toDisplayName("百灵大模型_API_代理"), "百灵大模型 API 代理");
});

/* ================= scanDirectory（临时目录端到端） ================= */

let tmpDir;

test.beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qx-blog-test-"));
});

test.afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("scanDirectory: 无 front-matter 的文章自动补写并锁定日期", () => {
  const file = path.join(tmpDir, "新文章.md");
  fs.writeFileSync(file, "正文内容", "utf-8");

  const result = scanDirectory(tmpDir);
  const after = fs.readFileSync(file, "utf-8");

  // 补写后：头部一块 front-matter + 原文，且 date 是今天的本地日期
  assert.match(after, /^---\ndate: \d{4}-\d{2}-\d{2}\n---\n\n正文内容$/);
  assert.strictEqual(after.split("---").length - 1, 2); // 只有开头那一对 ---
  assert.strictEqual(result[0].publishDate, formatDate(new Date()));
});

test("scanDirectory: 带 BOM 且无 front-matter 的文章只补写一块（BOM bug 回归）", () => {
  const file = path.join(tmpDir, "记事本保存.md");
  fs.writeFileSync(file, "\uFEFF正文", "utf-8");

  scanDirectory(tmpDir);

  const buf = fs.readFileSync(file);
  const after = buf.toString("utf-8");

  // 旧实现：BOM 导致 ^--- 匹配失败 → 误判无 front-matter 的问题在于
  // 补写后 BOM 留在文件里且只补一块也正常；真正的回归点是重复补写，
  // 这里断言：BOM 已被剥离（读入时剥离、回写用剥离后内容）且只有一对 ---
  assert.ok(!(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf), "BOM 应在补写时被剥离");
  assert.strictEqual(after.split("---").length - 1, 2);
  assert.match(after, /^---\ndate: \d{4}-\d{2}-\d{2}\n---\n\n正文$/);
});

test("scanDirectory: 带 BOM 但已有 front-matter 的文章不重复补写", () => {
  const file = path.join(tmpDir, "已有日期.md");
  fs.writeFileSync(file, "\uFEFF---\ndate: 2026-01-01\n---\n\n正文", "utf-8");

  const result = scanDirectory(tmpDir);
  const after = fs.readFileSync(file, "utf-8");

  assert.strictEqual(after, "\uFEFF---\ndate: 2026-01-01\n---\n\n正文"); // 文件原样保留（含 BOM）
  assert.strictEqual(result[0].publishDate, "2026-01-01");
  assert.strictEqual(result[0].title, "已有日期");
});

test("scanDirectory: archive 目录被跳过", () => {
  fs.mkdirSync(path.join(tmpDir, "archive"));
  fs.writeFileSync(path.join(tmpDir, "archive", "旧文.md"), "---\ndate: 2025-01-01\n---\n正文");
  fs.writeFileSync(path.join(tmpDir, "新文.md"), "---\ndate: 2026-01-01\n---\n正文");

  const result = scanDirectory(tmpDir);
  assert.strictEqual(result.length, 1);
  assert.strictEqual(result[0].title, "新文");
});

test("scanDirectory: 非 md 文件被忽略", () => {
  fs.writeFileSync(path.join(tmpDir, "图片.png"), "fake");
  fs.writeFileSync(path.join(tmpDir, "文章.md"), "---\ndate: 2026-01-01\n---\n正文");

  const result = scanDirectory(tmpDir);
  assert.strictEqual(result.length, 1);
});

test("scanDirectory: updated 优先进 sortDate，文章按其降序排列", () => {
  fs.writeFileSync(path.join(tmpDir, "a旧文.md"), "---\ndate: 2026-01-01\nupdated: 2026-03-01\n---\nx");
  fs.writeFileSync(path.join(tmpDir, "b新文.md"), "---\ndate: 2026-02-01\n---\nx");

  const result = scanDirectory(tmpDir);
  // a 的 sortDate 是 updated(03-01) > b 的 date(02-01)，a 排前
  assert.strictEqual(result[0].title, "a旧文");
  assert.strictEqual(result[0].sortDate, "2026-03-01");
  assert.strictEqual(result[1].sortDate, "2026-02-01");
});

test("scanDirectory: 数字编号章节按编号升序且排在无编号文件之前", () => {
  // 10 用字符串比较会排在 02 前（'1'<'0' 为 false，但 '10'<'2' 为 true），
  // 因此必须按数值比较；同时无编号文件即使日期最新也排在编号章节之后
  fs.writeFileSync(path.join(tmpDir, "10.第三章.md"), "---\ndate: 2026-01-01\n---\nx");
  fs.writeFileSync(path.join(tmpDir, "02.第二章.md"), "---\ndate: 2026-01-01\n---\nx");
  fs.writeFileSync(path.join(tmpDir, "01.第一章.md"), "---\ndate: 2026-01-01\n---\nx");
  fs.writeFileSync(path.join(tmpDir, "关于.md"), "---\ndate: 2026-09-01\n---\nx");

  const result = scanDirectory(tmpDir);
  assert.deepStrictEqual(result.map((r) => r.title), ["01.第一章", "02.第二章", "10.第三章", "关于"]);
});

test("collectAllFiles: 排除指定分类（知识库不进首页文章流）", () => {
  fs.mkdirSync(path.join(tmpDir, "知识库"));
  fs.writeFileSync(path.join(tmpDir, "知识库", "01.教程.md"), "---\ndate: 2026-01-01\n---\nx");
  fs.writeFileSync(path.join(tmpDir, "随笔.md"), "---\ndate: 2026-02-01\n---\nx");

  const structure = scanDirectory(tmpDir);
  const files = collectAllFiles(structure, new Set(["知识库"]));
  assert.deepStrictEqual(files.map((f) => f.title), ["随笔"]);
});

/* ================= renderList ================= */

test("renderList: 输出全紧致列表（任意层级条目间无空行）", () => {
  // 空行会让解析器把列表判为「松散」并把条目文本包进 <p>，
  // 导致部分层级文件夹出现 p 结构、部分为裸文本，行内图标 CSS 无法统一覆盖。
  // 此断言防止未来有人“美化”输出格式而破坏侧边栏图标
  const out = renderList([
    {
      type: "folder",
      name: "Linux",
      children: [{ type: "file", title: "01.简介", path: "note/Linux/01.简介.md" }],
    },
    { type: "file", title: "随笔", path: "note/随笔.md" },
  ]);
  assert.strictEqual(out, "- Linux\n  - [01.简介](note/Linux/01.简介.md)\n- [随笔](note/随笔.md)\n");
  assert.ok(!out.includes("\n\n"), "输出中不应出现空行");
});
