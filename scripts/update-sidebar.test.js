// update-sidebar.js 的单元测试（Node 内置 test runner，零依赖）。
// 运行：npm test（即 node --test scripts/）
// 覆盖重点：readFrontMatter 的边界用例 + BOM/时区两个历史 bug 的回归测试
// （BOM 重复补写、UTC 时区偏移，见 更新日志.md 2026-08-18）

const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { formatDate, toDisplayName, readFrontMatter, setUpdatedField, parseStagedPaths, listStagedModifiedArticles, stageFiles, trackedArticlePaths, updatedDateFor, touchUpdated, scanDirectory, collectAllFiles, renderList, generateSite, SIDEBAR_REL, HOME_REL } = require("./update-sidebar.js");

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

/* ================= setUpdatedField（提交时刷新 updated） ================= */

test("setUpdatedField: 已有 updated 时替换其值", () => {
  const out = setUpdatedField("---\ndate: 2026-07-01\nupdated: 2026-08-02\n---\n正文", "2026-09-09");
  assert.strictEqual(out, "---\ndate: 2026-07-01\nupdated: 2026-09-09\n---\n正文");
});

test("setUpdatedField: 没有 updated 时插到 date 之后", () => {
  const out = setUpdatedField("---\ndate: 2026-09-08\n---\n\n正文", "2026-09-09");
  assert.strictEqual(out, "---\ndate: 2026-09-08\nupdated: 2026-09-09\n---\n\n正文");
});

test("setUpdatedField: CRLF 行尾保持 CRLF", () => {
  const out = setUpdatedField("---\r\ndate: 2026-09-08\r\n---\r\n\r\n正文", "2026-09-09");
  assert.strictEqual(out, "---\r\ndate: 2026-09-08\r\nupdated: 2026-09-09\r\n---\r\n\r\n正文");
});

test("setUpdatedField: 已是指定日期时返回 null（不重写文件）", () => {
  assert.strictEqual(setUpdatedField("---\ndate: 2026-09-08\nupdated: 2026-09-09\n---\nx", "2026-09-09"), null);
});

test("setUpdatedField: 无 front-matter 返回 null", () => {
  assert.strictEqual(setUpdatedField("# 标题\n正文", "2026-09-09"), null);
});

test("setUpdatedField: 带 BOM 的文件刷新时剥离 BOM", () => {
  const out = setUpdatedField("\uFEFF---\ndate: 2026-09-08\n---\n正文", "2026-09-09");
  assert.strictEqual(out, "---\ndate: 2026-09-08\nupdated: 2026-09-09\n---\n正文");
});

test("setUpdatedField: 刷完后 readFrontMatter 能读出新日期", () => {
  const out = setUpdatedField("---\ndate: 2026-09-08\n---\n正文", "2026-09-09");
  assert.deepStrictEqual(readFrontMatter(out), { date: "2026-09-08", updated: "2026-09-09" });
});

/* ================= parseStagedPaths + git 集成（quotepath 回归） ================= */

test("parseStagedPaths: NUL 分隔的中文路径原样解析", () => {
  const out = "docs/note/编程笔记/LeetCode/LeetCodeHot100.md\0docs/note/墙外的世界/宝可梦每月优惠口令.md\0";
  const paths = parseStagedPaths(out);
  assert.deepStrictEqual(paths, [
    "docs/note/编程笔记/LeetCode/LeetCodeHot100.md",
    "docs/note/墙外的世界/宝可梦每月优惠口令.md",
  ]);
  // 历史 bug 断言：解析结果必须能通过 .md 后缀过滤（旧版拿到的是带引号
  // 和八进制转义的路径，以 " 结尾，导致刷新流程被整体静默跳过）
  for (const p of paths) assert.ok(p.endsWith(".md"));
});

test("parseStagedPaths: 空输出与纯 NUL 输出返回空数组", () => {
  assert.deepStrictEqual(parseStagedPaths(""), []);
  assert.deepStrictEqual(parseStagedPaths("\0"), []);
});

