-- 회사 테이블
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    company_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    keywords JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 거래 내역 테이블
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50),
    transaction_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    deposit_amount DECIMAL(15,2) DEFAULT 0,
    withdrawal_amount DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) NOT NULL,
    branch VARCHAR(100),
    category_id VARCHAR(50),
    is_classified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

-- Row Level Security 활성화
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 기본 회사 데이터 삽입
INSERT INTO companies (id, name) VALUES 
    ('com_1', 'A 커머스'),
    ('com_2', 'B 커머스')
ON CONFLICT (id) DO NOTHING;

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (id, company_id, name, keywords) VALUES 
    ('cat_101', 'com_1', '매출', '["네이버페이", "쿠팡"]'),
    ('cat_102', 'com_1', '식비', '["배달의민족", "김밥천국"]'),
    ('cat_103', 'com_1', '사무용품비', '["오피스디포"]'),
    ('cat_201', 'com_2', '교통비', '["카카오 T", "택시"]'),
    ('cat_202', 'com_2', '통신비', '["KT", "SKT"]'),
    ('cat_203', 'com_2', '지급수수료', '["우체국", "등기"]'),
    ('cat_204', 'com_2', '복리후생비', '["스타벅스"]')
ON CONFLICT (id) DO NOTHING; 