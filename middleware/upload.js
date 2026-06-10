/**
 * 上传中间件配置
 * 负责创建上传目录、配置 multer 的磁盘存储与文件过滤策略，
 * 并对外暴露已构造好的 multer 实例及上传目录路径。
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 创建上传目录（与重构前位置保持一致：项目根目录下的 uploads/）
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片格式文件'));
    }
  }
});

module.exports = { upload, uploadDir };