test("集成: listStagedModifiedArticles 对中文路径返回原样路径（历史 bug 回归）", () => {
  const { execFileSync } = require("child_process");
  const git = (args) => execFileSync("git", args, { encoding: "utf-8", cwd: tmpDir });
  const file = path.join(tmpDir, "docs", "note", "墙外的世界", "宝可梦每月优惠口令.md");

  // 建一个临时仓库：中文路径文章先提交一版，再修改并暂存。
  // 关键：下面调用的是生产代码 listStagedModifiedArticles 本身（cwd 注入临时仓库），
  // 而不是在测试里复制一份 git 命令——否则 -z 丢失时测试依旧绿灯（假安全网）
  git(["init", "-q"]);
  git(["config", "user.email", "test@test.test"]);
  git(["config", "user.name", "test"]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, "---\ndate: 2026-01-01\n---\nx", "utf-8");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);
  fs.writeFileSync(file, "---\ndate: 2026-01-01\n---\nchanged", "utf-8");
  git(["add", "."]);

  const paths = listStagedModifiedArticles(tmpDir);
  assert.deepStrictEqual(paths, ["docs/note/墙外的世界/宝可梦每月优惠口令.md"]);
  // 历史 bug 断言：路径若被 quotepath 转义，会带首尾引号、以 " 结尾
  assert.ok(paths[0].endsWith(".md"), "路径应未被引号/转义包裹");
  assert.ok(!paths[0].startsWith('"'), "路径不应以引号开头");
});

/* ================= 日期语义：mtime 即内容实际改动日 ================= */

// 建一个临时 git 仓库（含 docs/note/），返回 git 调用器
function initRepo(dir) {
  const { execFileSync } = require("child_process");
  const git = (args) => execFileSync("git", args, { encoding: "utf-8", cwd: dir });
  git(["init", "-q"]);
  git(["config", "user.email", "test@test.test"]);
  git(["config", "user.name", "test"]);
  fs.mkdirSync(path.join(dir, "docs", "note"), { recursive: true });
  return git;
}

// 把文件 mtime 设为指定日期（本地时区正午，避开边界）
function setMtime(file, y, m, d) {
  const t = new Date(y, m - 1, d, 12, 0, 0);
  fs.utimesSync(file, t, t);
}

test("updatedDateFor: 取文件 mtime 的日期（内容实际改动日，非提交当天）", () => {
  const file = path.join(tmpDir, "文章.md");
  fs.writeFileSync(file, "---\ndate: 2026-01-01\n---\nx", "utf-8");
  setMtime(file, 2026, 9, 8);
  assert.strictEqual(updatedDateFor(file, null), "2026-09-08");
});

test("updatedDateFor: mtime 早于已有 updated 时返回 null（不回退日期）", () => {
  // 场景：检出旧版本 / 回滚后 mtime 变早，不应把已记录的更新日改小
  const file = path.join(tmpDir, "文章.md");
  fs.writeFileSync(file, "---\ndate: 2026-01-01\nupdated: 2026-09-09\n---\nx", "utf-8");
  setMtime(file, 2026, 9, 1);
  assert.strictEqual(updatedDateFor(file, "2026-09-09"), null);
});

test("updatedDateFor: mtime 等于已有 updated 时仍返回该日期（由 setUpdatedField 判空）", () => {
  const file = path.join(tmpDir, "文章.md");
  fs.writeFileSync(file, "---\ndate: 2026-01-01\n---\nx", "utf-8");
  setMtime(file, 2026, 9, 9);
  assert.strictEqual(updatedDateFor(file, "2026-09-09"), "2026-09-09");
});

test("集成: touchUpdated 把 updated 刷成 mtime 日期而非今天", () => {
  const git = initRepo(tmpDir);
  const file = path.join(tmpDir, "docs", "note", "宝可梦每月优惠口令.md");
  fs.writeFileSync(file, "---\ndate: 2026-07-01\nupdated: 2026-08-02\n---\n八月", "utf-8");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);

  fs.writeFileSync(file, "---\ndate: 2026-07-01\nupdated: 2026-08-02\n---\n九月", "utf-8");
  setMtime(file, 2026, 9, 8);
  git(["add", "."]);

  const written = touchUpdated(tmpDir);
  assert.deepStrictEqual(written, ["docs/note/宝可梦每月优惠口令.md"]);
  // 关键：09-08 是内容改动日，不是运行当天（今天是 2026-09-09+）
  assert.match(fs.readFileSync(file, "utf-8"), /^updated: 2026-09-08$/m);
});

test("集成: touchUpdated 对已是最新日期的文件不重写（返回空）", () => {
  const git = initRepo(tmpDir);
  const file = path.join(tmpDir, "docs", "note", "文章.md");
  fs.writeFileSync(file, "---\ndate: 2026-01-01\nupdated: 2026-09-08\n---\nv1", "utf-8");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);

  fs.writeFileSync(file, "---\ndate: 2026-01-01\nupdated: 2026-09-08\n---\nv2", "utf-8");
  setMtime(file, 2026, 9, 8);
  git(["add", "."]);

  assert.deepStrictEqual(touchUpdated(tmpDir), []);
});

