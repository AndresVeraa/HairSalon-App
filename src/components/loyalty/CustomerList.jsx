import CustomerCard from './CustomerCard'

export default function CustomerList({ customers, onSelect }) {
  return (
    <div className="grid gap-3">
      {customers.length ? (
        customers.map((customer) => <CustomerCard key={customer.customer_id} customer={customer} onSelect={onSelect} />)
      ) : (
        <p className="text-center text-slate-400 py-10">Aún no hay clientes registrados.</p>
      )}
    </div>
  )
}
