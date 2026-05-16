const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email.toLowerCase(), hashedPassword, name]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [id]
    );

    return result.rows[0];
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async updateProfile(userId, { name, email }) {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, email, name, updated_at',
      [name, email.toLowerCase(), userId]
    );

    return result.rows[0];
  }

  static async changePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
  }
}

module.exports = User;
