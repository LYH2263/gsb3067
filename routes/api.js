const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const { upload, uploadDir } = require('../middlewares/upload');
const { analyzeLithology } = require('../services/analyzeLithology');
const { analyzeStructure } = require('../services/analyzeStructure');
const { analyzeFacies } = require('../services/analyzeFacies');

const router = express.Router();

/**
 * POST /api/analyze
 * Accept a multipart/form-data upload (field name `image`), run the three
 * analysis pipelines (lithology, structure, facies), extract image metadata
 * via sharp, and return the aggregated result as JSON.
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
 * GET /api/history
 * List the most recently uploaded images (up to 20) stored in `uploads/`,
 * sorted by modification time (newest first).
 */
router.get('/history', (req, res) => {
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

module.exports = router;
