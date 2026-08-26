---
tags:
  - MOC
  - Web开发
  - Python
date: 2026-05-28
updated: 2026-08-03
---

# Python Web 开发笔记总索引

> 建议先完成 [Python 基础](../基础/关于Python基础.md)，并至少了解 [asyncio](../进阶/06.并发编程.md)，再进入 Web 框架。

## FastAPI 学习路线

| 顺序 | 笔记 | 目标 |
|---|---|---|
| 01 | [FastAPI 学习路线](01.FastAPI学习路线.md) | 整体地图与学习顺序 |
| 02 | [02.FastAPI路由与请求](02.FastAPI路由与请求.md) | HTTP、路由、参数、响应与异常 |
| 03 | [03.FastAPI依赖注入与数据库](03.FastAPI依赖注入与数据库.md) | 中间件、依赖注入、SQLAlchemy ORM |
| 04 | [04.FastAPI项目实战-AI掘金头条](04.FastAPI项目实战-AI掘金头条.md) | 认证、Redis、RESTful API 与项目分层 |

---

## FastAPI 知识地图

### 入门基础
- 路由与请求方法（GET, POST, PUT, DELETE）
- 路径参数（Path Parameters）
- 查询参数（Query Parameters）
- 请求体参数（Request Body）
- 响应类型（JSON, HTML, File）

### 进阶特性
- 中间件（Middleware）
- 依赖注入（Dependency Injection）
- 异常处理（HTTPException）

### 数据库操作
- SQLAlchemy ORM 基础
- 异步数据库操作（async/await）
- CRUD 操作完整实现
- 聚合查询与分页

### 项目实战
- RESTful API 设计
- 用户认证系统（Token）
- Redis 缓存策略
- 完整项目架构（AI掘金头条）

---

## 相关笔记

- [Python 总索引](../关于Python.md)
- [MySQL MOC](../../MySQL/关于MySQL.md)
- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 官方文档](https://docs.sqlalchemy.org/)

---

## 学习建议

1. 先掌握路由、参数和响应，再学习依赖注入与 ORM。
2. 每完成一节就运行最小示例，避免只阅读不验证。
3. 最后用 AI 掘金头条项目串联认证、缓存与数据库。
4. 遇到版本差异时以官方文档为准。

---

## 后续扩展

- [ ] Flask 框架学习笔记
- [ ] Django 框架学习笔记
- [ ] FastAPI 高级特性（WebSocket, 后台任务）
- [ ] 部署与运维（Docker, Nginx）
