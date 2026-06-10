const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3067;

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片格式文件'));
    }
  }
});

// 岩性识别算法
function analyzeLithology(imageBuffer) {
  // 模拟岩性识别：基于图像特征分析
  const lithologies = [
    { name: '砂岩', confidence: 0.85, color: '浅黄色至灰白色', grain: '中粒-细粒', features: '分选好，磨圆度中等' },
    { name: '泥岩', confidence: 0.75, color: '灰色至深灰色', grain: '泥质', features: '层理发育，含有机质' },
    { name: '灰岩', confidence: 0.65, color: '灰白色', grain: '隐晶质', features: '致密，可见化石碎屑' },
    { name: '砾岩', confidence: 0.55, color: '杂色', grain: '粗粒-砾石', features: '砾石成分复杂，胶结疏松' },
    { name: '页岩', confidence: 0.70, color: '深灰色至黑色', grain: '泥质', features: '页理发育，易剥离' }
  ];

  // 随机选择主要岩性（实际应用中应使用图像识别AI模型）
  const primaryIndex = Math.floor(Math.random() * lithologies.length);
  const primary = lithologies[primaryIndex];

  return {
    primary: primary,
    secondary: lithologies.filter((_, i) => i !== primaryIndex).slice(0, 2)
  };
}

// 构造分析算法
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

  // 随机选择1-3个构造特征
  const count = Math.floor(Math.random() * 3) + 1;
  const selected = [];
  const indices = new Set();

  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * structures.length));
  }

  indices.forEach(i => selected.push(structures[i]));

  return selected;
}

// 沉积相判断算法
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

  // 基于岩性和构造特征匹配沉积相
  let bestMatch = faciesDatabase[0];
  let maxScore = 0;

  faciesDatabase.forEach(facies => {
    let score = 0;

    // 检查岩性匹配
    if (facies.keywords.some(kw => lithology.primary.name.includes(kw))) {
      score += 3;
    }

    // 检查构造匹配
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

// API路由：上传并分析岩心图片
app.post('/api/analyze', upload.single('image'), async (req, res) => {
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

// 获取历史记录
app.get('/api/history', (req, res) => {
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`岩心描述系统运行在 http://localhost:${PORT}`);
});
