---
tags:
  - Numpy
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-07-31
---

# Numpy 知识树总结

> 来源：[关于Numpy](关于Numpy.md) 全部 5 篇笔记的函数/方法提取与学习路线

## 学习路线树

```
Numpy 学习路线
├── 01. Numpy优势               ← 为什么用Numpy（性能对比）
│   └── ndarray vs list: 同构 dtype + 规则内存布局 + 向量化底层循环
│
├── 02. N维数组-ndarray          ← ndarray 属性 + dtype 体系
│   └── shape / ndim / size / itemsize / dtype
│
├── 03. 基本操作                 ← ★ 核心（创建 + 索引 + 变形）
│   ├── 创建: zeros/ones/linspace/arange/random
│   ├── 索引: 切片 + 布尔索引
│   ├── 变形: reshape/resize/T
│   └── 类型: astype/tobytes/unique
│
├── 04. ndarray运算              ← ★ 运算（逻辑 + 统计 + 条件）
│   ├── 逻辑: np.all / np.any
│   ├── 条件: np.where / np.logical_and / np.logical_or
│   └── 统计: min/max/mean/std/var/median/argmax/argmin
│
└── 05. 数组间运算               ← 广播机制（Broadcasting）
    └── 标量广播 + 三规则 + 维度对齐
```

## 函数速查树

```
Numpy 函数分类树
│
├── 🆕 数组创建
│   ├── np.array(obj, dtype, copy=)    创建数组，默认复制
│   ├── np.asarray(obj, dtype)         条件满足时尽量复用，否则复制
│   ├── np.zeros(shape, dtype)         全零数组
│   ├── np.zeros_like(a)               按指定数组形状创建全零
│   ├── np.ones(shape, dtype)          全一数组
│   ├── np.ones_like(a)                按指定数组形状创建全一
│   ├── np.linspace(start, stop, num)  等间距（按个数）
│   ├── np.arange(start, stop, step)   等间距（按步长）
│   └── np.logspace(start, stop, num)  等比数列（10^x）
│
├── 🎲 随机数生成
│   ├── rng = np.random.default_rng(seed) 独立随机生成器
│   ├── rng.random(size)               均匀分布 [0,1)
│   ├── rng.integers(low,high,size)    随机整数
│   ├── rng.standard_normal(size)      标准正态分布
│   └── rng.normal(u,sigma,size)       正态分布（指定均值/标准差）
│
├── 📐 数组变形
│   ├── ndarray.reshape(shape)         不改原数组；可能是视图，也可能复制
│   ├── ndarray.resize(shape)          原地修改
│   ├── np.resize(arr, shape)          返回新数组（可重复数据）
│   └── ndarray.T                      转置（行列互换）
│
├── 📊 统计运算
│   ├── np.min / np.max (axis)         最小/最大值
│   ├── np.mean (axis, dtype)          均值
│   ├── np.median (axis)               中位数
│   ├── np.std (axis, dtype)           标准差
│   ├── np.var (axis, dtype)           方差
│   ├── np.argmin / np.argmax (axis)   最小/最大值索引
│   └── np.sum (axis)                  求和
│
├── 🔀 逻辑与条件
│   ├── np.all(condition)              全部满足？
│   ├── np.any(condition)              任一满足？
│   ├── np.where(cond, x, y)           向量化 if-else
│   ├── np.logical_and(a, b)           逻辑与（数组）
│   └── np.logical_or(a, b)            逻辑或（数组）
│
├── 🔄 类型转换
│   ├── ndarray.astype(type)           返回新类型数组
│   └── ndarray.tobytes()              转为字节（序列化）
│
└── 🔍 去重
    └── np.unique(arr)                 去重 + 排序

ndarray 属性:
  .shape       每个轴的长度元组；二维时可理解为 (行, 列)
  .ndim        维度数
  .size        元素总数
  .itemsize    单元素字节数
  .dtype       元素数据类型

axis 含义:
  axis=0       沿列方向（跨行，结果每列一个值）
  axis=1       沿行方向（跨列，结果每行一个值）
```

## 广播规则速查

```
Broadcasting 广播三规则
├── 规则1: 维度补齐 → 维度少的左边补1
├── 规则2: 兼容检查 → 从最后一维开始，相等或一方为1则兼容
└── 规则3: 不兼容 → 某维度都不等且都不为1 → 报错

示例:
  (4,1) + (3,) → (4,1)+(1,3) → (4,3) ✓
  (2,6) + (2,4) → 6≠4且都不为1 → ✗
  (2,6) + (2,1) → 1可广播为6 → (2,6) ✓
```

## dtype 类型速查

```
常用 dtype
├── 整型: int8 / int16 / int32 / int64 (默认)
├── 浮点: float16 / float32 / float64 (默认)
├── 布尔: bool
├── 字符串: string_(ASCII) / unicode_(Unicode)
└── 复数: complex64 / complex128
```
