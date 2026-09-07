---
date: 2026-09-08
---

LeetCode Hot 100 题

# 00.1.两数之和



[官网链接](https://leetcode.cn/problems/two-sum/description/?envType=study-plan-v2&envId=top-100-liked)

## 题目如下：

![image-20260908000125445](C:\Users\20336\AppData\Roaming\Typora\typora-user-images\image-20260908000125445.png)

## 代码如下：

```python
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        idx = {}
        for j, x in enumerate(nums):
            if target - x in idx:
                return [idx[target - x], j]
            idx[x] = j
```

## 本题解析：



