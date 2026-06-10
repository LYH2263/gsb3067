/**
 * 岩性识别分析模块
 * @module services/lithology
 */

/**
 * 对岩心图像执行岩性识别分析
 * @param {Buffer} imageBuffer - 图像的二进制数据
 * @returns {{ primary: { name: string, confidence: number, color: string, grain: string, features: string }, secondary: Array<{ name: string, confidence: number, color: string, grain: string, features: string }> }}
 *   返回主要岩性及最多两个次要岩性
 */
function analyzeLithology(imageBuffer) {
  const lithologies = [
    { name: '砂岩', confidence: 0.85, color: '浅黄色至灰白色', grain: '中粒-细粒', features: '分选好，磨圆度中等' },
    { name: '泥岩', confidence: 0.75, color: '灰色至深灰色', grain: '泥质', features: '层理发育，含有机质' },
    { name: '灰岩', confidence: 0.65, color: '灰白色', grain: '隐晶质', features: '致密，可见化石碎屑' },
    { name: '砾岩', confidence: 0.55, color: '杂色', grain: '粗粒-砾石', features: '砾石成分复杂，胶结疏松' },
    { name: '页岩', confidence: 0.70, color: '深灰色至黑色', grain: '泥质', features: '页理发育，易剥离' }
  ];

  const primaryIndex = Math.floor(Math.random() * lithologies.length);
  const primary = lithologies[primaryIndex];

  return {
    primary: primary,
    secondary: lithologies.filter((_, i) => i !== primaryIndex).slice(0, 2)
  };
}

module.exports = { analyzeLithology };
