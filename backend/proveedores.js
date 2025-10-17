const express = require('express');
const router = express.Router();
const pool = require('./db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
});
// Crear proveedor
router.post('/', async (req, res) => {
  try {
    const { nombre, contacto, telefono, email, direccion } = req.body;
    if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
    const [result] = await pool.query('INSERT INTO proveedores (nombre, contacto, telefono, email, direccion) VALUES (?, ?, ?, ?, ?)', [nombre, contacto || null, telefono || null, email || null, direccion || null]);
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
});
//actualizar proveedor
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { nombre,contacto, telefono, email, direccion } = req.body;
        if (!nombre) return res.status(400).json({ message: 'Nombre requerido' });
        await pool.query('UPDATE proveedores SET nombre = ?, contacto = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?', [nombre, contacto || null, telefono || null, email || null, direccion || null, id]);
        const [rows] = await pool.query('SELECT * FROM proveedores WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar proveedor' });
    }
});

// Eliminar proveedor
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try { 
        await pool.query('DELETE FROM proveedores WHERE id = ?', [id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al eliminar proveedor' });
    }
});
module.exports = router;
