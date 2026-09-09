// pre-commit 的实际逻辑（Node 实现，便于单测）。
// .git/hooks/pre-commit 只是调用本文件的一行 shim——钩子本体不被 git 跟踪，
// 换电脑 / 重新 clone 会丢失，所以逻辑放在仓库内，并用 scripts/install-hooks.js 安装。
//
// 职责（与 CI 的分工见 更新日志.md）：
//   1. 文件名空格检查（CI 也跑，本地跑只是提前几秒发现）
//   2. 刷新已暂存文章的 updated（CI 不跑，这是钩子不可替代的职责）
//   3. 重新生成 _sidebar.md / home.md（CI 会重跑并做 drift 校验）
//
// 关键约束：只暂存「脚本自己写过的文件」，绝不 `git add docs/note/` 整目录——
// 后者会把工作区里未暂存的草稿、无关改动一并吞进本次提交（2026-09-09 实测确认）。

const path = require("path");
const { spawnSync } = require("child_process");
const {
  REPO_ROOT,
  touchUpdated,
  generateSite,
  stageFiles,
  trackedArticlePaths,
  SIDEBAR_REL,
  HOME_REL,
} = require("./update-sidebar.js");

// 用 node 跑一个脚本，返回是否成功。inherit 让输出直接打到终端
function runNode(script) {
  const res = spawnSync(process.execPath, [path.join(__dirname, script)], {
    stdio: "inherit",
    cwd: REPO_ROOT,
  });
  return res.status === 0;
}

function main() {
  console.log("🔍 正在检查文件名中的空格 ...");
  if (!runNode("check-spaces.js")) {
    console.error("❌ 提交已取消：请先把上面列出的文件名里的空格改成下划线(_)");
    return 1;
  }

  console.log("🔄 正在刷新有改动文章的 updated 日期 ...");
  const touched = touchUpdated(REPO_ROOT);
  for (const name of touched) console.log("   已刷新: " + name);

  console.log("🔄 正在重新生成侧边栏与首页 ...");
  // 只把已跟踪的文章写进生成文件：工作区未跟踪的草稿不参与，
  // 否则生成文件会引用一篇没被提交的草稿，CI 重新生成时 drift 报红
  const tracked = trackedArticlePaths(REPO_ROOT);
  const include = tracked === null ? undefined : (p) => tracked.has(path.resolve(p));
  const backfilled = generateSite(include);

  // 精确暂存：脚本写过的文章 + 两个生成文件。
  // 不含工作区里其它未暂存改动，所以草稿/无关修改不会被带进提交。
  stageFiles([...touched, ...backfilled, SIDEBAR_REL, HOME_REL], REPO_ROOT);
  return 0;
}

module.exports = { main };

if (require.main === module) {
  process.exit(main());
}
