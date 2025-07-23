const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate Limiting 설정
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// API 요청 제한
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15분
  100, // 최대 100회 요청
  '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
);

// 파일 업로드 제한
const uploadLimiter = createRateLimiter(
  15 * 60 * 1000, // 15분
  10, // 최대 10회 업로드
  '파일 업로드 횟수가 제한을 초과했습니다.'
);

// Helmet 보안 설정
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS 설정
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// 에러 핸들링 미들웨어
const errorHandler = (err, req, res, next) => {
  console.error('❌ 에러 발생:', err);
  
  // Multer 에러 처리
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: '파일 크기가 너무 큽니다.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: '업로드할 수 있는 파일 개수를 초과했습니다.'
    });
  }
  
  // 기본 에러 응답
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '서버 내부 오류가 발생했습니다.'
  });
};

module.exports = {
  helmetConfig,
  corsOptions,
  apiLimiter,
  uploadLimiter,
  requestLogger,
  errorHandler
}; 