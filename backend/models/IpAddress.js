const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const IpAddress = sequelize.define('IpAddress', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'ip_addresses',
  underscored: true, // 自动将驼峰命名转换为蛇形命名
  timestamps: true, // 启用时间戳
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['ip']
    },
    {
      fields: ['user_id']
    }
  ]
});

// 定义关联关系
IpAddress.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
User.hasMany(IpAddress, { as: 'ip_addresses', foreignKey: 'user_id' });

module.exports = IpAddress;