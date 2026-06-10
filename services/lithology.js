/**
 * 岩性识别服务
 * 基于图像数据返回主要岩性及次要岩性候选项。
 * 当前实现为模拟逻辑，保留与重构前一致的随机抽取行为。
 */

const lithologies = [
  { name: '砂岩', confidence: 0.85, color: '浅黄色至灰白色', grain: '中粒-细粒', features: '分选好，磨圆度中等' },
  { name: '泥岩', confidence: 0.75, color: '灰色至深灰色', grain: '泥质', features: '层理发育，含有机质' },
  { name: '灰岩', confidence: 0.65, color: '灰白色', grain: '隐晶质', features: '致密，可见化石碎屑' },
  { name: '砾岩', confidence: 0.55, color: '杂色', grain: '粗粒-砾石', features: '砾石成分复杂，胶结疏松' },
  { name: '页岩', confidence: 0.70, color: '深灰色至黑色', grain: '泥质', features: '页理发育，易剥离' }
];

/**
 * 对岩心图片执行岩性识别。
 *
 * @param {Buffer} imageBuffer - 岩心图片的二进制数据。
 * @returns {{primary: {name: string, confidence: number, color: string, grain: string, features: string},
 *           secondary: Array<{name: string, confidence: number, color: string, grain: string, features: string}>}}
 *          岩性识别结果，包含主要岩性与至多两种次要岩性候选。
 */
function analyzeLithology(imageBuffer) {
  // 模拟岩性识别：基于图像特征分析
  const primaryIndex = Math.floor(Math.random() * lithologies.length);
  const primary = lithologies[primaryIndex];

  return {
    primary: primary,
    secondary: lithologies.filter((_, i) => i !== primaryIndex).slice(0, 2)
  };
}

module.exports = { analyzeLithology };
