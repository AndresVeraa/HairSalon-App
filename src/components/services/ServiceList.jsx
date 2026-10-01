import { Search } from 'lucide-react'
import ServiceItem from './ServiceItem'

export default function ServiceList({ services, searchTerm, onSearch, onRemove, onEdit, getIcon }) {
  return (
    <>
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="w-full pl-14 pr-8 py-5 bg-white rounded-3xl border-0 shadow-sm outline-none focus:ring-4 focus:ring-rose-100 font-medium placeholder:text-slate-300"
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <div className="grid gap-4 pb-12">
        {services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            icon={getIcon(service.type)}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}
      </div>
    </>
  )
}
