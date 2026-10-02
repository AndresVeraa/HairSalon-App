import { ClipboardList, User } from 'lucide-react'

export default function StaffSettlementCard({ staff }) {
  return (
    <div
      className={`p-5 rounded-3xl border shadow-sm transition-all text-left ${staff.isOwner ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-200' : 'bg-white border-slate-100'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${staff.isOwner ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
            <User size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase leading-none">{staff.name}</p>
            <p className="text-[8px] font-bold text-rose-500 uppercase mt-1">{staff.note}</p>
          </div>
        </div>
        <div
          className="bg-slate-800 text-white px-2 py-1 rounded-lg flex items-center gap-1"
          title="Servicios realizados hoy"
        >
          <ClipboardList size={10} />
          <span className="text-[10px] font-black">{staff.count}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-bold">Producción Bruta:</span>
          <span className="text-slate-800 font-black">${staff.total.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <span className={`font-black uppercase text-[10px] ${staff.isOwner ? 'text-rose-600' : 'text-slate-500'}`}>
            Total Liquidado:
          </span>
          <span className={`text-xl font-black ${staff.isOwner ? 'text-rose-600' : 'text-slate-800'}`}>
            ${staff.commission.toLocaleString('es-CO')}
          </span>
        </div>
      </div>
    </div>
  )
}
