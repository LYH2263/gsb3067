/**
 * 应用入口
 * 仅负责装配中间件、挂载路由并启动 HTTP 服务，
 * 业务逻辑全部下沉到 services/、middleware/、routes/ 目录。
 */

const express = require('express');
const cors = require('cors');

const analyzeRouter = require('./routes/analyze');
const historyRouter = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3067;

// 通用中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API 路由
app.use('/api/analyze', analyzeRouter);
app.use('/api/history', historyRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`岩心描述系统运行在 http://localhost:${PORT}`);
});
