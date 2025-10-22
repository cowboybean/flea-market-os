const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  employee_id: {
    type: DataTypes.STRING
  },
  name: {
    type: DataTypes.STRING
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  last_login: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  underscored: true, // 自动将驼峰命名转换为蛇形命名
  indexes: [
    {
      fields: ['expires_at']
    }
  ],
  hooks: {
    beforeSave: (user) => {
      user.last_login = new Date();
    }
  }
});

module.exports = User;