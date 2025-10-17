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
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.hash_contrasena);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });
    const token = jwt.sign({ id: user.id, username: user.usuario }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.usuario, role_id: user.rol_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Register nuevos usuarios
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Faltan datos' });
  try {
  const [exists] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [username]);
  if (exists.length > 0) return res.status(409).json({ message: 'Usuario ya existe' });
  const hash = await bcrypt.hash(password, 10);
  // Buscar id del role 'user' de forma segura
  const [roleRows] = await pool.query("SELECT id FROM roles WHERE nombre = 'user'");
  const roleId = (roleRows && roleRows.length > 0) ? roleRows[0].id : null;
  // Si no existe el role, continuar con rol nulo para no bloquear el registro
  const [result] = await pool.query('INSERT INTO usuarios (usuario, hash_contrasena, rol_id) VALUES (?, ?, ?)', [username, hash, roleId]);
  const [rows] = await pool.query('SELECT id, usuario, rol_id FROM usuarios WHERE id = ?', [result.insertId]);
  const user = rows[0];
  const token = jwt.sign({ id: user.id, username: user.usuario }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
  res.status(201).json({ token, user });
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
