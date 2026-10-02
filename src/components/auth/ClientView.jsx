import Header from '../layout/Header'

export default function ClientView({ onRoleChange, children, authenticated = false }) {
  return (
    <div className="brand-shell min-h-screen bg-pink-50 text-slate-900 font-sans selection:bg-rose-200">
      <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
        <div className="mb-8 flex justify-center">
          <Header role="client" onRoleChange={onRoleChange} authenticated={authenticated} />
        </div>
        {children}
        <footer className="mt-16 -mx-4 bg-[#0b0b0b] px-4 pt-8 pb-10 text-center text-[10px] font-black uppercase tracking-[0.35em] text-[#a59e92]">
          Hair Style • Mi Wallet • Tu mejor versión, con confianza.
        </footer>
      </div>
    </div>
  )
}
