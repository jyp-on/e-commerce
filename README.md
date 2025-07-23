# 실행 및 테스트 가이드

## 🚀 기술 스택

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Container**: Docker + Docker Compose
- **Security**: Helmet, Rate Limiting, CORS

## 📋 구현된 기능

### 1. 핵심 로직 구현 코드

#### ✅ 기능 1: 자동 회계 처리 API
- **엔드포인트**: `POST /api/v1/accounting/process`
- **기능**: CSV 파일과 JSON 규칙 파일을 입력받아 거래 내역을 자동 분류
- **입력**: `input-files/bank_transactions.csv`, `input-files/rules.json`
- **출력**: 분류 결과 통계

#### ✅ 기능 2: 사업체별 분류 결과 조회 API
- **엔드포인트**: `GET /api/v1/accounting/records?companyId=com_1`
- **기능**: 특정 회사의 거래 내역과 분류된 계정과목 정보 조회
- **특이사항**: 미분류 거래는 별도 처리

## 🛠️ 설치 및 실행

### 1. Docker Compose로 실행 (권장)

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd e-commerce

# 2. 환경 변수 설정
cp env.example .env

# 3. Docker Compose로 실행
docker-compose up --build

# 4. 백그라운드 실행
docker-compose up -d --build

# 5. 서버 상태 확인
curl http://localhost:3000/health
```

### 2. 로컬 개발 환경

```bash
# 1. 의존성 설치
npm install

# 2. PostgreSQL 설치 및 실행
# (PostgreSQL이 로컬에 설치되어 있어야 함)

# 3. 환경 변수 설정
cp env.example .env

# 4. 데이터베이스 마이그레이션
npm run migrate

# 5. 개발 서버 실행
npm run dev
```

### 3. 환경 변수 설정 (.env 파일)

```bash
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=password

# 서버 설정
PORT=3000
NODE_ENV=development

# 보안 설정
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. 필수 파일 확인

API 실행 전 다음 파일들이 존재하는지 확인하세요:

```bash
# 입력 파일 확인
ls -la input-files/
# - bank_transactions.csv (은행 거래 내역)
# - rules.json (분류 규칙)

# 업로드 디렉토리 생성
mkdir -p uploads
```

## 📡 API 테스트

### 1. 서버 상태 확인

```bash
curl http://localhost:3000/health
```

**예상 응답:**
```json
{
  "success": true,
  "message": "이커머스 경영 경리 프로그램 API 서버가 정상적으로 실행 중입니다.",
  "timestamp": "2025-07-23T11:42:45.536Z",
  "version": "1.0.0"
}
```

### 2. 자동 회계 처리 API 테스트

```bash
curl -X POST http://localhost:3000/api/v1/accounting/process \
  -F "csvFile=@input-files/bank_transactions.csv" \
  -F "rulesFile=@input-files/rules.json"
```

**예상 응답:**
```json
{
  "success": true,
  "message": "거래 내역 자동 분류가 완료되었습니다.",
  "data": {
    "success": true,
    "totalProcessed": 9,
    "classified": 8,
    "unclassified": 1
  }
}
```

### 3. 사업체별 분류 결과 조회

```bash
# A 커머스 조회
curl "http://localhost:3000/api/v1/accounting/records?companyId=com_1"

# B 커머스 조회
curl "http://localhost:3000/api/v1/accounting/records?companyId=com_2"
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "companyId": "com_1",
    "records": [
      {
        "id": 44,
        "transaction_date": "2025-07-22T11:55:10.000Z",
        "description": "오피스디포(주)",
        "deposit_amount": "0.00",
        "withdrawal_amount": "78000.00",
        "balance": "1171000.00",
        "branch": "강남지점",
        "is_classified": true,
        "category_id": "cat_103",
        "category_name": "사무용품비",
        "company_name": "A 커머스"
      },
      {
        "id": 42,
        "transaction_date": "2025-07-21T14:20:40.000Z",
        "description": "(주)쿠팡",
        "deposit_amount": "250000.00",
        "withdrawal_amount": "0.00",
        "balance": "1349000.00",
        "branch": "온라인",
        "is_classified": true,
        "category_id": "cat_101",
        "category_name": "매출",
        "company_name": "A 커머스"
      }
    ],
    "statistics": {
      "totalRecords": 5,
      "classifiedCount": 5,
      "unclassifiedCount": 0,
      "totalAmount": "511000.00"
    }
  }
}
```

