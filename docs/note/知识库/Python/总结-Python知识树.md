---
tags:
  - Python
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-08-03
---

# Python 知识树总结

> 来源：[关于Python](关于Python.md) 全部笔记的函数/方法提取与扁平化学习路线

## 学习路线树

```
Python 学习路线
│
├── 基础篇
│   ├── 01. 入门与环境                 ← 环境 + 类型 + 输入输出 + 运算符
│   ├── 02. 流程控制                   ← 条件 + while + for + 循环控制
│   ├── 03. 内置数据结构               ← 字符串 + 列表 + 元组 + 字典 + 集合
│   ├── 04. 函数                       ← 定义 + 参数 + 作用域 + 高阶函数
│   ├── 05. 文件、异常与模块           ← 文件 I/O + 异常 + 模块/包
│   ├── 06. 学生管理系统               ← 基础语法综合项目
│   └── 07. 标准库、递归与数据库       ← os + 练习 + 递归 + PyMySQL
│
├── 进阶篇
│   ├── 01. 面向对象基础               ← class + self + 魔法方法 + 继承
│   ├── 02. 面向对象进阶               ← 重写 + 封装 + 多态 + 类方法
│   ├── 03. 学生管理系统（OOP版）      ← OOP 综合项目
│   ├── 04. 迭代器、生成器与 property  ← 迭代协议 + yield + property
│   ├── 05. 闭包与装饰器               ← 闭包 + nonlocal + decorator
│   ├── 06. 并发编程                   ← 进程 + 线程 + Lock + asyncio
│   ├── 07. Socket网络编程             ← TCP + 编解码 + 文件上传
│   ├── 08. 正则表达式                 ← 匹配 + 替换 + 分组
│   ├── 09. 数据结构                   ← 复杂度 + 顺序表 + 链表
│   └── 10. 排序、查找与二叉树         ← 排序 + 二分查找 + 树遍历
│
└── Web开发篇
    ├── 01. FastAPI学习路线            ← 整体地图
    ├── 02. 路由与请求                 ← 路由 + 参数 + 响应 + 异常
    ├── 03. 依赖注入与数据库           ← 中间件 + DI + SQLAlchemy
    └── 04. AI掘金头条项目             ← 认证 + Redis + RESTful
```

## 函数/方法速查树

```
Python 内置函数树
├── 🔤 类型与转换
│   ├── int() / float() / str() / bool()    类型转换
│   ├── type()                               查看类型
│   ├── eval()                               执行字符串表达式（勿处理不可信输入）
│   └── len()                                长度
│
├── 📤 输入输出
│   ├── print(...)                           输出（f-string 格式化）
│   └── input()                              键盘输入（返回str）
│
├── 🔢 数值
│   ├── max() / min()                        最大/最小值
│   ├── range(start, end, step)              生成序列
│   ├── enumerate(iterable, start)           带索引迭代
│   ├── map(fn, iterable)                    批量映射（返回迭代器）
│   ├── filter(fn, iterable)                 条件过滤（返回迭代器）
│   └── sorted(iterable, key=fn)             自定义排序（返回新列表）
│
├── 📦 序列操作
│   ├── list.sort(key=fn)                    排序（原地）
│   ├── sorted()                             排序（返回新列表）
│   ├── list.append() / extend() / insert()  列表增
│   ├── list.remove() / pop() / clear()      列表删
│   └── dict.get() / keys() / values() / items()  字典查询
│
└── 🛠️ 辅助
    ├── help(func)                           查看文档
    ├── id(var)                              内存地址
    └── keyword.kwlist                       关键字列表
```

```
字符串方法树
├── 查找: find / index / rfind / rindex
├── 替换: replace(old, new, count)
├── 分割: split(separator, count)
├── 合并: separator.join(iterable)
├── 去空白: strip / lstrip / rstrip
└── 判断: isdigit / isalpha / isalnum / isspace / isupper / islower
```

```
文件操作树
├── 打开: open(path, mode, encoding)
│   └── 模式: r(读) / w(写) / a(追加) / rb(二进制读) / wb(二进制写)
├── 读取: read(n) / readline() / readlines()
├── 写入: write(data) / writelines(list)
├── 关闭: close()
└── 上下文: with open(...) as f:  （自动关闭）
```

```
高阶函数树
├── map(fn, iterable)              批量映射 → map对象(迭代器)
│   ├── list(map(int, ['1','2']))  类型转换常用
│   └── list(map(fn, list1, list2)) 多列表合并
├── filter(fn, iterable)           条件过滤 → filter对象(迭代器)
│   └── filter(None, iterable)     过滤偏假值('', 0, None, [])
├── reduce(fn, iterable)           累积计算 → 单个值
│   ├── from functools import reduce
│   ├── reduce(lambda x,y: x+y, lst)    求和
│   └── reduce(lambda x,y: x*y, lst)    求积
├── sorted(iterable, key=fn)       自定义排序 → 新列表
│   ├── key=lambda x: abs(x)      按绝对值
│   ├── key=lambda x: x[1]        按元组第2个元素
│   └── 多条件: key=lambda x: (x[1], x[0])
└── vs 推导式
    ├── map()    ≈ [fn(x) for x in lst]
    ├── filter() ≈ [x for x in lst if fn(x)]
    └── reduce() / sorted() → 无推导式等价
```

