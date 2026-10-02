import { Scissors } from 'lucide-react'
import RoleSwitcher from '../auth/RoleSwitcher'

export default function Header({ role, onRoleChange, authenticated = false }) {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
      <div className="flex items-center gap-4">
        <div className="bg-[#121212] p-3 rounded-full shadow-lg shadow-amber-900/20 border border-[#c9a15c]/50">
          <div className="relative flex items-center justify-center w-8 h-8">
            <span className="font-serif text-2xl font-bold tracking-[-0.18em] text-[#e4c88a]">H</span>
            <span className="font-serif text-2xl font-bold text-[#c9a15c]">S</span>
            <Scissors className="absolute text-[#f7f2ea] w-3 h-3 opacity-80" />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
            Hair <span className="text-rose-500">Style</span>
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em]">Salón &amp; Barbería</p>
          <p className="text-[10px] italic text-slate-500 mt-1">Tu mejor versión, con confianza.</p>
        </div>
      </div>
      {authenticated ? (
        <button
          type="button"
          onClick={() => onRoleChange('logout')}
          className="rounded-xl bg-[#121212] px-4 py-3 text-xs font-black uppercase tracking-widest text-[#e4c88a]"
        >
          Cerrar sesión
        </button>
      ) : (
        <RoleSwitcher role={role} onRoleChange={onRoleChange} />
      )}
    </header>
  )
}
