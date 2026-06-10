/**
 * 构造分析算法模块。
 * 基于图像缓冲区分析岩心的构造特征，返回随机选取的1-3个构造类型。
 */

/**
 * @typedef {Object} StructureItem
 * @property {string} type - 构造大类（如层理构造、变形构造）
 * @property {string} subtype - 构造子类（如平行层理、交错层理）
 * @property {string} description - 构造特征描述及地质意义
 */

/**
 * 执行构造分析。
 * 基于图像缓冲区模拟分析岩心的构造特征，随机选取1-3个构造类型。
 *
 * @param {Buffer} imageBuffer - 岩心图像的二进制缓冲区
 * @returns {StructureItem[]} 识别出的构造特征列表
 */
function analyzeStructure(imageBuffer) {
  const structures = [
    { type: '层理构造', subtype: '平行层理', description: '层面平直，厚度均匀，指示稳定沉积环境' },
    { type: '层理构造', subtype: '交错层理', description: '层系倾斜交叉，指示水流或风力作用' },
    { type: '层理构造', subtype: '波状层理', description: '层面呈波状起伏，指示波浪作用' },
    { type: '变形构造', subtype: '断层', description: '岩层错断，可见断面和位移' },
    { type: '变形构造', subtype: '褶皱', description: '岩层弯曲变形，可见背斜或向斜' },
    { type: '生物构造', subtype: '生物扰动', description: '生物活动痕迹，破坏原生层理' },
    { type: '沉积构造', subtype: '冲刷面', description: '底部侵蚀面，指示水流冲刷' }
  ];

  const count = Math.floor(Math.random() * 3) + 1;
  const selected = [];
  const indices = new Set();

  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * structures.length));
  }

  indices.forEach(i => selected.push(structures[i]));

  return selected;
}

module.exports = {
  analyzeStructure
};
