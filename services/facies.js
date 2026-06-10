/**
 * 沉积相判断模块
 * @module services/facies
 */

/**
 * 基于岩性和构造特征判断沉积相
 * @param {{ primary: { name: string, confidence: number, color: string, grain: string, features: string }, secondary: Array }} lithology - 岩性分析结果
 * @param {Array<{ type: string, subtype: string, description: string }>} structures - 构造分析结果
 * @returns {{ primary: Object, confidence: number, alternatives: Array<Object> }}
 *   返回主要沉积相、置信度（封顶 0.95）及最多两个备选沉积相
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

module.exports = { analyzeFacies };
