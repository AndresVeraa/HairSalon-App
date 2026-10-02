import { useState } from 'react'
import QrScanner from './QrScanner'

export default function CustomerForm({ onSave, onCancel, onTokenScan }) {
  const [scanMode, setScanMode] = useState(false)
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Nueva tarjeta de fidelidad</h2>
          <p className="text-sm text-slate-400">Registro rápido del cliente</p>
        </div>
        <button
          type="button"
          onClick={() => setScanMode((current) => !current)}
          className="text-xs font-black text-rose-500"
        >
          {scanMode ? 'Cerrar lector' : 'Escanear QR'}
        </button>
      </div>
      {scanMode && (
        <QrScanner onScan={onTokenScan} onError={(error) => console.warn('El lector QR no pudo continuar.', error)} />
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSave(new FormData(event.currentTarget))
        }}
        className="space-y-4"
      >
        <input
          name="name"
          required
          placeholder="Nombre completo"
          className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold"
        />
        <input
          name="phone"
          required
          type="tel"
          placeholder="WhatsApp / Teléfono"
          className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold"
        />
        <input
          name="email"
          type="email"
          placeholder="Correo electrónico (opcional)"
          className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold"
        />
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-4 bg-slate-50 rounded-2xl font-bold">
            Cancelar
          </button>
          <button type="submit" className="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black">
            Crear tarjeta
          </button>
        </div>
      </form>
    </div>
  )
}
