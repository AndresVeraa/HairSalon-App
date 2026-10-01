import { Scissors } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
      <div className="flex items-center gap-4">
        <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-200">
          <Scissors className="text-white w-7 h-7 md:w-8 md:h-8" />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
            Hair<span className="text-rose-500">Salon</span>
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em]">Management Pro</p>
        </div>
      </div>
    </header>
  )
}
