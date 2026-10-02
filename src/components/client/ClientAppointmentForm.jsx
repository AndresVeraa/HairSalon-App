import { useState } from 'react'

export default function ClientAppointmentForm({ customer, onSubmit, loading, message }) {
  const [serviceType, setServiceType] = useState('Corte')
  const [appointmentDate, setAppointmentDate] = useState('')

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit({ customerId: customer?.id, clientName: customer?.name, serviceType, appointmentDate })
      }}
      className="rounded-[2rem] border border-[#c9a15c]/25 bg-white p-6 text-left"
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b5e3c]">Agenda tu experiencia</p>
      <h3 className="mt-2 text-2xl font-black text-slate-800">Solicitar una cita</h3>
      <label className="mt-5 block text-xs font-black uppercase tracking-widest text-slate-500">
        Servicio
        <select
          value={serviceType}
          onChange={(event) => setServiceType(event.target.value)}
          className="mt-2 w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 font-bold"
        >
          <option>Corte</option>
          <option>Corte + barba</option>
          <option>Peinado</option>
          <option>Cepillado</option>
          <option>Coloración</option>
          <option>Tratamiento</option>
        </select>
      </label>
      <label className="mt-4 block text-xs font-black uppercase tracking-widest text-slate-500">
        Fecha y hora
        <input
          type="datetime-local"
          required
          value={appointmentDate}
          onChange={(event) => setAppointmentDate(event.target.value)}
          className="mt-2 w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 font-bold"
        />
      </label>
      {message && <p className="mt-4 text-sm font-bold text-[#8b5e3c]">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-2xl bg-[#c9a15c] px-5 py-4 font-black text-[#121212] disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Solicitar cita'}
      </button>
    </form>
  )
}
