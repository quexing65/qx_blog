# Trae 项目规则

## 注意事项：

- 更适合在 Solo 模式中使用，这里提到的工具可能发生变化
- 根据个人需要修改

```
本地编码与运行命令注意事项：

1. 当前运行环境为 Windows 11 + PowerShell 5.1：
   - 无条件顺序执行用换行或 `;`，条件执行必须显式检查 `$LASTEXITCODE`
     - 外部命令：`<cmd>; if ($LASTEXITCODE -ne 0) { throw "Exit: $LASTEXITCODE" }`
     - 内部命令（cmdlet）：`<cmd>; if (-not $?) { throw "Cmdlet failed" }`
   - 批量操作或复杂诊断时，编写命令与脚本来标记、拆解与解决问题
2. 代码体积限制（配置/数据类除外）：单文件 ≤300 行，单函数 ≤100 行，超出则要拆分/简单压缩。
   - 校验：`(Get-Content "path").Count`
3. 源码在 `src` 目录下，测试在 `src/test` 目录下，一个文件只做一件事。
4. 先搜索再动手：需求不明确或首次操作时，必须先用工具了解现状再执行，禁止盲改：
   - 代码搜索：SearchCodebase、Grep、Glob、LS
   - 文件阅读：Read
   - 互联网搜索：WebSearch、WebFetch
   - 文档查询（MCP）：mcp_context7_resolve-library-id → mcp_context7_query-docs
   - 发起多轮基础且差异化的查询，理解之前结果，优化后续查询
5. 使用现成权威方案，禁止重复造轮子。发现问题/清理代码可以提出重构计划，待确认后再执行。
6. 修改代码优先使用 SearchReplace 替换修改，且不可破坏注释。
7. 单次修改涉及 >3 文件或总修改 >100 行代码时，必须创建 TodoWrite 拆分为子任务，使用 Task 子代理并行处理。
8. 多个独立的工具/命令/子任务可并行发起，提高效率
9. 项目使用 uv 管理 Python 与依赖：
   - 执行 Python 前激活虚拟环境：`.\.venv\Scripts\activate`
   - 禁止手动修改 pyproject.toml，管理依赖使用 `uv add/remove`
```
