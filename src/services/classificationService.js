const db = require('../config/database');
const csv = require('csv-parser');
const fs = require('fs');

class ClassificationService {
  /**
   * CSV 파일과 규칙을 기반으로 거래 내역을 자동 분류
   */
  async processTransactions(csvFilePath, rulesData) {
    try {
      console.log('🔄 거래 내역 자동 분류 시작...');
      
      // 기존 거래 내역 삭제 (새로운 데이터로 교체)
      await this.clearExistingTransactions();
      
      // CSV 파일 파싱
      const transactions = await this.parseCSV(csvFilePath);
      
      // 규칙 기반 분류
      const classifiedTransactions = await this.classifyTransactions(transactions, rulesData);
      
      // 데이터베이스에 저장
      const result = await this.saveTransactions(classifiedTransactions);
      
      console.log(`✅ 분류 완료: ${result.length}건의 거래 내역이 처리되었습니다.`);
      
      return {
        success: true,
        totalProcessed: result.length,
        classified: result.filter(t => t.is_classified).length,
        unclassified: result.filter(t => !t.is_classified).length
      };
      
    } catch (error) {
      console.error('❌ 거래 내역 처리 중 오류:', error);
      throw error;
    }
  }

  /**
   * CSV 파일 파싱
   */
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push({
            transaction_date: new Date(data.거래일시),
            description: data.적요,
            deposit_amount: parseFloat(data.입금액) || 0,
            withdrawal_amount: parseFloat(data.출금액) || 0,
            balance: parseFloat(data.거래후잔액),
            branch: data.거래점
          });
        })
        .on('end', () => {
          console.log(`📊 CSV 파싱 완료: ${results.length}건의 거래 내역`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  /**
   * 규칙 기반 거래 내역 분류
   */
  async classifyTransactions(transactions, rulesData) {
    const classifiedTransactions = [];
    
    for (const transaction of transactions) {
      let classified = false;
      let companyId = null;
      let categoryId = null;
      
      // 각 회사의 규칙에 따라 분류
      for (const company of rulesData.companies) {
        for (const category of company.categories) {
          // 키워드 매칭 확인
          const isMatch = category.keywords.some(keyword => 
            transaction.description.includes(keyword)
          );
          
          if (isMatch) {
            companyId = company.company_id;
            categoryId = category.category_id;
            classified = true;
            break;
          }
        }
        
        if (classified) break;
      }
      
      classifiedTransactions.push({
        ...transaction,
        company_id: companyId,
        category_id: categoryId,
        is_classified: classified
      });
    }
    
    console.log(`🏷️ 분류 결과: ${classifiedTransactions.filter(t => t.is_classified).length}건 분류됨`);
    
    return classifiedTransactions;
  }

  /**
   * 분류된 거래 내역을 데이터베이스에 저장
   */
  async saveTransactions(transactions) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      const insertQuery = `
        INSERT INTO transactions 
        (company_id, transaction_date, description, deposit_amount, withdrawal_amount, balance, branch, category_id, is_classified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const results = [];
      
      for (const transaction of transactions) {
        const values = [
          transaction.company_id,
          transaction.transaction_date,
          transaction.description,
          transaction.deposit_amount,
          transaction.withdrawal_amount,
          transaction.balance,
          transaction.branch,
          transaction.category_id,
          transaction.is_classified
        ];
        
        const result = await client.query(insertQuery, values);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 기존 거래 내역 삭제
   */
  async clearExistingTransactions() {
    await db.query('DELETE FROM transactions');
    console.log('🗑️ 기존 거래 내역 삭제 완료');
  }

  /**
   * 회사별 분류 결과 조회
   */
  async getRecordsByCompany(companyId) {
    const query = `
      SELECT 
        t.id,
        t.transaction_date,
        t.description,
        t.deposit_amount,
        t.withdrawal_amount,
        t.balance,
        t.branch,
        t.is_classified,
        c.id as category_id,
        c.name as category_name,
        comp.name as company_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN companies comp ON t.company_id = comp.id
      WHERE t.company_id = $1
      ORDER BY t.transaction_date DESC
    `;
    
    const result = await db.query(query, [companyId]);
    return result.rows;
  }

  /**
   * 미분류 거래 내역 조회
   */
  async getUnclassifiedRecords() {
    const query = `
      SELECT 
        t.id,
        t.transaction_date,
        t.description,
        t.deposit_amount,
        t.withdrawal_amount,
        t.balance,
        t.branch,
        t.is_classified
      FROM transactions t
      WHERE t.is_classified = false OR t.company_id IS NULL
      ORDER BY t.transaction_date DESC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = new ClassificationService(); 