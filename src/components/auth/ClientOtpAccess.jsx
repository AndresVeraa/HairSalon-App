import { useState } from 'react'
import QrScanner from '../loyalty/QrScanner'
import { createCustomerToken } from '../../utils/customerTokens'

export default function ClientOtpAccess({ onRequestMagicLink, loading, error, enrollmentMode = false }) {
  const [token, setToken] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [scannerOpen, setScannerOpen] = useState(false)
  const [nfcMessage, setNfcMessage] = useState('')
  const [generatedToken] = useState(() => (enrollmentMode ? createCustomerToken() : ''))

  const startNfc = async () => {
    if (!('NDEFReader' in window)) {
      setNfcMessage('Este navegador no permite NFC web. Usa el QR o escribe el token de la tarjeta.')
      return
    }
    try {
      const reader = new window.NDEFReader()
      await reader.scan()
      setNfcMessage('Acerca la tarjeta NFC al teléfono...')
      reader.onreading = ({ message }) => {
        for (const record of message.records) {
          const decoder = new TextDecoder(record.encoding || 'utf-8')
          const value = decoder.decode(record.data)
          if (value) {
            setToken(value.trim())
            setNfcMessage('Tarjeta NFC identificada.')
            return
          }
        }
      }
    } catch (nfcError) {
      setNfcMessage(nfcError.message)
    }
  }

  const requestLink = async (event) => {
    event.preventDefault()
    await onRequestMagicLink({ token: token || generatedToken, name, email })
  }

  return (
    <section className="mt-8 rounded-3xl border border-[#c9a15c]/30 bg-white p-5 text-left">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Cliente</p>
      <h2 className="mt-2 text-2xl font-black text-[#121212]">Entra con tu tarjeta</h2>
      <p className="mt-2 text-sm text-[#5a534a]">
        Escanea tu QR o NFC y confirma tu correo. En el primer acceso se creará tu cuenta automáticamente.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setScannerOpen((value) => !value)}
          className="rounded-xl bg-[#121212] px-3 py-2 text-xs font-black uppercase text-[#e4c88a]"
        >
          {scannerOpen ? 'Cerrar cámara' : 'Escanear QR'}
        </button>
        <button
          type="button"
          onClick={startNfc}
          className="rounded-xl border border-[#c9a15c]/50 px-3 py-2 text-xs font-black uppercase text-[#8b5e3c]"
        >
          Leer NFC
        </button>
      </div>
      {scannerOpen && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#c9a15c]/20 p-2">
          <QrScanner
            onScan={(value) => {
              setToken(value)
              setScannerOpen(false)
            }}
            onError={() => undefined}
          />
        </div>
      )}
      {nfcMessage && <p className="mt-3 text-xs font-bold text-[#8b5e3c]">{nfcMessage}</p>}
      <form onSubmit={requestLink} className="mt-5 space-y-4">
        {!enrollmentMode && (
          <input
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Token QR/NFC"
            className="w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 font-bold"
          />
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Correo asociado a la tarjeta"
            className="w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 font-bold"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre (primer acceso)"
            className="w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 font-bold"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#c9a15c] px-4 py-3 font-black text-[#121212] disabled:opacity-50"
        >
          {loading ? 'Enviando enlace...' : enrollmentMode ? 'Crear mi Wallet' : 'Enviar enlace por correo'}
        </button>
      </form>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
    </section>
  )
}
