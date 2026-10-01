import { Banknote, Smartphone, Trash2 } from 'lucide-react'

export default function ServiceItem({ service, icon, onRemove, onEdit }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 group transition-all hover:bg-white">
      <div className="flex items-center gap-6 w-full text-left">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-800">{service.client}</h4>
          {service.notes && <p className="mt-1 text-xs text-slate-400 truncate max-w-[16rem]">{service.notes}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase">
              {service.type}
            </span>
            <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">
              {service.staff}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${service.paymentMethod === 'Nequi' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}
            >
              {service.paymentMethod === 'Nequi' ? <Smartphone size={8} /> : <Banknote size={8} />}
              {service.paymentMethod}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
        <span className="text-2xl font-black text-slate-800">${Number(service.price).toLocaleString('es-CO')}</span>
        <button onClick={() => onEdit(service)} className="text-slate-400 hover:text-rose-500 px-2 font-bold text-xs">
          Editar
        </button>
        <button onClick={() => onRemove(service.id)} className="text-slate-200 hover:text-rose-500 p-2">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
