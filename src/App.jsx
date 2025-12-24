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
  TrendingUp
} from 'lucide-react';

/**
 * App Component - Sistema de Gestión HairSalon
 * Incluye registro de servicios, análisis diario de ingresos, métodos de pago y personal.
 */
export default function App() {
  // Estado para los servicios con persistencia en localStorage
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('hairsalon_pro_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Definiciones de categorías, pagos y personal
  const serviceTypes = ['Corte', 'Peinado', 'Cepillado', 'Coloración', 'Tratamiento', 'Otro'];
  const paymentMethods = ['Efectivo', 'Nequi'];
  const staffMembers = ['Jhon barber', 'Nelly peluquera', 'Luz peluquera'];

  // Guardado automático al cambiar los servicios
  useEffect(() => {
    localStorage.setItem('hairsalon_pro_records', JSON.stringify(services));
  }, [services]);

  // Análisis de ingresos y servicios del día actual
  const analysis = useMemo(() => {
    const today = new Date().toDateString();
    const todayServices = services.filter(s => new Date(s.date).toDateString() === today);
    
    // Usamos Math.round para evitar errores de precisión de punto flotante en la suma
    const incomeToday = todayServices.reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
    const nequiToday = todayServices
      .filter(s => s.paymentMethod === 'Nequi')
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);
    const cashToday = todayServices
      .filter(s => s.paymentMethod === 'Efectivo')
      .reduce((acc, s) => acc + Math.round(parseFloat(s.price || 0)), 0);

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
      staffEarnings
    };
  }, [services, staffMembers]);

  const handleAddService = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    
    // Aseguramos que el precio sea un número entero limpio desde el registro
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

  // Función auxiliar para dar formato de moneda consistente
  const formatCurrency = (amount) => {
    return new Number(amount).toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 p-4 md:p-8 font-sans selection:bg-rose-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado Principal */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4 group">
            <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-200 group-hover:rotate-12 transition-transform duration-300">
              <Scissors className="text-white w-8 h-8" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black italic tracking-tighter">
                Hair<span className="text-rose-500">Salon</span>
              </h1>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Gestión de Belleza</p>
            </div>
          </div>
          
          <nav className="flex bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-white shadow-sm">
            <button 
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all duration-200 ${view === 'list' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-400'}`}
            >
              <History size={18} /> Historial
            </button>
            <button 
              onClick={() => setView('add')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all duration-200 ${view === 'add' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-rose-400'}`}
            >
              <PlusCircle size={18} /> Nuevo
            </button>
          </nav>
        </header>

        {/* Panel de Análisis del Día */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 text-left">Servicios Hoy</p>
              <h3 className="text-4xl font-black text-slate-800 text-left">{analysis.todayCount}</h3>
            </div>
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500">
              <CalendarDays size={32} />
            </div>
          </div>

          <div className="bg-rose-500 p-8 rounded-[2.5rem] shadow-xl shadow-rose-200 flex items-center justify-between text-white">
            <div className="text-left">
              <p className="text-[10px] font-black text-rose-100 uppercase tracking-widest mb-2">Ingresos de Hoy</p>
              <h3 className="text-4xl font-black">${formatCurrency(analysis.incomeToday)}</h3>
              <div className="flex gap-4 mt-2">
                <span className="text-[10px] font-bold flex items-center gap-1 opacity-80 uppercase tracking-tight">
                  <Smartphone size={10} /> Nequi: ${formatCurrency(analysis.nequiToday)}
                </span>
                <span className="text-[10px] font-bold flex items-center gap-1 opacity-80 uppercase tracking-tight">
                  <Banknote size={10} /> Efectivo: ${formatCurrency(analysis.cashToday)}
                </span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
              <Wallet size={32} />
            </div>
          </div>
        </section>

        {/* Nuevo Desglose por Personal Hoy */}
        <section className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 mb-12 border border-white/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-rose-500" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Ganancias por Personal (Hoy)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {analysis.staffEarnings.map((staff) => (
              <div key={staff.name} className="bg-white p-4 rounded-3xl shadow-sm border border-rose-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{staff.name}</p>
                    <p className="text-lg font-black text-slate-800 leading-none">${formatCurrency(staff.total)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {view === 'list' ? (
          <div className="space-y-6">
            {/* Buscador de Clientes */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar cliente por nombre..." 
                className="w-full pl-14 pr-8 py-5 bg-white rounded-3xl border-0 shadow-sm outline-none focus:ring-4 focus:ring-rose-100 font-medium placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Listado de Actividad */}
            <div className="grid gap-4">
              {filteredServices.length > 0 ? filteredServices.map(s => (
                <div key={s.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-sm flex items-center justify-between group hover:translate-y-[-2px] transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      {getServiceIcon(s.type)}
                    </div>
                    <div className="text-left">
                      <h4 className="text-lg font-extrabold text-slate-800">{s.client}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded tracking-widest">
                          {s.type}
                        </span>
                        <span className="text-[9px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <User size={10} /> {s.staff || 'Sin asignar'}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${s.paymentMethod === 'Nequi' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                          {s.paymentMethod === 'Nequi' ? <Smartphone size={8} /> : <Banknote size={8} />}
                          {s.paymentMethod}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={10} /> {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-black text-slate-800">${formatCurrency(s.price)}</span>
                    <button 
                      onClick={() => removeService(s.id)} 
                      className="text-slate-200 hover:text-rose-500 transition-colors p-2"
                      title="Eliminar registro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-24 bg-white/30 rounded-[3rem] border-4 border-dashed border-white">
                  <Scissors className="mx-auto w-12 h-12 text-rose-200 mb-4 opacity-50" />
                  <p className="text-slate-400 font-bold italic">No hay servicios registrados en HairSalon.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-rose-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Scissors size={120} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 text-left">
                <Plus className="text-rose-500" /> Nuevo Registro
              </h2>
              <form onSubmit={handleAddService} className="space-y-6">
                <div className="text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Nombre del Cliente</label>
                  <input name="client" required placeholder="Ej: María José" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-semibold text-slate-700 placeholder:text-slate-300" />
                </div>
                
                <div className="text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Personal que ofreció el servicio</label>
                  <select name="staff" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer">
                    {staffMembers.map(member => <option key={member} value={member}>{member}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Tipo de Servicio</label>
                    <select name="type" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer">
                      {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Método de Pago</label>
                    <select name="paymentMethod" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 appearance-none cursor-pointer">
                      {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Precio del Trabajo ($)</label>
                  <input name="price" type="number" required placeholder="0" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-black text-slate-800 text-xl" />
                </div>
                
                <div className="text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 block mb-2">Observaciones</label>
                  <textarea name="notes" rows="2" placeholder="Opcional..." className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none resize-none font-medium text-slate-600" />
                </div>
                
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setView('list')} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-bold hover:bg-slate-100 transition-all uppercase text-xs tracking-widest">Cancelar</button>
                  <button type="submit" className="flex-[2] py-5 bg-rose-500 text-white rounded-3xl font-black hover:bg-rose-600 shadow-xl shadow-rose-200 uppercase text-xs tracking-widest">Guardar en HairSalon</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">HairSalon Pro v5.0 • 2025</p>
        </footer>
      </div>
    </div>
  );
}