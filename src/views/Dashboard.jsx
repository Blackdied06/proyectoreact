import React from 'react'

export default function Dashboard(){
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-500">Resumen rápido de estado y alertas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
  <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Stock total</p>
            <p className="text-2xl font-bold">1,250</p>
          </div>
          <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10z" fill="currentColor"/></svg>
        </div>

  <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Ventas hoy</p>
            <p className="text-2xl font-bold">$5,400</p>
          </div>
          <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v4H3zM5 11h14v10H5z" fill="currentColor"/></svg>
        </div>

  <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Alertas críticas</p>
            <p className="text-2xl font-bold text-red-500">5</p>
          </div>
          <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" fill="currentColor"/></svg>
        </div>

  <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Productos críticos</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <svg className="w-10 h-10 text-yellow-500" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 8l6 .5-4.5 3 1.5 6L12 16l-6 2 1.5-6L3 8.5 9 8l3-6z" fill="currentColor"/></svg>
        </div>
      </div>
    </section>
  )
}
