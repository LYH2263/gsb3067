const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { upload, getUploadDir } = require('../config/upload');
const { analyzeLithology } = require('../services/lithology');
const { analyzeStructure } = require('../services/structure');
const { analyzeFacies } = require('../services/facies');

const router = express.Router();

/**
 * 上传并分析岩心图片。
 * 接收单张图片上传，执行岩性、构造、沉积相三重分析，返回完整分析结果。
 *
 * @route POST /api/analyze
 * @param {Express.Request} req - Express 请求对象
 * @param {Express.Response} res - Express 响应对象
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);

    const metadata = await sharp(imageBuffer).metadata();

    const lithology = analyzeLithology(imageBuffer);
    const structures = analyzeStructure(imageBuffer);
    const facies = analyzeFacies(lithology, structures);

    res.json({
      success: true,
      image: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        }
      },
      analysis: {
        lithology: lithology,
        structures: structures,
        facies: facies,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('分析错误:', error);
    res.status(500).json({ error: '图片分析失败，请重试' });
  }
});

/**
 * 获取历史上传记录。
 * 读取上传目录中的图片文件，按修改时间倒序返回最近 20 条记录。
 *
 * @route GET /api/history
 * @param {Express.Request} req - Express 请求对象
 * @param {Express.Response} res - Express 响应对象
 */
router.get('/history', (req, res) => {
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
