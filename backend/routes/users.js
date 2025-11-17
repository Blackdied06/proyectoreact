const express = require('express');
const router = express.Router();
const pool = require('../db');

// Listar usuarios básicos (sin hashes)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.id, u.usuario, u.rol_id, u.creado_en, r.nombre AS rol FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id ORDER BY u.id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error listando usuarios', err);
    res.status(500).json({ message: 'Error al listar usuarios' });
  }
});

// Eliminar usuario (solo admin)
const { requireAuth, requireAdmin } = require('../middleware/auth')

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Error eliminando usuario', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});
// proteccion: solo admin puede borrar usuarios

module.exports = router;
