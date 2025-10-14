import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Modal from '../components/Modal'

describe('Modal', ()=>{
  test('renders and validates required fields', ()=>{
    const onSave = jest.fn()
    const onClose = jest.fn()
    render(<Modal open={true} onClose={onClose} title="Test" product={null} onSave={onSave} />)

    // try submit without filling
    const saveBtn = screen.getByText('Guardar')
    fireEvent.click(saveBtn)

    expect(screen.getByText(/Ingrese el nombre del producto/i)).toBeInTheDocument()
    expect(screen.getByText(/SKU requerido/i)).toBeInTheDocument()
  })
})
