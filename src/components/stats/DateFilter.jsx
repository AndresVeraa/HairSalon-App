export default function DateFilter({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-[#c9a15c]/20 bg-[#f7f2ea] p-4 md:flex-row md:items-end">
      <label className="flex-1 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#5a534a]">
        Desde
        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#c9a15c]/30 bg-white px-3 py-2 text-sm font-medium tracking-normal text-[#121212]"
        />
      </label>
      <label className="flex-1 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#5a534a]">
        Hasta
        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#c9a15c]/30 bg-white px-3 py-2 text-sm font-medium tracking-normal text-[#121212]"
        />
      </label>
    </div>
  )
}
