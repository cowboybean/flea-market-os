const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../config/upload');
const ipAuth = require('../middleware/ipAuth');

// 获取所有物品（无需鉴权，公开访问）
router.get('/', itemController.getAllItems);

// 获取特定用户的物品
router.get('/user/:userId', itemController.getUserItems);

// 获取单个物品详情
router.get('/:id', itemController.getItemById);

// 以下路由需要IP鉴权

// 创建新物品（支持多图上传）
router.post('/', ipAuth, upload.array('images', 5), itemController.createItem);

// 更新物品信息
router.put('/:id', ipAuth, upload.array('images', 5), itemController.updateItem);

// 删除物品
router.delete('/:id', ipAuth, itemController.deleteItem);

module.exports = router;