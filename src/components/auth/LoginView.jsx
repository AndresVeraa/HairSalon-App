import { useState } from 'react'
import { LogIn } from 'lucide-react'

import ClientOtpAccess from './ClientOtpAccess'
import PublicEnrollmentCard from './PublicEnrollmentCard'

export default function LoginView({
  onSubmit,
  onRequestMagicLink,
  error,
  clientError,
  loading,
  enrollmentMode = false,
  adminOnly = false,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md rounded-[2.5rem] bg-[#f7f2ea] p-8 shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8b5e3c]">Hair Style</p>
        <h1 className="mt-3 text-4xl font-black text-[#121212]">
          {adminOnly ? 'Acceso privado' : 'Tu Wallet Hair Style'}
        </h1>
        <p className="mt-2 text-sm text-[#5a534a]">
          {enrollmentMode ? 'Crea tu tarjeta digital en menos de un minuto.' : 'Ingresa para acceder a tu experiencia.'}
        </p>
        {adminOnly && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit({ email, password })
            }}
          >
            <label className="mt-8 block text-left text-xs font-black uppercase tracking-widest text-[#5a534a]">
              Correo
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border-0 bg-white px-5 py-4 text-base normal-case tracking-normal"
              />
            </label>
            <label className="mt-5 block text-left text-xs font-black uppercase tracking-widest text-[#5a534a]">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border-0 bg-white px-5 py-4 text-base normal-case tracking-normal"
              />
            </label>
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#121212] px-5 py-4 font-black uppercase tracking-widest text-[#e4c88a] disabled:opacity-50"
            >
              <LogIn size={18} /> {loading ? 'Validando...' : 'Iniciar sesión admin'}
            </button>
          </form>
        )}
        {!adminOnly && (
          <>
            <ClientOtpAccess
              onRequestMagicLink={onRequestMagicLink}
              loading={loading}
              error={clientError}
              enrollmentMode={enrollmentMode}
            />
            {!enrollmentMode && <PublicEnrollmentCard />}
          </>
        )}
      </div>
    </main>
  )
}
