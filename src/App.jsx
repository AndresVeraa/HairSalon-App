import { useEffect, useMemo, useState } from 'react'
import { Crown, MoreHorizontal, Palette, Scissors, Sparkles, Wind } from 'lucide-react'
import SettlementSummary from './components/settlement/SettlementSummary'
import ServiceForm from './components/services/ServiceForm'
import EditServiceModal from './components/services/EditServiceModal'
import ServiceList from './components/services/ServiceList'
import AppointmentList from './components/appointments/AppointmentList'
import MonthlyBarChart from './components/stats/MonthlyBarChart'
import LoyaltyPanel from './components/loyalty/LoyaltyPanel'
import ClientWallet from './components/loyalty/ClientWallet'
import AdminView from './components/auth/AdminView'
import ClientView from './components/auth/ClientView'
import SettingsPanel from './components/settings/SettingsPanel'
import { calculateDailyCash, calculateStaffSettlement } from './utils/settlementCalculations'
import { readSettings, SETTINGS_STORAGE_KEY } from './utils/salonSettings'
import { calculateMonthlyStats } from './utils/statsCalculations'
import {
  appointmentStorageKey,
  readAppointments,
  readJsonArray,
  readServices,
  writeStorageArray,
  serviceStorageKey,
} from './utils/storageHelper'
import {
  addPointsTransaction,
  calculateBarberPromotion,
  createCustomer,
  LOYALTY_STORAGE_KEYS,
} from './utils/loyaltyCalculations'

const icons = { Corte: Scissors, Peinado: Crown, Cepillado: Wind, Coloración: Palette, Tratamiento: Sparkles }

