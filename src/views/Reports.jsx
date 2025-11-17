import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || ''

export default function Reports(){
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sales, setSales] = useState([])
  const base = (location.hostname === 'localhost' ? '' : API)

  async function loadSales(){
    const params = new URLSearchParams()
    if(from) params.set('from', from)
    if(to) params.set('to', to)
    const res = await fetch(base + '/api/reports/sales?' + params.toString())
    const data = await res.json()
    setSales(Array.isArray(data) ? data : [])
  }
  useEffect(()=>{ loadSales() }, [])

  function download(url, filename){
    fetch(url).then(r=>r.blob()).then(blob=>{
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    }).catch(console.error)
  }

  const downloadInventoryXlsx = ()=> download(base + '/api/reports/inventory.xlsx', 'inventario.xlsx')
  const downloadSalesXlsx = ()=> {
    const params = new URLSearchParams()
    if(from) params.set('from', from)
    if(to) params.set('to', to)
    download(base + '/api/reports/sales.xlsx?' + params.toString(), 'ventas.xlsx')
  }

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h2>
        <p className="text-sm text-gray-500">Exporta y analiza tu inventario.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Inventario actual</h4>
            <button onClick={downloadInventoryXlsx} className="px-3 py-1.5 rounded bg-primary text-white text-sm">Exportar Excel</button>
          </div>
          <p className="text-sm text-gray-500">Descarga una hoja de cálculo con el inventario.</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Ventas por periodo</h4>
            <button onClick={downloadSalesXlsx} className="px-3 py-1.5 rounded bg-primary text-white text-sm">Exportar Excel</button>
          </div>
          <div className="flex gap-2 mb-3">
            <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="border rounded px-2 py-2" />
            <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="border rounded px-2 py-2" />
            <button onClick={loadSales} className="px-3 py-2 rounded border">Aplicar</button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 text-xs uppercase">
                <tr><th className="px-2 py-2">Fecha</th><th className="px-2 py-2">Cliente</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Estado</th></tr>
              </thead>
              <tbody className="divide-y">
                {sales.map(s=> (
                  <tr key={s.id}>
                    <td className="px-2 py-2">{new Date(s.creado_en).toLocaleDateString()}</td>
                    <td className="px-2 py-2">{s.cliente || '-'}</td>
                    <td className="px-2 py-2">${s.total}</td>
                    <td className="px-2 py-2">{s.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
