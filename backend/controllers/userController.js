const User = require('../models/User');

// @desc    获取当前用户信息
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: '用户未登录' });
    }
    
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['expires_at']
      },
      include: [
        {
          model: require('../models/IpAddress'),
          as: 'ip_addresses',
          attributes: ['id', 'ip', 'created_at']
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

// @desc    更新用户信息
// @route   PUT /api/users/me
// @access  Private
const updateUser = async (req, res) => {
  try {
    const { name, employee_id, department, avatar } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: '用户未登录' });
    }
    
    // 验证必填字段
    if (!employee_id) {
      return res.status(400).json({ success: false, message: '工号不能为空' });
    }
    
    // 更新字段
    const updateFields = {};
    if (name) updateFields.name = name;
    if (employee_id) updateFields.employee_id = employee_id;
    if (department) updateFields.department = department;
    if (avatar) updateFields.avatar = avatar;
    
    // 保存更新
    await User.update(updateFields, { where: { id: req.user.id } });
    
    // 获取更新后的用户
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ['expires_at']
      },
      include: [
        {
          model: require('../models/IpAddress'),
          as: 'ip_addresses',
          attributes: ['id', 'ip', 'created_at']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      message: '用户信息更新成功',
      data: updatedUser
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(400).json({ success: false, message: '用户信息更新失败', error: error.message });
  }
};

// @desc    根据ID获取用户信息
// @route   GET /api/users/user/:id
// @access  Public
const getUserInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: {
        exclude: ['expires_at']
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误', error: error.message });
  }
};

module.exports = {
  getCurrentUser,
  updateUser,
  getUserInfoById
};