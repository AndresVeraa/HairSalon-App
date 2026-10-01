import { useState } from 'react'
import CustomerForm from './CustomerForm'
import CustomerList from './CustomerList'

export default function LoyaltyPanel({ customers, onCreate, onSelect, selectedCustomer, onCloseProfile }) {
  const [showForm, setShowForm] = useState(false)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Fidelización</h2>
          <p className="text-sm text-slate-400">Tarjetas digitales y puntos locales</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-rose-500 text-white px-5 py-3 rounded-2xl font-black text-xs"
        >
          Nuevo cliente
        </button>
      </div>
      {showForm && (
        <CustomerForm
          onSave={(formData) => {
            onCreate(formData)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
          onTokenScan={() => {}}
        />
      )}
      {selectedCustomer ? (
        <div className="bg-rose-500 text-white p-6 rounded-[2.5rem]">
          <button onClick={onCloseProfile} className="float-right text-xs font-black">
            Cerrar
          </button>
          <p className="text-xs uppercase font-black opacity-70">Tarjeta digital</p>
          <h3 className="text-3xl font-black mt-2">{selectedCustomer.name}</h3>
          <p className="mt-4 text-5xl font-black">
            {selectedCustomer.total_points} <span className="text-sm">puntos</span>
          </p>
          <p className="mt-2 font-bold">{selectedCustomer.membership_tier}</p>
          <p className="mt-4 text-xs break-all opacity-80">QR: {selectedCustomer.nfc_qr_token}</p>
        </div>
      ) : (
        <CustomerList customers={customers} onSelect={onSelect} />
      )}
    </div>
  )
}
