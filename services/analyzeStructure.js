/**
 * Perform (simulated) sedimentary-structure analysis on an image buffer.
 *
 * Randomly picks 1-3 structure entries from a predefined catalogue
 * (bedding, deformation, biogenic, depositional structures). The random
 * selection preserves the original demonstrative behaviour.
 *
 * @param {Buffer} imageBuffer - Raw image buffer of the core photograph.
 * @returns {Array<{ type: string, subtype: string, description: string }>}
 *   A list of 1 to 3 detected sedimentary-structure descriptors.
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

module.exports = { analyzeStructure };
