import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }){

  const [user, setUser] = useState(()=>{
    try{
      const token = localStorage.getItem('stockpilot_token')
      const userStr = localStorage.getItem('stockpilot_user')
      return token && userStr ? JSON.parse(userStr) : null
    }catch(e){ return null }
  })

  useEffect(()=>{
    try{
      if(user){
        localStorage.setItem('stockpilot_token', user.token || 'demo-token')
        localStorage.setItem('stockpilot_user', JSON.stringify({ id: user.id, username: user.username }))
      } else {
        localStorage.removeItem('stockpilot_token')
        localStorage.removeItem('stockpilot_user')
      }
    }catch(e){}
  }, [user])

  const login = (payload)=> setUser(payload ? payload : null)
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
