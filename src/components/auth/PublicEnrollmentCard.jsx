import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Download } from 'lucide-react'
import { getEnrollmentUrl } from '../../utils/customerTokens'

export default function PublicEnrollmentCard() {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [message, setMessage] = useState('')
  const enrollmentUrl = getEnrollmentUrl()

  useEffect(() => {
    QRCode.toDataURL(enrollmentUrl, { width: 260, margin: 2 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [enrollmentUrl])

  const downloadQr = () => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = 'hair-style-registro-clientes.png'
    link.click()
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(enrollmentUrl)
      setMessage('Enlace copiado.')
    } catch (error) {
      setMessage(`No se pudo copiar el enlace: ${error.message}`)
    }
  }

  const writeNfc = async () => {
    if (!('NDEFWriter' in window)) {
      setMessage('Este navegador no permite escribir NFC. Descarga el QR para imprimirlo.')
      return
    }
    try {
      const writer = new window.NDEFWriter()
      await writer.write({ records: [{ recordType: 'url', data: enrollmentUrl }] })
      setMessage('NFC de registro escrito correctamente.')
    } catch (error) {
      setMessage(`No se pudo escribir NFC: ${error.message}`)
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-[#c9a15c]/30 bg-white p-5 text-left">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Registro automático</p>
      <h2 className="mt-2 text-2xl font-black text-[#121212]">Crea tu Wallet Hair Style</h2>
      <p className="mt-2 text-sm text-[#5a534a]">
        Escanea este código en recepción o en el espejo. El cliente se registra sin intervención del administrador.
      </p>
      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="QR público para crear una Wallet Hair Style"
          className="mx-auto mt-4 h-52 w-52 rounded-xl bg-white p-2"
        />
      )}
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
          onClick={copyUrl}
          className="flex items-center gap-2 rounded-xl border border-[#c9a15c]/50 px-3 py-2 text-xs font-black uppercase text-[#8b5e3c]"
        >
          <Copy size={15} /> Copiar enlace
        </button>
        <button
          type="button"
          onClick={writeNfc}
          className="flex items-center gap-2 rounded-xl border border-[#c9a15c]/50 px-3 py-2 text-xs font-black uppercase text-[#8b5e3c]"
        >
          Escribir NFC
        </button>
      </div>
      {message && <p className="mt-3 text-xs font-bold text-[#8b5e3c]">{message}</p>}
      <p className="mt-3 break-all text-center text-[10px] text-slate-400">{enrollmentUrl}</p>
    </section>
  )
}
