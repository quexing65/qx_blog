---
tags:
  - Pandas
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-07-31
---

# Pandas 知识树总结

> 来源：[关于Pandas](关于Pandas.md) 全部 10 篇笔记的函数/方法提取与学习路线

## 学习路线树

```
Pandas 学习路线
├── 01. Pandas框架概述              ← 安装 + 读取CSV + 列名修改
├── 02. Pandas数据结构              ← ★ Series(1D) + DataFrame(2D)
├── 03. Pandas基本操作              ← ★ loc/iloc索引 + 布尔索引 + 排序
├── 04. DataFrame运算               ← 算术 + 统计 + apply + 累积函数
├── 05. 文件读取与存储              ← CSV/Excel/MySQL/JSON 读写
├── 06. DataFrame增删改查           ← assign/drop/replace/map/rank
├── 07. 缺失值处理                  ← isnull/dropna/fillna
├── 08. 数据合并                    ← concat(拼接) + merge(关联)
├── 09. 数据分组                    ← ★ groupby → agg/transform/filter
└── 10. 交叉表与透视表              ← crosstab + pivot_table
```

## 函数速查树

```
Pandas 函数分类树
│
├── 📥 数据读取
│   ├── pd.read_csv(path, encoding, sep, ...)       读CSV
│   ├── pd.read_excel(io, sheet_name, ...)           读Excel
│   ├── pd.read_json(path, orient, lines)            读JSON
│   ├── pd.read_sql(sql, con)                        读MySQL
│   └── create_engine(url) → SQLAlchemy引擎
│
├── 📤 数据存储
│   ├── df.to_csv(path, index, encoding)             写CSV
│   ├── df.to_excel(writer, sheet_name, index)       写Excel
│   ├── df.to_json(path, orient, lines)              写JSON
│   ├── df.to_sql(name, con, if_exists)              写MySQL
│   └── pd.ExcelWriter(path)                         多Sheet写入
│
├── 🔍 数据查看
│   ├── df.head(n) / df.tail(n)                      前/后n行
│   ├── df.shape                                     (行数, 列数)
│   ├── df.dtypes                                    列数据类型
│   ├── df.info()                                    概览信息
│   ├── df.describe()                                统计摘要
│   └── df.T                                         转置
│
├── 🎯 索引与选择 ★
│   ├── df['col'] / df.col                           列选择
│   ├── df.loc[row_label, col_label]                 标签索引（闭区间）
│   ├── df.iloc[row_int, col_int]                    位置索引（开区间）
│   ├── df.at[row, col] / df.iat[row, col]           单值快速访问
│   ├── df.query("expr")                             字符串表达式过滤
│   └── df.isin(values)                              成员判断
│
├── 🔃 排序与排名
│   ├── df.sort_values(by, ascending, na_position)   按值排序
│   ├── df.sort_index(ascending)                     按索引排序
│   └── df.rank(method, ascending, pct)              排名
│       └── method: average/min/max/dense
│
├── ✏️ 增删改
│   ├── df['col'] = values / df.assign(col=values)   增列
│   ├── df.drop(labels, axis)                        删行列
│   ├── del df['col']                                永久删列
│   ├── df.rename(columns={})                        重命名
│   ├── df.replace(old, new)                         替换值
│   ├── df.drop_duplicates(subset, keep)             去重
│   ├── df.unique() (Series)                         唯一值
│   ├── df.map(dict_or_func) (Series)                映射
│   ├── df.reset_index(drop) / df.set_index(keys)   索引重置/设置
│   └── df.copy()                                    深拷贝
│
├── ➕ 算术运算
│   ├── df.add / sub / mul / div                     元素级四则
│   └── df + - * /                                   运算符重载
│
├── 📊 统计运算
│   ├── df.mean / median / std / var                 均值/中位数/标准差/方差
│   ├── df.max / min / sum / count                   最大/最小/求和/计数
│   ├── df.mode / abs / prod                         众数/绝对值/乘积
│   ├── df.idxmax / idxmin                           最大/最小值索引标签
│   ├── df.cumsum / cummax / cummin / cumprod        累积函数
│   └── df.apply(func, axis)                         自定义函数应用
│       └── axis=0 按列，axis=1 按行
│
├── ❓ 缺失值处理
│   ├── pd.isnull(obj) / pd.notnull(obj)             检测缺失
│   ├── df.isnull().any() / .sum() / .mean()         按列缺失统计
│   ├── df.dropna(axis)                              删除含缺失行/列
│   └── df.fillna(value, inplace)                    填充缺失值
│
├── 🔗 数据合并
│   ├── pd.concat(objs, axis, join, ignore_index)    拼接（结构合并）
│   │   └── axis=0 纵向 / axis=1 横向
│   └── pd.merge(left, right, how, on, ...)          关联（键值合并）
│       └── how: inner/left/right/outer
│
├── 📦 数据分组 ★
│   ├── df.groupby(by, as_index)                     分组
│   ├── group.agg(func_or_dict)                      聚合（压缩到组数行）
│   ├── group.transform(func)                        变换（广播回原行数）
│   ├── group.filter(func)                           过滤（按组条件筛选）
│   ├── group.first() / .last() / .get_group(key)    组操作
│   └── pd.NamedAgg(column, aggfunc)                 命名聚合
│
└── 📋 交叉表与透视表
    ├── pd.crosstab(index, columns, margins, normalize)
    │   └── normalize: 'all'/'index'/'columns'
    └── df.pivot_table(values, index, columns, aggfunc, fill_value, margins)
```

## loc vs iloc 速查

```
索引对比
├── loc  → 标签索引   闭区间 [start:end]  含两端
├── iloc → 位置索引   开区间 [start:end)  不含右端
├── at   → 单值标签   最快
└── iat  → 单值位置   最快
```

## groupby 三大操作对比

```
groupby 后操作对比
├── agg       压缩: 每组 → 1行   行数 = 组数
├── transform 广播: 每组统计 → 回填每行   行数 = 原行数
└── filter    筛选: 按组条件保留/丢弃整组   行数 ≤ 原行数
```

## concat vs merge 速查

```
数据合并对比
├── concat → 结构拼接（同结构纵向/横向堆叠）→ 类似 SQL UNION ALL
└── merge  → 键值关联（按共同列匹配）→ 类似 SQL JOIN
    └── how: inner(交集) / left(左全) / right(右全) / outer(并集)
```
