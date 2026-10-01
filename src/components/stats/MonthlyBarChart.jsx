export default function MonthlyBarChart({ dailyData, maxDaily }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
      <h3 className="text-xl font-black text-slate-800 mb-6 text-left">Ventas Diarias</h3>
      <div className="h-48 flex items-end gap-1 overflow-x-auto pb-4">
        {dailyData.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center min-w-[12px] h-full justify-end">
            <div
              style={{ height: `${(item.total / maxDaily) * 100}%` }}
              className={`w-full max-w-[10px] rounded-t-full ${item.total ? 'bg-rose-400' : 'bg-slate-50'}`}
            />
            <span className="text-[8px] font-bold text-slate-300 mt-2">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
