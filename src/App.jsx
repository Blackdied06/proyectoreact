import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './views/Dashboard'
import Products from './views/Products'
import Suppliers from './views/Suppliers'
import Categories from './views/Categories'
import Reports from './views/Reports'
import Sales from './views/Sales'
import Users from './views/Users'
import Login from './views/Login'
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom'
import Modal from './components/Modal'
import ConfirmModal from './components/ConfirmModal'
import { loadProducts, saveProducts } from './lib/storage'

function App(){
  const [view, setView] = useState('dashboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [productToEdit, setProductToEdit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dark, setDark] = useState(()=>{
    try{
      const raw = localStorage.getItem('stockpilot_theme_v1')
      return raw === 'dark'
    }catch(e){
      return false
    }
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('stockpilot_token')
      if(token){
        try{
          const res = await fetch('http://localhost:4000/api/products')
          const data = await res.json()
          setProducts(data)
          return
        }catch(e){ console.error('Error cargando productos desde API', e) }
      }
      const data = loadProducts()
      setProducts(data)
    }
    load()
  }, [])

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(()=>{
    saveProducts(products)
  }, [products])

  useEffect(()=>{
    // if no token, redirect to login
    const token = localStorage.getItem('stockpilot_token')
    if(!token) navigate('/login')
  }, [])

  function handleSaveProduct(prod){
    (async () => {
      try{
        if(prod.id && String(prod.id).match(/^\d+$/)){
          // existing server id -> update via PUT
          const res = await fetch(`http://localhost:4000/api/products/${prod.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prod) })
          const updated = await res.json()
          setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
        } else {
          // create new
          const res = await fetch('http://localhost:4000/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prod) })
          const created = await res.json()
          setProducts(prev => [created, ...prev])
        }
      }catch(e){
        console.error('Error guardando producto', e)
        // fallback local
        if(prod.id){
          setProducts(prev => prev.map(p => p.id === prod.id ? prod : p))
        } else {
          prod.id = Date.now().toString()
          setProducts(prev => [prod, ...prev])
        }
      } finally {
        setModalOpen(false)
        setProductToEdit(null)
      }
    })()
  }

  function handleDeleteProduct(id){
    // open confirm modal instead
    setToDeleteId(id)
    setConfirmOpen(true)
  }

  function confirmDelete(){
    if(!toDeleteId) return
    (async ()=>{
      try{
        // attempt server delete
        const res = await fetch(`http://localhost:4000/api/products/${toDeleteId}`, { method: 'DELETE' })
        if(!res.ok) throw new Error('Server delete failed')
        setProducts(prev => prev.filter(p => p.id !== toDeleteId))
      }catch(e){
        console.error('Error eliminando en servidor, eliminando localmente', e)
        // fallback local
        setProducts(prev => prev.filter(p => p.id !== toDeleteId))
      } finally {
        setToDeleteId(null)
        setConfirmOpen(false)
      }
    })()
  }

  function cancelDelete(){
    setToDeleteId(null)
    setConfirmOpen(false)
  }

  function handleEditRequest(prod){
    setProductToEdit(prod)
    setModalOpen(true)
  }

  useEffect(()=>{
    // sync theme class on document element and persist
    try{
      if(dark) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      localStorage.setItem('stockpilot_theme_v1', dark ? 'dark' : 'light')
    }catch(e){ /* noop for SSR or test env */ }
  }, [dark])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100">
      <div className="flex">
        {location.pathname !== '/login' && (
          <Sidebar onNavigate={(v)=>{ setView(v); setMobileSidebarOpen(false) }} isOpen={mobileSidebarOpen} onClose={()=>setMobileSidebarOpen(false)} onToggleTheme={()=>setDark(d=>!d)} onLogout={()=>{ localStorage.removeItem('stockpilot_token'); navigate('/login') }} />
        )}
        <div className="flex-1">
          {location.pathname !== '/login' && (
            <Topbar onOpenModal={()=>setModalOpen(true)} onSearch={(q)=>setSearchQuery(q)} onToggleTheme={()=>setDark(d=>!d)} onToggleSidebar={()=>setMobileSidebarOpen(s=>!s)} />
          )}
          <main className="p-6">
            <Routes>
              <Route path="/login" element={<Login/>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products products={products} onOpenModal={()=>setModalOpen(true)} onEdit={handleEditRequest} onDelete={handleDeleteProduct} searchQuery={searchQuery} /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute><Suppliers/></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories/></ProtectedRoute>} />
              <Route path="/purchases" element={<ProtectedRoute><div>Compras</div></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><Sales/></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports/></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users/></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>

      <Modal open={modalOpen} onClose={()=>{setModalOpen(false); setProductToEdit(null)}} title={productToEdit ? 'Editar producto' : 'Agregar producto'} product={productToEdit} onSave={handleSaveProduct} />
      <ConfirmModal open={confirmOpen} message={"¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </div>
  )
}

export default function WrappedApp(){
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
