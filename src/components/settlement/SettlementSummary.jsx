import { Coins } from 'lucide-react'
import DailyCashCard from './DailyCashCard'
import StaffSettlementCard from './StaffSettlementCard'

export default function SettlementSummary({ cash, staff }) {
  const owner = staff.find((item) => item.isOwner)
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DailyCashCard cash={cash} />
        <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-center text-center">
          <Coins className="mx-auto text-rose-500 mb-2" size={24} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
            Total Dueña
            <br />
            (Luz)
          </p>
          <h3 className="text-2xl font-black text-slate-800">${owner?.commission.toLocaleString('es-CO')}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {staff.map((item) => (
          <StaffSettlementCard key={item.name} staff={item} />
        ))}
      </div>
    </>
  )
}
