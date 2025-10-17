import React, { useEffect, useState } from 'react'

export default function Suppliers(){
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [editing, setEditing] = useState(null)

  async function load(){
    setLoading(true)
    try{
      const r = await fetch('http://localhost:4000/api/suppliers')
      const data = await r.json()
      setSuppliers(data || [])
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  async function save(){
    try{
      if(editing){
        const r = await fetch(`http://localhost:4000/api/suppliers/${editing.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nombre: name, contacto: contact }) })
        const updated = await r.json()
        setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s))
        setEditing(null)
      } else {
        const r = await fetch('http://localhost:4000/api/suppliers', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nombre: name, contacto: contact }) })
        const created = await r.json()
        setSuppliers(prev => [created, ...prev])
      }
      setName('')
      setContact('')
    }catch(e){ console.error(e) }
  }

  async function remove(id){
    if(!confirm('¿Eliminar proveedor?')) return
    try{
      await fetch(`http://localhost:4000/api/suppliers/${id}`, { method: 'DELETE' })
      setSuppliers(prev => prev.filter(s => s.id !== id))
    }catch(e){ console.error(e) }
  }

  function startEdit(s){ setEditing(s); setName(s.nombre); setContact(s.contacto || '') }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Proveedores</h2>
          <p className="text-sm text-gray-500">Registro y desempeño de tus proveedores.</p>
        </div>
        <div className="flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded" />
          <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contacto (email/teléfono)" className="px-3 py-2 border rounded" />
          <button onClick={save} className="px-3 py-2 bg-primary text-white rounded">{editing ? 'Guardar' : 'Agregar'}</button>
          <button onClick={load} className="px-3 py-2 border rounded">Refrescar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <div>Cargando...</div>}
        {suppliers.map(s => (
          <div key={s.id} className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
            <h4 className="font-semibold">{s.nombre}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-300">{s.contacto || s.telefono || s.email || ''}</p>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-300">{s.direccion || ''}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={()=>startEdit(s)} className="px-2 py-1 border text-primary">Editar</button>
              <button onClick={()=>remove(s.id)} className="px-2 py-1 border text-red-600">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
