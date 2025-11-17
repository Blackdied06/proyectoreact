const express = require('express');
const router = express.Router();
const pool = require('../db');
const ExcelJS = require('exceljs');

// JSON: ventas por rango
router.get('/sales', async (req, res) => {
  const { from, to } = req.query;
  try {
    let query = 'SELECT * FROM ventas WHERE 1=1';
    const params = [];
    if (from) { query += ' AND DATE(creado_en) >= ?'; params.push(from); }
    if (to) { query += ' AND DATE(creado_en) <= ?'; params.push(to); }
    query += ' ORDER BY creado_en DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error reporte ventas', err);
    res.status(500).json({ message: 'Error al obtener reporte de ventas' });
  }
});

// Excel: ventas por rango
router.get('/sales.xlsx', async (req, res) => {
  const { from, to } = req.query;
  try {
    let query = 'SELECT * FROM ventas WHERE 1=1';
    const params = [];
    if (from) { query += ' AND DATE(creado_en) >= ?'; params.push(from); }
    if (to) { query += ' AND DATE(creado_en) <= ?'; params.push(to); }
    query += ' ORDER BY creado_en DESC';
    const [rows] = await pool.query(query, params);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Ventas');
    ws.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Factura', key: 'numero_factura', width: 15 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha', key: 'creado_en', width: 22 },
    ];
    rows.forEach(r => ws.addRow(r));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ventas.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportando ventas.xlsx', err);
    res.status(500).json({ message: 'Error al exportar ventas.xlsx' });
  }
});

// Excel: inventario actual
router.get('/inventory.xlsx', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT p.id, p.nombre, p.sku, c.nombre AS categoria, p.stock, p.stock_minimo, p.precio, p.costo FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.nombre');
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Inventario');
    ws.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 32 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Mínimo', key: 'stock_minimo', width: 10 },
      { header: 'Precio', key: 'precio', width: 12 },
      { header: 'Costo', key: 'costo', width: 12 },
    ];
    rows.forEach(r => ws.addRow(r));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="inventario.xlsx"');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportando inventario.xlsx', err);
    res.status(500).json({ message: 'Error al exportar inventario.xlsx' });
  }
});

module.exports = router;
