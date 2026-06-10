/**
 * 岩性识别算法模块。
 * 基于图像缓冲区分析岩心的岩性组成，返回主岩性和次要岩性。
 */

/**
 * @typedef {Object} LithologyItem
 * @property {string} name - 岩性名称
 * @property {number} confidence - 置信度（0-1）
 * @property {string} color - 颜色描述
 * @property {string} grain - 粒度描述
 * @property {string} features - 结构特征描述
 */

/**
 * @typedef {Object} LithologyResult
 * @property {LithologyItem} primary - 主要岩性
 * @property {LithologyItem[]} secondary - 次要岩性列表
 */

/**
 * 执行岩性识别分析。
 * 基于图像缓冲区模拟分析岩心的岩性组成，返回主岩性和前两个次要岩性。
 *
 * @param {Buffer} imageBuffer - 岩心图像的二进制缓冲区
 * @returns {LithologyResult} 岩性分析结果，包含主岩性和次要岩性
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

module.exports = {
  analyzeLithology
};
