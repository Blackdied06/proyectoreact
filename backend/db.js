const mysql = require('mysql2/promise');
require('dotenv').config();

// Strategy: try multiple host/port combos; if DB doesn't exist, create it and connect.
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'inventario_db';
const DB_PORT = Number(process.env.DB_PORT || 3306);

async function tryConnect(host, port){
  const cfg = { host, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, port, waitForConnections: true, connectionLimit: 10, queueLimit: 0, connectTimeout: 8000 };
  const pool = mysql.createPool(cfg);
  try{
    await pool.query('SELECT 1');
    console.log(`Pool conectado a base ${DB_NAME} en ${host}:${port}`);
    return pool;
  }catch(err){
    // Si la base no existe aún, intente crearla y reconectar
    if(err && err.code === 'ER_BAD_DB_ERROR'){
      console.log(`Base ${DB_NAME} no existe en ${host}:${port}. Intentando crear...`);
      const conn = await mysql.createConnection({ host, user: DB_USER, password: DB_PASSWORD, port, connectTimeout: 8000 });
      try{
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
        console.log('Base creada (o ya existía):', DB_NAME);
      } finally { await conn.end(); }
      const pool2 = mysql.createPool(cfg);
      await pool2.query('SELECT 1');
      console.log(`Pool conectado (post-creation) a ${DB_NAME} en ${host}:${port}`);
      return pool2;
    }
    throw err;
  }
}

async function createPoolWithDb(){
  const hostCandidates = [DB_HOST, '127.0.0.1', 'localhost'].filter(Boolean);
  const portCandidates = [DB_PORT, 3306, 3307].filter(p => Number(p) === Number(p));
  const tried = new Set();
  let lastErr = null;
  for(const h of hostCandidates){
    for(const p of portCandidates){
      const key = `${h}:${p}`;
      if(tried.has(key)) continue; tried.add(key);
      try{
        console.log(`Intentando conectar MySQL en ${key} ...`);
        const pool = await tryConnect(h, Number(p));
        return pool;
      }catch(err){
        lastErr = err;
        if(err && (err.code === 'ER_ACCESS_DENIED_ERROR')){
          console.error('Acceso denegado a MySQL. Verifique DB_USER/DB_PASSWORD');
          throw err;
        }
        console.warn(`Fallo conexión en ${key}:`, err.code || err.message);
        // continuar probando otros combos
      }
    }
  }
  // si todos fallaron, propagar último error
  if(lastErr) throw lastErr;
  throw new Error('No fue posible conectar a MySQL: sin intentos válidos');
}

const poolPromise = createPoolWithDb();
// export a pool object wrapper with getConnection and query convenience using the resolved pool
module.exports = {
  query: async function(){
    const pool = await poolPromise;
    return pool.query.apply(pool, arguments);
  },
  getConnection: async function(){
    const pool = await poolPromise;
    return pool.getConnection();
  }
};
