const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const metricsRoutes = require('./routes/metrics');
const proveedoresRoutes = require('./proveedores');
const salesRoutes = require('./routes/sales');
const purchasesRoutes = require('./routes/purchases');
const usersRoutes = require('./routes/users');
const reportsRoutes = require('./routes/reports');

const app = express();
// Ampliar origen CORS para puertos alternos (5173-5176) y evitar pantalla negra por fallos fetch/socket
app.use(cors({ origin: [/http:\/\/localhost:5173$/, /http:\/\/localhost:5174$/, /http:\/\/localhost:5175$/, /http:\/\/localhost:5176$/] }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/metrics', metricsRoutes);
// Ruta seed mínima para poblar datos de prueba si vacío
app.post('/api/seed/minimal', async (req, res) => {
	try {
		const [[prodCount]] = await pool.query('SELECT COUNT(*) AS c FROM productos');
		if (prodCount.c > 0) return res.status(200).json({ message: 'Ya hay productos, seed no ejecutado' });
		const [cat] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', ['General']);
		await pool.query('INSERT INTO productos (nombre, sku, categoria_id, stock, precio, costo, stock_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Producto Demo', 'SKU-DEMO-1', cat.insertId, 50, 100.00, 60.00, 10]);
		await pool.query('INSERT INTO productos (nombre, sku, categoria_id, stock, precio, costo, stock_minimo) VALUES (?, ?, ?, ?, ?, ?, ?)', ['Producto Demo 2', 'SKU-DEMO-2', cat.insertId, 5, 35.50, 20.00, 10]);
		const [rows] = await pool.query('SELECT * FROM productos');
		const io = req.app.get('io');
		if (io) io.emit('product:seeded', rows);
		res.status(201).json({ message: 'Seed ejecutado', productos: rows });
	} catch(err){
		console.error('Error seed minimal:', err.message);
		res.status(500).json({ message: 'Error al ejecutar seed', error: err.message });
	}
});
app.use('/api/suppliers', proveedoresRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);

const port = process.env.PORT || 4000;

// Global error handlers to surface runtime errors when nodemon reports crash
process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
	// do not exit immediately so nodemon prints the stack
});
process.on('unhandledRejection', (reason, p) => {
	console.error('Unhandled Rejection at:', p, 'reason:', reason && reason.stack ? reason.stack : reason);
});

