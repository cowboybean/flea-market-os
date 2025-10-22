const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const routes = require('./routes');
require('dotenv').config();

// 初始化Express应用
const app = express();

// 连接数据库
connectDB();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 注册API路由
app.use('/api', routes);

// 前端静态文件服务（在生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器错误'
  });
});

// 获取端口
const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});