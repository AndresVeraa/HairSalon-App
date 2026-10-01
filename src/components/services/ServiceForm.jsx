const toDateTimeInputValue = (date) => {
  if (!date) return ''
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  const offset = parsed.getTimezoneOffset()
  return new Date(parsed.getTime() - offset * 60 * 1000).toISOString().slice(0, 16)
}

export default function ServiceForm({ initialService, customers = [], onSubmit, onCancel }) {
  return (
    <div className="max-w-xl mx-auto animate-in zoom-in-95">
      <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-rose-50">
        <h2
          id={initialService ? 'edit-service-title' : undefined}
          className="text-3xl font-black text-slate-800 mb-8 italic text-left"
        >
          {initialService ? 'Editar Registro' : 'Nuevo Registro'}
        </h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit(new FormData(event.currentTarget))
          }}
          className="space-y-6"
        >
          <div className="text-left space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Nombre del Cliente
            </label>
            <input
              name="client"
              required
              defaultValue={initialService?.client || ''}
              placeholder="Escribe el nombre..."
              className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl outline-none font-bold"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <label className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase ml-2">¿Quién atendió?</span>
              <select
                name="staff"
                defaultValue={initialService?.staff || 'Jhon barber'}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold"
              >
                {['Jhon barber', 'Nelly peluquera', 'Luz peluquera'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Servicio</span>
              <select
                name="type"
                defaultValue={initialService?.type || 'Corte'}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold"
              >
                {['Corte', 'Peinado', 'Cepillado', 'Coloración', 'Tratamiento', 'Otro'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-left space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fecha y hora</span>
            <input
              name="date"
              type="datetime-local"
              required
              defaultValue={toDateTimeInputValue(initialService?.date || new Date())}
              className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl font-bold"
            />
          </label>
          <label className="block text-left space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">
              Cliente de fidelidad
            </span>
            <select
              name="customerId"
              defaultValue={initialService?.customerId || ''}
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold"
            >
              <option value="">Sin tarjeta asociada</option>
              {customers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.name} ({customer.total_points} pts)
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <label className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Pago</span>
              <select
                name="paymentMethod"
                defaultValue={initialService?.paymentMethod || 'Efectivo'}
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold"
              >
                <option>Efectivo</option>
                <option>Nequi</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Precio Cobrado ($)</span>
              <input
                name="price"
                type="number"
                min="0"
                required
                defaultValue={initialService?.price || ''}
                placeholder="0"
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-xl"
              />
            </label>
          </div>
          <label className="block text-left space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Notas</span>
            <textarea
              name="notes"
              defaultValue={initialService?.notes || ''}
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-medium"
              rows="3"
            />
          </label>
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-bold uppercase text-[10px]"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-[2] py-5 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px]"
            >
              {initialService ? 'Guardar Cambios' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
