import { Banknote, Smartphone, Wallet } from 'lucide-react'

export default function DailyCashCard({ cash }) {
  return (
    <div className="bg-[#121212] p-6 rounded-[2rem] shadow-xl shadow-stone-900/20 text-white col-span-1 md:col-span-2 flex flex-col justify-center border border-[#c9a15c]/30">
      <div className="flex items-center justify-between mb-4 text-left">
        <div>
          <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1">Caja Bruta Hoy</p>
          <h3 className="text-4xl font-black">${cash.total.toLocaleString('es-CO')}</h3>
        </div>
        <Wallet size={48} className="opacity-30" />
      </div>
      <div className="flex gap-6 border-t border-white/20 pt-4 text-left">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-rose-100" />
          <div>
            <p className="text-[8px] font-black text-rose-200 uppercase tracking-tighter">Nequi</p>
            <p className="text-sm font-black">${cash.nequi.toLocaleString('es-CO')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Banknote size={16} className="text-rose-100" />
          <div>
            <p className="text-[8px] font-black text-rose-200 uppercase tracking-tighter">Efectivo</p>
            <p className="text-sm font-black">${cash.cash.toLocaleString('es-CO')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
