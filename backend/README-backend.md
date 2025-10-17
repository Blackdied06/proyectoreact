# Backend (Express + MySQL) para la app de inventario

Pasos rápidos:

1. Copia `.env.example` a `.env` y completa las credenciales.
2. Asegúrate de que XAMPP esté ejecutando MySQL (phpMyAdmin: http://localhost/phpmyadmin).
3. Instala dependencias:

```powershell
cd backend
npm install
```

4. Inicia en modo desarrollo:

```powershell
npm run dev
```

5. Prueba conexión a la BD:

```powershell
node test-db.js
```

Rutas principales:
- POST /api/auth/login { username, password }
- GET /api/products
- POST /api/products { name, sku, quantity, price }
- PUT /api/products/:id
- DELETE /api/products/:id

Importar datos de ejemplo
-------------------------
En `backend/init.sql` tienes un script que crea la base de datos, tablas, un usuario MySQL y agrega un usuario de ejemplo (`admin` con contraseña `admin123`) y un producto de prueba.

1. Abre phpMyAdmin (http://localhost/phpmyadmin).
2. Selecciona la pestaña SQL y pega el contenido de `backend/init.sql` o usa Import > seleccionar archivo `init.sql`.
3. Ejecuta: se creará la base y los datos.

Después de esto, en `.env` usa las mismas credenciales (DB_USER=inventario_user, DB_PASSWORD=TuPasswordSegura).

Tablas creadas por init.sql (resumen)
------------------------------------
- `roles`: roles del sistema (admin, user).
- `users`: usuarios con `role_id`, contraseña en `password_hash`.
- `categories`: categorías de productos.
- `suppliers`: proveedores.
- `products`: catálogo de productos (con stock y precio).
- `product_suppliers`: relación entre productos y proveedores.
- `purchases`, `purchase_items`: compras y sus items.
- `sales`, `sale_items`: ventas y sus items.
- `inventory_movements`: movimientos de stock (entradas/salidas).
- `settings`: clave/valor para configuración.

Semillas incluidas:
- roles: admin, user
- users: admin (usuario)
- categories: General
- suppliers: Proveedor ejemplo
- products: Producto de prueba (SKU-001)

Recuerda: este script es para entorno de desarrollo. Revisa y cambia contraseñas antes de usar en producción.

Ver registros (usuarios)
------------------------
Puedes ver los usuarios registrados de dos maneras:

1) phpMyAdmin
	- Abre http://localhost/phpmyadmin
	- Selecciona la base de datos `inventario_db`
	- Haz clic en la tabla `users` para ver filas y columnas

2) Usando la API (desarrollo)
	- GET http://localhost:4000/api/auth/users
	- Ejemplo con curl:

```powershell
curl http://localhost:4000/api/auth/users
```

Nota: la ruta `/api/auth/users` es para desarrollo y no usa autenticación. En producción debes proteger este endpoint.

