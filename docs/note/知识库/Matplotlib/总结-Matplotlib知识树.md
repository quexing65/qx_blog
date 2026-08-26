---
tags:
  - Matplotlib
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-07-31
---

# Matplotlib 知识树总结

> 来源：[关于Matplotlib](关于Matplotlib.md) 全部 3 篇笔记的函数/方法提取与学习路线

## 学习路线树

```
Matplotlib 学习路线
├── 01. 快速入门                    ← 三步绘图流程
│   └── plt.figure() → plt.plot() → plt.show()
│
├── 02. 基础绘图                    ← ★ 完善图表（刻度/标签/图例/网格/子图）
│   ├── 刻度: xticks / yticks
│   ├── 标签: xlabel / ylabel / title
│   ├── 图例: legend
│   ├── 网格: grid
│   ├── 保存: fig.savefig（脚本中通常放在阻塞式 show 之前）
│   ├── 多线: 同一axes多次plot + label
│   ├── 子图: plt.subplots(nrows, ncols)
│   ├── 中文: SimHei字体 + rcParams配置
│   └── 数学函数: np.linspace + np.sin + plt.plot
│
└── 03. 常见图形绘制                ← 5种基础图表
    ├── 折线图 plt.plot()           趋势变化
    ├── 柱状图 plt.bar()            离散比较
    ├── 直方图 plt.hist()           连续分布
    ├── 饼图   plt.pie()            占比构成
    └── 散点图 plt.scatter()        相关性分析
```

## 函数速查树

```
Matplotlib 函数分类树
│
├── 🖼️ 画布与显示
│   ├── plt.figure(figsize=(w,h), dpi=n)     创建画布
│   ├── plt.show()                            按后端与 block 参数显示图表
│   └── fig.savefig("path.png")               保存指定 Figure，脚本中通常在阻塞式 show 前调用
│
├── 📈 绘图函数
│   ├── plt.plot(x, y, color, linestyle, label)  折线图
│   ├── plt.bar(x, width, align, color)          柱状图
│   ├── plt.hist(x, bins, color, alpha, rwidth)  直方图
│   ├── plt.pie(x, labels, autopct, colors)      饼图
│   └── plt.scatter(x, y)                         散点图
│
├── 🏷️ 标注与装饰
│   ├── plt.title("text", fontsize)              标题
│   ├── plt.xlabel("text") / plt.ylabel("text")  轴标签
│   ├── plt.xticks(ticks, labels)                 X轴刻度
│   ├── plt.yticks(ticks, labels)                 Y轴刻度
│   ├── plt.legend(loc="best")                    图例
│   └── plt.grid(True, linestyle, alpha)          网格线
│
├── 🪟 子图 (面向对象)
│   ├── plt.subplots(nrows, ncols)                创建子图 → (fig, axes)
│   ├── axes[i].plot(x, y)                        子图绘制
│   ├── axes[i].set_title / set_xlabel / set_ylabel
│   ├── axes[i].set_xticks / set_yticks / set_xticklabels
│   ├── axes[i].grid / legend
│   └── 两种风格: 过程式 plt.xxx() / 面向对象 axes.set_xxx()
│
└── ⚙️ 配置
    ├── mpl.rcParams["font.sans-serif"] = ["SimHei"]     中文字体
    └── mpl.rcParams["axes.unicode_minus"] = False        修复负号
```

## 图表选择速查

```
图表选择指南
├── 趋势变化（随时间）    → 折线图  plt.plot()
├── 离散比较（大小对比）  → 柱状图  plt.bar()
├── 连续分布（频率分布）  → 直方图  plt.hist()
├── 占比构成（百分比）    → 饼图    plt.pie()
└── 相关性（两变量关系）  → 散点图  plt.scatter()
```

## 线条与颜色速查

```
线条样式 linestyle
├── '-'    实线      '--'   虚线
├── '-.'   点划线    ':'    点线
└── ''     无线条

颜色字符 color
├── r=红  g=绿  b=蓝  k=黑
├── w=白  c=青  m=品红  y=黄

图例位置 loc
├── best=0  upper right=1  upper left=2
├── lower left=3  lower right=4  right=5
├── center left=6  center right=7
└── lower center=8  upper center=9  center=10
```

## 绘图流程速查

```
标准三步绘图流程
1. plt.figure(figsize, dpi)     创建画布
2. plt.plot/bar/hist/pie/scatter  绑定数据
3. 装饰: title/xlabel/ylabel/xticks/legend/grid
4. fig.savefig("path")          脚本中通常在阻塞式 show 之前保存
5. plt.show()                   显示
```
