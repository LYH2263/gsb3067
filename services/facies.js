/**
 * 沉积相判断算法模块。
 * 基于岩性分析结果和构造特征，通过关键词打分匹配最可能的沉积相类型。
 * 置信度采用 0.6 + 得分 * 0.1 的计算方式，并以 0.95 封顶。
 */

/**
 * @typedef {Object} FaciesItem
 * @property {string} name - 沉积相名称
 * @property {string} subtype - 沉积亚相名称
 * @property {string} environment - 沉积环境描述
 * @property {string} characteristics - 沉积特征描述
 * @property {string} oilPotential - 含油气潜力评价
 * @property {string[]} keywords - 用于匹配的关键词列表
 */

/**
 * @typedef {Object} LithologyPrimary
 * @property {string} name - 主要岩性名称
 */

/**
 * @typedef {Object} LithologyResult
 * @property {LithologyPrimary} primary - 主要岩性信息
 */

/**
 * @typedef {Object} StructureItem
 * @property {string} subtype - 构造子类名称
 * @property {string} description - 构造描述
 */

/**
 * @typedef {Object} FaciesResult
 * @property {FaciesItem} primary - 最佳匹配的沉积相
 * @property {number} confidence - 置信度（0-1，最高 0.95）
 * @property {FaciesItem[]} alternatives - 备选沉积相列表
 */

/**
 * 执行沉积相判断。
 * 基于岩性和构造特征，通过关键词打分匹配沉积相数据库，
 * 返回最佳匹配结果、置信度及备选方案。
 * 置信度计算公式：min(0.95, 0.6 + maxScore * 0.1)
 *
 * @param {LithologyResult} lithology - 岩性分析结果
 * @param {StructureItem[]} structures - 构造特征列表
 * @returns {FaciesResult} 沉积相分析结果
 */
function analyzeFacies(lithology, structures) {
  const faciesDatabase = [
    {
      name: '河流相',
      subtype: '河道砂体',
      environment: '河流主河道',
      characteristics: '砂岩为主，交错层理发育，冲刷面常见',
      oilPotential: '高',
      keywords: ['砂岩', '交错层理', '冲刷']
    },
    {
      name: '三角洲相',
      subtype: '三角洲前缘',
      environment: '河流入海（湖）处',
      characteristics: '砂泥互层，层理类型多样，生物扰动',
      oilPotential: '高',
      keywords: ['砂岩', '泥岩', '层理', '生物']
    },
    {
      name: '湖泊相',
      subtype: '深湖-半深湖',
      environment: '湖盆中心',
      characteristics: '泥岩、页岩为主，水平层理，富含有机质',
      oilPotential: '中-高（烃源岩）',
      keywords: ['泥岩', '页岩', '平行层理']
    },
    {
      name: '浊积相',
      subtype: '浊积扇',
      environment: '深水环境',
      characteristics: '砂泥互层，递变层理，鲍马序列',
      oilPotential: '中',
      keywords: ['砂岩', '泥岩', '层理']
    },
    {
      name: '滨岸相',
      subtype: '滨岸砂坝',
      environment: '海（湖）岸带',
      characteristics: '砂岩，波状层理，分选好',
      oilPotential: '中-高',
      keywords: ['砂岩', '波状层理']
    }
  ];

  let bestMatch = faciesDatabase[0];
  let maxScore = 0;

  faciesDatabase.forEach(facies => {
    let score = 0;

    if (facies.keywords.some(kw => lithology.primary.name.includes(kw))) {
      score += 3;
    }

    structures.forEach(struct => {
      if (facies.keywords.some(kw => struct.subtype.includes(kw) || struct.description.includes(kw))) {
        score += 2;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = facies;
    }
  });

  return {
    primary: bestMatch,
    confidence: Math.min(0.95, 0.6 + maxScore * 0.1),
    alternatives: faciesDatabase.filter(f => f.name !== bestMatch.name).slice(0, 2)
  };
}

module.exports = {
  analyzeFacies
};
