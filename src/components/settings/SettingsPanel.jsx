import { useState } from 'react'

export default function SettingsPanel({ settings, onSave }) {
  const [staff, setStaff] = useState(settings.staff)
  const [serviceTypes, setServiceTypes] = useState(settings.serviceTypes)
  const [newService, setNewService] = useState('')

  const save = (event) => {
    event.preventDefault()
    onSave({ staff, serviceTypes })
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Configuración del salón</h2>
        <p className="mt-1 text-sm text-slate-500">Administra personal, porcentajes y servicios sin editar código.</p>
      </div>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-black">Personal y liquidación</h3>
        <div className="space-y-3">
          {staff.map((member, index) => (
            <div key={`${member.name}-${index}`} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_1fr_auto]">
              <input
                value={member.name}
                onChange={(event) =>
                  setStaff((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, name: event.target.value } : item,
                    ),
                  )
                }
                className="rounded-xl bg-slate-50 px-4 py-3 font-bold"
                aria-label={`Nombre empleado ${index + 1}`}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={member.percentage}
                onChange={(event) =>
                  setStaff((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, percentage: Number(event.target.value) } : item,
                    ),
                  )
                }
                className="rounded-xl bg-slate-50 px-4 py-3 font-bold"
                aria-label={`Porcentaje empleado ${index + 1}`}
              />
              <input
                value={member.note}
                onChange={(event) =>
                  setStaff((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, note: event.target.value } : item,
                    ),
                  )
                }
                className="rounded-xl bg-slate-50 px-4 py-3"
                aria-label={`Nota empleado ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => setStaff((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded-xl px-3 font-bold text-[#8b5e3c]"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-black">Tipos de servicio</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {serviceTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => setServiceTypes((current) => current.filter((item) => item !== type))}
              className="rounded-full border border-[#c9a15c]/30 px-4 py-2 text-sm font-bold"
            >
              {type} ×
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newService}
            onChange={(event) => setNewService(event.target.value)}
            placeholder="Nuevo servicio"
            className="flex-1 rounded-xl bg-slate-50 px-4 py-3"
          />
          <button
            type="button"
            onClick={() => {
              const value = newService.trim()
              if (value && !serviceTypes.includes(value)) {
                setServiceTypes((current) => [...current, value])
                setNewService('')
              }
            }}
            className="rounded-xl bg-[#121212] px-4 font-bold text-[#e4c88a]"
          >
            Agregar
          </button>
        </div>
      </section>
      <button type="submit" className="rounded-2xl bg-[#c9a15c] px-6 py-4 font-black text-[#121212]">
        Guardar configuración
      </button>
    </form>
  )
}
