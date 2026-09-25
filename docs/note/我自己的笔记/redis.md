---
date: 2026-09-23
updated: 2026-09-25
---

# Redis

## 1通用命令

- KEYS:查看符合模板的所有key，不建议在生产环境设备上使用 
- DEL:删除一个指定的key 
- EXISTS:判断key是否存在 
- EXPIRE:给一个key设置有效期，有效期到期时该key会被自动删除 
- TTL:查看一个KEY的剩余有效期

## 2String命令

- SET添加或者修改已经存在的一个String类型的键值对 
- SET: GET:根据key获取String类型的value
-  MSET:批量添加多个String类型的键值对 
- MGET:根据多个key获取多个String类型的value 
- INCR:让一个整型的key自增1 
- INCRBY:让一个整型的key自增并指定步长，例如:incrbynum2让num值自增2 
- INCRBYFLOAT:让一个浮点类型的数字自增并指定步长 
- SETNX:添加一个String类型的键值对，前提是这个key不存在，否则不执行 
- SETEX:添加一个String类型的键值对，并且指定有效期

## 3Hash命令

- HSET key field value:添加或者修改hash类型key的field的值 
- HGET key field:获取一个hash类型key的field的值 
- HMSET:批量添加多个hash类型key的field的值 
- HMGET:批量获取多个hash类型key的field的值 
- HGETALL:获取一个hash类型的key中的所有的field和value 
- HKEYS:获取一个hash类型的key中的所有的field
- HVALS:获取一个hash类型的key中的所有的value 
- HINCRBY:让一个hash类型key的字段值自增并指定步长 
- HSETNX:添加一个hash类型的key的field值，前提是这个field不存在，否则不执行

## 4List命令

- LPUSH key element…:向列表左侧插入一个或多个元素 
- LPOP key:移除并返回列表左侧的第一个元素，没有则返回nil 
- RPUSH key element…:向列表右侧插入一个或多个元素 
- RPOP key:移除并返回列表右侧的第一个元素 
- LRANGE key starend:返回一段角标范围内的所有元素 
- BLPOP和BRPOP:与LPOP和RPOP类似，只不过在没有元素时等待指定时间，而不是直接返回nil

## 5Set命令

- SADD key member ...: 向set中添加一个或多个元素 
- SREM key member….:移除set中的指定元素 
- SCARD key:返回set中元素的个数 
- SISMEMBER key member:判断一个元素是否存在于set 中
- SMEMBERS:获取set中的所有元素 
- SINTER key1 key2 .. : 求key1与key2的交集 
- SDIFF key1 key2..:求key1与key2的差集 
- SUNION key1 key2..:求key1和key2的并集

## 6SortedSet

- ZADD key score member:添加一个或多个元素到sorted set，如果已经存在则更新其score值 
- ZREM key member:删除sorted set中的一个指定元素 
- ZSCORE key member:获取sorted set中的指定元素的score值 
- ZRANK key member:获取sorted set中的指定元素的排名 
- ZCARD key:获取sorted set中的元素个数 
- ZCOUNT key min max:统计score值在给定范围内的所有元素的个数 
- ZINCRBY key increment member:让sorted set中的指定元素自增，步长为指定的increment值 
- ZRANGE key min max:按照score排序后，获取指定排名范围内的元素 
- ZRANGEBYSCORE key min max:按照score排序后，获取指定score范围内的元素 
- ZDIFF、ZINTER、ZUNION:求差集、交集、并集
