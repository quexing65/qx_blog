# qx_blog

你好！

> 基于 [Docsify](https://docsify.js.org) 的极简静态博客
> 线上地址：https://b.quexing.cc.cd（Vercel 托管，只发布 `docs/`）
> 项目约定与 AI 协作说明见 [AGENTS.md](AGENTS.md)

## 开始写作

在 `docs/note/<分类>/` 下创建 `.md` 文件，头部写 front-matter
（`date: YYYY-MM-DD`，有修改再补 `updated`），然后运行：

```bash
npm run update   # 重建侧边栏（docs/_sidebar.md）与首页（docs/home.md），改完文章必跑
```

注意：**文件名不要用空格**，用下划线代替（CI 会拦截）。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run update` | 重建侧边栏与首页（改完文章必跑） |
| `npm run check` | 文件名空格检查 |
| `npm run check:links` | 外链可用性检查 |
| `npm test` | 单元测试（update-sidebar 等） |
| `npm run serve` | 本地预览 http://localhost:3000 |
| `npm run sync:vault` | 从 Obsidian vault 同步「知识库」目录 |
| `npm run setup:hooks` | 安装 pre-commit 钩子（每台新机器一次） |

## 安装 git 钩子（每台新机器一次）

`.git/hooks/` 不被 git 跟踪，重新 clone 后钩子会丢失，需要装一次：

```bash
npm run setup:hooks
```

装好后，每次 `git commit` 会自动：检查文件名空格、把改动文章的 `updated`
刷成该文件最后改动日、重新生成侧边栏与首页，并且只暂存脚本自己写过的文件
（不会把工作区里的草稿或无关改动带进提交）。钩子逻辑在 `scripts/pre-commit.js`，
改完重跑上面的命令即可生效。

## 更多约定

写作规范、知识库同步边界（`docs/note/知识库/` 是 vault 镜像，禁直接放文件）、
CI 行为等见 [AGENTS.md](AGENTS.md)。
