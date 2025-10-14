import React from 'react'

export default function ConfirmModal({ open, message = '¿Confirmar?', onConfirm, onCancel }){
  if(!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h4 className="text-lg font-semibold">Confirmación</h4>
        <p className="mt-3 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">Eliminar</button>
        </div>
      </div>
    </div>
  )
}
