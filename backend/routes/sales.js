const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar ventas (con items agregados en arreglo)
router.get('/', async (req, res) => {
  try {
    const [ventas] = await pool.query('SELECT * FROM ventas ORDER BY id DESC LIMIT 100');
    const ventaIds = ventas.map(v => v.id);
    let itemsMap = {};
    if (ventaIds.length > 0) {
      const [items] = await pool.query('SELECT vi.*, p.nombre FROM venta_items vi LEFT JOIN productos p ON vi.producto_id = p.id WHERE vi.venta_id IN (?)', [ventaIds]);
      for (const it of items) {
        if (!itemsMap[it.venta_id]) itemsMap[it.venta_id] = [];
        itemsMap[it.venta_id].push(it);
      }
    }
    const result = ventas.map(v => ({ ...v, items: itemsMap[v.id] || [] }));
    res.json(result);
  } catch (err) {
    console.error('Error listando ventas', err);
    res.status(500).json({ message: 'Error al listar ventas' });
  }
});

// Crear venta: body { cliente, items: [ { producto_id, cantidad, precio } ] }
router.post('/', async (req, res) => {
  const { cliente, items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items requeridos' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Calcular total
    let total = 0;
    for (const it of items) {
      total += Number(it.precio) * Number(it.cantidad);
    }
    const [ventaRes] = await conn.query('INSERT INTO ventas (cliente, total) VALUES (?, ?)', [cliente || null, total]);
    const ventaId = ventaRes.insertId;

    for (const it of items) {
      const productoId = it.producto_id;
      const cantidad = Number(it.cantidad);
      const precio = Number(it.precio);
      await conn.query('INSERT INTO venta_items (venta_id, producto_id, cantidad, precio) VALUES (?, ?, ?, ?)', [ventaId, productoId, cantidad, precio]);
      // Actualizar stock del producto
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, productoId]);
      // Registrar movimiento de inventario
      await conn.query('INSERT INTO movimientos_inventario (producto_id, cambio, tipo, referencia_id, nota) VALUES (?, ?, ?, ?, ?)', [productoId, -cantidad, 'venta', ventaId, null]);
    }
    await conn.commit();

    // Recuperar venta completa
    const [[venta]] = await pool.query('SELECT * FROM ventas WHERE id = ?', [ventaId]);
    const [ventaItems] = await pool.query('SELECT vi.*, p.nombre FROM venta_items vi LEFT JOIN productos p ON vi.producto_id = p.id WHERE vi.venta_id = ?', [ventaId]);
    const fullVenta = { ...venta, items: ventaItems };

    const io = req.app.get('io');
    if (io) {
      io.emit('sale:created', fullVenta);
      io.emit('metrics:update');
    }
    res.status(201).json(fullVenta);
  } catch (err) {
    await conn.rollback();
    console.error('Error creando venta', err);
    res.status(500).json({ message: 'Error al crear venta' });
  } finally {
    conn.release();
  }
});

module.exports = router;
