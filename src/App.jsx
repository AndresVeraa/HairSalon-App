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
  BarChart3
} from 'lucide-react';

/**
 * App Component - Sistema de Gestión HairSalon
 * Versión optimizada para ser totalmente responsive en móviles, tablets y escritorio.
 */
export default function App() {
  // Estado para los servicios con persistencia en localStorage
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('hairsalon_pro_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('list'); // 'list', 'add', 'stats'
  const [searchTerm, setSearchTerm] = useState('');

  // Definiciones de categorías, pagos y personal
  const serviceTypes = ['Corte', 'Peinado', 'Cepillado', 'Coloración', 'Tratamiento', 'Otro'];
  const paymentMethods = ['Efectivo', 'Nequi'];
  const staffMembers = ['Jhon barber', 'Nelly peluquera', 'Luz peluquera'];

  // Guardado automático al cambiar los servicios
  useEffect(() => {
    localStorage.setItem('hairsalon_pro_records', JSON.stringify(services));
  }, [services]);

  // Análisis de ingresos y servicios
  const analysis = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filtros por tiempo
    const todayServices = services.filter(s => new Date(s.date).toDateString() === todayStr);
    const monthlyServices = services.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    // Ingresos de hoy
    const incomeToday = todayServices.reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
    const nequiToday = todayServices
      .filter(s => s.paymentMethod === 'Nequi')
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
    const cashToday = todayServices
      .filter(s => s.paymentMethod === 'Efectivo')
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);

    // Ingresos mensuales
    const incomeMonthly = monthlyServices.reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);

    // Datos para la gráfica diaria del mes
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const total = monthlyServices
        .filter(s => new Date(s.date).getDate() === day)
        .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
      return { day, total };
    });

    const maxDaily = Math.max(...dailyData.map(d => d.total), 1);

    // Cálculo de ganancias por cada miembro del personal hoy
    const staffEarnings = staffMembers.map(name => {
      const total = todayServices
        .filter(s => s.staff === name)
        .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
      return { name, total };
    });

    return {
      todayCount: todayServices.length,
      incomeToday,
      nequiToday,
      cashToday,
      incomeMonthly,
      dailyData,
      maxDaily,
      staffEarnings,
      monthName: now.toLocaleString('es-ES', { month: 'long' })
    };
  }, [services, staffMembers]);

  const handleAddService = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const rawPrice = fd.get('price');
    const cleanPrice = Math.round(parseFloat(rawPrice));

    const newEntry = {
      id: Date.now(),
      client: fd.get('client'),
      type: fd.get('type'),
      price: cleanPrice, 
      paymentMethod: fd.get('paymentMethod'),
      staff: fd.get('staff'),
      date: new Date().toISOString(),
      notes: fd.get('notes')
    };
    setServices([newEntry, ...services]);
    setView('list');
  };

  const removeService = (id) => {
    if (window.confirm('¿Deseas eliminar este registro de HairSalon permanentemente?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const filteredServices = services.filter(s => 
    s.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (type) => {
    const iconClass = "w-5 h-5 md:w-6 h-6";
    switch(type) {
      case 'Corte': return <Scissors className={iconClass} />;
      case 'Peinado': return <Crown className={iconClass} />;
      case 'Cepillado': return <Wind className={iconClass} />;
      case 'Coloración': return <Palette className={iconClass} />;
      case 'Tratamiento': return <Sparkles className={iconClass} />;
      default: return <MoreHorizontal className={iconClass} />;
    }
  };

  const formatCurrency = (amount) => {
    return new Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 px-3 py-6 md:p-8 font-sans selection:bg-rose-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado Principal */}
        <header className="flex flex-col lg:flex-row justify-between items-center mb-8 md:mb-10 gap-6">
          <div className="flex items-center gap-4 group">
            <div className="bg-rose-500 p-2.5 md:p-3 rounded-2xl shadow-lg shadow-rose-200 group-hover:rotate-12 transition-transform duration-300">
              <Scissors className="text-white w-7 h-7 md:w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
                Hair<span className="text-rose-500">Salon</span>
              </h1>
              <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em]">Gestión de Belleza</p>
            </div>
          </div>
          
          <nav className="flex bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-white shadow-sm w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setView('list')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap text-sm md:text-base ${view === 'list' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-400'}`}
            >
              <History size={18} /> <span className="hidden xs:inline">Historial</span>
            </button>
            <button 
              onClick={() => setView('stats')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap text-sm md:text-base ${view === 'stats' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-400'}`}
            >
              <BarChart3 size={18} /> <span className="hidden xs:inline">Estadísticas</span>
            </button>
            <button 
              onClick={() => setView('add')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold transition-all duration-200 whitespace-nowrap text-sm md:text-base ${view === 'add' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-400'}`}
            >
              <PlusCircle size={18} /> <span className="hidden xs:inline">Nuevo</span>
            </button>
          </nav>
        </header>

        {view === 'stats' ? (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Resumen Mensual */}
            <div className="bg-rose-500 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-rose-200 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-[10px] md:text-xs font-black text-rose-100 uppercase tracking-widest mb-1 md:mb-2">Total Ganado en {analysis.monthName}</p>
                <h2 className="text-4xl md:text-5xl font-black">${formatCurrency(analysis.incomeMonthly)}</h2>
              </div>
              <div className="bg-white/20 p-4 md:p-6 rounded-3xl backdrop-blur-sm">
                <TrendingUp size={40} className="md:w-12 md:h-12" />
              </div>
            </div>

            {/* Gráfica de Ganancias Diarias */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-white overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
                <div>
                  <h3 className="text-lg md:text-xl font-black text-slate-800">Flujo de Caja Diario</h3>
                  <p className="text-xs md:text-sm text-slate-400 font-medium">Ganancias por día del mes actual</p>
                </div>
                <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-full self-start">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">En vivo</span>
                </div>
              </div>

              {/* Contenedor de la Gráfica con scroll horizontal en móvil si es necesario */}
              <div className="overflow-x-auto pb-4">
                <div className="h-64 flex items-end gap-1 md:gap-2 pt-4 min-w-[600px] md:min-w-full">
                  {analysis.dailyData.map((data) => {
                    const heightPercentage = (data.total / analysis.maxDaily) * 100;
                    return (
                      <div key={data.day} className="flex-1 flex flex-col items-center group h-full justify-end">
                        <div className="relative w-full flex justify-center items-end h-full">
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                            ${formatCurrency(data.total)}
                          </div>
                          <div 
                            style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                            className={`w-full max-w-[12px] rounded-t-full transition-all duration-500 ease-out cursor-pointer group-hover:bg-rose-600 ${data.total > 0 ? 'bg-rose-400' : 'bg-slate-100'}`}
                          ></div>
                        </div>
                        <span className="text-[8px] md:text-[10px] font-bold text-slate-300 mt-2">{data.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6 md:mt-8 flex justify-center gap-6 md:gap-8 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-100 rounded-full"></div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400">Sin ventas</span>
                </div>
              </div>
            </div>
          </div>
        ) : view === 'list' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Panel de Análisis del Día */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-white flex items-center justify-between">
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 md:mb-2 text-left">Servicios Hoy</p>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-800 text-left">{analysis.todayCount}</h3>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-50 rounded-2xl md:rounded-3xl flex items-center justify-center text-rose-500">
                  <CalendarDays className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>

              <div className="bg-rose-500 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-rose-200 flex items-center justify-between text-white">
                <div className="text-left">
                  <p className="text-[9px] md:text-[10px] font-black text-rose-100 uppercase tracking-widest mb-1 md:mb-2">Ingresos de Hoy</p>
                  <h3 className="text-3xl md:text-4xl font-black">${formatCurrency(analysis.incomeToday)}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    <span className="text-[9px] md:text-[10px] font-bold flex items-center gap-1 opacity-80 uppercase tracking-tight">
                      <Smartphone size={10} /> Nequi: ${formatCurrency(analysis.nequiToday)}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold flex items-center gap-1 opacity-80 uppercase tracking-tight">
                      <Banknote size={10} /> Efec: ${formatCurrency(analysis.cashToday)}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </section>

            {/* Nuevo Desglose por Personal Hoy */}
            <section className="bg-white/40 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-6 mb-8 md:mb-12 border border-white/50">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-rose-500" />
                <h2 className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Ganancias por Personal (Hoy)</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {analysis.staffEarnings.map((staff) => (
                  <div key={staff.name} className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm border border-rose-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 rounded-xl md:rounded-2xl flex items-center justify-center text-rose-500">
                        <User size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{staff.name}</p>
                        <p className="text-base md:text-lg font-black text-slate-800 leading-none">${formatCurrency(staff.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Buscador de Clientes */}
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full pl-12 pr-6 py-4 md:py-5 bg-white rounded-2xl md:rounded-3xl border-0 shadow-sm outline-none focus:ring-4 focus:ring-rose-100 font-medium placeholder:text-slate-300 text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Listado de Actividad */}
            <div className="grid gap-3 md:gap-4 pb-10">
              {filteredServices.length > 0 ? filteredServices.map(s => (
                <div key={s.id} className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-white shadow-sm flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 group hover:translate-y-[-2px] transition-all">
                  <div className="flex items-center gap-4 md:gap-6 w-full xs:w-auto">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
                      {getServiceIcon(s.type)}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-extrabold text-slate-800 truncate">{s.client}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[8px] md:text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded tracking-wider">
                          {s.type}
                        </span>
                        <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <User size={10} /> {s.staff || 'S/A'}
                        </span>
                        <span className={`text-[8px] md:text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${s.paymentMethod === 'Nequi' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                          {s.paymentMethod === 'Nequi' ? <Smartphone size={8} /> : <Banknote size={8} />}
                          {s.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[9px] md:text-[10px] font-bold text-slate-400">
                        <Clock size={10} /> {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                  <div className="flex xs:flex-col items-center xs:items-end justify-between w-full xs:w-auto gap-1 border-t xs:border-t-0 border-slate-50 pt-3 xs:pt-0">
                    <span className="text-xl md:text-2xl font-black text-slate-800">${formatCurrency(s.price)}</span>
                    <button 
                      onClick={() => removeService(s.id)} 
                      className="text-slate-200 hover:text-rose-500 transition-colors p-1.5"
                      title="Eliminar registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 md:py-24 bg-white/30 rounded-[2rem] md:rounded-[3rem] border-4 border-dashed border-white">
                  <Scissors className="mx-auto w-10 h-10 md:w-12 md:h-12 text-rose-200 mb-4 opacity-50" />
                  <p className="text-slate-400 font-bold italic text-sm md:text-base">No hay servicios registrados.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300 pb-10">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-rose-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Scissors size={120} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-6 md:mb-8 flex items-center gap-3 text-left">
                <Plus className="text-rose-500" /> Nuevo Registro
              </h2>
              <form onSubmit={handleAddService} className="space-y-4 md:space-y-6">
                <div className="text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Nombre del Cliente</label>
                  <input name="client" required placeholder="Ej: María José" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-0 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-semibold text-slate-700 placeholder:text-slate-300 text-sm md:text-base" />
                </div>
                
                <div className="text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Personal que ofreció el servicio</label>
                  <select name="staff" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-0 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer text-sm md:text-base">
                    {staffMembers.map(member => <option key={member} value={member}>{member}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Tipo de Servicio</label>
                    <select name="type" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-0 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer text-sm md:text-base">
                      {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Método de Pago</label>
                    <select name="paymentMethod" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-0 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer text-sm md:text-base">
                      {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Precio del Trabajo ($)</label>
                  <input name="price" type="number" required placeholder="0" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-0 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-black text-slate-800 text-lg md:text-xl" />
                </div>
                
                <div className="text-left">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Observaciones</label>
                  <textarea name="notes" rows="2" placeholder="Opcional..." className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border-0 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none resize-none font-medium text-slate-600 text-sm md:text-base" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                  <button type="button" onClick={() => setView('list')} className="w-full sm:flex-1 py-4 md:py-5 bg-slate-100 text-slate-500 rounded-2xl md:rounded-3xl font-bold hover:bg-slate-200 transition-all uppercase text-[10px] md:text-xs tracking-widest">Cancelar</button>
                  <button type="submit" className="w-full sm:flex-[2] py-4 md:py-5 bg-rose-500 text-white rounded-2xl md:rounded-3xl font-black hover:bg-rose-600 shadow-xl shadow-rose-200 uppercase text-[10px] md:text-xs tracking-widest">Guardar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="mt-10 md:mt-20 text-center opacity-30 pb-6">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">HairSalon Pro v5.0 • 2025</p>
        </footer>
      </div>
    </div>
  );
}