const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  // 物品类型：sell(出售)或buy(求购)
  item_type: {
    type: DataTypes.ENUM('sell', 'buy'),
    allowNull: false,
    defaultValue: 'sell'
  },
  // 物品分类
  category: {
    type: DataTypes.ENUM('电子产品', '办公用品', '生活用品', '服装鞋帽', '图书音像', '其他'),
    allowNull: false
  },
  // 物品名称
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // 物品用途
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  // 成色(几成新) - 仅用于出售的商品
  item_condition: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isValidCondition: function(value) {
        // 对于求购类型的物品，物品成色可以为空
        if (this.item_type === 'buy') return;
        
        // 对于出售类型的物品，需要验证成色
        if (value === null || value === undefined) {
          throw new Error('出售物品必须指定成色');
        }
        
        // 允许的值：10, 99, 95, 9, 85, 8, 7, 6
        const allowedValues = [6, 7, 8, 9, 10, 85, 95, 99];
        if (!allowedValues.includes(value)) {
          throw new Error('物品成色必须是允许的值之一');
        }
      }
    }
  },
  // 价格
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: function(value) {
        // 对于求购类型的物品，价格可以为空
        if (this.item_type === 'buy') return;
        
        // 对于出售类型的物品，价格必须大于等于0
        if (value === null || value === undefined || value < 0) {
          throw new Error('出售物品必须指定有效价格');
        }
      }
    }
  },
  // 是否已成交
  is_sold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // 查看次数
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 图片列表（JSON字符串格式存储）
  images: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  // 用户信息（关联用户模型）- 对于出售是卖家，对于求购是买家
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'items',
  timestamps: true,
  underscored: true, // 自动将驼峰命名转换为蛇形命名
  hooks: {
    beforeSave: (item) => {
      item.updated_at = new Date();
    }
  }
});

// 定义关联关系
Item.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(Item, { as: 'items', foreignKey: 'user_id' });

module.exports = Item;