import { createElement } from 'react'
import { BarChart3, CalendarCheck, History, PlusCircle, Sparkles } from 'lucide-react'

const items = [
  ['list', History, 'Liquidación'],
  ['appointments', CalendarCheck, 'Citas Bot'],
  ['stats', BarChart3, 'Estadísticas'],
  ['add', PlusCircle, 'Registro'],
  ['loyalty', Sparkles, 'Fidelización'],
]

export default function Navbar({ view, onChange }) {
  return (
    <nav className="flex bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-white shadow-sm overflow-x-auto w-full md:w-auto">
      {items.map(([key, Icon, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${view === key ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}
        >
          {createElement(Icon, { size: 18 })}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </nav>
  )
}
