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
  MoreHorizontal
} from 'lucide-react';

/**
 * App Component - HairSalon Management System
 * Gestiona el registro de servicios, análisis diario y persistencia.
 */
export default function App() {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('hairsalon_v4_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Tipos de servicio y métodos de pago
  const serviceTypes = ['Corte', 'Peinado', 'Cepillado', 'Coloración', 'Tratamiento', 'Otro'];
  const paymentMethods = ['Efectivo', 'Nequi'];

  // Guardar en LocalStorage automáticamente
  useEffect(() => {
    localStorage.setItem('hairsalon_v4_records', JSON.stringify(services));
  }, [services]);

  // Análisis detallado de ingresos y servicios
  const analysis = useMemo(() => {
    const today = new Date().toDateString();
    const todayServices = services.filter(s => new Date(s.date).toDateString() === today);
    
    const incomeToday = todayServices.reduce((acc, s) => acc + parseFloat(s.price || 0), 0);
    const nequiToday = todayServices
      .filter(s => s.paymentMethod === 'Nequi')
      .reduce((acc, s) => acc + parseFloat(s.price || 0), 0);
    const cashToday = todayServices
      .filter(s => s.paymentMethod === 'Efectivo')
      .reduce((acc, s) => acc + parseFloat(s.price || 0), 0);

    return {
      todayCount: todayServices.length,
      incomeToday,
      nequiToday,
      cashToday,
      totalCount: services.length
    };
  }, [services]);

  const handleAddService = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newEntry = {
      id: Date.now(),
      client: fd.get('client'),
      type: fd.get('type'),
      price: fd.get('price'),
      paymentMethod: fd.get('paymentMethod'),
      date: new Date().toISOString(),
      notes: fd.get('notes')
    };
    setServices([newEntry, ...services]);
    setView('list');
  };

  const removeService = (id) => {
    if (window.confirm('¿Eliminar este registro de HairSalon?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const filteredServices = services.filter(s => 
    s.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (type) => {
    switch(type) {
      case 'Corte': return <Scissors className="w-6 h-6" />;
      case 'Peinado': return <Crown className="w-6 h-6" />;
      case 'Cepillado': return <Wind className="w-6 h-6" />;
      case 'Coloración': return <Palette className="w-6 h-6" />;
      case 'Tratamiento': return <Sparkles className="w-6 h-6" />;
      default: return <MoreHorizontal className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header de HairSalon */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500 p-3 rounded-2xl shadow-lg shadow-rose-200">
              <Scissors className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter">
                Hair<span className="text-rose-500">Salon</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Management Pro</p>
            </div>
          </div>
          
          <nav className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
            <button 
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'list' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
            >
              <History size={18} /> Historial
            </button>
            <button 
              onClick={() => setView('add')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'add' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
            >
              <PlusCircle size={18} /> Nuevo
            </button>
          </nav>
        </header>

        {/* Dashboard de Análisis Diario */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-white flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Servicios Hoy</p>
              <h3 className="text-3xl font-black text-slate-800">{analysis.todayCount}</h3>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl text-rose-500">
              <CalendarDays />
            </div>
          </div>

          <div className="bg-rose-500 p-6 rounded-[2.5rem] shadow-xl shadow-rose-100 flex items-center justify-between text-white md:col-span-2">
            <div>
              <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Ingresos de Hoy</p>
              <h3 className="text-4xl font-black">${analysis.incomeToday.toLocaleString()}</h3>
              <div className="flex gap-4 mt-2">
                <span className="text-xs font-bold flex items-center gap-1 opacity-90">
                  <Smartphone size={12} /> Nequi: ${analysis.nequiToday.toLocaleString()}
                </span>
                <span className="text-xs font-bold flex items-center gap-1 opacity-90">
                  <Banknote size={12} /> Efectivo: ${analysis.cashToday.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white/20 p-5 rounded-2xl">
              <Wallet size={32} />
            </div>
          </div>
        </section>

        {view === 'list' ? (
          <div className="space-y-6">
            {/* Buscador */}
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full pl-14 pr-8 py-5 bg-white/80 border-0 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-rose-100 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Listado de Servicios */}
            <div className="grid gap-4">
              {filteredServices.length > 0 ? filteredServices.map(s => (
                <div key={s.id} className="bg-white/70 backdrop-blur-md p-6 rounded-[2.5rem] border border-white shadow-sm flex items-center justify-between group hover:translate-y-[-2px] transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-rose-500">
                      {getServiceIcon(s.type)}
                    </div>
                    <div>
                      <h4 className="text-xl font-extrabold text-slate-800">{s.client}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md tracking-tighter">
                          {s.type}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${s.paymentMethod === 'Nequi' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                          {s.paymentMethod === 'Nequi' ? <Smartphone size={10} /> : <Banknote size={10} />}
                          {s.paymentMethod}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {new Date(s.date).toLocaleDateString()} • {new Date(s.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-2xl font-black text-slate-800">${parseFloat(s.price).toLocaleString()}</span>
                    <button 
                      onClick={() => removeService(s.id)}
                      className="text-slate-200 hover:text-rose-500 transition-colors p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-24 bg-white/30 rounded-[3rem] border-4 border-dashed border-white">
                  <p className="text-slate-400 font-bold italic">No hay servicios registrados aún.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-rose-50">
              <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-3 italic">
                <PlusCircle className="text-rose-500" /> Nuevo Registro
              </h2>
              <form onSubmit={handleAddService} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Cliente</label>
                  <input 
                    name="client" 
                    required 
                    placeholder="Ej: Claudia Silva"
                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-semibold text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Servicio</label>
                    <select name="type" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 cursor-pointer">
                      {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Método de Pago</label>
                    <select name="paymentMethod" className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-bold text-slate-600 cursor-pointer">
                      {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Precio del Trabajo ($)</label>
                  <input 
                    name="price" 
                    type="number" 
                    required 
                    placeholder="0.00"
                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none font-black text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Notas adicionales</label>
                  <textarea 
                    name="notes" 
                    rows="2"
                    placeholder="Opcional..."
                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-rose-100 outline-none resize-none font-medium"
                  ></textarea>
                </div>
                <div className="flex gap-4 pt-6">
                  <button 
                    type="button" 
                    onClick={() => setView('list')}
                    className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-bold hover:bg-slate-100 transition-all uppercase text-xs tracking-widest"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-5 bg-rose-500 text-white rounded-3xl font-black hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all uppercase text-xs tracking-widest"
                  >
                    Guardar Servicio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center opacity-30">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">HairSalon Manager v4.0 • 2025</p>
        </footer>
      </div>
    </div>
  );
}