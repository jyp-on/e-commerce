const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const classificationService = require('../services/classificationService');

const router = express.Router();

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'csvFile' && (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv'))) {
      cb(null, true);
    } else if (file.fieldname === 'rulesFile' && (file.mimetype === 'application/json' || file.originalname.endsWith('.json'))) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
  }
});

/**
 * POST /api/v1/accounting/process
 * 자동 회계 처리 API
 */
router.post('/process', upload.fields([
  { name: 'csvFile', maxCount: 1 },
  { name: 'rulesFile', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📥 자동 회계 처리 요청 받음');
    
    // 파일 검증
    if (!req.files.csvFile || !req.files.rulesFile) {
      return res.status(400).json({
        success: false,
        error: 'CSV 파일과 규칙 파일이 모두 필요합니다.'
      });
    }
    
    const csvFile = req.files.csvFile[0];
    const rulesFile = req.files.rulesFile[0];
    
    // 규칙 파일 파싱
    let rulesData;
    try {
      const rulesContent = fs.readFileSync(rulesFile.path, 'utf8');
      rulesData = JSON.parse(rulesContent);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: '규칙 파일 형식이 올바르지 않습니다.'
      });
    }
    
    // 거래 내역 처리
    const result = await classificationService.processTransactions(csvFile.path, rulesData);
    
    // 임시 파일 정리
    fs.unlinkSync(csvFile.path);
    fs.unlinkSync(rulesFile.path);
    
    res.json({
      success: true,
      message: '거래 내역 자동 분류가 완료되었습니다.',
      data: result
    });
    
  } catch (error) {
    console.error('❌ 자동 회계 처리 오류:', error);
    
    // 임시 파일 정리
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: '거래 내역 처리 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/accounting/records
 * 사업체별 분류 결과 조회 API
 */
router.get('/records', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'companyId 파라미터가 필요합니다.'
      });
    }
    
    console.log(`📊 회사별 거래 내역 조회: ${companyId}`);
    
    const records = await classificationService.getRecordsByCompany(companyId);
    
    // 통계 계산
    const totalAmount = records.reduce((sum, record) => {
      return sum + parseFloat(record.deposit_amount || 0) + parseFloat(record.withdrawal_amount || 0);
    }, 0);
    
    const classifiedCount = records.filter(record => record.is_classified).length;
    const unclassifiedCount = records.filter(record => !record.is_classified).length;
    
    res.json({
      success: true,
      data: {
        companyId,
        records,
        statistics: {
          totalRecords: records.length,
          classifiedCount,
          unclassifiedCount,
          totalAmount: totalAmount.toFixed(2)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ 거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '거래 내역 조회 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

/**
 * GET /api/v1/accounting/unclassified
 * 미분류 거래 내역 조회 API
 */
router.get('/unclassified', async (req, res) => {
  try {
    console.log('📊 미분류 거래 내역 조회');
    
    const records = await classificationService.getUnclassifiedRecords();
    
    res.json({
      success: true,
      data: {
        records,
        count: records.length
      }
    });
    
  } catch (error) {
    console.error('❌ 미분류 거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '미분류 거래 내역 조회 중 오류가 발생했습니다.',
      details: error.message
    });
  }
});

module.exports = router; 