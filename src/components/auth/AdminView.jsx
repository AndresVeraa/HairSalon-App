import Header from '../layout/Header'
import Navbar from '../layout/Navbar'

export default function AdminView({ view, onViewChange, onRoleChange, children, authenticated = false }) {
  return (
    <div className="brand-shell min-h-screen bg-pink-50 text-slate-900 font-sans selection:bg-rose-200">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <div className="mb-8 flex flex-col items-center justify-between gap-6 lg:flex-row">
          <Header role="admin" onRoleChange={onRoleChange} authenticated={authenticated} />
          <Navbar view={view} onChange={onViewChange} />
        </div>
        {children}
        <footer className="mt-16 -mx-4 bg-[#0b0b0b] px-4 pt-8 pb-10 text-center text-[10px] font-black uppercase tracking-[0.35em] text-[#a59e92]">
          Hair Style • Administración • Tu mejor versión, con confianza.
        </footer>
      </div>
    </div>
  )
}
