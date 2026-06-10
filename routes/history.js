/**
 * 历史记录路由模块
 * @module routes/history
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { getUploadDir } = require('../middlewares/upload');

const router = express.Router();

/**
 * GET /api/history
 * 获取最近上传的岩心图片历史记录（最多 20 条）
 */
router.get('/', (req, res) => {
  try {
    const uploadDir = getUploadDir();
    const files = fs.readdirSync(uploadDir);
    const history = files
      .filter(f => /\.(jpg|jpeg|png|gif|bmp)$/i.test(f))
      .map(f => {
        const stats = fs.statSync(path.join(uploadDir, f));
        return {
          filename: f,
          url: `/uploads/${f}`,
          uploadTime: stats.mtime
        };
      })
      .sort((a, b) => b.uploadTime - a.uploadTime)
      .slice(0, 20);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: '获取历史记录失败' });
  }
});

module.exports = router;
