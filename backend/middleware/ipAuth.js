const User = require('../models/User');
const IpAddress = require('../models/IpAddress');
require('dotenv').config();

const ipAuth = async (req, res, next) => {
  try {
    // 获取客户端IP（使用express内置的方式）
    let clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // 清理IP地址，移除前缀
    if (clientIp && (clientIp.startsWith('::ffff:') || clientIp.startsWith('::1'))) {
      clientIp = clientIp.startsWith('::ffff:') ? clientIp.slice(7) : '127.0.0.1';
    }
    
    // 查找IP地址对应的记录
    let ipRecord = await IpAddress.findOne({
      where: { ip: clientIp },
      include: [{ model: User, as: 'user' }]
    });
    
    let user;
    
    if (!ipRecord) {
      // 创建新用户
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + (parseInt(process.env.IP_EXPIRY_DAYS) || 30));
      
      user = await User.create({
        last_login: new Date(),
        expires_at,
        status: 'active'
      });
      
      // 创建IP地址记录
      await IpAddress.create({
        ip: clientIp,
        user_id: user.id
      });
      
      console.log(`新用户创建成功: IP=${clientIp}`);
    } else {
      user = ipRecord.user;
      // 更新最后登录时间和过期时间
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + (parseInt(process.env.IP_EXPIRY_DAYS) || 30));
      
      await user.update({
        last_login: new Date(),
        expires_at
      });
      console.log(`用户登录成功: IP=${clientIp}`);
    }
    
    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('IP鉴权错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = ipAuth;