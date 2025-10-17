import React, { useEffect, useState } from 'react'

export default function Modal({open, onClose, title, product, onSave}){
  const [form, setForm] = useState({
    name: '', sku: '', category: '', price: '', quantity: '', supplier: '', expires: '', stock_minimo: ''
  })
  const [errors, setErrors] = useState({})
  const [categories, setCategories] = useState([])

  useEffect(()=>{
    if(product){
      setForm({
        name: product.name || '', sku: product.sku || '', category: product.category || '', price: product.price || '', quantity: product.quantity || '', supplier: product.supplier || '', expires: product.expires || '', stock_minimo: product.stock_minimo || ''
      })
    } else {
      setForm({ name: '', sku: '', category: '', price: '', quantity: '', supplier: '', expires: '', stock_minimo: '' })
    }
  }, [product, open])

  useEffect(()=>{
    fetch('http://localhost:4000/api/categories')
      .then(r=>r.json())
      .then(data=>setCategories(data || []))
      .catch(()=>setCategories([]))
  }, [])

  useEffect(()=>{
    function handler(){
      fetch('http://localhost:4000/api/categories')
        .then(r=>r.json())
        .then(data=>setCategories(data || []))
        .catch(()=>{})
    }
    window.addEventListener('categories-updated', handler)
    return ()=> window.removeEventListener('categories-updated', handler)
  }, [])

  if(!open) return null

  function update(field, value){
    setForm(prev => ({...prev, [field]: value}))
  }

  function validate(values){
    const errs = {}
    if(!values.name || !values.name.trim()) errs.name = 'Ingrese el nombre del producto'
    if(!values.sku || !values.sku.trim()) errs.sku = 'SKU requerido'
    const priceNum = Number(values.price)
    if(!values.price || isNaN(priceNum) || priceNum <= 0) errs.price = 'Precio debe ser un número mayor que 0'
    const qtyNum = Number(values.quantity)
    if(!values.quantity || isNaN(qtyNum) || qtyNum < 0) errs.quantity = 'Cantidad inválida (>= 0)'
    return errs
  }

  function submit(e){
    e.preventDefault()
    const payload = { ...form }
    const v = validate(payload)
    setErrors(v)
    if(Object.keys(v).length > 0) return
    // normalize numeric values
    payload.price = Number(payload.price)
    payload.quantity = Number(payload.quantity)
    if(product && product.id) payload.id = product.id
    onSave && onSave(payload)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>
        <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <input value={form.name} onChange={(e)=>update('name', e.target.value)} placeholder="Nombre" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <input value={form.sku} onChange={(e)=>update('sku', e.target.value)} placeholder="SKU" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
          </div>
          <input list="category-list" value={form.category} onChange={(e)=>update('category', e.target.value)} placeholder="Categoría" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
          <datalist id="category-list">
            {categories.map(c => <option key={c.id} value={c.nombre}>{c.parent_name ? `${c.nombre} (${c.parent_name})` : c.nombre}</option>)}
          </datalist>
          <div>
            <input value={form.price} onChange={(e)=>update('price', e.target.value)} placeholder="Precio" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>
          <div>
            <input value={form.quantity} onChange={(e)=>update('quantity', e.target.value)} placeholder="Cantidad" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
          </div>
          {/* Mostrar stock_minimo solo al crear (product === null) */}
          {!product && (
            <div>
              <input value={form.stock_minimo} onChange={(e)=>update('stock_minimo', e.target.value)} placeholder="Stock mínimo" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
            </div>
          )}
          <input value={form.supplier} onChange={(e)=>update('supplier', e.target.value)} placeholder="Proveedor" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2" />
          <input value={form.expires} onChange={(e)=>update('expires', e.target.value)} type="date" placeholder="Fecha de vencimiento" className="form-input rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 px-3 py-2 col-span-2" />
          <div className="col-span-2 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-white/5">Cancelar</button>
            <button type="submit" disabled={Object.keys(errors).length > 0} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
