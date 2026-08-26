---
tags:
  - MOC
  - Python
  - Matplotlib
  - 数据可视化
date: 2024-09-02
updated: 2026-07-31
---

# 关于 Matplotlib

> Matplotlib 数据可视化库学习笔记总索引

> 当前内容按 Matplotlib 3.11.1 校订；复杂图表优先使用 `Figure` / `Axes` 面向对象接口，并显式管理保存与关闭时机。

## 导航

| # | 笔记 | 内容 |
|---|------|------|
| 01 | [01.Matplotlib快速入门](01.Matplotlib快速入门.md) | Matplotlib 介绍、折线图绘制、图像结构 |
| 02 | [02.Matplotlib基础绘图](02.Matplotlib基础绘图.md) | 辅助功能、多图绘制、子图、刻度、网格 |
| 03 | [03.常见图形绘制](03.常见图形绘制.md) | 散点图、柱状图、直方图、饼图 |

## 知识体系

```
Matplotlib
├── 基础
│   ├── Figure（画布）
│   ├── Axes（坐标系）
│   └── plot() 方法
├── 辅助功能
│   ├── 标题（title）
│   ├── 标签（xlabel、ylabel）
│   ├── 刻度（xticks、yticks）
│   ├── 网格（grid）
│   └── 图例（legend）
├── 多图绘制
│   ├── subplot
│   └── 多次 plot
└── 常见图形
    ├── 折线图（plot）
    ├── 散点图（scatter）
    ├── 柱状图（bar）
    ├── 直方图（hist）
    └── 饼图（pie）
```

## 相关笔记

- [Pandas基础](../Pandas/关于Pandas.md) - 数据分析框架
- [NumPy 基础](../Numpy/关于Numpy.md) - 数值计算库
