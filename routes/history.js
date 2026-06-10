/**
 * /api/history 路由
 * 列出 uploads 目录下最近上传的图片文件（按修改时间倒序，最多 20 条）。
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const { uploadDir } = require('../middleware/upload');

const router = express.Router();

/**
 * 创建 /api/history 路由处理器。
 * 该路由读取上传目录下的图片文件，按修改时间倒序返回最近 20 条记录。
 *
 * @returns {import('express').Router} 已挂载 GET / 端点的 Express 路由实例。
 */
function createHistoryRouter() {
  router.get('/', (req, res) => {
    try {
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

  return router;
}

module.exports = createHistoryRouter();
