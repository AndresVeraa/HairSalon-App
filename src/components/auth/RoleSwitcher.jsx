import { ShieldCheck, UserRound } from 'lucide-react'

export default function RoleSwitcher({ role, onRoleChange }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[#c9a15c]/25 bg-[#121212] p-1 text-xs font-bold">
      <button
        type="button"
        onClick={() => onRoleChange('admin')}
        className={`flex items-center gap-1 rounded-xl px-3 py-2 ${role === 'admin' ? 'bg-[#f7f2ea] text-[#9b7637]' : 'text-[#a59e92]'}`}
      >
        <ShieldCheck size={14} /> Admin
      </button>
      <button
        type="button"
        onClick={() => onRoleChange('client')}
        className={`flex items-center gap-1 rounded-xl px-3 py-2 ${role === 'client' ? 'bg-[#f7f2ea] text-[#9b7637]' : 'text-[#a59e92]'}`}
      >
        <UserRound size={14} /> Cliente
      </button>
    </div>
  )
}
