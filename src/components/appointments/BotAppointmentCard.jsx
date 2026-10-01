import { CheckCircle2, Clock, MessageSquare, User, XCircle } from 'lucide-react'

export default function BotAppointmentCard({ appointment, onConfirm, onReject }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
      <div className="flex items-center gap-5 w-full">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 shrink-0">
          <User size={28} />
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-800">{appointment.client}</h4>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {appointment.source}
            </span>
            <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
              {appointment.type}
            </span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Clock size={12} />
              {new Date(appointment.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button
          aria-label="Confirmar cita"
          onClick={() => onConfirm(appointment)}
          className="flex-1 bg-rose-500 text-white p-3 rounded-xl"
        >
          <CheckCircle2 size={20} />
        </button>
        <button
          aria-label="Rechazar cita"
          onClick={() => onReject(appointment.id)}
          className="flex-1 bg-slate-100 text-slate-400 p-3 rounded-xl"
        >
          <XCircle size={20} />
        </button>
      </div>
    </div>
  )
}
