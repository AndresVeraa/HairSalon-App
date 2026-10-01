import { useMemo } from 'react'
import { Download, WalletCards } from 'lucide-react'

export default function ClientWallet({ customers, customerId, onCustomerChange }) {
  const customer = useMemo(
    () => customers.find((item) => item.customer_id === customerId) || customers[0],
    [customers, customerId],
  )

  const downloadWalletCard = () => {
    if (!customer) return
    const card = {
      type: 'HairStyleLoyaltyCard',
      issuer: 'Hair Style — Salón & Barbería',
      customer_id: customer.customer_id,
      name: customer.name,
      phone: customer.phone,
      points: customer.total_points,
      membership_tier: customer.membership_tier,
      qr_token: customer.nfc_qr_token,
    }
    const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `hair-style-wallet-${customer.customer_id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!customer) {
    return (
      <div className="rounded-[2.5rem] bg-[#121212] p-8 text-center text-[#f7f2ea]">
        <WalletCards className="mx-auto mb-4 text-[#e4c88a]" size={42} />
        <h2 className="text-2xl font-black">Tu Wallet Hair Style</h2>
        <p className="mt-2 text-sm text-[#a59e92]">Aún no existe una tarjeta de fidelidad.</p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Área de cliente</p>
        <h2 className="mt-2 text-3xl font-black text-slate-800">Mi Wallet</h2>
        <p className="mt-1 text-sm text-slate-500">Tu tarjeta queda guardada localmente en este dispositivo.</p>
      </div>
      {customers.length > 1 && (
        <label className="block space-y-2 text-left">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Seleccionar cliente demo</span>
          <select
            value={customer.customer_id}
            onChange={(event) => onCustomerChange(event.target.value)}
            className="w-full rounded-2xl bg-[#f7f2ea] px-5 py-4 font-bold"
          >
            {customers.map((item) => (
              <option key={item.customer_id} value={item.customer_id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#121212] p-8 text-[#f7f2ea] shadow-2xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#c9a15c]/40" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#e4c88a]">Hair Style</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-[#a59e92]">Salón &amp; Barbería</p>
            </div>
            <WalletCards className="text-[#c9a15c]" size={30} />
          </div>
          <h3 className="mt-12 text-3xl font-black">{customer.name}</h3>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-5xl font-black text-[#e4c88a]">{customer.total_points}</p>
              <p className="text-xs uppercase tracking-widest text-[#a59e92]">Puntos</p>
            </div>
            <div className="text-right">
              <p className="font-black text-[#e4c88a]">{customer.membership_tier}</p>
              <p className="mt-1 max-w-40 break-all text-[9px] text-[#a59e92]">{customer.nfc_qr_token}</p>
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={downloadWalletCard}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9a15c] px-5 py-4 font-black text-[#121212] transition hover:bg-[#e4c88a]"
      >
        <Download size={18} /> Guardar tarjeta en mi Wallet
      </button>
      <p className="text-center text-xs text-slate-500">
        La descarga genera una tarjeta digital portable. La integración nativa con Apple Wallet o Google Wallet se
        agregará con backend y credenciales del emisor.
      </p>
    </section>
  )
}
