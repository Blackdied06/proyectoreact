import React, { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Dashboard(){
  const [metrics, setMetrics] = useState({ total_stock: 0, ventas_hoy_total: 0, alertas_criticas: 0, productos_criticos: [] })
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)

  async function fetchMetrics(){
    try {
      // Preferir proxy en dev: usar ruta relativa /api si Vite proxy está activo
      const url = (location.hostname === 'localhost' ? '/api/metrics/dashboard' : `${API_BASE}/api/metrics/dashboard`)
      const res = await fetch(url)
      if(res.ok){
        const data = await res.json()
        setMetrics(data)
        setError(null)
      } else {
        // Intentar parsear respuesta degradada (503) con estructura de métricas
        let data = null
        try{ data = await res.json() }catch{}
        if(data && (data.total_stock !== undefined)){
          setMetrics({
            total_stock: data.total_stock||0,
            ventas_hoy_total: data.ventas_hoy_total||0,
            alertas_criticas: data.alertas_criticas||0,
            productos_criticos: data.productos_criticos||[]
          })
          setError('Modo degradado: la base de datos no está disponible.')
        } else {
          throw new Error('HTTP '+res.status)
        }
      }
    } catch(e){
      console.error('Error cargando métricas', e)
      setError('No se pudieron cargar las métricas. Verifique el backend.')
    } finally {
      setLoading(false)
    }
  }

  const [error, setError] = useState(null)

  useEffect(()=>{ fetchMetrics() }, [])

  useEffect(()=>{
    // conectar socket sólo una vez
    const socketUrl = (location.hostname === 'localhost' ? API_BASE : API_BASE)
    socketRef.current = io(socketUrl, { transports: ['websocket'], reconnectionAttempts: 5 })
    socketRef.current.on('connect', ()=>{ /* opcional: console.log('socket conectado') */ })
    socketRef.current.on('connect_error', (err)=>{ console.warn('Socket connect_error', err); setError('No se pudo conectar al servidor de tiempo real (socket).'); })
    socketRef.current.on('metrics:update', ()=>{ fetchMetrics() })
    // también podríamos escuchar eventos específicos para optimizar
    socketRef.current.on('product:created', ()=>fetchMetrics())
    socketRef.current.on('product:updated', ()=>fetchMetrics())
    socketRef.current.on('product:deleted', ()=>fetchMetrics())
    socketRef.current.on('sale:created', ()=>fetchMetrics())
    return ()=>{ if(socketRef.current) socketRef.current.disconnect() }
  }, [])

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-sm text-gray-500">Resumen rápido de estado y alertas</p>
        </div>
      </div>
      {loading && <p className="text-sm text-gray-500">Cargando métricas...</p>}
      {error && !loading && (
        <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Stock total</p>
            <p className="text-2xl font-bold">{metrics.total_stock}</p>
          </div>
          <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10z" fill="currentColor"/></svg>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Ventas hoy</p>
            <p className="text-2xl font-bold">${metrics.ventas_hoy_total}</p>
          </div>
          <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v4H3zM5 11h14v10H5z" fill="currentColor"/></svg>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Alertas críticas</p>
            <p className="text-2xl font-bold text-red-500">{metrics.alertas_criticas}</p>
          </div>
          <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 22h20L12 2z" fill="currentColor"/></svg>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-slate-800 shadow flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Productos críticos</p>
            <p className="text-2xl font-bold">{metrics.productos_criticos.length}</p>
          </div>
          <svg className="w-10 h-10 text-yellow-500" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 8l6 .5-4.5 3 1.5 6L12 16l-6 2 1.5-6L3 8.5 9 8l3-6z" fill="currentColor"/></svg>
        </div>
      </div>
      {metrics.productos_criticos.length > 0 && (
        <div className="mt-6 rounded bg-white dark:bg-slate-800 shadow p-4">
          <h3 className="font-semibold mb-2 text-sm">Lista de productos críticos</h3>
          <ul className="space-y-1 text-sm">
            {metrics.productos_criticos.map(p => (
              <li key={p.id} className="flex justify-between">
                <span>{p.nombre}</span>
                <span className="text-red-500">{p.stock}/{p.stock_minimo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