### 4. 미분류 거래 내역 조회

```bash
curl http://localhost:3000/api/v1/accounting/unclassified
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 43,
        "transaction_date": "2025-07-21T21:00:15.000Z",
        "description": "개인용도 이체",
        "deposit_amount": "0.00",
        "withdrawal_amount": "100000.00",
        "balance": "1249000.00",
        "branch": "강남지점",
        "is_classified": false
      }
    ],
    "count": 1
  }
}
```

### 5. 에러 응답 예시

**잘못된 파일 형식:**
```bash
curl -X POST http://localhost:3000/api/v1/accounting/process \
  -F "csvFile=@input-files/wrong.txt"
```

**응답:**
```json
{
  "success": false,
  "error": "지원하지 않는 파일 형식입니다. CSV 또는 JSON 파일만 업로드 가능합니다."
}
```

**존재하지 않는 회사 조회:**
```bash
curl "http://localhost:3000/api/v1/accounting/records?companyId=invalid_id"
```

**응답:**
```json
{
  "success": false,
  "error": "해당 회사를 찾을 수 없습니다."
}
```

## 🔧 문제 해결

### 1. Docker 관련 문제

**Docker 데몬이 실행되지 않는 경우:**
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

**포트 충돌이 발생하는 경우:**
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :5432

# Docker Compose 포트 변경
# docker-compose.yml에서 포트 매핑 수정
```

### 2. 데이터베이스 연결 문제

**PostgreSQL 컨테이너에 직접 접속:**
```bash
# 컨테이너 내부 접속
docker-compose exec postgres psql -U postgres -d ecommerce_db

# 테이블 확인
\dt

# 데이터 확인
SELECT * FROM companies;
SELECT * FROM transactions LIMIT 5;
```

### 3. 파일 업로드 문제

**파일 권한 문제:**
```bash
# 업로드 디렉토리 권한 설정
chmod 755 uploads/
chmod 644 input-files/*

**파일 형식 확인:**
```bash
# CSV 파일 인코딩 확인
file input-files/bank_transactions.csv

# JSON 파일 유효성 확인
cat input-files/rules.json | jq .
```



## 🔒 보안 기능

기본적인 보안 기능이 구현되어 있으며, 상세한 보안 아키텍처는 [설계 및 보안 아키텍처 기술서](./docs/ARCHITECTURE.md)를 참조하세요.

**구현된 보안 기능:**
- ✅ **Helmet**: 보안 헤더 설정
- ✅ **Rate Limiting**: API 요청 제한
- ✅ **CORS**: Cross-Origin 요청 제어
- ✅ **파일 업로드 검증**: CSV, JSON 파일만 허용
- ✅ **SQL Injection 방지**: Parameterized Queries
- ✅ **에러 핸들링**: 민감한 정보 노출 방지

## 🧪 테스트 데이터

### 기본 회사 데이터
- **A 커머스** (com_1): 매출, 식비, 사무용품비
- **B 커머스** (com_2): 교통비, 통신비, 지급수수료, 복리후생비

### 분류 규칙 예시
```json
{
  "companies": [
    {
      "company_id": "com_1",
      "company_name": "A 커머스",
      "categories": [
        { "category_id": "cat_101", "category_name": "매출", "keywords": ["네이버페이", "쿠팡"] },
        { "category_id": "cat_102", "category_name": "식비", "keywords": ["배달의민족", "김밥천국"] },
        { "category_id": "cat_103", "category_name": "사무용품비", "keywords": ["오피스디포"] }
      ]
    }
  ]
}
```

## 📁 프로젝트 구조

```
├── src/                       # 소스 코드
├── input-files/               # 입력 파일 (CSV, JSON)
├── uploads/                   # 업로드 파일 저장소
├── docs/                      # 문서 (ARCHITECTURE.md, AI_USAGE.md)
├── docker-compose.yml         # Docker Compose 설정
├── Dockerfile                 # Docker 이미지 설정
└── package.json               # 프로젝트 의존성
```

## 📚 추가 문서

- **[설계 및 보안 아키텍처 기술서](./docs/ARCHITECTURE.md)**: 시스템 설계, 보안 방안, 확장 방안
- **[AI 활용 기록](./docs/AI_USAGE.md)**: AI 도구 활용 과정 및 의사결정 기록