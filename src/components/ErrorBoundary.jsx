import React from 'react'

export default class ErrorBoundary extends React.Component{
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(err){ return { hasError: true, error: err } }
  componentDidCatch(err, info){
    console.error('ErrorBoundary captured', err, info)
  }
  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-100">
          <div className="max-w-lg text-center p-6 bg-white dark:bg-slate-800 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">¡Ups! Ocurrió un error</h2>
            <p className="text-sm text-gray-500 mb-4">Por favor revisa la consola del navegador o contacta al administrador.</p>
            <details className="text-xs text-red-600 dark:text-red-400 text-left"><summary>Detalles</summary><pre className="whitespace-pre-wrap">{String(this.state.error)}</pre></details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
