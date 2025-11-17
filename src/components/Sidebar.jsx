import React from 'react'
import { NavLink } from 'react-router-dom'
import { HomeIcon, ArchiveBoxIcon, Squares2X2Icon, UsersIcon, TruckIcon, CurrencyDollarIcon, ChartBarIcon, ArrowRightOnRectangleIcon, SunIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../lib/auth.jsx'

const menuItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/products', label: 'Inventario', icon: ArchiveBoxIcon },
  { to: '/categories', label: 'Categorías', icon: Squares2X2Icon },
  { to: '/suppliers', label: 'Proveedores', icon: UsersIcon },
  { to: '/purchases', label: 'Compras', icon: TruckIcon },
  { to: '/sales', label: 'Ventas', icon: CurrencyDollarIcon },
  { to: '/reports', label: 'Reportes', icon: ChartBarIcon },
  { to: '/users', label: 'Usuarios', icon: UsersIcon },
]

export default function Sidebar({onNavigate, isOpen=false, onClose, onToggleTheme, onLogout}){
  const { user } = useAuth()
  const isAdmin = (user?.role_name === 'admin') || (user?.role_id === 1)
  return (
    <>
      {/* Mobile drawer */}
      <div className={`${isOpen ? 'fixed inset-0 z-40' : 'hidden' } md:hidden`} aria-hidden={!isOpen}>
        <div className={`fixed inset-0 bg-black/40 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`} onClick={onClose} aria-hidden="true"></div>
        <aside aria-label="Navegación principal" className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-slate-800 p-4 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
          <MobileContent onNavigate={onNavigate} onClose={onClose} onToggleTheme={onToggleTheme} onLogout={onLogout} />
        </aside>
      </div>

      <aside className="hidden md:flex md:flex-col w-64 border-r bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-800 dark:text-gray-100 px-4 py-6 h-screen sticky top-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary rounded p-1 flex items-center justify-center w-9 h-9">
          <ArchiveBoxIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">StockPilot</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Panel de inventario</p>
        </div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {menuItems.filter(m=> (m.to !== '/users') || isAdmin).map(item=>{
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink to={item.to} className={({isActive})=>`flex items-center gap-3 w-full px-3 py-2 rounded text-sm ${isActive? 'bg-gray-100 dark:bg-white/10 font-semibold border-l-4 border-primary pl-2' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" /> {item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 text-sm text-gray-600 dark:text-gray-300">
        <button onClick={onToggleTheme} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3"><SunIcon className="w-4 h-4"/> Alternar tema</button>
        <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 mt-2 flex items-center gap-3"><ArrowRightOnRectangleIcon className="w-4 h-4"/> Cerrar sesión</button>
      </div>
    </aside>
    </>
  )
}

function MobileContent({onNavigate, onClose, onToggleTheme, onLogout}){
  return (
    <div className="h-full flex flex-col text-gray-800 dark:text-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary rounded p-1 flex items-center justify-center w-9 h-9">
          <ArchiveBoxIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">StockPilot</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Panel de inventario</p>
        </div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-1">
          <li><button onClick={()=>{onNavigate('dashboard'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><HomeIcon className="w-4 h-4"/> Dashboard</button></li>
          <li><button onClick={()=>{onNavigate('products'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><ArchiveBoxIcon className="w-4 h-4"/> Inventario</button></li>
          <li><button onClick={()=>{onNavigate('categories'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><Squares2X2Icon className="w-4 h-4"/> Categorías</button></li>
          <li><button onClick={()=>{onNavigate('suppliers'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><UsersIcon className="w-4 h-4"/> Proveedores</button></li>
          <li><button onClick={()=>{onNavigate('purchases'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><TruckIcon className="w-4 h-4"/> Compras</button></li>
          <li><button onClick={()=>{onNavigate('sales'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><CurrencyDollarIcon className="w-4 h-4"/> Ventas</button></li>
          <li><button onClick={()=>{onNavigate('reports'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><ChartBarIcon className="w-4 h-4"/> Reportes</button></li>
          <li><button onClick={()=>{onNavigate('users'); onClose()}} className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-sm"><UsersIcon className="w-4 h-4"/> Usuarios</button></li>
        </ul>
      </nav>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 text-sm text-gray-600 dark:text-gray-300">
        <button onClick={()=>{onToggleTheme && onToggleTheme(); onClose()}} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3"><SunIcon className="w-4 h-4"/> Alternar tema</button>
        <button onClick={()=>{onLogout && onLogout(); onClose()}} className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 mt-2 flex items-center gap-3"><ArrowRightOnRectangleIcon className="w-4 h-4"/> Cerrar sesión</button>
      </div>
    </div>
  )
}
