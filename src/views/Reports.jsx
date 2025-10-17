import React from 'react'

export default function Reports(){
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h2>
        <p className="text-sm text-gray-500">Exporta y analiza tu inventario.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
          <h4 className="font-semibold">Inventario actual</h4>
          <p className="text-sm text-gray-500">Exportar a PDF / Excel</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
          <h4 className="font-semibold">Productos más vendidos</h4>
          <p className="text-sm text-gray-500">Rotación y ventas</p>
        </div>
      </div>
    </section>
  )
}
