const Item = require('../models/Item');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { Op, Sequelize } = require('sequelize');

// 获取所有物品
const getAllItems = async (req, res) => {
  try {
    const { category, search, sold = 'false', item_type } = req.query;
    
    const whereClause = {
      is_sold: sold === 'true'
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (item_type) {
      whereClause.item_type = item_type;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const items = await Item.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'employee_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // 解析每个物品的图片数据
    const itemsWithParsedImages = items.map(item => {
      // 解析图片数据
      if (item.images && typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (parseError) {
          console.error('解析图片数据失败:', parseError);
          item.images = [];
        }
      }
      
      return item;
    });
    
    res.status(200).json({
      success: true,
      count: itemsWithParsedImages.length,
      data: itemsWithParsedImages
    });
  } catch (error) {
    console.error('获取物品列表错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

// 获取特定用户的物品
const getUserItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sold = 'false', item_type } = req.query;
    
    const whereClause = {
      user_id: userId,
      is_sold: sold === 'true'
    };
    
    if (item_type) {
      whereClause.item_type = item_type;
    }
    
    const items = await Item.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'employee_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    // 解析每个物品的图片数据
    const itemsWithParsedImages = items.map(item => {
      // 解析图片数据
      if (item.images && typeof item.images === 'string') {
        try {
          item.images = JSON.parse(item.images);
        } catch (parseError) {
          console.error('解析图片数据失败:', parseError);
          item.images = [];
        }
      }
      
      return item;
    });
    
    // 如果用户没有物品，返回空数组而不是错误
    if (!itemsWithParsedImages.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    res.status(200).json({
      success: true,
      count: itemsWithParsedImages.length,
      data: itemsWithParsedImages
    });
  } catch (error) {
    console.error('获取用户物品错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

// 获取单个物品详情
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先更新查看次数，再获取物品信息，不更新updated_at字段
    await Item.update(
      { view_count: Sequelize.literal('view_count + 1') },
      { where: { id }, returning: true, timestamps: false }
    );
    
    const item = await Item.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'employee_id']
        }
      ]
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: '物品不存在' });
    }
    
    // 解析图片数据
    if (item.images && typeof item.images === 'string') {
      try {
        item.images = JSON.parse(item.images);
      } catch (parseError) {
        console.error('解析图片数据失败:', parseError);
        item.images = [];
      }
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('获取物品详情错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

// 创建新物品
const createItem = async (req, res) => {
  try {
    const { category, name, description, item_condition, price, item_type = 'sell' } = req.body;
    
    // 验证必填字段
    if (!category || !name || !description || !price) {
      return res.status(400).json({ success: false, message: '请填写所有必填字段' });
    }
    
    // 对于出售的商品，item_condition是必填的
    if (item_type === 'sell' && !item_condition) {
      return res.status(400).json({ success: false, message: '出售商品必须填写成色' });
    }
    
    // 处理上传的图片
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push({
          url: `/uploads/${file.filename}`,
          filename: file.filename
        });
      });
    }
    
    const itemData = {
      category,
      name,
      description,
      price: parseFloat(price),
      user_id: req.userId,
      item_type,
      images: JSON.stringify(images)
    };
    
    // 只有出售的商品才设置成色
    if (item_type === 'sell') {
      itemData.item_condition = parseInt(item_condition);
    }
    
    const item = await Item.create(itemData);
    
    res.status(201).json({
      success: true,
      message: '物品发布成功',
      data: item
    });
  } catch (error) {
    console.error('创建物品错误:', error);
    res.status(400).json({ success: false, message: '物品创建失败', error: error.message });
  }
};

// 更新物品信息
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, name, description, item_condition, price, item_type, is_sold } = req.body;
    
    // 查找物品
    let item = await Item.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: '物品不存在' });
    }
    
    // 检查权限（只有物品的发布者可以更新）
    if (item.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: '无权修改此物品' });
    }
    
    // 更新物品信息
    const updateData = {};
    if (category) updateData.category = category;
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (item_condition) updateData.item_condition = parseInt(item_condition);
    if (price) updateData.price = parseFloat(price);
    if (item_type) updateData.item_type = item_type;
    if (is_sold !== undefined) updateData.is_sold = is_sold === 'true' || is_sold === true;
    
    // 处理图片更新逻辑
    const originalImages = req.body.originalImages;
    const hasNewFiles = req.files && req.files.length > 0;
    
    if (hasNewFiles || originalImages) {
      // 获取原始图片列表
      let existingImages = [];
      if (item.images) {
        existingImages = JSON.parse(item.images);
      }
      
      // 如果指定了要保留的原始图片，筛选出这些图片
      let finalImages = [];
      if (originalImages) {
        // originalImages可能是单个字符串或字符串数组
        const originalImageArray = Array.isArray(originalImages) ? originalImages : [originalImages];
        finalImages = existingImages.filter(img => 
          originalImageArray.includes(img.filename)
        );
      }
      
      // 删除未被保留的原始图片文件
      if (originalImages) {
        const originalImageArray = Array.isArray(originalImages) ? originalImages : [originalImages];
        existingImages.forEach(img => {
          if (!originalImageArray.includes(img.filename)) {
            const filePath = path.join(process.env.UPLOAD_PATH, img.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        });
      } else if (hasNewFiles) {
        // 如果没有指定保留的原始图片但有新文件，则删除所有原始图片
        existingImages.forEach(img => {
          const filePath = path.join(process.env.UPLOAD_PATH, img.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }
      
      // 添加新上传的图片
      if (hasNewFiles) {
        req.files.forEach(file => {
          finalImages.push({
            url: `/uploads/${file.filename}`,
            filename: file.filename
          });
        });
      }
      
      // 更新图片数据
      updateData.images = JSON.stringify(finalImages);
    }
    
    item = await Item.update(updateData, { 
      where: { id },
      returning: true 
    });
    
    // 获取更新后的物品
    item = await Item.findByPk(id);
    
    res.status(200).json({
      success: true,
      message: '物品更新成功',
      data: item
    });
  } catch (error) {
    console.error('更新物品错误:', error);
    res.status(400).json({ success: false, message: '物品更新失败', error: error.message });
  }
};

// 删除物品
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找物品
    const item = await Item.findByPk(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: '物品不存在' });
    }
    
    // 检查权限（只有物品的发布者可以删除）
    if (item.user_id !== req.userId) {
      return res.status(403).json({ success: false, message: '无权删除此物品' });
    }
    
    // 删除图片文件
    if (item.images) {
      const images = JSON.parse(item.images);
      images.forEach(img => {
        const filePath = path.join(process.env.UPLOAD_PATH, img.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // 删除物品
    await item.destroy();
    
    res.status(200).json({
      success: true,
      message: '物品删除成功'
    });
  } catch (error) {
    console.error('删除物品错误:', error);
    res.status(500).json({ success: false, message: '物品删除失败', error: error.message });
  }
};

module.exports = {
  getAllItems,
  getUserItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};