export default function App() {
  const [services, setServices] = useState(() => readServices())
  const [appointments, setAppointments] = useState(() => readAppointments())
  const [view, setView] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [serviceDraft, setServiceDraft] = useState(null)
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null)
  const [customers, setCustomers] = useState(() => readJsonArray(window.localStorage, LOYALTY_STORAGE_KEYS.customers))
  const [pointsLedger, setPointsLedger] = useState(() =>
    readJsonArray(window.localStorage, LOYALTY_STORAGE_KEYS.points),
  )
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [role, setRole] = useState('admin')
  const [walletCustomerId, setWalletCustomerId] = useState(null)
  const [settings, setSettings] = useState(() => readSettings())

  useEffect(() => writeStorageArray(window.localStorage, serviceStorageKey, services), [services])
  useEffect(() => writeStorageArray(window.localStorage, appointmentStorageKey, appointments), [appointments])
  useEffect(() => writeStorageArray(window.localStorage, LOYALTY_STORAGE_KEYS.customers, customers), [customers])
  useEffect(() => writeStorageArray(window.localStorage, LOYALTY_STORAGE_KEYS.points, pointsLedger), [pointsLedger])

  const cash = useMemo(() => calculateDailyCash(services), [services])
  const staff = useMemo(
    () => calculateStaffSettlement(services, new Date(), settings.staff),
    [services, settings.staff],
  )
  const monthly = useMemo(() => calculateMonthlyStats(services), [services])
  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        String(service.client || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [services, searchTerm],
  )

  const saveService = (formData) => {
    const formValues = {
      client: formData.get('client'),
      type: formData.get('type'),
      price: Math.round(Number.parseFloat(formData.get('price') || 0)),
      paymentMethod: formData.get('paymentMethod'),
      staff: formData.get('staff'),
      notes: formData.get('notes') || '',
      customerId: formData.get('customerId') || '',
      date: formData.get('date') ? new Date(formData.get('date')).toISOString() : new Date().toISOString(),
    }
    const promotion = formValues.customerId
      ? calculateBarberPromotion(services, formValues.customerId, formValues)
      : {
          visitNumber: 0,
          originalPrice: formValues.price,
          discountPercentage: 0,
          discountAmount: 0,
          finalPrice: formValues.price,
        }
    const values = {
      ...formValues,
      price: promotion.finalPrice,
      ...promotion,
    }
    if (editingService) {
      setServices((current) =>
        current.map((service) => (service.id === editingService.id ? { ...service, ...values } : service)),
      )
      setEditingService(null)
    } else {
      setServices((current) => [{ ...values, id: Date.now() }, ...current])
      const customer = customers.find((item) => item.customer_id === values.customerId)
      if (customer) {
        const result = addPointsTransaction(customer, values, values.staff)
        setCustomers((current) =>
          current.map((item) => (item.customer_id === customer.customer_id ? result.customer : item)),
        )
        setPointsLedger((current) => [result.transaction, ...current])
      }
      if (pendingAppointmentId !== null) {
        setAppointments((current) => current.filter((appointment) => appointment.id !== pendingAppointmentId))
        setPendingAppointmentId(null)
      }
    }
    setView('list')
  }

  const removeService = (id) => {
    if (window.confirm('¿Deseas eliminar este registro?'))
      setServices((current) => current.filter((service) => service.id !== id))
  }

  const getIcon = (type) => {
    const Icon = icons[type] || MoreHorizontal
    return <Icon className="w-6 h-6" />
  }

  const confirmAppointment = (appointment) => {
    setServiceDraft({
      client: appointment.client,
      type: appointment.type,
      date: appointment.date,
      paymentMethod: 'Efectivo',
      staff: 'Jhon barber',
      price: '',
      notes: '',
    })
    setPendingAppointmentId(appointment.id)
    setView('add')
  }

  const createLoyaltyCustomer = (formData) => {
    const customer = createCustomer({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || '',
    })
    setCustomers((current) => [customer, ...current])
    setPointsLedger((current) => [
      {
        transaction_id: `welcome_${customer.customer_id}`,
        customer_id: customer.customer_id,
        points_earned: 20,
        service_type: 'Bono de bienvenida',
        staff_name: 'Sistema',
        date: customer.created_at,
      },
      ...current,
    ])
    setSelectedCustomer(customer)
  }

  const handleRoleChange = (nextRole) => {
    setRole(nextRole)
    setView(nextRole === 'client' ? 'wallet' : 'list')
  }

  const handleViewChange = (nextView) => {
    setEditingService(null)
    setServiceDraft(null)
    setPendingAppointmentId(null)
    setSelectedCustomer(null)
    setView(nextView)
  }

  const content = (
    <>
      {role === 'admin' && view === 'list' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <SettlementSummary cash={cash} staff={staff} />
          <ServiceList
            services={filteredServices}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            onRemove={removeService}
            onEdit={(service) => {
              setEditingService(service)
            }}
            getIcon={getIcon}
          />
        </div>
      )}
      {role === 'admin' && view === 'loyalty' && (
        <LoyaltyPanel
          customers={customers}
          onCreate={createLoyaltyCustomer}
          onSelect={setSelectedCustomer}
          selectedCustomer={selectedCustomer}
          onCloseProfile={() => setSelectedCustomer(null)}
        />
      )}
      {role === 'admin' && view === 'settings' && (
        <SettingsPanel
          settings={settings}
          onSave={(nextSettings) => {
            setSettings(nextSettings)
            window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings))
            setView('list')
          }}
        />
      )}
      {role === 'client' && view === 'wallet' && (
        <ClientWallet customers={customers} customerId={walletCustomerId} onCustomerChange={setWalletCustomerId} />
      )}
      {role === 'admin' && view === 'stats' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#121212] p-8 rounded-[2.5rem] shadow-xl shadow-stone-900/20 text-white flex items-center justify-between border border-[#c9a15c]/30">
            <div>
              <p className="text-xs font-black text-rose-100 uppercase tracking-widest mb-2">
                Total {monthly.monthName}
              </p>
              <h2 className="text-5xl font-black">${monthly.incomeMonthly.toLocaleString('es-CO')}</h2>
            </div>
          </div>
          <MonthlyBarChart dailyData={monthly.dailyData} maxDaily={monthly.maxDaily} />
        </div>
      )}
      {role === 'admin' && view === 'add' && (
        <ServiceForm
          initialService={serviceDraft}
          customers={customers}
          staffMembers={settings.staff.map((member) => member.name)}
          serviceTypes={settings.serviceTypes}
          onSubmit={saveService}
          onCancel={() => {
            setServiceDraft(null)
            setPendingAppointmentId(null)
            setView('list')
          }}
        />
      )}
      <EditServiceModal
        service={editingService}
        customers={customers}
        staffMembers={settings.staff.map((member) => member.name)}
        serviceTypes={settings.serviceTypes}
        onSubmit={(formData) => {
          saveService(formData)
          setEditingService(null)
        }}
        onCancel={() => setEditingService(null)}
      />
      {role === 'admin' && view === 'appointments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left">
            <div className="w-full">
              <h2 className="text-2xl font-black text-slate-800">Próximas Citas Bot</h2>
              <p className="text-sm text-slate-400 font-medium italic">Sincronizado con Chatbot de WhatsApp</p>
            </div>
            <button
              onClick={() =>
                setAppointments((current) => [
                  {
                    id: Date.now(),
                    client: 'Cliente Simulada',
                    type: 'Coloración',
                    date: new Date().toISOString(),
                    source: 'WhatsApp Bot',
                    status: 'Pendiente',
                  },
                  ...current,
                ])
              }
              className="bg-green-500 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase"
            >
              Simular Cita WhatsApp
            </button>
          </div>
          <AppointmentList
            appointments={appointments}
            onConfirm={confirmAppointment}
            onReject={(id) => setAppointments((current) => current.filter((appointment) => appointment.id !== id))}
          />
        </div>
      )}
    </>
  )
  return role === 'admin' ? (
    <AdminView view={view} onViewChange={handleViewChange} onRoleChange={handleRoleChange}>
      {content}
    </AdminView>
  ) : (
    <ClientView onRoleChange={handleRoleChange}>{content}</ClientView>
  )
}
