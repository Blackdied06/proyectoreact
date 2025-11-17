import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

const API = import.meta.env.VITE_API_URL || ''

export default function Users(){
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ username:'', password:'' })
  const base = (location.hostname === 'localhost' ? '' : API)
  const { user: current } = useAuth()
  const isAdmin = (current?.role_name === 'admin') || (current?.role_id === 1)
  const token = (current && current.token) || localStorage.getItem('stockpilot_token')

  async function load(){
    try{
      const res = await fetch(base + '/api/auth/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    }catch(e){ console.error('Error cargando usuarios', e) }
  }
  useEffect(()=>{ load() }, [])

  async function register(e){
    e.preventDefault()
    if(!form.username || !form.password) return
    try{
      const res = await fetch(base + '/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json', 'Authorization': `Bearer ${token}`}, body: JSON.stringify({ username: form.username, password: form.password }) })
      if(!res.ok) throw new Error('Error registrando usuario')
      setForm({ username:'', password:'' })
      await load()
    }catch(e){ console.error(e) }
  }

  async function removeUser(id){
    try{
      const res = await fetch(base + '/api/users/' + id, { method:'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
      if(res.ok) setUsers(prev=>prev.filter(u=>u.id!==id))
    }catch(e){ console.error(e) }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usuarios y roles</h2>
        <div className="text-sm text-gray-500">Administra usuarios</div>
      </div>
      {isAdmin && (
      <form onSubmit={register} className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow mb-4 flex gap-2 items-end">
        <div>
          <label className="text-xs text-gray-500">Usuario</label>
          <input value={form.username} onChange={e=>setForm(f=>({...f, username:e.target.value}))} className="border rounded px-3 py-2" placeholder="usuario" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Contraseña</label>
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} className="border rounded px-3 py-2" placeholder="contraseña" />
        </div>
        <button className="px-4 py-2 rounded bg-primary text-white">Agregar usuario</button>
      </form>
      )}
      <div className="rounded-lg bg-white dark:bg-slate-800 p-4 shadow">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 text-xs uppercase">
            <tr><th className="px-3 py-2">ID</th><th className="px-3 py-2">Usuario</th><th className="px-3 py-2">Rol</th><th className="px-3 py-2">Creado</th><th className="px-3 py-2"></th></tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u=> (
              <tr key={u.id}>
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.usuario}</td>
                <td className="px-3 py-2">{u.rol || u.rol_id || '-'}</td>
                <td className="px-3 py-2">{u.creado_en ? new Date(u.creado_en).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2 text-right">{isAdmin && (<button onClick={()=>removeUser(u.id)} className="text-red-600">Eliminar</button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
