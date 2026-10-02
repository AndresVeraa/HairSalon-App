import { MessageSquare } from 'lucide-react'
import BotAppointmentCard from './BotAppointmentCard'

export default function AppointmentList({ appointments, onConfirm, onReject }) {
  if (!appointments.length)
    return (
      <div className="text-center py-20 bg-white/40 rounded-[3rem] border-4 border-dashed border-white">
        <MessageSquare className="mx-auto w-12 h-12 text-slate-200 mb-4 opacity-50" />
        <p className="text-slate-400 font-bold italic">No hay citas pendientes hoy.</p>
      </div>
    )
  return (
    <div className="grid gap-4">
      {appointments.map((appointment) => (
        <BotAppointmentCard key={appointment.id} appointment={appointment} onConfirm={onConfirm} onReject={onReject} />
      ))}
    </div>
  )
}
