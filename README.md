# StockPilot - Frontend (React + Vite + Tailwind)

Proyecto frontend de ejemplo basado en el diseño proporcionado.

Requisitos:
- Node.js 18+ y npm o pnpm

Instalación y ejecución:

```bash
cd "Frontend_inventario/react-app"
npm install
npm run dev
```

Esto levanta Vite en modo desarrollo. El proyecto usa TailwindCSS; la configuración está en `tailwind.config.cjs`.

Siguientes pasos sugeridos:
- Implementar persistencia (localStorage o conectar API).
- Añadir validaciones y formularios controlados.
- Integrar autenticación y rutas protegidas.

CRUD local (simulado):
- La app usa localStorage para persistir productos en el navegador.
- Abre la vista "Productos" y pulsa "Agregar producto" para crear uno.
- Los cambios se guardan automáticamente en localStorage bajo la clave `stockpilot_products_v1`.
