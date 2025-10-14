import React, { useState, useEffect } from 'react'

export default function Products({ products = [], onOpenModal, onEdit, onDelete, searchQuery = '' }) {
  const [filtered, setFiltered] = useState(products)

  useEffect(() => {
    const q = (searchQuery || '').toLowerCase()
    if (!q) setFiltered(products)
    else
      setFiltered(
        products.filter(
          (p) =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        )
      )
  }, [products, searchQuery])

  const list = filtered || []

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
          <button onClick={onOpenModal} className="rounded-md bg-primary px-4 py-2 text-white text-sm">Agregar producto</button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
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
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                    No hay productos. Agrega uno.
                  </td>
                </tr>
              )}

              {list.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.sku}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{p.quantity}</span>
                      {p.quantity && Number(p.quantity) < 20 && (
                        <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Bajo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.supplier}</td>
                  <td className="px-4 py-3">{p.expires || '—'}</td>
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
    </section>
  )
}
