import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Login(){
  const [user, setUser] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  function submit(e){
    e.preventDefault()
    // use auth context to login
    login({ name: user || 'demo' })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <form onSubmit={submit} className="w-full max-w-md bg-white dark:bg-[#071422] p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Iniciar sesión</h2>
        <label className="sr-only">Usuario</label>
        <input value={user} onChange={(e)=>setUser(e.target.value)} placeholder="Usuario" aria-label="Usuario" className="w-full border px-3 py-2 rounded mb-3 bg-white dark:bg-[#0b1622] text-gray-900 dark:text-gray-100" />
        <button className="w-full bg-primary text-white px-4 py-2 rounded">Entrar</button>
      </form>
    </div>
  )
}
