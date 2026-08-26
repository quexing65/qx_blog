---
tags:
  - Linux
  - 总结
  - 知识树
date: 2026-06-18
updated: 2026-07-31
---

# Linux 知识树总结

> 来源：[关于Linux](关于Linux.md) 全部 11 篇笔记的函数/命令提取与学习路线

## 学习路线树

```
Linux 学习路线
├── 01. 计算机与Linux简介          ← 理论基础，无命令
│   └── 硬件/软件/OS概念 → Linux发行版（旧课程使用已 EOL 的 CentOS 7）
│
├── 02. 环境搭建                   ← 实操起点
│   └── VMware → 虚拟机 → FinalShell → SSH连接(端口22)
│       └── 命令: systemctl restart network
│
├── 03. Linux目录结构              ← 认知地图
│   └── 根目录 / → FHS标准目录树 → 各目录用途
│
├── 04. 基础命令                   ← ★ 核心基础（必背）
│   ├── 导航: ls / cd / pwd
│   ├── 文件操作: mkdir / touch / cat / more / cp / mv / rm
│   ├── 搜索: which / find
│   └── 输出与重定向: echo / > / >>
│
├── 05. 管道过滤与统计             ← ★ 进阶文本处理
│   ├── 过滤: grep
│   ├── 统计: wc
│   ├── 监控: tail -f
│   ├── 管道: |
│   └── 替换: 反引号 ``
│
├── 06. vi编辑器                   ← 编辑工具
│   └── vim → i插入 → Esc → :wq保存 / :q!退出
│       └── 辅助: --help / man
│
├── 07. 用户与权限管理             ← ★ 安全核心
│   ├── 用户: useradd / userdel / passwd / id / su
│   ├── 用户组: groupadd / groupdel / usermod -aG
│   ├── 查询: getent group / getent passwd
│   ├── 权限: chmod(符号/数字) / chown
│   └── 提权: sudo
│
├── 08. 软件安装与系统服务         ← ★ 运维基础
│   ├── 包管理: dnf install / search / remove / upgrade
│   └── 服务管理: systemctl start/stop/status/restart/enable/disable
│
├── 09. 软硬链接                  ← 文件系统进阶
│   └── ln -s(软链接) / ln(硬链接)
│
├── 10. 网络与进程管理             ← ★ 诊断与管控
│   ├── 网络: ip address / ip route / ping / curl / ss -lntup
│   └── 进程: ps -ef / kill（SIGTERM 优先，SIGKILL 兜底）
│
└── 11. 压缩与解压缩               ← 日常工具
    └── tar -zcvf(压缩) / tar -zxvf(解压)
```

## 命令速查树

```
Linux 命令分类树
├── 📁 文件与目录操作
│   ├── ls [-a | -l | -h]          列出目录内容
│   ├── ll                          常见 ls -l 别名（不保证存在）
│   ├── cd [路径|..|~|-]            切换目录
│   ├── pwd                         打印当前目录
│   ├── mkdir [-p] 目录             创建目录（-p 递归）
│   ├── touch 文件                  创建空文件
│   ├── cp [-r] 源 目标             复制（-r 递归）
│   ├── mv 源 目标                  移动/重命名
│   ├── rm [-rf] 文件               删除（-r 递归 -f 强制）
│   ├── ln -s 源 链接名             创建软链接
│   ├── ln 源 链接名                创建硬链接
│   └── find / [-name|-size]        搜索文件
│
├── 📄 文件查看与编辑
│   ├── cat 文件                    查看全文
│   ├── more 文件                   分页查看
│   ├── tail [-n|-f] 文件           查看尾部（-f 实时追踪）
│   ├── vim 文件                    编辑文件
│   │   ├── i                       进入插入模式
│   │   ├── Esc                     回到命令模式
│   │   ├── :wq                     保存退出
│   │   └── :q!                     不保存退出
│   └── echo "文本" [>|>>] 文件     输出/重定向
│
├── 🔍 搜索与过滤
│   ├── grep [-n] "模式" 文件       文本过滤
│   ├── which 命令名                查找命令路径
│   ├── wc [-l|-w|-c] 文件          统计行/词/字节
│   └── 管道 |                      连接多命令
│
├── 👤 用户与权限
│   ├── groupadd / groupdel         创建/删除用户组
│   ├── useradd [-g 组] 用户        创建用户
│   ├── userdel [-r] 用户           删除用户
│   ├── passwd 用户                 设置密码
│   ├── id 用户                     查看用户信息
│   ├── usermod -aG 组 用户         追加用户到组
│   ├── su 用户                     切换用户
│   ├── sudo 命令                   提权执行
│   ├── getent group / passwd       列出组/用户
│   ├── chmod [符号|数字] 文件      修改权限
│   └── chown [-R] 用户:组 文件     修改所有者
│
├── 📦 软件与服务
│   ├── dnf install / search / remove  包管理（部分系统兼容 yum）
│   ├── wget URL                    下载文件
│   └── systemctl start|stop|status|restart|enable|disable  服务管理
│
├── 🌐 网络与进程
│   ├── ip address                  查看地址
│   ├── ip route                    查看路由
│   ├── ping [-c 次数] 地址         测试连通性
│   ├── curl URL                    HTTP请求
│   ├── ss -lntup                   查看监听套接字
│   ├── ps -ef                      查看进程
│   └── kill PID                    先请求正常退出；必要时再用 SIGKILL
│
└── 🗜️ 压缩
    ├── tar -zcvf 归档名 文件...    压缩(gzip)
    └── tar -zxvf 归档名 [-C 路径]  解压

快捷键:
  Ctrl+C  中断    Ctrl+L  清屏    Ctrl+D  发送 EOF（交互式 shell 可能退出）
  Ctrl+A  行首    Ctrl+E  行尾    Ctrl+R  搜索历史
  history         查看历史命令    !命令   执行上次匹配
```

## 权限编码速查

```
权限数字编码
├── 0 = ---     无权限
├── 1 = --x     仅执行
├── 2 = -w-     仅写入
├── 3 = -wx     写+执行
├── 4 = r--     仅读取
├── 5 = r-x     读+执行
├── 6 = rw-     读+写入
└── 7 = rwx     全部权限

示例: chmod 754 file → rwx(7) r-x(5) r--(4)
      即: 所有者全权限, 组读+执行, 其他只读
```

## tar 标志速查

```
tar 标志
├── z = gzip 压缩
├── c = 创建归档
├── x = 解压归档
├── v = 显示过程
├── f = 指定文件名
└── -C = 指定解压目标目录

压缩: tar -zcvf name.tar.gz file1 file2 ...
解压: tar -zxvf name.tar.gz [-C 目标路径]
```
