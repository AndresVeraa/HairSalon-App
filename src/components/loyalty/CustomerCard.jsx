export default function CustomerCard({ customer, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(customer)}
      className="w-full text-left bg-white p-5 rounded-3xl border border-white shadow-sm hover:border-rose-200"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-800">{customer.name}</h3>
          <p className="text-xs text-slate-400">{customer.phone}</p>
        </div>
        <span className="text-xs font-black text-rose-500">{customer.membership_tier}</span>
      </div>
      <p className="mt-4 text-2xl font-black text-slate-800">
        {customer.total_points} <span className="text-xs text-slate-400">puntos</span>
      </p>
    </button>
  )
}