```
面向对象树
├── 定义: class ClassName:
├── 初始化/显示/终结: __init__ / __str__ / __del__（终结时机不可靠）
├── 继承: class Child(Parent) → MRO 方法解析顺序
│   ├── 多继承: class Child(P1, P2) → 左优先
│   ├── 重写: 子类同名覆盖父类
│   ├── 调父类: super().__init__() / Parent.__init__(self)
│   └── 双下划线属性: __attr → 名称改写，用于避免意外覆盖，不是安全边界
├── 多态: 不同对象提供相同协议即可被统一调用（鸭子类型）
├── 抽象类: @abstractmethod 声明接口，未实现的子类不能实例化
├── 类属性 vs 对象属性: 类体中定义 vs 通过实例（常在 __init__ 中）定义
├── @classmethod(cls) / @staticmethod
└── 魔术方法: __init__ / __str__ / __del__ / __dict__
```

```
闭包与装饰器树
├── 闭包三要素: 嵌套 + 内部引用外部变量 + 外部返回内部函数
├── nonlocal var → 修改外部函数变量
└── 装饰器: @decorator = func = decorator(func)
    └── 模式: def deco(fn): def wrapper(*args, **kwargs): 增强; return fn(*args, **kwargs); return wrapper
```

```
网络编程树
├── Socket (TCP)
│   ├── server: socket() → bind() → listen() → accept() → send/recv
│   └── client: socket() → connect() → recv/sendall（TCP 需自行设计消息边界）
├── 编码: str.encode() / bytes.decode()
├── 多进程: multiprocessing.Process(target=) → start() / daemon / terminate
├── 多线程: threading.Thread(target=) → start() / daemon
└── 互斥锁: threading.Lock() → acquire() / release()
```

```
迭代器/生成器/正则树
├── 迭代器: __iter__() + __next__() / next(iterator)
├── 生成器
│   ├── 推导式: (expr for var in iterable)
│   └── 函数: yield（暂停+恢复，省内存）
├── property: @property(getter) / @name.setter
└── 正则 re 模块
    ├── re.match(从头) / re.search(任意位置)
    ├── re.sub() / re.compile().sub()
    └── result.group(n)  取第n组
```

```
排序算法树
├── 冒泡排序 bubble_sort     O(n²) 稳定   相邻比较交换
├── 选择排序 select_sort     O(n²) 不稳定 选最小放前面
├── 插入排序 insert_sort     O(n²) 稳定   插入已排序部分
├── 二分查找 binary_search   O(log n)     必须有序
│   ├── 递归版 binary_search_recursion
│   └── 迭代版 binary_search
└── 二叉树 BinaryTree
    ├── add(item)            层序添加（队列实现）
    ├── breadth_travel()     广度优先 BFS
    ├── preorder_travel()    前序遍历 DLR
    ├── inorder_travel()     中序遍历 LDR
    └── postorder_travel()   后序遍历 LRD
```

```
FastAPI Web开发树
├── 路由: @app.get/post/put/delete
├── 参数: Path() / Query() / BaseModel(请求体)
├── 验证: Pydantic BaseModel + Field
├── 异常: HTTPException / @app.exception_handler
├── 中间件: @app.middleware("http") / CORSMiddleware
├── 依赖注入: Depends(func)
├── 生命周期: FastAPI(lifespan=async_context_manager)
├── 数据库: SQLAlchemy 2.0 (async)
│   ├── 定义: DeclarativeBase + Mapped[] + mapped_column()
│   ├── 查询: select().where() / .order_by() / .offset() / .limit()
│   ├── 聚合: func.count / sum / avg / max / min
│   └── CRUD: db.add / db.execute / db.delete / db.commit
├── 认证: Argon2 密码哈希 + Bearer Token（验证过期时间；不透明令牌只存摘要）
├── 缓存: Redis (分类2h / 列表10min / 详情5min)
└── 架构: models / schemas / crud / routers / utils / config
```

```
OS模块树
├── os.getcwd()       当前目录
├── os.chdir()        切换目录
├── os.mkdir()        创建目录
├── os.rmdir()        删除目录
├── os.rename()       重命名
└── os.listdir()      列出目录内容
```

```
PyMySQL树
├── pymysql.connect() → conn
│   ├── conn.cursor() → cursor
│   │   ├── cursor.execute(sql)    执行SQL
│   │   ├── cursor.fetchall()      全部结果
│   │   ├── cursor.fetchone()      单条结果
│   │   └── cursor.fetchmany(n)    n条结果
│   ├── conn.commit()              提交变更
│   └── conn.close()               关闭连接
```
