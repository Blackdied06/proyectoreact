import React, { useEffect, useState } from 'react'

export default function Categories(){
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [parent, setParent] = useState(null)
  const [expanded, setExpanded] = useState({})

  async function load(){
    setLoading(true)
    try{
      const r = await fetch('http://localhost:4000/api/categories')
      const data = await r.json()
      setCategories(data || [])
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  async function save(){
    try{
      if(editing){
        const r = await fetch(`http://localhost:4000/api/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: name, parent_id: parent || null }) })
        const updated = await r.json()
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
        setEditing(null)
      } else {
        const r = await fetch('http://localhost:4000/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre: name, parent_id: parent || null }) })
        const created = await r.json()
        setCategories(prev => [created, ...prev])
        window.dispatchEvent(new Event('categories-updated'))
      }
      setName('')
      setParent(null)
    }catch(e){ console.error(e) }
  }

  async function remove(id){
    if(!confirm('¿Eliminar categoría?')) return
    try{
      await fetch(`http://localhost:4000/api/categories/${id}`, { method: 'DELETE' })
      setCategories(prev => prev.filter(c => c.id !== id))
      window.dispatchEvent(new Event('categories-updated'))
    }catch(e){ console.error(e) }
  }

  function startEdit(c){ setEditing(c); setName(c.nombre); setParent(c.parent_id || null) }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Categorías</h2>
          <p className="text-sm text-gray-500 dark:text-slate-300">Gestiona categorías y subcategorías.</p>
        </div>
      </div>

        <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
          <select value={parent||''} onChange={e=>setParent(e.target.value || null)} className="px-3 py-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            <option value="">Sin padre</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-2 bg-primary text-white rounded">{editing ? 'Guardar' : 'Agregar'}</button>
            {editing && <button onClick={()=>{ setEditing(null); setName(''); setParent(null) }} className="px-3 py-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">Cancelar</button>}
            <button onClick={load} className="px-3 py-2 border rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">Refrescar</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="space-y-2">
            {categories.filter(c=>!c.parent_id).map(parentCat => (
              <div key={parentCat.id} className="border rounded border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="px-4 py-2 flex items-center justify-between cursor-pointer" onClick={()=>setExpanded(e=>({...e, [parentCat.id]: !e[parentCat.id]}))}>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{parentCat.nombre}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-300">{parentCat.parent_name || 'Principal'}</div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-300">{expanded[parentCat.id] ? '–' : '+'}</div>
                </div>
                {expanded[parentCat.id] && (
                  <div className="px-4 py-2 bg-gray-50 dark:bg-slate-700">
                    {categories.filter(c=>c.parent_id === parentCat.id).length === 0 && <div className="text-sm text-gray-500 dark:text-slate-300">Sin subcategorías</div>}
                    {categories.filter(c=>c.parent_id === parentCat.id).map(sc => (
                      <div key={sc.id} className="flex items-center justify-between py-1 text-slate-900 dark:text-slate-100">
                        <div>{sc.nombre}</div>
                        <div className="flex gap-2">
                          <button onClick={()=>startEdit(sc)} className="px-2 py-1 border text-primary bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">Editar</button>
                          <button onClick={()=>remove(sc.id)} className="px-2 py-1 border text-red-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
