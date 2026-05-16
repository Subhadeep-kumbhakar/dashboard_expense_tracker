const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../financeai.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(-1);
  }
  console.log('✅ SQLite database connected successfully');
});

// Convert PostgreSQL-style queries to SQLite
const query = (text, params) => {
  return new Promise((resolve, reject) => {
    // Convert $1, $2 to ? placeholders
    const sqliteQuery = text.replace(/\$\d+/g, '?');

    if (text.toLowerCase().includes('returning')) {
      // Handle RETURNING clause for INSERT/UPDATE/DELETE
      db.run(sqliteQuery, params, function(err) {
        if (err) reject(err);
        else {
          // Get the last inserted/updated row
          db.get('SELECT * FROM ' + text.match(/(?:INTO|UPDATE)\s+(\w+)/i)[1] + ' WHERE rowid = ?', [this.lastID], (err, row) => {
            if (err) reject(err);
            else resolve({ rows: row ? [row] : [], rowCount: this.changes });
          });
        }
      });
    } else if (text.toLowerCase().trim().startsWith('select')) {
      db.all(sqliteQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
      });
    } else {
      db.run(sqliteQuery, params, function(err) {
        if (err) reject(err);
        else resolve({ rows: [], rowCount: this.changes });
      });
    }
  });
};

module.exports = { query, db };
