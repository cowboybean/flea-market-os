const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 创建 Sequelize 实例
const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'flea_market',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// 测试数据库连接
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected...');
    
    // 自动同步模型到数据库
    await sequelize.sync({ alter: true });
    console.log('Models synchronized with database');
  } catch (error) {
    console.error('MySQL Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};