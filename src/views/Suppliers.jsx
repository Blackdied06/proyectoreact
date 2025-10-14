import React from 'react'

export default function Suppliers(){
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proveedores</h2>
          <p className="text-sm text-gray-500">Registro y desempeño de tus proveedores.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white dark:bg-background-dark/50 p-4 shadow">
          <h4 className="font-semibold">Proveedor A</h4>
          <p className="text-sm text-gray-500">contacto@proveedorA.com</p>
          <p className="text-sm mt-2">Entrega: 2-3 días · Calidad: Alta</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-background-dark/50 p-4 shadow">
          <h4 className="font-semibold">Proveedor B</h4>
          <p className="text-sm text-gray-500">ventas@proveedorB.com</p>
          <p className="text-sm mt-2">Entrega: 5-7 días · Calidad: Media</p>
        </div>
      </div>
    </section>
  )
}
