const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/metrics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [[totalStockRow]] = await pool.query('SELECT IFNULL(SUM(stock),0) AS total_stock FROM productos');
    const [[ventasHoyRow]] = await pool.query('SELECT IFNULL(SUM(total),0) AS ventas_hoy_total FROM ventas WHERE DATE(creado_en) = CURDATE()');
    const [[alertasRow]] = await pool.query('SELECT COUNT(*) AS alertas_criticas FROM productos WHERE stock <= stock_minimo');
    const [criticosRows] = await pool.query('SELECT id, nombre, stock, stock_minimo FROM productos WHERE stock <= stock_minimo ORDER BY (stock - stock_minimo) ASC');
    return res.json({
      status: 'ok',
      total_stock: totalStockRow.total_stock,
      ventas_hoy_total: ventasHoyRow.ventas_hoy_total,
      alertas_criticas: alertasRow.alertas_criticas,
      productos_criticos: criticosRows
    });
  } catch (err) {
    console.error('Error obteniendo métricas dashboard:', err.message, err.code);
    // Modo degradado para que el dashboard no quede vacío
    return res.status(503).json({
      status: 'degraded',
      message: 'Base de datos no accesible',
      error: err.message,
      code: err.code,
      total_stock: 0,
      ventas_hoy_total: 0,
      alertas_criticas: 0,
      productos_criticos: []
    });
  }
});

module.exports = router;
