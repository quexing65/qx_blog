---
tags:
  - Python数据分析
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-08-02
---

# Python数据分析 知识树总结

> 来源：[关于Python数据分析](关于Python数据分析.md) 笔记的流程/方法提取与学习路线

## 学习路线树

```
Python数据分析 学习路线
├── 04. RFM案例                    ← 会员价值度模型（客户分群）
│   ├── 概念: Recency(最近消费) + Frequency(消费频率) + Monetary(消费金额)
│   ├── 流程: 数据读取 → 清洗 → 分组聚合 → R/F/M计算 → 评分 → 分群 → 可视化
│   └── 核心: 百分位排名五档 + 加权得分/组合得分 + 业务分群
└── 05. Pandas与Seaborn绘图扩展
    ├── Pandas: 汇总结果快速绘图
    ├── Seaborn: 分组分布、关系与回归趋势
    └── 图形: 直方图、散点图、箱线图、小提琴图
```

## RFM 流程树

```
RFM 模型实施流程树
│
├── 1. 数据准备
│   ├── pd.read_excel('./dataset/sales.xlsx')               读取配套Excel
│   ├── 校验字段 + 日期/金额类型转换 + 按必要列处理缺失
│   └── 按业务规则处理退款、无效交易、重复记录与观察窗口
│
├── 2. 计算 R / F / M
│   ├── R = (截止日期 - 最近购买日期).dt.days               最近消费间隔
│   ├── F = groupby(USERID).ORDERID.nunique()               独立订单数（有订单ID时）
│   └── M = groupby(USERID).AMOUNTINFO.sum()                有效消费总金额
│
├── 3. 评分（百分位排名映射 1～5）
│   ├── R: rank(pct=True) 后反向映射                         越近越高
│   ├── F/M: rank(pct=True) 后正向映射                      越多/越高越高
│   └── 并列值使用平均排名；数据偏斜时允许某些档位为空
│
├── 4. 分群策略
│   ├── 策略1: 加权得分
│   │   └── rfm_wscore = R*0.2 + F*0.2 + M*0.6
│   │       └── <2 低 / [2,4) 中 / >=4 高（仅示例，需业务验证）
│   └── 策略2: 组合得分
│       └── str(R) + str(F) + str(M) → "555" / "343" / "111"
│
├── 5. 八类客户分群
│   ├── 重要价值用户  R高 F高 M高    ← 最优
│   ├── 重要发展用户  R高 F低 M高
│   ├── 重要保持用户  R低 F高 M高
│   ├── 重要挽留用户  R低 F低 M高
│   ├── 一般价值用户  R高 F高 M低
│   ├── 一般发展用户  R高 F低 M低
│   ├── 一般保持用户  R低 F高 M低
│   └── 一般挽留用户  R低 F低 M低    ← 最差
│
└── 6. 可视化
    ├── 柱状图: value_counts().plot(kind='bar')
    └── 饼图:   value_counts().plot(kind='pie', autopct='%1.1f%%')
```

## 函数速查树

```
RFM 案例用到的函数树
│
├── Pandas
│   ├── pd.read_excel(path, index_col)             读Excel
│   ├── pd.to_datetime(..., errors='coerce')       规范日期
│   ├── Series.rank(pct=True)                      百分位排名
│   ├── pd.cut(..., right=False)                   按业务阈值分群
│   ├── df.dropna(subset=...)                      只按必要字段删缺失行
│   ├── df.copy()                                  创建独立 DataFrame 语义
│   ├── df.to_csv(path, index_label=...)           导出CSV
│   ├── groupby('USERID').agg(...)                 分组聚合
│   ├── .dt.days                                   提取天数
│   └── .astype('string').agg(''.join, axis=1)     组合RFM分数
│
├── Numpy
│   └── np.ceil(percentile * 5)                    百分位映射到五档
│
└── Matplotlib
    ├── value_counts().plot(kind='bar')            柱状图
    ├── value_counts().plot(kind='pie')            饼图
    │   └── autopct='%1.1f%%'  startangle=90  counterclock=False
    └── plt.title / xlabel / ylabel / show         标注与显示
```

## Pandas / Seaborn 绘图树

```
统计可视化
├── Pandas .plot()
│   ├── Series.value_counts().plot.bar()           分类计数
│   ├── DataFrame.plot.line()                      趋势
│   └── DataFrame.plot.area()                      累计或面积变化
└── Seaborn
    ├── histplot(data, x, hue)                     分组分布
    ├── scatterplot(data, x, y, hue)               变量关系
    ├── regplot(data, x, y)                        回归趋势
    ├── jointplot(..., kind='hex')                 联合密度
    ├── boxplot(data, x, y)                        四分位与离群值
    └── violinplot(data, x, y, hue)                密度与分位信息
```

## RFM 分档要点

```
RFM 评分关键
├── pd.cut: 等宽或自定义边界，适合有明确业务阈值的分箱
├── pd.qcut: 等频分位，遇到大量并列值可能产生重复边界
├── rank(pct=True): 可让并列值保持同分，再映射到1～5
└── R原始天数越小越好；F/M原始值越大越好
```

## 加权 vs 组合得分

```
两种分群策略对比
├── 加权得分: R*0.2 + F*0.2 + M*0.6 → 单一分数
│   ├── 优点: 可排序，便于阈值划分
│   └── 缺点: 权重需业务确定，M占主导
└── 组合得分: str(R)+str(F)+str(M) → 编码如"555"
    ├── 优点: 三维独立，8类客户精确分类
    └── 缺点: 编码不可直接排序
```
