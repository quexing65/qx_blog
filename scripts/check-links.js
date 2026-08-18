// 检查 docs/index.html 引用的资源是否可用：
//   1. 外链（CDN 脚本/样式/字体/图片）：逐个发 HTTP 请求，非 2xx/3xx 报错
//   2. 内部引用（src/href 指向的本地文件）：校验文件存在
// 背景：2026-08-17 曾发生三处 CDN 链接损坏但无人察觉的事故（见 更新日志.md），
// 此脚本让坏链接进不了仓库（本地 pre-commit 之外，CI 里也会跑）。
// 用法：npm run check:links（需 Node 18+，使用内置 fetch）

const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "..", "docs");
const INDEX_FILE = path.join(DOCS_DIR, "index.html");
const TIMEOUT_MS = 15000;

// 去掉 HTML 注释：注释里的外链（已弃用的 CDN 等）不参与检查
const html = fs.readFileSync(INDEX_FILE, "utf-8").replace(/<!--[\s\S]*?-->/g, "");

// ---- 外链提取：匹配全文所有 http(s) URL（含 script/link 标签、内联 JS 字符串、meta 属性），去重 ----
const externalUrls = [
  ...new Set(
    (html.match(/https?:\/\/[^\s"'<>]+/g) || []).map((u) =>
      // 去掉 URL 后误捕获的标点（如 import("...") 的右括号）
      u.replace(/[)\],;.,]+$/, "")
    )
  ),
];

// ---- 内部引用提取：src/href 里非外链、非锚点的相对路径 ----
const internalRefs = [
  ...new Set(
    [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((ref) => !/^(https?:|\/\/|#|mailto:|data:)/.test(ref))
  ),
];

function request(url, method) {
  return fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  }).then((res) => res.status);
}

// HEAD 优先（省流量）；405/501 说明服务器不支持 HEAD，回退 GET。
// 失败后隔 1 秒用 GET 重试一次：个别 CDN 对 CI 出口 IP 的高频 HEAD 会限流（429），避免假红。
async function checkUrl(url) {
  try {
    let status = await request(url, "HEAD");
    if (status === 405 || status === 501) status = await request(url, "GET");
    if (status >= 200 && status < 400) return { ok: true, status };
    await new Promise((r) => setTimeout(r, 1000));
    const retry = await request(url, "GET");
    return { ok: retry >= 200 && retry < 400, status: retry };
  } catch (e) {
    await new Promise((r) => setTimeout(r, 1000));
    try {
      const status = await request(url, "GET");
      return { ok: status >= 200 && status < 400, status };
    } catch (e2) {
      return { ok: false, status: e2.cause?.code || e2.message };
    }
  }
}

(async () => {
  let failed = 0;

  console.log(`外链检查（${externalUrls.length} 个）...\n`);
  for (const url of externalUrls) {
    const r = await checkUrl(url);
    console.log(`${r.ok ? "PASS" : "FAIL"} [${r.status}] ${url}`);
    if (!r.ok) failed++;
  }

  console.log(`\n内部引用检查（${internalRefs.length} 个）...\n`);
  for (const ref of internalRefs) {
    const file = ref.split(/[?#]/)[0];
    const ok = fs.existsSync(path.join(DOCS_DIR, file));
    console.log(`${ok ? "PASS" : "FAIL"} ${ref}`);
    if (!ok) failed++;
  }

  if (failed > 0) {
    console.error(`\n共 ${failed} 个链接/引用不可用`);
    process.exit(1);
  }
  console.log("\n所有链接可用！");
})();
