const pool = require('../config/database');

class Transaction {
  static async create(userId, { type, amount, date, description, category, notes }) {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, date, description, category, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, type, amount, date, description, category, notes || null]
    );

    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    const params = [userId];
    let paramIndex = 2;

    if (filters.type) {
      query += ` AND type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' ORDER BY date DESC, id DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return result.rows[0];
  }

  static async update(id, userId, updates) {
    const { type, amount, date, description, category, notes } = updates;

    const result = await pool.query(
      `UPDATE transactions
       SET type = $1, amount = $2, date = $3, description = $4, category = $5, notes = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [type, amount, date, description, category, notes || null, id, userId]
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    return result.rows[0];
  }

  static async getStats(userId, startDate, endDate) {
    const result = await pool.query(
      `SELECT
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
         COUNT(*) as total_transactions
       FROM transactions
       WHERE user_id = $1
         AND date >= $2
         AND date <= $3`,
      [userId, startDate, endDate]
    );

    return result.rows[0];
  }

  static async getCategoryBreakdown(userId, type, startDate, endDate) {
    const result = await pool.query(
      `SELECT category, SUM(amount) as total
       FROM transactions
       WHERE user_id = $1 AND type = $2 AND date >= $3 AND date <= $4
       GROUP BY category
       ORDER BY total DESC`,
      [userId, type, startDate, endDate]
    );

    return result.rows;
  }

  static async getMonthlyTrend(userId, months = 6) {
    const result = await pool.query(
      `SELECT
         TO_CHAR(date, 'YYYY-MM') as month,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
       FROM transactions
       WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '${months} months'
       GROUP BY TO_CHAR(date, 'YYYY-MM')
       ORDER BY month`,
      [userId]
    );

    return result.rows;
  }
}

module.exports = Transaction;
