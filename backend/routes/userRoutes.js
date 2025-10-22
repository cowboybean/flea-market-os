const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const ipAuth = require('../middleware/ipAuth');

// 根据ID获取指定用户信息（公开接口）
router.get('/user/:id', userController.getUserInfoById);

// 获取当前用户信息（需要IP鉴权）
router.get('/me', ipAuth, userController.getCurrentUser);

// 更新用户信息（需要IP鉴权）
router.put('/me', ipAuth, userController.updateUser);

module.exports = router;