-- MySQL初始化脚本 - 企业内部跳蚤市场系统

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS flea_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE flea_market;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip VARCHAR(45) NOT NULL UNIQUE,
  nickname VARCHAR(50) DEFAULT '匿名用户',
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建物品表
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_type ENUM('sell', 'buy') NOT NULL DEFAULT 'sell',
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('电子产品', '办公用品', '生活用品', '服装鞋帽', '图书音像', '其他') NOT NULL,
  price DECIMAL(10, 2) DEFAULT NULL,
  item_condition INT DEFAULT NULL,
  images TEXT DEFAULT NULL,
  is_sold BOOLEAN DEFAULT FALSE,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_sold ON items(is_sold);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_users_ip ON users(ip);

-- 创建一些初始测试数据（可选）
-- INSERT INTO users (ip, nickname) VALUES ('127.0.0.1', '测试用户');

-- INSERT INTO items (item_type, name, description, category, price, item_condition, images, is_sold, user_id) VALUES
-- ('sell', '二手笔记本电脑', '使用两年，状态良好，配置i5处理器，8G内存', '电子产品', 2500.00, 9, '{"images":[{"url":"/uploads/laptop1.jpg","filename":"laptop1.jpg"},{"url":"/uploads/laptop2.jpg","filename":"laptop2.jpg"}]}', FALSE, 1),
-- ('sell', '办公桌', '实木材质，9成新，尺寸120x60cm', '办公用品', 800.00, 9, '{"images":[{"url":"/uploads/desk1.jpg","filename":"desk1.jpg"}]}', FALSE, 1);

-- 显示创建的表结构
SHOW TABLES;

-- 显示每个表的结构
DESCRIBE users;
DESCRIBE items;

-- 输出初始化成功消息
SELECT '数据库初始化成功' AS message;