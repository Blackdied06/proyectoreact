import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export default function Sales(){
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ cliente: '', items: [{ producto_id: '', cantidad: 1, precio: 0 }] })
  const [loading, setLoading] = useState(false)
  const base = (location.hostname === 'localhost' ? '' : API)

  async function load(){
    try{
      const [sres, pres] = await Promise.all([
        fetch(base + '/api/sales'),
        fetch(base + '/api/products')
      ])
      const [sdata, pdata] = await Promise.all([sres.json(), pres.json()])
      setSales(Array.isArray(sdata) ? sdata : [])
      setProducts(Array.isArray(pdata) ? pdata : [])
    }catch(e){ console.error('Error cargando ventas/productos', e) }
  }
  useEffect(()=>{ load() }, [])

  function updateItem(idx, patch){
    setForm(f=>{
      const items = f.items.slice()
      items[idx] = { ...items[idx], ...patch }
      return { ...f, items }
    })
  }

  function addItem(){ setForm(f=>({ ...f, items: [...f.items, { producto_id:'', cantidad:1, precio:0 }] })) }
  function removeItem(i){ setForm(f=>({ ...f, items: f.items.filter((_,idx)=>idx!==i) })) }

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try{
      const payload = { cliente: form.cliente || null, items: form.items.filter(it=>it.producto_id && it.cantidad>0) }
      const res = await fetch(base + '/api/sales', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if(!res.ok) throw new Error('Error creando venta')
      const created = await res.json()
      setSales(prev=>[created, ...prev])
      setForm({ cliente:'', items:[{ producto_id:'', cantidad:1, precio:0 }] })
    }catch(e){ console.error(e) }
    finally{ setLoading(false) }
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h2>
        <p className="text-sm text-gray-500">Registro de ventas y facturación.</p>
      </div>

      <form onSubmit={submit} className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={form.cliente} onChange={e=>setForm(f=>({...f, cliente:e.target.value}))} placeholder="Cliente" className="border rounded px-3 py-2" />
        </div>
        <div className="mt-3 space-y-2">
          {form.items.map((it, idx)=> (
            <div key={idx} className="grid sm:grid-cols-5 gap-2 items-center">
              <select value={it.producto_id} onChange={e=>updateItem(idx,{ producto_id: Number(e.target.value) })} className="border rounded px-2 py-2 sm:col-span-2">
                <option value="">Seleccione producto</option>
                {products.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <input type="number" min={1} value={it.cantidad} onChange={e=>updateItem(idx,{ cantidad: Number(e.target.value) })} className="border rounded px-2 py-2" placeholder="Cantidad" />
              <input type="number" step="0.01" value={it.precio} onChange={e=>updateItem(idx,{ precio: Number(e.target.value) })} className="border rounded px-2 py-2" placeholder="Precio" />
              <button type="button" onClick={()=>removeItem(idx)} className="text-sm text-red-600">Quitar</button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-sm text-primary">+ Agregar ítem</button>
        </div>
        <div className="mt-4">
          <button disabled={loading} className="px-4 py-2 rounded bg-primary text-white">{loading? 'Guardando...' : 'Registrar venta'}</button>
        </div>
      </form>

      <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
        <h3 className="font-semibold mb-3">Últimas ventas</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 text-xs uppercase">
            <tr><th className="px-2 py-2">Fecha</th><th className="px-2 py-2">Cliente</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Items</th></tr>
          </thead>
          <tbody className="divide-y">
            {sales.map(s => (
              <tr key={s.id}>
                <td className="px-2 py-2">{new Date(s.creado_en).toLocaleString()}</td>
                <td className="px-2 py-2">{s.cliente || '-'}</td>
                <td className="px-2 py-2">${s.total}</td>
                <td className="px-2 py-2">{(s.items||[]).length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
