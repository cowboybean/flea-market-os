const multer = require('multer');
const path = require('path');
require('dotenv').config();

// 确保上传目录存在
const fs = require('fs');
const uploadDir = process.env.UPLOAD_PATH || './backend/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const mimeTypeMatch = allowedTypes.test(file.mimetype);
  const extnameMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimeTypeMatch && extnameMatch) {
    return cb(null, true);
  }
  
  cb(new Error('只允许上传图片文件 (JPEG, JPG, PNG, GIF)'));
};

// 配置multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024 // 默认10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;