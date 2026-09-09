> 基于 [Docsify](https://docsify.js.org) 的极简静态博客

## 开始写作

要添加新文章，只需在 docs/note 目录下创建 `.md` 文件，然后运行：

```bash
# 更新侧边栏和首页
node scripts/update-sidebar.js
```

## 启动预览

要预览博客，运行：

```bash
docsify serve docs
```

## 安装 git 钩子（每台新机器一次）

`.git/hooks/` 不被 git 跟踪，重新 clone 后钩子会丢失，需要装一次：

```bash
npm run setup:hooks
```

装好后，每次 `git commit` 会自动：检查文件名空格、把改动文章的 `updated`
刷成该文件最后改动日、重新生成侧边栏与首页，并且只暂存脚本自己写过的文件
（不会把工作区里的草稿或无关改动带进提交）。钩子逻辑在 `scripts/pre-commit.js`，
改完重跑上面的命令即可生效。
