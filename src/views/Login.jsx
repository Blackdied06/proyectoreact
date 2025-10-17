import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Login(){
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'

  async function submit(e){
    e.preventDefault()
    try {
      const url = mode === 'login' ? 'http://localhost:4000/api/auth/login' : 'http://localhost:4000/api/auth/register'
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
      // guardamos token (simple) y actualizamos contexto
      localStorage.setItem('token', data.token)
      login({ token: data.token, id: data.user.id, username: data.user.username })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('No se pudo conectar al servidor')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
  <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
        <label className="sr-only">Usuario</label>
        <input value={user} onChange={(e)=>setUser(e.target.value)} placeholder="Usuario" aria-label="Usuario" className="w-full border px-3 py-2 rounded mb-3 bg-white dark:bg-[#0b1622] text-gray-900 dark:text-gray-100" />
        <label className="sr-only">Contraseña</label>
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Contraseña" aria-label="Contraseña" className="w-full border px-3 py-2 rounded mb-3 bg-white dark:bg-[#0b1622] text-gray-900 dark:text-gray-100" />
  <button className="w-full bg-primary text-white px-4 py-2 rounded">{mode === 'login' ? 'Entrar' : 'Registrarse'}</button>
        <div className="text-center mt-3">
          <button type="button" onClick={()=>setMode(m=> m === 'login' ? 'register' : 'login')} className="text-sm text-blue-600">{mode === 'login' ? 'Crear cuenta' : 'Volver a iniciar sesión'}</button>
        </div>
      </form>
    </div>
  )
}
