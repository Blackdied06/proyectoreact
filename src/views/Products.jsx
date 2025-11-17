import React, { useState, useEffect } from 'react'
import CategoryModal from '../components/CategoryModal'

export default function Products({ products = [], onOpenModal, onEdit, onDelete, searchQuery = '' }) {
  const [filtered, setFiltered] = useState(Array.isArray(products) ? products : [])
  const [error, setError] = useState(null)
  const [catOpen, setCatOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Si no se pasan productos por props, los cargamos desde la API
  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) return
    setLoading(true)
    // usar proxy en dev: ruta relativa /api
    fetch('/api/products')
      .then(async res => {
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const data = await res.json()
        if (Array.isArray(data)) {
          setFiltered(data)
          setError(null)
        } else {
          setFiltered([])
          setError('Respuesta inesperada del servidor de productos')
        }
      })
      .catch(err => { console.error('Error cargando productos', err); setError('No se pudieron cargar los productos') })
      .finally(() => setLoading(false))
  }, [products])

  useEffect(() => {
    const q = (searchQuery || '').toLowerCase()
    if (!q) setFiltered(Array.isArray(products) ? products : [])
    else
      setFiltered(
        (Array.isArray(products) ? products : []).filter(
          (p) =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        )
      )
  }, [products, searchQuery])

  const list = Array.isArray(filtered) ? filtered : []
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Inventario</h2>
          <p className="text-sm text-gray-500">Agregar, editar y gestionar productos.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-md border px-3 py-2 text-sm">
            <option value="">Todas las categorías</option>
          </select>
          <button onClick={()=>setCatOpen(true)} className="rounded-md border px-3 py-2 text-sm">Gestionar categorías</button>
          <button onClick={onOpenModal} className="rounded-md bg-primary px-4 py-2 text-white text-sm">Agregar producto</button>
        </div>
      </div>

      <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
        {error && (
          <div className="mb-3 p-2 text-sm rounded border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
                    No hay productos. Agrega uno.
                  </td>
                </tr>
              )}

              {list.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-4 py-3">{p.name || p.nombre}</td>
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3">{p.category || p.categoria}</td>
                  <td className="px-4 py-3">{p.price || p.precio}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{p.quantity ?? p.stock}</span>
                      {((p.quantity ?? p.stock) && Number(p.quantity ?? p.stock) < 20) && (
                        <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-50">Bajo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.supplier || p.proveedor}</td>
                  <td className="px-4 py-3">{p.expires || p.vence_en || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit && onEdit(p)} className="px-2 py-1 rounded border text-primary">Editar</button>
                      <button onClick={() => onDelete && onDelete(p.id)} className="px-2 py-1 rounded border text-red-600">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {catOpen && <CategoryModal open={catOpen} onClose={()=>setCatOpen(false)} />}
    </section>
  )
}
