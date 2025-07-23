require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 미들웨어 및 라우터 임포트
const {
  helmetConfig,
  corsOptions,
  apiLimiter,
  uploadLimiter,
  requestLogger,
  errorHandler
} = require('./middleware/security');

const accountingRoutes = require('./routes/accounting');

const app = express();
const PORT = process.env.PORT || 3000;

// 보안 미들웨어
app.use(helmetConfig);
app.use(cors(corsOptions));

// 기본 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/v1/accounting/process', uploadLimiter);

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API 라우터
app.use('/api/v1/accounting', accountingRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '이커머스 경영 경리 프로그램 API 서버가 정상적으로 실행 중입니다.',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '이커머스 경영 경리 프로그램 - 풀스택 개발자 실무테스트',
    endpoints: {
      health: 'GET /health',
      processTransactions: 'POST /api/v1/accounting/process',
      getRecords: 'GET /api/v1/accounting/records?companyId=com_1',
      getUnclassified: 'GET /api/v1/accounting/unclassified'
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '요청한 엔드포인트를 찾을 수 없습니다.'
  });
});

// 에러 핸들러 (마지막에 위치)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log('🚀 이커머스 경영 경리 프로그램 API 서버가 시작되었습니다.');
  console.log(`📍 서버 주소: http://localhost:${PORT}`);
  console.log(`📊 헬스 체크: http://localhost:${PORT}/health`);
  console.log(`📁 API 문서: http://localhost:${PORT}/`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM 신호를 받았습니다. 서버를 종료합니다.');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT 신호를 받았습니다. 서버를 종료합니다.');
  process.exit(0);
});

module.exports = app; 