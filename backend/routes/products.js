const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar productos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY p.id DESC`);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener productos:', err.message, err.code);
    res.status(500).json({ message: 'Error al obtener productos', error: err.message, code: err.code });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  // Accept both Spanish keys (nombre, precio, stock) and frontend keys (name, price, quantity, category)
  try {
    let { nombre, sku, categoria_id, stock, precio, costo, stock_minimo } = req.body;
    // fallback from frontend field names
    if (!nombre && req.body.name) nombre = req.body.name;
    if ((stock === undefined || stock === null) && req.body.quantity !== undefined) stock = req.body.quantity;
    if ((precio === undefined || precio === null) && req.body.price !== undefined) precio = req.body.price;

    // If category provided as string, find or create category
    if (!categoria_id && req.body.category) {
      const categoryName = req.body.category;
      // try find
      const [catRows] = await pool.query('SELECT id FROM categorias WHERE nombre = ?', [categoryName]);
      if (catRows.length > 0) categoria_id = catRows[0].id;
      else {
        const [insCat] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [categoryName]);
        categoria_id = insCat.insertId;
      }
    }

    // Try to find existing product by nombre + categoria_id (or category name)
    let existing = []
    if (categoria_id) {
      const [ex] = await pool.query('SELECT * FROM productos WHERE nombre = ? AND categoria_id = ?', [nombre, categoria_id]);
      existing = ex
    } else if (req.body.category) {
      const [ex] = await pool.query(`SELECT p.* FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.nombre = ? AND c.nombre = ?`, [nombre, req.body.category]);
      existing = ex
    } else {
      const [ex] = await pool.query('SELECT * FROM productos WHERE nombre = ? LIMIT 1', [nombre]);
      existing = ex
    }

    if (existing.length > 0) {
      // update existing: sum stock and update other fields; do not overwrite stock_minimo unless explicitly provided
      const prod = existing[0]
      const newStock = (Number(prod.stock || 0) + Number(stock || 0))
      const updatedStockMinimo = (stock_minimo !== undefined && stock_minimo !== null) ? stock_minimo : prod.stock_minimo
      await pool.query('UPDATE productos SET sku = ?, categoria_id = ?, stock = ?, precio = ?, costo = ?, stock_minimo = ? WHERE id = ?', [sku || prod.sku, categoria_id || prod.categoria_id, newStock, precio || prod.precio, costo || prod.costo, updatedStockMinimo || 0, prod.id])
      const [rows] = await pool.query(`SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?`, [prod.id]);
      const io = req.app.get('io');
      if (io) { io.emit('product:updated', rows[0]); io.emit('metrics:update'); }
      return res.status(200).json(rows[0])
    }

    const [result] = await pool.query('INSERT INTO productos (nombre, sku, categoria_id, stock, precio, costo, stock_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)', [nombre, sku, categoria_id || null, stock || 0, precio || 0, costo || 0, stock_minimo || 0]);
    const [rows] = await pool.query(`SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?`, [result.insertId]);
    const io = req.app.get('io');
    if (io) { io.emit('product:created', rows[0]); io.emit('metrics:update'); }
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let { nombre, sku, categoria_id, stock, precio, costo, stock_minimo } = req.body;
    if (!nombre && req.body.name) nombre = req.body.name;
    if ((stock === undefined || stock === null) && req.body.quantity !== undefined) stock = req.body.quantity;
    if ((precio === undefined || precio === null) && req.body.price !== undefined) precio = req.body.price;

    if (!categoria_id && req.body.category) {
      const categoryName = req.body.category;
      const [catRows] = await pool.query('SELECT id FROM categorias WHERE nombre = ?', [categoryName]);
      if (catRows.length > 0) categoria_id = catRows[0].id;
      else {
        const [insCat] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [categoryName]);
        categoria_id = insCat.insertId;
      }
    }

    await pool.query('UPDATE productos SET nombre=?, sku=?, categoria_id=?, stock=?, precio=?, costo=?, stock_minimo=? WHERE id=?', [nombre, sku, categoria_id || null, stock || 0, precio || 0, costo || 0, stock_minimo || 0, id]);
    const [rows] = await pool.query(`SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?`, [id]);
    const io = req.app.get('io');
    if (io) { io.emit('product:updated', rows[0]); io.emit('metrics:update'); }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    const io = req.app.get('io');
    if (io) { io.emit('product:deleted', { id }); io.emit('metrics:update'); }
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

module.exports = router;
