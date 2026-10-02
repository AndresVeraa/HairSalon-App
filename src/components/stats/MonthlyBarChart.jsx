export default function MonthlyBarChart({ dailyData, maxDaily }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
      <h3 className="text-xl font-black text-slate-800 mb-6 text-left">Ventas Diarias</h3>
      <div className="h-48 flex items-end gap-1 overflow-x-auto pb-4">
        {dailyData.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center min-w-[24px] h-full justify-end">
            <div
              style={{ height: `${Math.max((item.total / maxDaily) * 100, item.total ? 3 : 0)}%` }}
              className={`w-full max-w-[14px] rounded-t-full ${item.total ? 'bg-[#c9a15c]' : 'bg-slate-50'}`}
            />
            <span className="text-[8px] font-bold text-slate-300 mt-2">{item.day.slice(-2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
