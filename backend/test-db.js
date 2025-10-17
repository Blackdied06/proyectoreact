const pool = require('./db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1+1 AS result');
    console.log('DB ok:', rows);
    process.exit(0);
  } catch (err) {
    console.error('Error DB:', err);
    process.exit(1);
  }
})();
