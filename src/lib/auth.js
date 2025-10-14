import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=>{
    try{ return localStorage.getItem('stockpilot_token') ? { name: 'demo' } : null }catch(e){ return null }
  })

  useEffect(()=>{
    try{ if(user) localStorage.setItem('stockpilot_token', 'demo-token'); else localStorage.removeItem('stockpilot_token') }catch(e){}
  }, [user])

  const login = (payload)=> setUser({ name: payload?.name || 'demo' })
  const logout = ()=> setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}
