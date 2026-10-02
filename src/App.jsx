import { useEffect, useMemo, useState } from 'react'
import { Crown, MoreHorizontal, Palette, Scissors, Sparkles, Wind } from 'lucide-react'
import SettlementSummary from './components/settlement/SettlementSummary'
import ServiceForm from './components/services/ServiceForm'
import EditServiceModal from './components/services/EditServiceModal'
import ServiceList from './components/services/ServiceList'
import AppointmentList from './components/appointments/AppointmentList'
import MonthlyBarChart from './components/stats/MonthlyBarChart'
import DateFilter from './components/stats/DateFilter'
import LoyaltyPanel from './components/loyalty/LoyaltyPanel'
import ClientWallet from './components/loyalty/ClientWallet'
import AdminView from './components/auth/AdminView'
import ClientView from './components/auth/ClientView'
import LoginView from './components/auth/LoginView'
import ClientAppointmentForm from './components/client/ClientAppointmentForm'
import ClientRewards from './components/client/ClientRewards'
import SettingsPanel from './components/settings/SettingsPanel'
import { calculateDailyCash, calculateStaffSettlement } from './utils/settlementCalculations'
import { readSettings, SETTINGS_STORAGE_KEY } from './utils/salonSettings'
import { calculateDateRangeStats } from './utils/statsCalculations'
import { downloadCsvReport, downloadExcelReport, printPdfReport } from './utils/reportExports'
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
  getMembershipTier,
  LOYALTY_STORAGE_KEYS,
  WELCOME_POINTS,
} from './utils/loyaltyCalculations'
import { isLocalDemoEnabled, isSupabaseConfigured } from './lib/supabaseClient'
import { APPOINTMENT_STATUS, validateAppointmentRequest } from './utils/appointmentRules'
import { mapRemoteAppointment, mapRemoteCustomer, mapRemoteService } from './utils/remoteMappers'
import { getServiceDurationMinutes } from './utils/serviceRules'
import {
  claimCustomerAccount,
  getCurrentProfile,
  getCurrentSession,
  requestClientMagicLink,
  signIn,
  signOut,
  subscribeToAuthChanges,
} from './services/authService'
import {
  createAppointment,
  createService,
  adjustCustomerPoints,
  getCustomerById,
  listServices,
  listCustomers,
  listAppointments,
  registerCustomer,
  updateAppointmentStatus,
  updateService,
} from './services/loyaltyService'

const icons = { Corte: Scissors, Peinado: Crown, Cepillado: Wind, Coloración: Palette, Tratamiento: Sparkles }

