const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar categorias (incluye parent_id y parent_name si existe)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT c.*, p.nombre AS parent_name FROM categorias c LEFT JOIN categorias p ON c.parent_id = p.id ORDER BY c.nombre`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener categorias' });
  }
});

// Crear categoria (acepta parent_id opcional)
router.post('/', async (req, res) => {
  try {
    const { nombre, parent_id } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    // evitar duplicados por nombre y parent
    const [exists] = await pool.query('SELECT id, nombre, parent_id FROM categorias WHERE nombre = ? AND (parent_id = ? OR (parent_id IS NULL AND ? IS NULL))', [nombre, parent_id || null, parent_id || null]);
    if (exists.length > 0) {
      const io = req.app.get('io');
      if (io) io.emit('category:existing', exists[0]);
      return res.status(200).json(exists[0]);
    }
    const [result] = await pool.query('INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)', [nombre, null]);
    // if parent_id provided, attempt to set after insert (simple approach)
    if (parent_id) await pool.query('UPDATE categorias SET parent_id = ? WHERE id = ?', [parent_id, result.insertId]);
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
    const io = req.app.get('io');
    if (io) io.emit('category:created', rows[0]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear categoria' });
  }
});

// Actualizar categoria (nombre y parent_id)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { nombre, parent_id } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    await pool.query('UPDATE categorias SET nombre = ?, parent_id = ? WHERE id = ?', [nombre, parent_id || null, id]);
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id = ?', [id]);
    const io = req.app.get('io');
    if (io) io.emit('category:updated', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar categoria' });
  }
});

// Eliminar categoria: reasigna hijos a NULL y luego borra
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE categorias SET parent_id = NULL WHERE parent_id = ?', [id]);
    await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
    const io = req.app.get('io');
    if (io) io.emit('category:deleted', { id });
    res.json({ message: 'Categoria eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar categoria' });
  }
});

module.exports = router;
