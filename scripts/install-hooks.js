// 安装 git 钩子：把 .git/hooks/pre-commit 写成调用 scripts/pre-commit.js 的 shim。
// 钩子本体在 .git/ 下、不被 git 跟踪，换电脑 / 重新 clone 后会丢失——
// 所以逻辑放在仓库内的 scripts/pre-commit.js，本脚本负责（重新）安装。
//
// 用法：npm run setup:hooks
// 幂等：可重复执行，内容已是最新时不做改动。

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const REPO_ROOT = path.join(__dirname, "..");

// shim 内容：只负责转交给仓库内的 Node 逻辑，不含业务代码。
// 用 exec 让 node 的退出码成为钩子的退出码（非 0 即取消提交）。
const SHIM = `#!/bin/sh
# 由 scripts/install-hooks.js 生成，请勿手改——改 scripts/pre-commit.js 后重跑 npm run setup:hooks
exec node "$(git rev-parse --show-toplevel)/scripts/pre-commit.js"
`;

// 解析钩子目录：用 git 自己的口径，兼容 worktree / 自定义 core.hooksPath
function hooksDir() {
  const rel = execFileSync("git", ["rev-parse", "--git-path", "hooks"], {
    encoding: "utf-8",
    cwd: REPO_ROOT,
  }).trim();
  return path.isAbsolute(rel) ? rel : path.join(REPO_ROOT, rel);
}

function install() {
  const dir = hooksDir();
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "pre-commit");

  const existing = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : null;
  if (existing === SHIM) {
    console.log("钩子已是最新，无需改动: " + target);
    return;
  }

  // 已有的钩子不是本脚本生成的，先备份，避免静默覆盖别人的东西
  if (existing !== null && !existing.includes("install-hooks.js")) {
    const backup = target + ".bak";
    fs.writeFileSync(backup, existing, "utf-8");
    console.log("已备份原有钩子: " + backup);
  }

  fs.writeFileSync(target, SHIM, { encoding: "utf-8", mode: 0o755 });
  console.log("已安装钩子: " + target);
}

module.exports = { SHIM, hooksDir, install };

if (require.main === module) install();
