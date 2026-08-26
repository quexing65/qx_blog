---
tags:
  - MOC
  - Python
  - Pandas
  - 数据分析
date: 2026-05-23
updated: 2026-08-02
---

# 关于 Pandas

> Pandas 数据分析框架学习笔记总索引

> 当前内容按 pandas 3.0.5 校订：Copy-on-Write 已成为固定语义，链式赋值不会修改原对象；默认字符串 dtype 与部分旧 API 也发生了变化。

## 导航

| # | 笔记 | 内容 |
|---|------|------|
| 01 | [01.Pandas框架概述](01.Pandas框架概述.md) | Pandas 介绍、安装、初体验 |
| 02 | [02.Pandas数据结构](02.Pandas数据结构.md) | Series、DataFrame、数据类型 |
| 03 | [03.Pandas基本操作](03.Pandas基本操作.md) | 索引、切片、排序 |
| 04 | [04.DataFrame运算](04.DataFrame运算.md) | 逻辑运算、统计函数、绘图 |
| 05 | [05.文件读取与存储](05.文件读取与存储.md) | CSV、Excel、数据库读写 |
| 06 | [06.DataFrame增删改查](06.DataFrame增删改查.md) | 增删改查操作 |
| 07 | [07.缺失值处理](07.缺失值处理.md) | 缺失值检测、填充、删除 |
| 08 | [08.数据合并](08.数据合并.md) | merge、concat、join |
| 09 | [09.数据分组](09.数据分组.md) | groupby 分组聚合 |
| 10 | [10.交叉表与透视表](10.交叉表与透视表.md) | 交叉表、透视表、RFM 案例 |

## 配套数据

以下文件均从配套课件原样复制；代码示例默认以当前 `Pandas` 目录为工作目录，从 `./dataset/` 读取：

| 文件 | 用途 |
|------|------|
| [1960—2019 全球 GDP 数据](dataset/1960-2019全球GDP数据.csv) | Pandas 初体验、DataFrame 增删改查 |
| [股票日行情数据](dataset/stock_day.csv) | 索引、切片、排序与 CSV 读写 |
| [电影数据](dataset/movie.csv) | 缺失值检测、删除与填充 |
| [优衣库销售数据](dataset/uniqlo.csv) | `groupby` 分组聚合 |
| [CSV 编码示例](dataset/csv示例文件.csv) | CSV 分隔符、索引与编码演示 |
| [新闻标题 JSON 样例](dataset/sarcasm-headlines-sample.json) | `read_json`、`to_json` 演示 |

## 知识体系

```
Pandas
├── 基础
│   ├── 数据结构（Series、DataFrame）
│   ├── 索引与切片（loc、iloc）
│   └── 排序（sort_values、sort_index）
├── 运算
│   ├── 逻辑运算
│   ├── 统计函数
│   └── 绘图（plot）
├── 文件操作
│   ├── CSV（read_csv、to_csv）
│   ├── Excel（read_excel、to_excel）
│   └── 数据库（read_sql、to_sql）
├── 数据处理
│   ├── 增删改查
│   ├── 缺失值处理
│   ├── 数据合并
│   └── 数据分组
└── 高级分析
    ├── 交叉表
    └── 透视表
```

## 相关笔记

- [NumPy 基础](../Numpy/关于Numpy.md) - 数值计算库
- [Matplotlib基础](../Matplotlib/关于Matplotlib.md) - 数据可视化
- [RFM案例](../Python数据分析/04.RFM案例.md) - 客户分群实战
