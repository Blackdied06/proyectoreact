import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ConfirmModal from '../components/ConfirmModal'

describe('ConfirmModal', ()=>{
  test('renders and calls callbacks', ()=>{
    const onConfirm = jest.fn()
    const onCancel = jest.fn()
    render(<ConfirmModal open={true} message="¿Eliminar?" onConfirm={onConfirm} onCancel={onCancel} />)

    expect(screen.getByText(/Confirmación/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText('Eliminar'))
    expect(onConfirm).toHaveBeenCalled()
  })
})