// Prueba de conexión inicial explícita para diagnosticar problemas con XAMPP
const pool = require('./db');
;(async function testDbConnection(){
	try {
		const conn = await pool.getConnection();
		await conn.query('SELECT 1 AS ok');
		conn.release();
		console.log('Conexión MySQL OK');
	} catch(err){
		console.error('Fallo conexión MySQL:', err.message);
		if(err.code) console.error('Código de error MySQL:', err.code);
		if (err.code === 'ER_BAD_DB_ERROR' || err.errno === 1049) {
			try {
				const host = process.env.DB_HOST || '127.0.0.1';
				const user = process.env.DB_USER || 'root';
				const password = process.env.DB_PASSWORD || '';
				const port = Number(process.env.DB_PORT || 3306);
				const dbName = process.env.DB_NAME || 'inventario_db';
				console.warn(`Base de datos "${dbName}" no existe. Creándola...`);
				const tmp = await mysql.createConnection({ host, user, password, port });
				await tmp.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
				await tmp.end();
				// Reintentar una conexión usando el pool ya configurado
				const conn2 = await pool.getConnection();
				await conn2.query('SELECT 1 AS ok');
				conn2.release();
				console.log('Base creada y conexión MySQL OK');
			} catch (e2) {
				console.error('No se pudo crear la base de datos automáticamente:', e2.message);
			}
		} else {
			console.error('Revise variables de entorno DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
		}
	}
})()

// Asegurar esquema SOLO después de confirmar/crear la base
;(async function ensureSchema(){
	// Crear tablas faltantes de forma segura (idempotente)
	async function ensureFullSchema(){
		const queries = [
			`CREATE TABLE IF NOT EXISTS roles ( id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(50) NOT NULL UNIQUE, descripcion VARCHAR(255) DEFAULT NULL )`,
			`CREATE TABLE IF NOT EXISTS usuarios ( id INT AUTO_INCREMENT PRIMARY KEY, usuario VARCHAR(100) NOT NULL UNIQUE, hash_contrasena VARCHAR(255) NOT NULL, rol_id INT DEFAULT NULL, correo VARCHAR(255) DEFAULT NULL, nombre_completo VARCHAR(255) DEFAULT NULL, creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL )`,
			`CREATE TABLE IF NOT EXISTS categorias ( id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(100) NOT NULL UNIQUE, descripcion VARCHAR(255) DEFAULT NULL )`,
			`CREATE TABLE IF NOT EXISTS proveedores ( id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255) NOT NULL, contacto VARCHAR(255) DEFAULT NULL, telefono VARCHAR(50) DEFAULT NULL, correo VARCHAR(255) DEFAULT NULL, direccion TEXT DEFAULT NULL, creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`,
			`CREATE TABLE IF NOT EXISTS productos ( id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255) NOT NULL, sku VARCHAR(100) DEFAULT NULL UNIQUE, categoria_id INT DEFAULT NULL, precio DECIMAL(10,2) DEFAULT 0.00, costo DECIMAL(10,2) DEFAULT 0.00, stock INT DEFAULT 0, stock_minimo INT DEFAULT 0, vence_en DATE DEFAULT NULL, creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL )`,
			`CREATE TABLE IF NOT EXISTS producto_proveedores ( id INT AUTO_INCREMENT PRIMARY KEY, producto_id INT NOT NULL, proveedor_id INT NOT NULL, sku_proveedor VARCHAR(100) DEFAULT NULL, precio DECIMAL(10,2) DEFAULT NULL, creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE, FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE )`,
			`CREATE TABLE IF NOT EXISTS compras ( id INT AUTO_INCREMENT PRIMARY KEY, proveedor_id INT DEFAULT NULL, numero_factura VARCHAR(100) DEFAULT NULL, total DECIMAL(12,2) DEFAULT 0.00, estado VARCHAR(50) DEFAULT 'recibido', creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL )`,
			`CREATE TABLE IF NOT EXISTS compra_items ( id INT AUTO_INCREMENT PRIMARY KEY, compra_id INT NOT NULL, producto_id INT NOT NULL, cantidad INT DEFAULT 0, precio DECIMAL(10,2) DEFAULT 0.00, FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE, FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL )`,
			`CREATE TABLE IF NOT EXISTS ventas ( id INT AUTO_INCREMENT PRIMARY KEY, cliente VARCHAR(255) DEFAULT NULL, numero_factura VARCHAR(100) DEFAULT NULL, total DECIMAL(12,2) DEFAULT 0.00, estado VARCHAR(50) DEFAULT 'completada', creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`,
			`CREATE TABLE IF NOT EXISTS venta_items ( id INT AUTO_INCREMENT PRIMARY KEY, venta_id INT NOT NULL, producto_id INT NOT NULL, cantidad INT DEFAULT 0, precio DECIMAL(10,2) DEFAULT 0.00, FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE, FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL )`,
			`CREATE TABLE IF NOT EXISTS movimientos_inventario ( id INT AUTO_INCREMENT PRIMARY KEY, producto_id INT NOT NULL, cambio INT NOT NULL, tipo VARCHAR(50) NOT NULL, referencia_id INT DEFAULT NULL, nota TEXT DEFAULT NULL, creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE )`,
			`CREATE TABLE IF NOT EXISTS configuracion ( clave VARCHAR(100) PRIMARY KEY, valor TEXT )`,
			`CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku)`,
			`CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id)`
		]
		for(const q of queries){
			try{ await pool.query(q) }catch(err){ /* continuar, algunos motores no soportan IF NOT EXISTS en INDEX */ }
		}
		// Semilla: roles básicos
		try{ await pool.query("INSERT IGNORE INTO roles (nombre, descripcion) VALUES ('admin','Administrador con todos los permisos'), ('user','Usuario estándar')"); }catch(e){ /* ignore */ }
		// Ajuste adicional: columna parent_id si no existe
		try{ await pool.query("ALTER TABLE categorias ADD COLUMN parent_id INT DEFAULT NULL") }catch(_e){}
		try{ await pool.query('ALTER TABLE categorias ADD INDEX idx_categorias_parent (parent_id)') }catch(_e){}
	}

	try{ await ensureFullSchema(); console.log('Esquema verificado/creado'); }catch(e){ console.error('Fallo asegurando esquema:', e.message) }
})()

// Ruta de salud para verificar estado DB desde el navegador
app.get('/api/health/db', async (req, res) => {
	try {
		const [[row]] = await pool.query('SELECT NOW() AS now');
		return res.json({ status: 'ok', now: row.now });
	} catch(err){
		return res.status(500).json({ status: 'error', message: err.message, code: err.code });
	}
});

// Diagnóstico ampliado (no incluir secretos) para depurar conexión
app.get('/api/diagnostics', async (req, res) => {
	const info = {
		env: {
			DB_HOST: process.env.DB_HOST,
			DB_PORT: process.env.DB_PORT,
			DB_USER: process.env.DB_USER,
			DB_NAME: process.env.DB_NAME,
			NODE_ENV: process.env.NODE_ENV
		}
	};
	try {
		const [[ping]] = await pool.query('SELECT 1 AS alive');
		info.db = { alive: !!ping.alive };
		return res.json(info);
	} catch (err) {
		info.db = { alive: false, error: err.message, code: err.code };
		return res.status(503).json(info);
	}
});

console.log('Iniciando servidor...');
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: [/http:\/\/localhost:5173$/, /http:\/\/localhost:5174$/, /http:\/\/localhost:5175$/, /http:\/\/localhost:5176$/] } });
app.set('io', io);
io.on('connection', (socket) => {
	console.log('Socket conectado', socket.id);
	socket.on('disconnect', () => console.log('Socket desconectado', socket.id));
});

let currentPort = Number(port);
let triesRemaining = 5;
httpServer.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE' && triesRemaining > 0) {
    console.warn(`Puerto ${currentPort} en uso. Intentando puerto ${currentPort + 1}...`);
    triesRemaining -= 1;
    currentPort += 1;
    setTimeout(() => httpServer.listen(currentPort, () => console.log(`Server listening on port ${currentPort}`)), 200);
  } else {
    console.error('Error en el servidor al escuchar el puerto:', err && err.stack ? err.stack : err);
  }
});

httpServer.listen(currentPort, () => console.log(`Server listening on port ${currentPort}`));