test("集成: stageFiles 只暂存列出的文件，不吞无关改动与草稿（历史 bug 回归）", () => {
  // 历史 bug：钩子末尾 `git add "docs/note/"` 会把工作区里未暂存的改动
  // 和未完成草稿一并暂存进本次提交。此测试锁定精确暂存的行为。
  const git = initRepo(tmpDir);
  const a = path.join(tmpDir, "docs", "note", "只提交这篇.md");
  const b = path.join(tmpDir, "docs", "note", "无关改动.md");
  const draft = path.join(tmpDir, "docs", "note", "未完成草稿.md");
  fs.writeFileSync(a, "---\ndate: 2026-01-01\n---\na1", "utf-8");
  fs.writeFileSync(b, "---\ndate: 2026-01-01\n---\nb1", "utf-8");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);

  // 只暂存 A；B 仅改工作区，草稿是未跟踪文件
  fs.writeFileSync(a, "---\ndate: 2026-01-01\n---\na2", "utf-8");
  git(["add", "--", "docs/note/只提交这篇.md"]);
  fs.writeFileSync(b, "---\ndate: 2026-01-01\n---\nb2", "utf-8");
  fs.writeFileSync(draft, "草稿内容", "utf-8");

  stageFiles(["docs/note/只提交这篇.md"], tmpDir);

  // 用 -z + 生产解析函数读暂存列表（测试自己的 git 输出同样会被 quotepath 转义）
  const staged = parseStagedPaths(git(["diff", "--cached", "--name-only", "-z"]));
  assert.deepStrictEqual(staged, ["docs/note/只提交这篇.md"]);
  // B 与草稿必须仍在暂存区外
  const unstaged = parseStagedPaths(git(["diff", "--name-only", "-z"]));
  assert.deepStrictEqual(unstaged, ["docs/note/无关改动.md"]);
  assert.ok(git(["status", "--porcelain", "-z"]).includes("未完成草稿.md"), "草稿应仍是未跟踪状态");
});

test("scanDirectory: written 数组收集被补写 front-matter 的文件", () => {
  const written = [];
  fs.writeFileSync(path.join(tmpDir, "新文章.md"), "正文", "utf-8");
  fs.writeFileSync(path.join(tmpDir, "已有.md"), "---\ndate: 2026-01-01\n---\nx", "utf-8");

  scanDirectory(tmpDir, "", written);

  assert.strictEqual(written.length, 1);
  assert.ok(written[0].endsWith("新文章.md"));
});

test("scanDirectory: include 返回 false 的文件被跳过且不补写（草稿不进生成文件）", () => {
  const written = [];
  const keep = path.join(tmpDir, "已跟踪.md");
  const draft = path.join(tmpDir, "草稿.md");
  fs.writeFileSync(keep, "---\ndate: 2026-01-01\n---\nx", "utf-8");
  fs.writeFileSync(draft, "未写完的草稿", "utf-8");

  const result = scanDirectory(tmpDir, "", written, (p) => p === keep);

  assert.deepStrictEqual(result.map((r) => r.title), ["已跟踪"]);
  assert.deepStrictEqual(written, [], "被跳过的草稿不应被补写");
  assert.strictEqual(fs.readFileSync(draft, "utf-8"), "未写完的草稿", "草稿内容应保持原样");
});

test("集成: trackedArticlePaths 只含已跟踪文章，未跟踪草稿不在其中", () => {
  const git = initRepo(tmpDir);
  const tracked = path.join(tmpDir, "docs", "note", "已跟踪.md");
  const draft = path.join(tmpDir, "docs", "note", "草稿.md");
  fs.writeFileSync(tracked, "---\ndate: 2026-01-01\n---\nx", "utf-8");
  git(["add", "."]);
  git(["commit", "-qm", "init"]);
  fs.writeFileSync(draft, "草稿", "utf-8"); // 未跟踪

  const set = trackedArticlePaths(tmpDir);
  assert.ok(set.has(path.resolve(tracked)), "已跟踪文章应在集合中");
  assert.ok(!set.has(path.resolve(draft)), "未跟踪草稿不应在集合中");
});

test("导出常量: 生成文件的仓库相对路径供钩子精确暂存", () => {
  assert.strictEqual(SIDEBAR_REL, "docs/_sidebar.md");
  assert.strictEqual(HOME_REL, "docs/home.md");
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
