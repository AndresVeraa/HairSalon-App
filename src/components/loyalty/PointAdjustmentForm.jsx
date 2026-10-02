import { useState } from 'react'

export default function PointAdjustmentForm({ customer, onSubmit, loading = false, message = '' }) {
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')

  return (
    <form
      className="mt-6 rounded-2xl bg-white/10 p-4 text-left"
      onSubmit={async (event) => {
        event.preventDefault()
        await onSubmit({ pointsDelta: Number(points), reason })
        setPoints('')
        setReason('')
      }}
    >
      <p className="text-xs font-black uppercase tracking-widest opacity-70">Ajuste auditado de puntos</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="number"
          required
          step="1"
          value={points}
          onChange={(event) => setPoints(event.target.value)}
          placeholder="+10 o -10"
          className="rounded-xl bg-white px-3 py-2 font-bold text-slate-800"
        />
        <input
          required
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Motivo del ajuste"
          className="rounded-xl bg-white px-3 py-2 font-bold text-slate-800"
        />
      </div>
      {message && <p className="mt-2 text-xs font-bold text-[#e4c88a]">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-3 rounded-xl bg-[#c9a15c] px-4 py-2 text-xs font-black text-[#121212] disabled:opacity-50"
      >
        {loading ? 'Guardando...' : `Ajustar a ${customer.name}`}
      </button>
    </form>
  )
}
