const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    console.log('Running migration...');
    await pool.query(sql);
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
