---
tags:
  - MySQL
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-08-11
---

# MySQL 知识树总结

> 来源：[关于MySQL](关于MySQL.md) 全部 3 篇课程笔记的命令、原理与学习路线

## 学习路线树

```text
MySQL 学习路线
├── 01. MySQL基础
│   ├── 概念与环境：数据库、DBMS、安装、服务、客户端
│   ├── SQL：DDL、DML、DQL、DCL、函数
│   ├── 完整性：约束、外键、多表关系与查询
│   └── 事务：ACID、并发问题、隔离级别
├── 02. MySQL进阶
│   ├── 存储引擎与 InnoDB
│   ├── 索引结构、执行计划与 SQL 优化
│   ├── 视图、存储过程、函数、触发器
│   └── 锁、redo/undo log、MVCC、ReadView
└── 03. MySQL运维
    ├── 错误、二进制、查询、慢查询日志
    ├── 主从复制
    ├── 分库分表与 MyCat
    └── 读写分离
```

## SQL 命令树

```
SQL 命令分类树
│
├── 🏗️ DDL（数据定义语言）
│   ├── 数据库
│   │   ├── CREATE DATABASE [IF NOT EXISTS] name CHARACTER SET utf8mb4
│   │   ├── SHOW DATABASES
│   │   ├── ALTER DATABASE name CHARACTER SET utf8mb4
│   │   ├── DROP DATABASE [IF EXISTS] name
│   │   ├── USE name                      切换数据库
│   │   └── SELECT DATABASE()             当前数据库
│   │
│   └── 表
│       ├── CREATE TABLE [IF NOT EXISTS] name(
│       │     col type [PRIMARY KEY AUTO_INCREMENT]
│       │                    [NOT NULL]
│       │                    [UNIQUE]
│       │                    [DEFAULT value]
│       │                    [FOREIGN KEY(col) REFERENCES table(col)]
│       │   )
│       ├── SHOW TABLES                   列出表
│       ├── DESC name                     查看表结构
│       ├── ALTER TABLE name RENAME new   重命名表
│       │   RENAME TABLE old TO new       重命名表(另一种语法)
│       ├── ALTER TABLE name ADD col type NOT NULL     添加列
│       ├── ALTER TABLE name MODIFY col type           修改列类型
│       ├── ALTER TABLE name CHANGE old new type       重命名列+改类型
│       ├── ALTER TABLE name DROP col                  删除列
│       ├── ALTER TABLE name ADD CONSTRAINT fk FOREIGN KEY(col) REFERENCES t(col)  添加外键
│       ├── ALTER TABLE name DROP FOREIGN KEY fk_name  删除外键
│       └── DROP TABLE [IF EXISTS] name   删除表
│
├── ✏️ DML（数据操作语言）
│   ├── INSERT
│   │   ├── INSERT INTO table(col1,col2) VALUES(v1,v2)    指定列插入
│   │   ├── INSERT INTO table VALUES(v1,v2)               全列插入
│   │   └── INSERT INTO table VALUES(...),(...)           多行插入
│   ├── UPDATE
│   │   └── UPDATE table SET col=val [WHERE 条件]         ★ 必须加WHERE
│   └── DELETE
│       ├── DELETE FROM table [WHERE 条件]                逐行删除，不重置自增
│       └── TRUNCATE TABLE table                         DDL，清空表并通常重置自增；会隐式提交
│
└── 🔍 DQL（数据查询语言）★ 核心
    ├── 完整查询模板
    │   SELECT [DISTINCT] col AS alias
    │   FROM table
    │   WHERE pre-group-condition
    │   GROUP BY col
    │   HAVING post-group-condition
    │   ORDER BY col [ASC|DESC]
    │   LIMIT offset, count
    │
    ├── 条件查询
    │   ├── 比较: = / != / <> / > / >= / < / <=
    │   ├── 范围: BETWEEN v1 AND v2 / IN(v1,v2)
    │   ├── 逻辑: AND / OR / NOT
    │   ├── 模糊: LIKE '_'(单字符) / '%'(多字符)
    │   └── 空值: IS NULL / IS NOT NULL  ★ 不能用 = NULL
    │
    ├── 排序: ORDER BY col [ASC|DESC]  （ASC默认可省略）
    │
    ├── 聚合函数
    │   ├── COUNT(*) / COUNT(1)    含NULL行
    │   ├── COUNT(col)             跳过NULL
    │   ├── SUM(col)               求和
    │   ├── AVG(col)               平均值
    │   ├── MAX(col) / MIN(col)    最大/最小
    │   └── ROUND(value, decimals) 四舍五入
    │
    ├── 分组: GROUP BY col → HAVING 聚合条件
    │   └── 去重优先用 DISTINCT；GROUP BY 表达分组语义
    │
    ├── 分页: LIMIT [offset,] count
    │   └── offset = (页码-1) * 每页行数
    │
    ├── 多表查询
    │   ├── 交叉连接: SELECT * FROM A, B               笛卡尔积
    │   ├── 内连接:   A [INNER] JOIN B ON 条件          交集
    │   ├── 左连接:   A LEFT [OUTER] JOIN B ON 条件     左全 + 交集
    │   ├── 右连接:   A RIGHT [OUTER] JOIN B ON 条件    右全 + 交集
    │   └── 自连接:   A AS a JOIN A AS b ON a.pid=b.id  层级数据
    │
    └── 子查询: WHERE col > (SELECT AVG(col) FROM table)
```

## 执行顺序速查

```
DQL 执行顺序（逻辑顺序，非书写顺序）
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

书写顺序:
SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
```

## 约束速查

```
约束类型树
├── PRIMARY KEY    主键（NOT NULL + UNIQUE，表中只能有一个；AUTO_INCREMENT 可选）
├── NOT NULL       非空（不允许NULL，允许重复值）
├── UNIQUE         唯一（不允许重复值，允许多个NULL）
├── DEFAULT        默认值（未提供时自动填充）
└── FOREIGN KEY    外键（引用父表已索引的候选键，保证引用完整性）
    ├── 添加: ALTER TABLE child ADD CONSTRAINT fk FOREIGN KEY(col) REFERENCES parent(id)
    └── 删除: ALTER TABLE child DROP FOREIGN KEY fk_name
```

## 多表关系速查

```
多表关系
├── 一对多: "多"方通常添加外键，指向"一"方候选键
├── 多对多: 创建关联表（两个FK；可用复合PK，未必需要独立自增ID）
└── 一对一: 可合表，也可用外键 + UNIQUE 拆表（按生命周期、权限和访问模式决定）
```

## COUNT 对比速查

```
COUNT 对比（面试高频）
├── COUNT(col)   只统计该表达式非NULL的行
├── COUNT(*)     统计结果集中的行数（通常最能表达“数行”）
└── COUNT(1)     常量1非NULL，因此同样统计行；不要背固定性能排序，用执行计划和实测判断
```

## 索引、事务与运维速查

```text
排查顺序
├── 查询慢：确认 SQL 与返回量 → EXPLAIN/ANALYZE → 索引与数据分布 → 锁等待 → 主机资源
├── 事务异常：确认隔离级别 → 快照读/当前读 → 行锁/间隙锁 → undo/redo 与提交边界
├── 复制延迟：确认主从线程与位点 → 网络/磁盘 → 大事务与并行复制能力 → 只读路由一致性
└── 分片问题：确认路由键 → 分片规则 → 跨分片 JOIN/事务 → 扩容与数据迁移方案
```

> 进阶与运维结论依赖 MySQL 版本、数据分布和部署拓扑。课件示例用于理解原理，生产变更前应在等价环境验证并准备回滚方案。
