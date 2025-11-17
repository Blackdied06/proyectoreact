const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Faltan credenciales' });
  try {
    const [rows] = await pool.query('SELECT u.*, r.nombre AS role_name FROM usuarios u LEFT JOIN roles r ON u.rol_id = r.id WHERE u.usuario = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.hash_contrasena);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });
    const tokenPayload = { id: user.id, username: user.usuario, role_id: user.rol_id, role_name: user.role_name };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.usuario, role_id: user.rol_id, role_name: user.role_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Note: registration is protected for admins only (see below). The unsecured /register endpoint has been removed.

const { requireAuth, requireAdmin } = require('../middleware/auth')

// proteger registro para que solo admin pueda crear usuarios
router.post('/register', requireAuth, requireAdmin, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Faltan datos' });
  try {
    const [exists] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [username]);
    if (exists.length > 0) return res.status(409).json({ message: 'Usuario ya existe' });
    const hash = await bcrypt.hash(password, 10);
    const [roleRows] = await pool.query("SELECT id FROM roles WHERE nombre = 'user'");
    const roleId = (roleRows && roleRows.length > 0) ? roleRows[0].id : null;
    const [result] = await pool.query('INSERT INTO usuarios (usuario, hash_contrasena, rol_id) VALUES (?, ?, ?)', [username, hash, roleId]);
    const [rows] = await pool.query('SELECT id, usuario, rol_id FROM usuarios WHERE id = ?', [result.insertId]);
    const user = rows[0];
    res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// LISTAR USUARIOS - Útil para desarrollo. NO dejar habilitado en producción sin auth adecuada.
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, usuario, rol_id, creado_en FROM usuarios ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

module.exports = router;
