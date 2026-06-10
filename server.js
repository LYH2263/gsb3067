const express = require('express');
const cors = require('cors');

const apiRouter = require('./routes/api');
const { uploadDir } = require('./middlewares/upload');

const app = express();
const PORT = process.env.PORT || 3067;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

app.use('/api', apiRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`岩心描述系统运行在 http://localhost:${PORT}`);
});
