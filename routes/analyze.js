/**
 * 图片上传与分析路由模块
 * @module routes/analyze
 */

const express = require('express');
const fs = require('fs');
const sharp = require('sharp');
const { uploadSingle } = require('../middlewares/upload');
const { analyzeLithology } = require('../services/lithology');
const { analyzeStructure } = require('../services/structure');
const { analyzeFacies } = require('../services/facies');

const router = express.Router();

/**
 * POST /api/analyze
 * 上传岩心图片并执行岩性、构造、沉积相分析
 */
router.post('/', uploadSingle, async (req, res) => {
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

module.exports = router;
