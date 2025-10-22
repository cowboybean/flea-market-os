const express = require('express');
const router = express.Router();

// 引入物品路由
const itemRoutes = require('./itemRoutes');
// 引入用户路由
const userRoutes = require('./userRoutes');

// 注册物品路由
router.use('/items', itemRoutes);

// 注册用户路由
router.use('/users', userRoutes);

module.exports = router;