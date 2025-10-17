-- init.sql (idempotente): crea la base y tablas solo si no existen
-- Ejecuta esto en phpMyAdmin > SQL o Import

-- Si la base ya existe, no se volverá a crear ni a insertar semillas duplicadas
SET @dbName = 'inventario_db';
SET @exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = @dbName);
-- Si no existe, crea la base y todo el esquema
-- NOTA: en phpMyAdmin la variable y control condicional pueden comportarse distinto; si tu phpMyAdmin no acepta, puedes ejecutar manualmente el bloque de creación.
-- Aquí usamos una estrategia simple: si la DB no existe, la creamos y luego ejecutamos las DDL/DML.

-- Crear DB si no existe
CREATE DATABASE IF NOT EXISTS inventario_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE inventario_db;

-- Comprobar si la tabla roles ya existe; si existe asumimos que ya fue inicializada
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'inventario_db' AND table_name = 'roles');

-- Si roles no existe, ejecutar esquema completo
-- (Algunos entornos SQL no permiten IF..THEN en scripts directos; este script está diseñado para phpMyAdmin/cliente que acepte múltiples sentencias.)
-- Para mayor compatibilidad, cada CREATE TABLE usa IF NOT EXISTS y las inserciones usan INSERT IGNORE o ON DUPLICATE KEY.

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL
);

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  hash_contrasena VARCHAR(255) NOT NULL,
  rol_id INT DEFAULT NULL,
  correo VARCHAR(255) DEFAULT NULL,
  nombre_completo VARCHAR(255) DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL
);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  contacto VARCHAR(255) DEFAULT NULL,
  telefono VARCHAR(50) DEFAULT NULL,
  correo VARCHAR(255) DEFAULT NULL,
  direccion TEXT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  sku VARCHAR(100) DEFAULT NULL UNIQUE,
  categoria_id INT DEFAULT NULL,
  precio DECIMAL(10,2) DEFAULT 0.00,
  costo DECIMAL(10,2) DEFAULT 0.00,
  stock INT DEFAULT 0,
  stock_minimo INT DEFAULT 0,
  vence_en DATE DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Relación producto-proveedor
CREATE TABLE IF NOT EXISTS producto_proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  proveedor_id INT NOT NULL,
  sku_proveedor VARCHAR(100) DEFAULT NULL,
  precio DECIMAL(10,2) DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE
);

-- Compras
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proveedor_id INT DEFAULT NULL,
  numero_factura VARCHAR(100) DEFAULT NULL,
  total DECIMAL(12,2) DEFAULT 0.00,
  estado VARCHAR(50) DEFAULT 'recibido',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS compra_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(255) DEFAULT NULL,
  numero_factura VARCHAR(100) DEFAULT NULL,
  total DECIMAL(12,2) DEFAULT 0.00,
  estado VARCHAR(50) DEFAULT 'completada',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venta_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT DEFAULT 0,
  precio DECIMAL(10,2) DEFAULT 0.00,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL
);

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  cambio INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  referencia_id INT DEFAULT NULL,
  nota TEXT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Settings
CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);

-- Semillas (usar INSERT IGNORE para ser idempotente)
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador con todos los permisos'),
('user', 'Usuario estándar');

