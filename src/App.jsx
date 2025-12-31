import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, 
  PlusCircle, 
  History, 
  Search, 
  Trash2, 
  Wallet, 
  CalendarDays, 
  Smartphone, 
  Banknote,
  Wind,
  Crown,
  Palette,
  Sparkles,
  MoreHorizontal,
  Plus,
  Clock,
  User,
  TrendingUp,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Percent,
  Coins
} from 'lucide-react';

/**
 * App Component - HairSalon Pro v7.6
 * Gestión de comisiones con rol de Dueña (Luz) y desglose de Nequi/Efectivo:
 * - Jhon (60% para él, 40% para Luz)
 * - Nelly (50% para ella, 50% para Luz)
 * - Luz (100% propio + porcentajes de Jhon y Nelly)
 */
export default function App() {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('hairsalon_v7_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('hairsalon_v7_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  const staffMembers = ['Jhon barber', 'Nelly peluquera', 'Luz peluquera'];
  const serviceTypes = ['Corte', 'Peinado', 'Cepillado', 'Coloración', 'Tratamiento', 'Otro'];
  const paymentMethods = ['Efectivo', 'Nequi'];

  useEffect(() => {
    localStorage.setItem('hairsalon_v7_records', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('hairsalon_v7_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const analysis = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayServices = services.filter(s => new Date(s.date).toDateString() === todayStr);
    const monthlyServices = services.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const incomeToday = todayServices.reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
    const incomeMonthly = monthlyServices.reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);

    // Totales por método de pago hoy
    const nequiToday = todayServices
      .filter(s => s.paymentMethod === 'Nequi')
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
    const cashToday = todayServices
      .filter(s => s.paymentMethod === 'Efectivo')
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);

    // Totales Brutos de Hoy por persona
    const getGross = (name) => todayServices
      .filter(s => s.staff === name)
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);

    const jhonGross = getGross('Jhon barber');
    const nellyGross = getGross('Nelly peluquera');
    const luzGross = getGross('Luz peluquera');

    // Liquidación con lógica de comisiones
    const jhonPay = Math.round(jhonGross * 0.60);
    const jhonFee = jhonGross - jhonPay; // 40% para Luz

    const nellyPay = Math.round(nellyGross * 0.50);
    const nellyFee = nellyGross - nellyPay; // 50% para Luz

    // Luz gana lo suyo al 100% (dueña) + las comisiones de los otros
    const luzFinalPay = luzGross + jhonFee + nellyFee;

    const staffEarnings = [
      { 
        name: 'Jhon barber', 
        total: jhonGross, 
        comision: jhonPay, 
        porcentaje: 60,
        nota: "40% para Luz"
      },
      { 
        name: 'Nelly peluquera', 
        total: nellyGross, 
        comision: nellyPay, 
        porcentaje: 50,
        nota: "50% para Luz"
      },
      { 
        name: 'Luz peluquera', 
        total: luzGross, 
        comision: luzFinalPay, 
        porcentaje: 100,
        nota: "Dueña (+ comisiones)",
        isOwner: true
      }
    ];

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const total = monthlyServices
        .filter(s => new Date(s.date).getDate() === day)
        .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
      return { day, total };
    });

    return {
      incomeToday,
      incomeMonthly,
      nequiToday,
      cashToday,
      staffEarnings,
      dailyData,
      maxDaily: Math.max(...dailyData.map(d => d.total), 1),
      monthName: now.toLocaleString('es-ES', { month: 'long' })
    };
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => 
      String(s.client || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const handleAddService = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newEntry = {
      id: Date.now(),
      client: fd.get('client'),
      type: fd.get('type'),
      price: Math.round(parseFloat(fd.get('price') || 0)),
      paymentMethod: fd.get('paymentMethod'),
      staff: fd.get('staff'),
      date: new Date().toISOString(),
      notes: fd.get('notes')
    };
    setServices([newEntry, ...services]);
    setView('list');
  };

  const removeService = (id) => {
    if (window.confirm('¿Deseas eliminar este registro?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 });
  };

  const getServiceIcon = (type) => {
    const iconClass = "w-6 h-6";
    switch(type) {
      case 'Corte': return <Scissors className={iconClass} />;
      case 'Peinado': return <Crown className={iconClass} />;
      case 'Cepillado': return <Wind className={iconClass} />;
      case 'Coloración': return <Palette className={iconClass} />;
      case 'Tratamiento': return <Sparkles className={iconClass} />;
      default: return <MoreHorizontal className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        
        {/* CABECERA */}
        <header className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-200">
              <Scissors className="text-white w-7 h-7 md:w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">Hair<span className="text-rose-500">Salon</span></h1>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em]">Management Pro</p>
            </div>
          </div>
          
          <nav className="flex bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-white shadow-sm overflow-x-auto w-full md:w-auto">
            <button onClick={() => setView('list')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${view === 'list' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
              <History size={18} /><span className="hidden sm:inline">Liquidación</span>
            </button>
            <button onClick={() => setView('appointments')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${view === 'appointments' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
              <CalendarCheck size={18} /><span className="hidden sm:inline">Citas Bot</span>
            </button>
            <button onClick={() => setView('stats')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${view === 'stats' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
              <BarChart3 size={18} /><span className="hidden sm:inline">Estadísticas</span>
            </button>
            <button onClick={() => setView('add')} className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${view === 'add' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>
              <PlusCircle size={18} /><span className="hidden sm:inline">Registro</span>
            </button>
          </nav>
        </header>

        {view === 'list' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Totales Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-rose-500 p-6 rounded-[2rem] shadow-xl shadow-rose-200 text-white col-span-1 md:col-span-2 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1">Caja Bruta Hoy</p>
                    <h3 className="text-4xl font-black">${formatCurrency(analysis.incomeToday)}</h3>
                  </div>
                  <Wallet size={48} className="opacity-30" />
                </div>
                {/* Desglose de Nequi y Efectivo */}
                <div className="flex gap-6 border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-rose-100" />
                    <div>
                      <p className="text-[8px] font-black text-rose-200 uppercase tracking-tighter">Nequi</p>
                      <p className="text-sm font-black">${formatCurrency(analysis.nequiToday)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-rose-100" />
                    <div>
                      <p className="text-[8px] font-black text-rose-200 uppercase tracking-tighter">Efectivo</p>
                      <p className="text-sm font-black">${formatCurrency(analysis.cashToday)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-center text-center">
                <Coins className="mx-auto text-rose-500 mb-2" size={24} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pago Dueña (Luz)</p>
                <h3 className="text-2xl font-black text-slate-800">${formatCurrency(analysis.staffEarnings.find(s => s.isOwner)?.comision)}</h3>
              </div>
            </div>

            {/* Tarjetas de Liquidación con lógica de Luz */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analysis.staffEarnings.map(s => (
                <div key={s.name} className={`p-5 rounded-3xl border shadow-sm transition-all ${s.isOwner ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-200' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${s.isOwner ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <User size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-500 uppercase leading-none">{s.name}</p>
                      <p className="text-[8px] font-bold text-rose-500 uppercase mt-1">{s.nota}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Producción:</span>
                      <span className="text-slate-800 font-black">${formatCurrency(s.total)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <span className={`font-black uppercase text-[10px] ${s.isOwner ? 'text-rose-600' : 'text-slate-500'}`}>
                        Total a Recibir:
                      </span>
                      <span className={`text-xl font-black ${s.isOwner ? 'text-rose-600' : 'text-slate-800'}`}>
                        ${formatCurrency(s.comision)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" placeholder="Buscar cliente..." 
                className="w-full pl-14 pr-8 py-5 bg-white rounded-3xl border-0 shadow-sm outline-none focus:ring-4 focus:ring-rose-100 font-medium"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Listado de Servicios */}
            <div className="grid gap-4 pb-12">
              {filteredServices.map(s => (
                <div key={s.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 group transition-all">
                  <div className="flex items-center gap-6 w-full text-left">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 shrink-0">{getServiceIcon(s.type)}</div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800">{s.client}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase">{s.type}</span>
                        <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{s.staff}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${s.paymentMethod === 'Nequi' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                          {s.paymentMethod === 'Nequi' ? <Smartphone size={8} /> : <Banknote size={8} />}{s.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <span className="text-2xl font-black text-slate-800">${formatCurrency(s.price)}</span>
                    <button onClick={() => removeService(s.id)} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vistas Secundarias */}
        {view === 'stats' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-rose-500 p-8 rounded-[2.5rem] shadow-xl shadow-rose-200 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-xs font-black text-rose-100 uppercase tracking-widest mb-2">Total {analysis.monthName}</p>
                <h2 className="text-5xl font-black">${formatCurrency(analysis.incomeMonthly)}</h2>
              </div>
              <TrendingUp size={48} className="opacity-40" />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white">
              <h3 className="text-xl font-black text-slate-800 mb-6 text-left">Ventas Diarias</h3>
              <div className="h-48 flex items-end gap-1 overflow-x-auto pb-4">
                {analysis.dailyData.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center min-w-[12px] h-full justify-end group relative">
                    <div style={{ height: `${(d.total / (analysis.maxDaily || 1)) * 100}%` }} className={`w-full max-w-[10px] rounded-t-full transition-all ${d.total > 0 ? 'bg-rose-400 group-hover:bg-rose-600' : 'bg-slate-50'}`}></div>
                    <span className="text-[8px] font-bold text-slate-300 mt-2">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="max-w-xl mx-auto animate-in zoom-in-95">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border border-rose-50">
              <h2 className="text-3xl font-black text-slate-800 mb-8 italic text-left">Nuevo Registro</h2>
              <form onSubmit={handleAddService} className="space-y-6">
                <div className="text-left space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Cliente</label>
                  <input name="client" required placeholder="Escribe el nombre..." className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">¿Quién atendió?</label>
                    <select name="staff" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 cursor-pointer">
                      {staffMembers.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Servicio</label>
                    <select name="type" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 cursor-pointer">
                      {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pago</label>
                    <select name="paymentMethod" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 cursor-pointer">
                      {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Precio Cobrado ($)</label>
                    <input name="price" type="number" required placeholder="0" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-black text-xl" />
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setView('list')} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest">Cerrar</button>
                  <button type="submit" className="flex-[2] py-5 bg-rose-500 text-white rounded-2xl font-black shadow-xl shadow-rose-200 uppercase text-[10px] tracking-widest">Guardar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'appointments' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-left">
              <div className="w-full">
                <h2 className="text-2xl font-black text-slate-800">Próximas Citas Bot</h2>
                <p className="text-sm text-slate-400 font-medium italic">Sincronizado con Chatbot de WhatsApp</p>
              </div>
              <button 
                onClick={() => setAppointments([{id: Date.now(), client: "Andrés Vera", type: "Corte", date: new Date().toISOString(), source: "WhatsApp Bot", status: "Pendiente"}, ...appointments])}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all w-full md:w-auto justify-center"
              >
                <MessageSquare size={16} /> Simular Cita WhatsApp
              </button>
            </div>

            <div className="grid gap-4">
              {appointments.length > 0 ? appointments.map(app => (
                <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-rose-100 transition-colors">
                  <div className="flex items-center gap-5 w-full text-left">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 shrink-0"><User size={28} /></div>
                    <div className="overflow-hidden">
                      <h4 className="text-lg font-black text-slate-800 truncate">{app.client}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded">{app.source}</span>
                        <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded">{app.type}</span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12} /> {new Date(app.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setView('add')} className="flex-1 sm:flex-none bg-rose-500 text-white p-3 rounded-xl hover:bg-rose-600 transition-colors"><CheckCircle2 size={20} /></button>
                    <button onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))} className="flex-1 sm:flex-none bg-slate-100 text-slate-400 p-3 rounded-xl hover:bg-rose-100 hover:text-rose-500 transition-colors"><XCircle size={20} /></button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white/40 rounded-[3rem] border-4 border-dashed border-white">
                  <MessageSquare className="mx-auto w-12 h-12 text-slate-200 mb-4 opacity-50" />
                  <p className="text-slate-400 font-bold italic">No hay citas pendientes hoy.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="mt-16 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.5em]">HairSalon Pro v7.6 • 2025</footer>
      </div>
    </div>
  );
}