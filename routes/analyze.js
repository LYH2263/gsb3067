/**
 * /api/analyze 路由
 * 接收上传的岩心图片，依次调用岩性、构造、沉积相分析模块，
 * 返回结构化分析结果与图片元数据。
 */

const express = require('express');
const fs = require('fs');
const sharp = require('sharp');

const { upload } = require('../middleware/upload');
const { analyzeLithology } = require('../services/lithology');
const { analyzeStructure } = require('../services/structure');
const { analyzeFacies } = require('../services/facies');

const router = express.Router();

/**
 * 创建 /api/analyze 路由处理器。
 * 该路由：
 *  1) 通过 multer 接收单个 image 字段；
 *  2) 读取图片并使用 sharp 解析尺寸；
 *  3) 调用三套分析算法并整合返回结果。
 *
 * @returns {import('express').Router} 已挂载 POST / 端点的 Express 路由实例。
 */
function createAnalyzeRouter() {
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '请上传图片文件' });
      }

      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);

      // 获取图片元数据
      const metadata = await sharp(imageBuffer).metadata();

      // 执行分析
      const lithology = analyzeLithology(imageBuffer);
      const structures = analyzeStructure(imageBuffer);
      const facies = analyzeFacies(lithology, structures);

      // 返回分析结果
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

  return router;
}

module.exports = createAnalyzeRouter();
