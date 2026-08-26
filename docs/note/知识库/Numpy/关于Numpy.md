---
tags:
  - MOC
  - Python
  - Numpy
  - 数据分析
date: 2024-09-01
updated: 2026-07-31
---

# 关于 NumPy

> NumPy 数值计算库学习笔记总索引

> 当前内容按 NumPy 2.5 稳定版校订；NumPy 2.0 已移除的旧别名已替换，新代码优先使用 `numpy.random.Generator`。

## 导航

| # | 笔记 | 内容 |
|---|------|------|
| 01 | [01.Numpy优势](01.Numpy优势.md) | NumPy 介绍、ndarray 优势、向量化运算 |
| 02 | [02.N维数组-ndarray](02.N维数组-ndarray.md) | ndarray 属性、形状、数据类型 |
| 03 | [03.基本操作](03.基本操作.md) | 数组创建、索引切片、形状修改、类型转换 |
| 04 | [04.ndarray运算](04.ndarray运算.md) | 逻辑运算、统计函数、比较运算 |
| 05 | [05.数组间运算](05.数组间运算.md) | 数组与标量、数组与数组、广播机制 |

## 知识体系

```
NumPy
├── ndarray 对象
│   ├── 属性（shape、ndim、size、dtype）
│   ├── 创建（array、zeros、ones、arange、random）
│   └── 数据类型（int、float、bool、string）
├── 索引与切片
│   ├── 基本索引
│   ├── 切片操作
│   └── 花式索引
├── 形状操作
│   ├── reshape
│   ├── resize
│   └── 转置（T）
└── 运算
    ├── 元素级运算
    ├── 矩阵运算
    └── 广播机制
```

## 相关笔记

- [Pandas基础](../Pandas/关于Pandas.md) - 数据分析框架
- [Matplotlib基础](../Matplotlib/关于Matplotlib.md) - 数据可视化
