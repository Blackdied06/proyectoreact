const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const proveedoresRoutes = require('./proveedores');

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/suppliers', proveedoresRoutes);

const port = process.env.PORT || 4000;

// Global error handlers to surface runtime errors when nodemon reports crash
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
	// do not exit immediately so nodemon prints the stack
});
process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at:', p, 'reason:', reason && reason.stack ? reason.stack : reason);
});

// Al iniciar, intentar asegurarse de que la columna parent_id exista en categorias (manejo seguro)
const pool = require('./db');
;(async function ensureSchema(){
	try{
		await pool.query("ALTER TABLE categorias ADD COLUMN parent_id INT DEFAULT NULL")
		console.log('Columna parent_id añadida a categorias')
	}catch(e){
		// puede fallar si la columna ya existe — ignorar
	}
	try{
		await pool.query('ALTER TABLE categorias ADD INDEX idx_categorias_parent (parent_id)')
	}catch(e){ /* ignore if exists */ }
})()

console.log('Iniciando servidor...');
const server = app.listen(port, () => console.log(`Server listening on port ${port}`));
server.on('error', (err) => {
	console.error('Error en el servidor al escuchar el puerto:', err && err.stack ? err.stack : err);
});
