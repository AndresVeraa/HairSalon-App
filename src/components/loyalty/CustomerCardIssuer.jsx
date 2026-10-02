import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download, Nfc } from 'lucide-react'

export default function CustomerCardIssuer({ customer }) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(customer.nfc_qr_token, { width: 360, margin: 2, errorCorrectionLevel: 'M' })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl)
      })
      .catch((error) => setMessage(error.message))
    return () => {
      active = false
    }
  }, [customer.nfc_qr_token])

  const downloadQr = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `hair-style-qr-${customer.customer_id}.png`
    link.click()
  }

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(customer.nfc_qr_token)
      setMessage('Token copiado.')
    } catch (error) {
      setMessage(`No se pudo copiar el token: ${error.message}`)
    }
  }

  const writeNfc = async () => {
    if (!('NDEFWriter' in window)) {
      setMessage('Este navegador no permite escribir NFC. Descarga el QR o usa una aplicación NFC compatible.')
      return
    }
    try {
      const writer = new window.NDEFWriter()
      await writer.write({ records: [{ recordType: 'text', data: customer.nfc_qr_token }] })
      setMessage('Token escrito en la etiqueta NFC.')
    } catch (error) {
      setMessage(`No se pudo escribir la etiqueta NFC: ${error.message}`)
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-[#c9a15c]/30 bg-[#f7f2ea] p-5 text-center">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Emisión de tarjeta</p>
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt={`Código QR de ${customer.name}`}
          className="mx-auto mt-4 h-56 w-56 rounded-xl bg-white p-2"
        />
      )}
      <p className="mt-4 break-all rounded-xl bg-white p-3 text-xs font-bold text-slate-500">{customer.nfc_qr_token}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={downloadQr}
          className="flex items-center gap-2 rounded-xl bg-[#121212] px-3 py-2 text-xs font-black uppercase text-[#e4c88a]"
        >
          <Download size={15} /> Descargar QR
        </button>
        <button
          type="button"
          onClick={copyToken}
          className="flex items-center gap-2 rounded-xl border border-[#c9a15c]/50 px-3 py-2 text-xs font-black uppercase text-[#8b5e3c]"
        >
          <Copy size={15} /> Copiar token
        </button>
        <button
          type="button"
          onClick={writeNfc}
          className="flex items-center gap-2 rounded-xl border border-[#c9a15c]/50 px-3 py-2 text-xs font-black uppercase text-[#8b5e3c]"
        >
          <Nfc size={15} /> Escribir NFC
        </button>
      </div>
      {message && <p className="mt-3 text-xs font-bold text-[#8b5e3c]">{message}</p>}
      <p className="mt-4 text-xs text-slate-500">
        Imprime el QR para entregarlo al cliente. Para NFC necesitas una etiqueta NTAG compatible y un teléfono Android
        con navegador compatible.
      </p>
    </div>
  )
}