export default function App() {
  const [services, setServices] = useState(() => (isLocalDemoEnabled ? readServices() : []))
  const [appointments, setAppointments] = useState(() => (isLocalDemoEnabled ? readAppointments() : []))
  const [view, setView] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [serviceDraft, setServiceDraft] = useState(null)
  const [pendingAppointmentId, setPendingAppointmentId] = useState(null)
  const [customers, setCustomers] = useState(() =>
    isLocalDemoEnabled ? readJsonArray(window.localStorage, LOYALTY_STORAGE_KEYS.customers) : [],
  )
  const [pointsLedger, setPointsLedger] = useState(() =>
    isLocalDemoEnabled ? readJsonArray(window.localStorage, LOYALTY_STORAGE_KEYS.points) : [],
  )
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [role, setRole] = useState(isLocalDemoEnabled ? 'admin' : null)
  const [walletCustomerId, setWalletCustomerId] = useState(null)
  const [settings, setSettings] = useState(() => readSettings())
  const [statsStartDate, setStatsStartDate] = useState(() => {
    const date = new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10)
  })
  const [statsEndDate, setStatsEndDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState('')
  const [clientAuthError, setClientAuthError] = useState('')
  const [appointmentMessage, setAppointmentMessage] = useState('')
  const [appointmentLoading, setAppointmentLoading] = useState(false)
  const [adjustmentLoading, setAdjustmentLoading] = useState(false)
  const [adjustmentMessage, setAdjustmentMessage] = useState('')
  const enrollmentMode = new URLSearchParams(window.location.search).get('registro') === '1'
  const adminRoute = window.location.pathname === '/admin'

  useEffect(() => {
    if (isLocalDemoEnabled) writeStorageArray(window.localStorage, serviceStorageKey, services)
  }, [services])
  useEffect(() => {
    if (isLocalDemoEnabled) writeStorageArray(window.localStorage, appointmentStorageKey, appointments)
  }, [appointments])
  useEffect(() => {
    if (isLocalDemoEnabled) writeStorageArray(window.localStorage, LOYALTY_STORAGE_KEYS.customers, customers)
  }, [customers])
  useEffect(() => {
    if (isLocalDemoEnabled) writeStorageArray(window.localStorage, LOYALTY_STORAGE_KEYS.points, pointsLedger)
  }, [pointsLedger])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    const resolveProfile = async (currentSession) => {
      if (!currentSession) return null
      try {
        return await getCurrentProfile()
      } catch (error) {
        const pending = JSON.parse(sessionStorage.getItem('hairsalon_pending_client_claim') || 'null')
        if (error.code !== 'PGRST116' || !pending) throw error
        await claimCustomerAccount(pending)
        sessionStorage.removeItem('hairsalon_pending_client_claim')
        return getCurrentProfile()
      }
    }
    const loadAuth = async () => {
      try {
        const currentSession = await getCurrentSession()
        if (!active) return
        setSession(currentSession)
        if (currentSession) setProfile(await resolveProfile(currentSession))
      } catch (error) {
        if (active) setAuthError(error.message)
      } finally {
        if (active) setAuthLoading(false)
      }
    }
    loadAuth()
    return subscribeToAuthChanges(async (nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfile(null)
        setAuthLoading(false)
        return
      }
      try {
        setProfile(await resolveProfile(nextSession))
      } catch (error) {
        setAuthError(error.message)
      } finally {
        setAuthLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !profile?.customer_id) return undefined
    getCustomerById(profile.customer_id)
      .then((customer) =>
        setCustomers([
          {
            ...mapRemoteCustomer(customer, getMembershipTier),
          },
        ]),
      )
      .catch((error) => setAuthError(error.message))
    return undefined
  }, [profile?.customer_id])

  useEffect(() => {
    if (!isSupabaseConfigured || profile?.role !== 'admin') return undefined
    listCustomers()
      .then((remoteCustomers) =>
        setCustomers(
          remoteCustomers.map((customer) => mapRemoteCustomer(customer, getMembershipTier)),
        ),
      )
      .catch((error) => setAuthError(error.message))
    return undefined
  }, [profile?.role])

  useEffect(() => {
    if (!profile?.role) return
    setRole(profile.role)
    setView(profile.role === 'client' ? 'wallet' : 'list')
  }, [profile?.role])

  useEffect(() => {
    if (!isSupabaseConfigured || profile?.role !== 'admin') return undefined
    listServices()
      .then((remoteServices) =>
        setServices(
          remoteServices.map(mapRemoteService),
        ),
      )
      .catch((error) => setAuthError(error.message))
    return undefined
  }, [profile?.role])

  useEffect(() => {
    if (!isSupabaseConfigured || profile?.role !== 'admin') return undefined
    listAppointments()
      .then((remoteAppointments) =>
        setAppointments(
          remoteAppointments.map(mapRemoteAppointment),
        ),
      )
      .catch((error) => setAuthError(error.message))
    return undefined
  }, [profile?.role])

  const cash = useMemo(() => calculateDailyCash(services), [services])
  const staff = useMemo(
    () => calculateStaffSettlement(services, new Date(), settings.staff),
    [services, settings.staff],
  )
  const report = useMemo(
    () => calculateDateRangeStats(services, statsStartDate, statsEndDate),
    [services, statsStartDate, statsEndDate],
  )
  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        String(service.client || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [services, searchTerm],
  )

  const saveService = async (formData) => {
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
      if (isSupabaseConfigured) {
        try {
          await updateService(editingService.id, {
            clientName: formValues.client,
            serviceType: formValues.type,
            price: promotion.finalPrice,
            paymentMethod: formValues.paymentMethod,
            notes: formValues.notes,
            date: formValues.date,
          })
        } catch (error) {
          setAuthError(error.message)
          return
        }
      }
      setServices((current) =>
        current.map((service) => (service.id === editingService.id ? { ...service, ...values } : service)),
      )
      setEditingService(null)
    } else {
      let savedValues = { ...values, id: Date.now() }
      if (isSupabaseConfigured) {
        try {
          const remoteService = await createService({
            clientName: values.client,
            customerId: values.customerId || null,
            staffName: values.staff,
            serviceType: values.type,
            price: values.price,
            paymentMethod: values.paymentMethod,
            notes: values.notes,
            date: values.date,
          })
          savedValues = {
            ...values,
            ...remoteService,
            id: remoteService.id,
            client: remoteService.client_name,
            customerId: remoteService.customer_id || '',
            staff: values.staff,
            type: remoteService.service_type,
            paymentMethod: remoteService.payment_method,
            price: remoteService.price,
            date: remoteService.created_at,
          }
        } catch (error) {
          setAuthError(error.message)
          return
        }
      }
      setServices((current) => [savedValues, ...current])
      const customer = customers.find((item) => item.customer_id === values.customerId)
      if (customer && !isSupabaseConfigured) {
        const result = addPointsTransaction(customer, values, values.staff)
        setCustomers((current) =>
          current.map((item) => (item.customer_id === customer.customer_id ? result.customer : item)),
        )
        setPointsLedger((current) => [result.transaction, ...current])
      }
      if (pendingAppointmentId !== null) {
        if (isSupabaseConfigured) {
          try {
            await updateAppointmentStatus(pendingAppointmentId, APPOINTMENT_STATUS.COMPLETED)
          } catch (error) {
            setAuthError(error.message)
            return
          }
        }
        setAppointments((current) => current.filter((appointment) => appointment.id !== pendingAppointmentId))
        setPendingAppointmentId(null)
      }
    }
    setView('list')
  }

  const removeService = (id) => {
    if (isSupabaseConfigured) {
      setAuthError('Los servicios productivos no se eliminan desde la interfaz. Registra un ajuste auditado.')
      return
    }
    if (window.confirm('¿Deseas eliminar este registro?'))
      setServices((current) => current.filter((service) => service.id !== id))
  }

  const getIcon = (type) => {
    const Icon = icons[type] || MoreHorizontal
    return <Icon className="w-6 h-6" />
  }

  const confirmAppointment = async (appointment) => {
    if (isSupabaseConfigured) {
      try {
        const updated = await updateAppointmentStatus(appointment.id, APPOINTMENT_STATUS.CONFIRMED)
        setAppointments((current) =>
          current.map((item) => (item.id === updated.id ? { ...item, ...updated, status: updated.status } : item)),
        )
      } catch (error) {
        setAuthError(error.message)
        return
      }
    }
    setServiceDraft({
      client: appointment.client || appointment.client_name,
      type: appointment.type || appointment.service_type,
      date: appointment.date || appointment.appointment_date,
      paymentMethod: 'Efectivo',
      staff: 'Jhon barber',
      price: '',
      notes: '',
    })
    setPendingAppointmentId(appointment.id)
    setView('add')
  }

  const rejectAppointment = async (appointmentId) => {
    if (isSupabaseConfigured) {
      try {
        const updated = await updateAppointmentStatus(appointmentId, APPOINTMENT_STATUS.REJECTED)
        setAppointments((current) =>
          current.map((item) => (item.id === updated.id ? { ...item, ...updated, status: updated.status } : item)),
        )
      } catch (error) {
        setAuthError(error.message)
      }
      return
    }
    setAppointments((current) => current.filter((appointment) => appointment.id !== appointmentId))
  }

  const createLoyaltyCustomer = async (formData) => {
    const customer = createCustomer({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || '',
    })
    let savedCustomer = customer
    if (isSupabaseConfigured) {
      try {
        const remoteCustomer = await registerCustomer({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          qrNfcToken: customer.nfc_qr_token,
        })
        savedCustomer = {
          ...customer,
          ...remoteCustomer,
          customer_id: remoteCustomer.id,
          nfc_qr_token: remoteCustomer.qr_nfc_token,
          total_points: remoteCustomer.total_points,
          membership_tier: getMembershipTier(remoteCustomer.total_points),
        }

      } catch (error) {
        setAuthError(error.message)
        return
      }
    }
    setCustomers((current) => [savedCustomer, ...current])
    if (!isSupabaseConfigured) {
      setPointsLedger((current) => [
        {
          transaction_id: `welcome_${savedCustomer.customer_id}`,
          customer_id: savedCustomer.customer_id,
          points_earned: WELCOME_POINTS,
          service_type: 'Bono de bienvenida',
          staff_name: 'Sistema',
          date: savedCustomer.created_at,
        },
        ...current,
      ])
    }
    setSelectedCustomer(savedCustomer)
  }

  const handleAdjustPoints = async ({ pointsDelta, reason }) => {
    if (!selectedCustomer || !Number.isInteger(pointsDelta) || pointsDelta === 0) {
      setAdjustmentMessage('El ajuste debe ser un número entero distinto de cero.')
      return
    }
    setAdjustmentLoading(true)
    setAdjustmentMessage('')
    try {
      await adjustCustomerPoints(selectedCustomer.customer_id, pointsDelta, reason)
      const refreshedCustomer = await getCustomerById(selectedCustomer.customer_id)
      const mappedCustomer = mapRemoteCustomer(refreshedCustomer, getMembershipTier)
      setCustomers((current) =>
        current.map((customer) => (customer.customer_id === mappedCustomer.customer_id ? mappedCustomer : customer)),
      )
      setSelectedCustomer(mappedCustomer)
      setAdjustmentMessage('Ajuste registrado correctamente.')
    } catch (error) {
      setAdjustmentMessage(error.message)
    } finally {
      setAdjustmentLoading(false)
    }
  }

  const handleRoleChange = (nextRole) => {
    if (nextRole === 'logout' && isSupabaseConfigured) {
      setAuthLoading(true)
      setSession(null)
      setProfile(null)
      signOut()
        .catch((error) => setAuthError(error.message))
        .finally(() => setAuthLoading(false))
      return
    }
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

  const handleLogin = async (credentials) => {
    setAuthError('')
    setAuthLoading(true)
    try {
      await signIn(credentials)
    } catch (error) {
      setAuthError(error.message)
      setAuthLoading(false)
    }
  }

  const handleRequestMagicLink = async ({ token, name, email }) => {
    setClientAuthError('')
    setAuthLoading(true)
    try {
      sessionStorage.setItem('hairsalon_pending_client_claim', JSON.stringify({ qrNfcToken: token, name, email }))
      await requestClientMagicLink(email)
    } catch (error) {
      sessionStorage.removeItem('hairsalon_pending_client_claim')
      setClientAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleClientAppointment = async (details) => {
    setAppointmentLoading(true)
    setAppointmentMessage('')
    try {
      const validationError = validateAppointmentRequest(details.appointmentDate)
      if (validationError) throw new Error(validationError)
      const appointmentDate = new Date(details.appointmentDate)
      await createAppointment({
        ...details,
        appointmentDate: appointmentDate.toISOString(),
        durationMinutes: getServiceDurationMinutes(details.serviceType),
      })
      setAppointmentMessage('Tu solicitud fue enviada. Te contactaremos para confirmar el horario.')
    } catch (error) {
      setAppointmentMessage(error.message)
    } finally {
      setAppointmentLoading(false)
    }
  }

  if (!isSupabaseConfigured && !isLocalDemoEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4 text-center text-[#f7f2ea]">
        <div className="max-w-lg rounded-3xl bg-[#1d1d1d] p-8">
          <h1 className="text-2xl font-black">Configuración pendiente</h1>
          <p className="mt-3 text-sm text-[#a59e92]">
            Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el archivo .env y reinicia Vite. El modo local solo
            está disponible si VITE_ENABLE_LOCAL_DEMO=true.
          </p>
        </div>
      </div>
    )
  }

  if (isSupabaseConfigured && authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-[#e4c88a]">
        Cargando sesión...
      </div>
    )
  }

  if (isSupabaseConfigured && !session) {
    return (
      <LoginView
        onSubmit={handleLogin}
        onRequestMagicLink={handleRequestMagicLink}
        error={authError}
        clientError={clientAuthError}
        loading={authLoading}
        enrollmentMode={enrollmentMode}
        adminOnly={adminRoute}
      />
    )
  }

  if (isSupabaseConfigured && session && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4 text-center text-[#f7f2ea]">
        <div className="max-w-md rounded-3xl bg-[#1d1d1d] p-8">
          <h1 className="text-2xl font-black">Perfil sin configurar</h1>
          <p className="mt-3 text-sm text-[#a59e92]">
            Tu usuario autenticado todavía no tiene un registro en la tabla profiles. Solicita al administrador que lo
            configure.
          </p>
          {authError && <p className="mt-4 text-sm font-bold text-red-300">{authError}</p>}
          {isLocalDemoEnabled && <button
            type="button"
            onClick={() => handleRoleChange('logout')}
            className="mt-6 rounded-xl bg-[#c9a15c] px-4 py-3 text-xs font-black uppercase text-[#121212]"
          >
            Cerrar sesión
          </button>}
        </div>
      </div>
    )
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
            allowRemove={isLocalDemoEnabled}
            onEdit={(service) => {
              setEditingService(service)
            }}
            allowEdit={!isSupabaseConfigured}
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
          onAdjustPoints={isSupabaseConfigured ? handleAdjustPoints : undefined}
          adjustmentLoading={adjustmentLoading}
          adjustmentMessage={adjustmentMessage}
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
        <div className="space-y-8">
          <ClientWallet customers={customers} customerId={walletCustomerId} onCustomerChange={setWalletCustomerId} />
          {isSupabaseConfigured && (
            <>
              <ClientRewards customer={customers[0]} />
              <ClientAppointmentForm
                customer={customers[0]}
                onSubmit={handleClientAppointment}
                loading={appointmentLoading}
                message={appointmentMessage}
              />
            </>
          )}
        </div>
      )}
      {role === 'admin' && view === 'stats' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <DateFilter
            startDate={statsStartDate}
            endDate={statsEndDate}
            onStartDateChange={setStatsStartDate}
            onEndDateChange={setStatsEndDate}
          />
          <div className="flex flex-col gap-3 rounded-3xl border border-[#c9a15c]/20 bg-white p-4 text-left md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#5a534a]">Reportes del periodo</p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {report.filteredServices.length} servicio(s) registrado(s)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadCsvReport(report.filteredServices, statsStartDate, statsEndDate)}
                className="rounded-xl border border-[#c9a15c]/40 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#5a534a] transition hover:border-[#c9a15c] hover:text-[#121212]"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => downloadExcelReport(report.filteredServices, statsStartDate, statsEndDate)}
                className="rounded-xl border border-[#c9a15c]/40 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#5a534a] transition hover:border-[#c9a15c] hover:text-[#121212]"
              >
                Excel
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    printPdfReport(report.filteredServices, statsStartDate, statsEndDate, report.income)
                  } catch (error) {
                    window.alert(error.message)
                  }
                }}
                className="rounded-xl bg-[#121212] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#e4c88a] transition hover:bg-[#2a2a2a]"
              >
                PDF / Imprimir
              </button>
            </div>
          </div>
          <div className="bg-[#121212] p-8 rounded-[2.5rem] shadow-xl shadow-stone-900/20 text-white flex items-center justify-between border border-[#c9a15c]/30">
            <div>
              <p className="text-xs font-black text-rose-100 uppercase tracking-widest mb-2">Total del periodo</p>
              <h2 className="text-5xl font-black">${report.income.toLocaleString('es-CO')}</h2>
            </div>
          </div>
          {statsStartDate <= statsEndDate ? (
            <MonthlyBarChart dailyData={report.dailyData} maxDaily={report.maxDaily} />
          ) : (
            <p className="rounded-3xl bg-rose-50 p-5 text-sm font-bold text-rose-700">
              El rango de fechas no es válido. Selecciona una fecha inicial anterior o igual a la fecha final.
            </p>
          )}
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
                    status: APPOINTMENT_STATUS.PENDING,
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
            onReject={rejectAppointment}
          />
        </div>
      )}
    </>
  )
  return role === 'admin' ? (
    <AdminView
      view={view}
      onViewChange={handleViewChange}
      onRoleChange={handleRoleChange}
      authenticated={isSupabaseConfigured}
    >
      {content}
    </AdminView>
  ) : (
    <ClientView onRoleChange={handleRoleChange} authenticated={isSupabaseConfigured}>
      {content}
    </ClientView>
  )
}
