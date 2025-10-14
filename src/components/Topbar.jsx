import React from 'react'

export default function Topbar({onOpenModal, onSearch, onToggleTheme, onToggleSidebar}){
  return (
    <header className="flex items-center justify-between border-b bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 px-4 py-3" role="banner">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 mr-2"> 
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="relative w-96 max-w-full">
              <input aria-label="Buscar productos" onInput={(e)=>onSearch && onSearch(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 pl-10 text-sm text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Buscar por nombre, SKU o categoría" />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" stroke="#6b7280" strokeWidth="1.5"/></svg>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button aria-label="Agregar producto" onClick={onOpenModal} className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-md text-sm">Agregar</button>
        <button aria-pressed="false" aria-label="Alternar tema" onClick={onToggleTheme} className="p-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Tema</button>
            <button className="p-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">🔔</button>
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700"></div>
      </div>
    </header>
  )
}
