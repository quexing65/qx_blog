---
date: 2026-09-24
updated: 2026-09-24
---

# Python常用函数

## 1. 原生库函数

### enumerate()

能用enumerate就别用range(len(...))

```python
# 慢
for i in range(len(my_list))
	value = my_list[i]
    
# 快，而且更加Pythonic
for i value in enumerate(my_list)
	# 可以搞点别的了
# Pythonic——地道的，符合Python哲学的写法，充分利用Python本身特性，代码简洁，可读性强、优雅。
```

## 2. re库



1. re.search(pattern, string, flags=0) 遍历整个字符串任意位置，找第一个出现的匹配项
2. re.match **只从字符串开头位置匹配**，开头不满足直接 None，不会向后搜
3. re.group(1)取第 1 个捕获括号`()`里面内容
4. re.start()：匹配起始下标

## 3.array库

> 对于大集合避免使用 list，使用array、deque、或者numpy数组
>
> - list是通用容器，但是在处理大量数值数据时，内存效率差且速度慢
> - 推荐使用：array、collections.deque、numpy.ndarray或者polars.Series
> - Numpy用C实现，Polars基于Rust编写，性能远超Pandas

```python
from array import array
my_array = array('i', [1,2,3,4])
```

## 4.functools

functools.lru_cache是Python的一个内置装饰器，用于**自动缓存函数的结果**，避免重复计算，提高性能

```python
from functools import lru_cache
@lru_cache(maxsize=1000)
def fib(n)
	if n<2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(30)) 	# 快速返回结果
print(fib.cache_info())	# 查看缓存情况
```

