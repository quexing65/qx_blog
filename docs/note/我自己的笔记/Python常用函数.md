---
date: 2026-09-24
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

