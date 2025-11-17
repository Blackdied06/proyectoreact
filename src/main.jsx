import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Global error handlers for runtime problems that could leave a blank screen
window.addEventListener('error', (e)=>{
  console.error('Global error', e.error || e.message)
})
window.addEventListener('unhandledrejection', (e)=>{
  console.error('Unhandled rejection', e.reason)
})
