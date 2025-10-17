import React, { useEffect, useState } from 'react'

export default function CategoryModal({ open, onClose }){
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [parent, setParent] = useState(null)
  const [loading, setLoading] = useState(false)

  async function load(){
    setLoading(true)
    try{
      const r = await fetch('http://localhost:4000/api/categories')
      const data = await r.json()
      setCategories(data || [])
    }catch(e){}
    setLoading(false)
  }

  useEffect(()=>{
    if(open) load()
  }, [open])

  async function add(){
    if(!name || !name.trim()) return
    try{
      const r = await fetch('http://localhost:4000/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: name, parent_id: parent || null }) })
      const nc = await r.json()
      setCategories(prev => [nc, ...prev])
      setName('')
      setParent(null)
      // notify others
      window.dispatchEvent(new Event('categories-updated'))
    }catch(e){ console.error(e) }
  }

  async function remove(id){
    if(!confirm('¿Eliminar categoría? Esto puede afectar productos asociados.')) return
    try{
      await fetch(`http://localhost:4000/api/categories/${id}`, { method: 'DELETE' })
      setCategories(prev => prev.filter(c => c.id !== id))
      window.dispatchEvent(new Event('categories-updated'))
    }catch(e){ console.error(e) }
  }

  if(!open) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Categorías</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div className="mb-3 grid grid-cols-1 gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} className="px-3 py-2 border rounded" placeholder="Nueva categoría" />
          <select value={parent||''} onChange={e=>setParent(e.target.value || null)} className="px-3 py-2 border rounded">
            <option value="">Sin padre</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={add} className="px-3 py-2 bg-primary text-white rounded">Agregar</button>
            <button onClick={load} className="px-3 py-2 border rounded">Refrescar</button>
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {loading && <p>Cargando...</p>}
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between py-1 border-b">
              <div>
                <div className="font-medium">{c.nombre}</div>
                {c.parent_name && <div className="text-xs text-gray-500">Padre: {c.parent_name}</div>}
              </div>
              <div>
                <button onClick={()=>remove(c.id)} className="text-red-600 px-2">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
