const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar compras con items
router.get('/', async (req, res) => {
  try {
    const [compras] = await pool.query('SELECT * FROM compras ORDER BY id DESC LIMIT 100');
    const ids = compras.map(c => c.id);
    let itemsMap = {};
    if (ids.length > 0) {
      const [items] = await pool.query('SELECT ci.*, p.nombre FROM compra_items ci LEFT JOIN productos p ON ci.producto_id = p.id WHERE ci.compra_id IN (?)', [ids]);
      for (const it of items) {
        if (!itemsMap[it.compra_id]) itemsMap[it.compra_id] = [];
        itemsMap[it.compra_id].push(it);
      }
    }
    const result = compras.map(c => ({ ...c, items: itemsMap[c.id] || [] }));
    res.json(result);
  } catch (err) {
    console.error('Error listando compras', err);
    res.status(500).json({ message: 'Error al listar compras' });
  }
});

// Crear compra: body { proveedor_id, numero_factura, items: [ { producto_id, cantidad, precio } ] }
router.post('/', async (req, res) => {
  const { proveedor_id, numero_factura, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items requeridos' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    for (const it of items) total += Number(it.precio) * Number(it.cantidad);

    const [compraRes] = await conn.query('INSERT INTO compras (proveedor_id, numero_factura, total, estado) VALUES (?, ?, ?, ?)', [proveedor_id || null, numero_factura || null, total, 'recibido']);
    const compraId = compraRes.insertId;

    for (const it of items) {
      const productoId = it.producto_id;
      const cantidad = Number(it.cantidad);
      const precio = Number(it.precio);
      await conn.query('INSERT INTO compra_items (compra_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)', [compraId, productoId, cantidad, precio]);
      await conn.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [cantidad, productoId]);
      await conn.query('INSERT INTO movimientos_inventario (producto_id, cambio, tipo, referencia_id, nota) VALUES (?, ?, ?, ?, ?)', [productoId, cantidad, 'compra', compraId, null]);
    }
    await conn.commit();

    const [[compra]] = await pool.query('SELECT * FROM compras WHERE id = ?', [compraId]);
    const [compraItems] = await pool.query('SELECT ci.*, p.nombre FROM compra_items ci LEFT JOIN productos p ON ci.producto_id = p.id WHERE ci.compra_id = ?', [compraId]);
    const full = { ...compra, items: compraItems };

    const io = req.app.get('io');
    if (io) { io.emit('purchase:created', full); io.emit('metrics:update'); }
    res.status(201).json(full);
  } catch (err) {
    await conn.rollback();
    console.error('Error creando compra', err);
    res.status(500).json({ message: 'Error al crear compra' });
  } finally { conn.release(); }
});

module.exports = router;
