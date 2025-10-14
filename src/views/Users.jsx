import React from 'react'

export default function Users(){
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios y roles</h2>
        <div className="text-sm text-gray-500">Roles: Administrador · Vendedor · Auditor</div>
      </div>
      <div className="rounded-lg bg-white dark:bg-background-dark/50 p-4 shadow">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 text-xs uppercase">
            <tr><th className="px-3 py-2">Usuario</th><th className="px-3 py-2">Rol</th><th className="px-3 py-2">Última actividad</th></tr>
          </thead>
          <tbody className="divide-y">
            <tr><td className="px-3 py-3">juan.perez</td><td className="px-3 py-3">Administrador</td><td className="px-3 py-3">2025-09-30</td></tr>
            <tr><td className="px-3 py-3">maria.ventas</td><td className="px-3 py-3">Vendedor</td><td className="px-3 py-3">2025-10-02</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
