# 数据库初始化指南

## 简介

本文档提供了初始化企业内部跳蚤市场系统MySQL数据库的详细步骤。

## 前提条件

- MySQL数据库服务已安装并运行
- 具有创建数据库和表的权限的MySQL用户账户

## 数据库信息

- **数据库名**: `flea_market`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`

## 初始化步骤

### 方法一：使用MySQL命令行直接执行脚本

1. 打开命令提示符或终端
2. 进入backend/config目录：
   ```bash
   cd backend/config
   ```
3. 运行以下命令连接MySQL并执行脚本：
   ```bash
   mysql -u root -p < init_mysql.sql
   ```
   或者指定主机和端口：
   ```bash
   mysql -u root -p -h localhost -P 3306 < init_mysql.sql
   ```
4. 输入MySQL密码后按回车，脚本将自动执行

### 方法二：先连接MySQL再执行脚本

1. 打开命令提示符或终端
2. 连接到MySQL服务器：
   ```bash
   mysql -u root -p
   ```
3. 输入密码后进入MySQL命令行
4. 执行脚本：
   ```sql
   SOURCE d:/3_workspaces/1_BBK/open_sources/flea-market/backend/config/init_mysql.sql;
   ```
   或者Linux/Mac路径：
   ```sql
   SOURCE /path/to/flea-market/backend/config/init_mysql.sql;
   ```

### 方法三：使用数据库管理工具

如果您使用的是phpMyAdmin、MySQL Workbench、Navicat等工具，可以：
1. 创建一个新的查询窗口
2. 打开`init_mysql.sql`文件并复制其内容
3. 将内容粘贴到查询窗口中
4. 执行查询

## 脚本内容说明

脚本执行以下操作：

1. 创建数据库`flea_market`（如果不存在）
2. 创建`users`表用于存储用户信息
3. 创建`items`表用于存储商品信息（注意：所有字段使用蛇形命名规范，如item_condition、is_sold、seller_id等）
4. 创建必要的索引以提高查询性能
5. 包含了可选的测试数据（默认已注释）
6. 显示创建的表结构信息

## 环境变量配置

初始化数据库后，请确保`.env`文件中的数据库连接配置正确：

```
# MySQL数据库连接信息
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=你的密码
MYSQL_DB=flea_market
MYSQL_PORT=3306
```

## 注意事项

- 确保MySQL服务已启动
- 替换`root`为您实际的MySQL用户名
- 如果数据库已存在，脚本不会删除现有数据，但会创建缺失的表
- 对于生产环境，建议创建一个专用的数据库用户，而不是使用root