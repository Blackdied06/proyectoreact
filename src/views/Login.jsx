import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Login(){
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function submit(e){
    e.preventDefault()
    try {
      const base = (location.hostname === 'localhost' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:4000'))
      const url = base + '/api/auth/login'
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password })
      })
      if (!resp.ok) {
        const err = await resp.json().catch(()=>({message:'Error'}))
        alert(err.message || 'Error al iniciar sesión')
        return
      }
      const data = await resp.json()
      // Actualizamos contexto con token y rol para controlar UI
      login({ token: data.token, id: data.user.id, username: data.user.username, role_id: data.user.role_id, role_name: data.user.role_name })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('No se pudo conectar al servidor')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
  <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
        <label className="sr-only">Usuario</label>
        <input value={user} onChange={(e)=>setUser(e.target.value)} placeholder="Usuario" aria-label="Usuario" className="w-full border px-3 py-2 rounded mb-3 bg-white dark:bg-[#0b1622] text-gray-900 dark:text-gray-100" />
        <label className="sr-only">Contraseña</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Contraseña" aria-label="Contraseña" className="w-full border px-3 py-2 rounded mb-3 bg-white dark:bg-[#0b1622] text-gray-900 dark:text-gray-100" />
  <button className="w-full bg-primary text-white px-4 py-2 rounded">Entrar</button>
      </form>
    </div>
  )
}
