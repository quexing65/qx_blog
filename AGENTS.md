# AGENTS.md — qx_blog 项目约定

> 个人博客（Docsify 静态站）。本文件供各类 AI 编码工具读取。
> 项目记忆在 `.agents/memory/`（**未纳入版本控制**，见下方说明）。

## 项目概览

- 站点：Docsify SPA，内容在 `docs/`，线上由 **Vercel** 托管（自定义域名 `b.quexing.cc.cd`）
- 写作：新文章放 `docs/note/<分类>/`，头部写 front-matter（`date`，有修改再补 `updated`）
- 生成物：`docs/_sidebar.md`、`docs/home.md` 由脚本生成，**不要手改**

## 常用命令

```bash
npm run update      # 重建侧边栏与首页（改完文章必跑）
npm run check       # 文件名空格检查
npm run check:links # 外链可用性检查
npm test            # 单元测试
npm run serve       # 本地预览 http://localhost:3000
npm run setup:hooks # 安装 pre-commit 钩子（每台新机器一次）
npm run sync:vault  # 从 Obsidian vault 同步「知识库」目录
```

## 硬性约定

- **文件名不能含空格**，用下划线代替（`check-spaces.js` 强制，CI 会拦截）
- **`docs/note/知识库/` 禁止直接放文件**：该目录由 `sync:vault` 单向镜像同步，
  vault 里没有的内容会被删除。改这个目录的内容必须**同时改 vault 源**
  （`E:\obdsin\笔记\基础知识\`）和 docs 镜像
- **改完文章跑 `npm run update`**，否则 CI 的 drift 校验（`git diff --exit-code docs/`）报红
- **提交前先本地预览确认**（`npm run serve`），确认效果后再推送
- 重要改动登记根目录 `更新日志.md`（手工维护，最新在最上）

## 记忆文件（`.agents/memory/`）

- **不纳入版本控制**：本仓库公开，记忆里含本机绝对路径与个人工作习惯，已在 `.gitignore` 中忽略
- 内容：用户画像、部署事实、日期系统、钩子设计、UI 方案等；入口是 `MEMORY.md` 索引
- 新机器 / 重新 clone 后该目录为空，需从旧机拷贝，或在对话中让 AI 重新生成
- **动代码前先读相关记忆**（例如改目录功能先读 `qxblog-toc-right-sidebar.md`），
  里面记录了设计意图与踩过的坑
