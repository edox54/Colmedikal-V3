import React, { useState } from 'react';
import { 
  useColmedical 
} from '../context/ColmedicalContext';
import { 
  Building2, 
  Users, 
  DollarSign, 
  FileCheck, 
  Calendar, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  HeartPulse, 
  UserCheck, 
  FileText, 
  Stethoscope, 
  Eye, 
  X,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Page, Doctor } from '../types';

interface AdminPanelProps {
  setCurrentPage: (page: Page) => void;
}

export default function AdminPanel({ setCurrentPage }: AdminPanelProps) {
  const {
    doctors,
    refunds,
    appointments,
    authorizations,
    leads,
    addDoctor,
    deleteDoctor,
    updateRefundStatus,
    updateAuthorizationStatus,
    updateAppointmentStatus,
    updateLeadStatus
  } = useColmedical();

  const [activeTab, setActiveTab] = useState<'kpis' | 'refunds' | 'appointments' | 'auths' | 'leads' | 'doctors'>('kpis');
  
  // Doctors form state
  const [newDoc, setNewDoc] = useState({
    name: '',
    specialty: 'Medicina General',
    city: 'Quito',
    phone: '',
    email: '',
    clinic: '',
    availability: 'Disponible Lunes a Viernes',
    education: '',
    cost: 40,
    image: 'doctor_m'
  });
  const [docSuccessMsg, setDocSuccessMsg] = useState('');

  // Selected details modal/panel state
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // Handle addition of a doctor
  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.clinic || !newDoc.education) {
      alert('Por favor complete los campos obligatorios del especialista.');
      return;
    }

    const imageMap: Record<string, string> = {
      doctor_m: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      doctor_f: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150',
      doctor_m2: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
      doctor_f2: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=150'
    };

    const imageUrl = imageMap[newDoc.image] || imageMap.doctor_m;

    const newDoctorObj: Doctor = {
      id: `dr-${Date.now()}`,
      name: newDoc.name,
      specialty: newDoc.specialty,
      city: newDoc.city,
      phone: newDoc.phone || '02-500-0100',
      email: newDoc.email || `${newDoc.name.toLowerCase().replace(/\s/g, '.')}@colmedical.center`,
      clinic: newDoc.clinic,
      rating: '5.00 (Nuevo Ingreso)',
      availability: newDoc.availability,
      education: newDoc.education,
      image: imageUrl,
      cost: Number(newDoc.cost)
    };

    addDoctor(newDoctorObj);
    setNewDoc({
      name: '',
      specialty: 'Medicina General',
      city: 'Quito',
      phone: '',
      email: '',
      clinic: '',
      availability: 'Disponible Lunes a Viernes',
      education: '',
      cost: 40,
      image: 'doctor_m'
    });
    setDocSuccessMsg('¡Especialista registrado con éxito en el Directorio Médico!');
    setTimeout(() => setDocSuccessMsg(''), 4000);
  };

  // KPI Calculations
  const pendingRefunds = refunds.filter(r => r.status === 'Procesando');
  const totalRefundAmountPending = pendingRefunds.reduce((sum, r) => sum + r.amount, 0);
  const totalLeadsUncontacted = leads.filter(l => l.status === 'Nuevo Plan').length;
  const pendingAuthsCount = authorizations.filter(a => a.status === 'Pendiente' || a.status === 'Auditoría').length;
  const activeAppointmentsCount = appointments.filter(a => a.status === 'Confirmada' || a.status === 'Pendiente').length;

  return (
    <div className="space-y-12 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedical-admin-portal">
      
      {/* 1. TOP HEADER & SWITCHING BACK TO USER SITE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-teal-400 border border-slate-750">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-display font-black text-slate-950 uppercase tracking-tight">Colmedical Corporativo</span>
              <span className="bg-indigo-100 text-indigo-805 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">MODO EMPRESA</span>
            </div>
            <p className="text-xs text-slate-500">Módulo Administrativo Interno de Auditoría Médica y Gestión de Planes</p>
          </div>
        </div>

        <button
          onClick={() => setCurrentPage('home')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-755 text-xs font-bold rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Volver al Portal de Clientes</span>
          <ArrowRight className="w-4 h-4 text-slate-450" />
        </button>
      </div>

      {/* 2. INNER NAVIGATION ACCORD */}
      <div className="flex flex-wrap gap-2.5 bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'kpis'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-650 hover:bg-slate-200'
          }`}
          id="admin-tab-kpis"
        >
          Consola General (KPIs)
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'refunds'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-refunds"
        >
          <span>Auditar Reembolsos</span>
          {pendingRefunds.length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">{pendingRefunds.length}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-appointments"
        >
          <span>Citas Médicas</span>
          {activeAppointmentsCount > 0 && (
            <span className="bg-teal-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{activeAppointmentsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('auths')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'auths'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-auths"
        >
          <span>Autorizaciones</span>
          {pendingAuthsCount > 0 && (
            <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">{pendingAuthsCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'leads'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-leads"
        >
          <span>Prospectos Web (Quotes)</span>
          {totalLeadsUncontacted > 0 && (
            <span className="bg-emerald-500 text-slate-950 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{totalLeadsUncontacted}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'doctors'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-655 hover:bg-slate-200'
          }`}
          id="admin-tab-doctors"
        >
          <span>Directorio Médico</span>
          <span className="text-[10px] text-slate-400 font-mono font-normal">({doctors.length})</span>
        </button>
      </div>

      {/* 3. CONDITIONAL RENDER AREA */}

      {/* 3.1 GENERAL KPI DASHBOARD CONSOLE */}
      {activeTab === 'kpis' && (
        <div className="space-y-8 animate-in fade-in duration-200" id="admin-kpi-panel">
          
          {/* Bento Statistcs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1: REEMBOLSOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reembolsos a Liquidar</span>
                <span className="text-2xl font-black text-slate-900 font-mono">${totalRefundAmountPending.toFixed(2)}</span>
                <span className="text-[10px] text-rose-650 font-bold block">{pendingRefunds.length} Solicitudes entrantes hoy</span>
              </div>
            </div>

            {/* KPI 2: PROSPECTOS */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prospectos (Leads) Activos</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{leads.length} Leads</span>
                <span className="text-[10px] text-emerald-600 font-semibold block">{totalLeadsUncontacted} pendientes de llamada telefónica</span>
              </div>
            </div>

            {/* KPI 3: AUTORIZACIONES */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditorías Complejas</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{pendingAuthsCount} Quirúrgicos</span>
                <span className="text-[10px] text-indigo-650 font-semibold block">Pendiente de dictamen clínico</span>
              </div>
            </div>

            {/* KPI 4: DOCTORS Listings */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especialistas Asegurados</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{doctors.length} Médicos</span>
                <span className="text-[10px] text-teal-650 font-semibold block">Habilitados en Quito, Gye y Cuenca</span>
              </div>
            </div>

          </div>

          {/* Connected state simulator guide banner */}
          <section className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1 md:max-w-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                <span>¿Cómo funciona el Control Conectado de Colmedical?</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Este panel manipula de forma exclusiva los datos del servidor central virtual (simulado en <code>localStorage</code>). Al autorizar un reembolso o agregar un doctor, los cambios se propagan de inmediato al Portal de Clientes y al cotizador web, simulando un entrono real de producción.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('refunds')} className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-[11px] font-bold rounded-lg cursor-pointer">
                Auditar Facturas
              </button>
              <button onClick={() => setActiveTab('leads')} className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-teal-400 text-[11px] font-semibold rounded-lg border border-slate-700 cursor-pointer">
                Analizar Leads del Cotizador
              </button>
            </div>
          </section>

          {/* Quick logs representation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick prospects leads tracker list */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Últimos Prospects del Cotizador Virtual</span>
                </h4>
                <button onClick={() => setActiveTab('leads')} className="text-[10px] font-bold text-teal-650 hover:underline cursor-pointer">
                  Ver todo
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {leads.slice(0, 3).map((ld) => (
                  <div key={ld.id} className="py-3 flex justify-between items-start text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{ld.quoteData.fullName}</h5>
                      <p className="text-[10px] text-slate-500">Plan: {ld.quoteData.basePlanId.toUpperCase()} • Tlf: {ld.quoteData.phone}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 font-mono">${ld.estimatedPrice.toFixed(2)}/mes</span>
                      <span className="block text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded uppercase text-center w-full">
                        {ld.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick upcoming consultation medical logs */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Últimas Citas Agendadas por Pacientes</span>
                </h4>
                <button onClick={() => setActiveTab('appointments')} className="text-[10px] font-bold text-teal-650 hover:underline cursor-pointer">
                  Ver todas
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="py-3 flex justify-between items-start text-xs">
                    <div>
                      <h5 className="font-bold text-slate-900">{apt.patientName}</h5>
                      <p className="text-[10px] text-slate-500">Médico: {apt.doctorName} ({apt.specialty})</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="font-bold text-slate-900 font-mono">{apt.aptDate} @ {apt.aptTime}</span>
                      <span className={`block text-[9px] font-bold px-1.5 py-0.2 rounded uppercase text-center ${
                        apt.status === 'Confirmada' ? 'text-teal-700 bg-teal-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3.2 REFUNDS AUDITING MODULE */}
      {activeTab === 'refunds' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-refunds-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Consola de Auditoría y Liquidación de Reembolsos</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verifica los importes presentados por afiliados, analiza la validez y aprueba al 90% o rechaza las facturas comerciales. Los pacientes obtienen respuesta de forma instantánea.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Refunds list list */}
            <div className="lg:col-span-12 space-y-4">
              {refunds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {refunds.map((ref) => {
                    const isPending = ref.status === 'Procesando';
                    const isSelected = selectedRefundId === ref.id;

                    return (
                      <div 
                        key={ref.id}
                        className={`bg-white p-5 rounded-3xl border transition-all ${
                          isSelected ? 'border-indigo-600 ring-2 ring-indigo-600/10' : 'border-slate-200 shadow-sm'
                        }`}
                        id={`admin-refund-card-${ref.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-slate-100 text-slate-805 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                                {ref.id}
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans border ${
                                ref.status === 'Reembolsado' || ref.status === 'Aprobado'
                                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                                  : ref.status === 'Rechazado'
                                  ? 'text-red-700 bg-red-50 border-red-100'
                                  : 'text-amber-700 bg-amber-50 border-amber-100 animate-pulse'
                              }`}>
                                {ref.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 pt-1.5">{ref.familyMember}</h4>
                            <p className="text-xs text-slate-500">{ref.specialty} — Factura N° {ref.invoiceNumber}</p>
                          </div>

                          <div className="text-right space-y-1">
                            <span className="text-[10px] text-slate-400 font-medium">Monto Declarado:</span>
                            <p className="text-lg font-black font-mono text-slate-950">${ref.amount.toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600 font-semibold font-mono">Retorno Est. 90%: ${(ref.amount * 0.9).toFixed(2)}</p>
                          </div>
                        </div>

                        {ref.adminComment && (
                          <div className="mt-3.5 p-3 bg-slate-50 border border-slate-150 rounded-xl text-[11px] text-slate-650 leading-relaxed">
                            <strong>Dictamen Interno:</strong> {ref.adminComment}
                          </div>
                        )}

                        {isPending ? (
                          <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                            <div className="space-y-1.5">
                              <label className="block text-[11px] font-bold text-slate-750">Nota de Auditoría Clínica:</label>
                              <input 
                                type="text"
                                placeholder="Escribe el comentario (ej: Factura SRI aprobada, reembolso asignado)"
                                value={isSelected ? adminComment : ''}
                                onChange={(e) => {
                                  setSelectedRefundId(ref.id);
                                  setAdminComment(e.target.value);
                                }}
                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                                id={`input-comment-${ref.id}`}
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const comment = isSelected ? adminComment : 'Reembolso auditado y verificado';
                                  updateRefundStatus(ref.id, 'Reembolsado', comment);
                                  setSelectedRefundId(null);
                                  setAdminComment('');
                                }}
                                className="flex-1 py-2 text-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Aprobar y Transferir</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const comment = isSelected ? adminComment : 'Reclamo rechazado por duplicidad o preexistencia no declarada';
                                  updateRefundStatus(ref.id, 'Rechazado', comment);
                                  setSelectedRefundId(null);
                                  setAdminComment('');
                                }}
                                className="flex-1 py-2 text-center bg-slate-100 hover:bg-red-50 hover:text-red-655 hover:border-red-200 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Rechazar Solicitud</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-3.5 text-right">
                            <span className="text-[10px] text-slate-400 font-mono">Procesado el: {ref.refundDate}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-3xl border p-6">
                  <DollarSign className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No hay reembolsos registrados.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 3.3 APPOINTMENTS CALENDAR MANAGE */}
      {activeTab === 'appointments' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-appointments-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Libro General de Consultas y Citas Médicas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Vigila, autoriza o cancela las citas presenciales y virtuales agendadas por los asegurados en los centros médicos de convenio del país.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Código / Paciente</th>
                    <th className="p-4">Médicos / Especialidad</th>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Sede / Modalidad</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 space-y-1">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.2 rounded inline-block">
                            {apt.id}
                          </span>
                          <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {apt.patientId} | Tel: {apt.patientPhone}</p>
                        </td>

                        <td className="p-4 space-y-1">
                          <p className="font-bold text-slate-850 leading-none">{apt.doctorName}</p>
                          <span className="inline-block bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.2 rounded font-bold uppercase">
                            {apt.specialty}
                          </span>
                        </td>

                        <td className="p-4 font-mono font-semibold text-slate-800">
                          {apt.aptDate} <span className="block text-[10px] text-slate-405 font-normal">{apt.aptTime}</span>
                        </td>

                        <td className="p-4 space-y-1">
                          <p className="text-slate-700 font-medium">{apt.clinic}</p>
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                              apt.modality === 'telemedicina' ? 'bg-indigo-50 text-indigo-750' : 'bg-rose-50 text-rose-750'
                            }`}>
                              {apt.modality === 'telemedicina' ? 'Videollamada' : 'Presencial'}
                            </span>
                            <span className="text-[10px] text-slate-400">({apt.city})</span>
                          </div>
                        </td>

                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            apt.status === 'Confirmada' || apt.status === 'Completada'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                              : apt.status === 'Cancelada'
                              ? 'text-red-700 bg-red-50 border-red-100'
                              : 'text-amber-705 bg-amber-50 border-amber-100'
                          }`}>
                            {apt.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {apt.status === 'Pendiente' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Confirmada')}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Confirmar
                              </button>
                            )}

                            {apt.status !== 'Cancelada' && apt.status !== 'Completada' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Cancelada')}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-750 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            )}

                            {apt.status === 'Confirmada' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Completada')}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Completar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-450">
                        No hay citas agendadas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3.4 AUTHORIZATIONS COMPLEX LISTINGS */}
      {activeTab === 'auths' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-auths-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Auditoría Quirúrgica y Autorizaciones Especiales</h3>
            <p className="text-xs text-slate-500 mt-1">
              Revisa, aprueba o pon en auditoría técnica las órdenes médicas que requieran cirugías programadas, resonancias o fármacos de alto coste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorizations.map((auth) => {
              const isPending = auth.status === 'Pendiente' || auth.status === 'Auditoría';
              return (
                <div key={auth.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between" id={`admin-auth-card-${auth.id}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                      <span className="font-mono text-[10px] font-bold text-slate-800">{auth.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        auth.status === 'Aprobado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-100'
                      }`}>
                        {auth.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Asegurado Solicitante:</span>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{auth.patient}</h4>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Procedimiento Programado:</span>
                      <p className="font-semibold text-slate-800 leading-snug">{auth.procedure}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Lugar: {auth.facility}</p>
                    </div>

                    {auth.adminComment && (
                      <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-slate-600 font-medium">
                        🔍 <strong>Dictamen Auditor:</strong> {auth.adminComment}
                      </div>
                    )}
                  </div>

                  {isPending ? (
                    <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => updateAuthorizationStatus(auth.id, 'Aprobado', 'Procedimiento autorizado vía IA de auditoría inmediata. Ración médica asegurada.')}
                        className="py-2.5 text-center bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                      >
                        Autorizar SRI
                      </button>
                      <button
                        onClick={() => updateAuthorizationStatus(auth.id, 'Rechazado', 'Rechazado por ser cirugía estética u odontología estética fuera de póliza.')}
                        className="py-2.5 text-center bg-slate-100 hover:bg-red-50 hover:text-red-750 font-semibold text-xs border border-slate-205 rounded-xl text-slate-705 cursor-pointer"
                      >
                        Rechazar Código
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 text-right text-[10px] text-slate-400 font-mono">
                      Solicitado el: {auth.requestDate}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3.5 LEADS FROM PLAN QUOTER (CRM MODULE) */}
      {activeTab === 'leads' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="admin-leads-panel">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Prospectos de Venta (Leads del Cotizador)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Visualiza en tiempo real las cotizaciones de seguros de salud realizadas en la web. Comunícate de inmediato por llamada o correo para cerrar conversiones comerciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leads.length > 0 ? (
              leads.map((ld) => (
                <div key={ld.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between" id={`admin-lead-card-${ld.id}`}>
                  
                  {/* Lead details header */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{ld.id}</span>
                        <h4 className="text-base font-black text-slate-900 leading-tight">{ld.quoteData.fullName}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-semibold font-mono block">Plan Est.:</span>
                        <span className="text-base font-black text-indigo-750 font-mono">${ld.estimatedPrice.toFixed(2)}<span className="text-[10px] font-normal">/m</span></span>
                      </div>
                    </div>

                    {/* Meta info tags */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Contacto:</span>
                        <a href={`tel:${ld.quoteData.phone}`} className="font-bold text-indigo-650 hover:underline flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{ld.quoteData.phone}</span>
                        </a>
                        <a href={`mailto:${ld.quoteData.email}`} className="text-[10px] text-slate-500 truncate block hover:underline">
                          {ld.quoteData.email}
                        </a>
                      </div>

                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">Estructura Plan:</span>
                        <span className="font-semibold text-slate-800 capitalize leading-none">{ld.quoteData.type}</span>
                        <span className="block text-[10px] text-slate-500">
                          {ld.quoteData.primaryAge} años 
                          {ld.quoteData.childrenCount > 0 ? ` • Hijos: ${ld.quoteData.childrenCount}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Addons preference ledger */}
                    <div className="space-y-1.5">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Coberturas Adicionales Elegidas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-block bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-medium">
                          Dental: {ld.quoteData.dentalAddon ? 'Sí' : 'No'}
                        </span>
                        <span className="inline-block bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-medium">
                          Maternidad: {ld.quoteData.maternityAddon ? 'Sí' : 'No'}
                        </span>
                        <span className="inline-block bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-medium">
                          Internacional: {ld.quoteData.intlAddon ? 'Sí' : 'No'}
                        </span>
                        <span className="inline-block bg-slate-100 text-slate-700 text-[9px] px-2 py-0.5 rounded font-medium">
                          Fármacos: {ld.quoteData.rxAddon ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Fecha: {new Date(ld.timestamp).toLocaleDateString()}</span>
                    
                    <div className="flex gap-2">
                      {ld.status === 'Nuevo Plan' && (
                        <button
                          onClick={() => updateLeadStatus(ld.id, 'Contactado')}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                        >
                          Marcar Contactado
                        </button>
                      )}

                      {ld.status === 'Contactado' && (
                        <button
                          onClick={() => updateLeadStatus(ld.id, 'Cierre Efectivo')}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer"
                        >
                          Cierre Exitoso ✔
                        </button>
                      )}

                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                        ld.status === 'Cierre Efectivo' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : ''
                      }`}>
                        {ld.status !== 'Nuevo Plan' && ld.status !== 'Contactado' ? ld.status : ''}
                      </span>
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 bg-white rounded-3xl border p-6">
                <Briefcase className="w-12 h-12 text-slate-350 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No hay prospectos cotizaciones guardadas aún.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3.6 LIVE MEDICAL DIRECTORY MANAGE */}
      {activeTab === 'doctors' && (
        <div className="space-y-8 animate-in fade-in duration-200" id="admin-doctors-panel">
          
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-950">Módulo de Especialistas Médicos del País</h3>
            <p className="text-xs text-slate-500 mt-1">
              Agrega nuevos profesionales de la salud al live board para que los asegurados los agenden de forma instantánea. Elimina profesionales que dejen de pertenecer a la red de cobertura.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* New Doctor form block */}
            <form onSubmit={handleAddDoctor} className="lg:col-span-4 bg-slate-55 p-6 rounded-3xl border border-slate-200 space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registrar Nuevo Médico</span>
              
              {docSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-xl flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{docSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Doctor Name */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Nombre del Médico:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Dr. Andrés Noboa"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Specialty */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Especialidad:</label>
                    <select
                      value={newDoc.specialty}
                      onChange={(e) => setNewDoc({...newDoc, specialty: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Dermatología">Dermatología</option>
                      <option value="Cardiología">Cardiología</option>
                      <option value="Ginecología y Obstetricia">Ginecología</option>
                      <option value="Pediatría y Neonatología">Pediatría</option>
                      <option value="Traumatología y Ortopedia">Traumatología</option>
                      <option value="Odontología y Maxilofacial">Odontología</option>
                      <option value="Medicina General">Medicina General</option>
                    </select>
                  </div>

                  {/* City */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Ciudad:</label>
                    <select
                      value={newDoc.city}
                      onChange={(e) => setNewDoc({...newDoc, city: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Quito">Quito</option>
                      <option value="Guayaquil">Guayaquil</option>
                      <option value="Cuenca">Cuenca</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Phone */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Teléfono:</label>
                    <input 
                      type="text"
                      placeholder="Ej. 02-390251"
                      value={newDoc.phone}
                      onChange={(e) => setNewDoc({...newDoc, phone: e.target.value})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <label className="block text-[11px] font-bold text-slate-700">Costo Consulta ($):</label>
                    <input 
                      type="number"
                      min="10"
                      max="150"
                      value={newDoc.cost}
                      onChange={(e) => setNewDoc({...newDoc, cost: Number(e.target.value)})}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Clinic */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Clínica de Convenio:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Hospital Metropolitano, Clínica Kennedy..."
                    value={newDoc.clinic}
                    onChange={(e) => setNewDoc({...newDoc, clinic: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Education and degree */}
                <div className="space-y-0.5">
                  <label className="block text-[11px] font-bold text-slate-700">Educación o Subespecialidad:</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ej. Cirujano de Tórax - Universidad de París, Francia"
                    value={newDoc.education}
                    onChange={(e) => setNewDoc({...newDoc, education: e.target.value})}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Photo profile choose mock */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">Foto del Especialista (Mockup):</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'doctor_m', alias: 'M-1', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=85&w=60' },
                      { id: 'doctor_f', alias: 'F-1', img: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=85&w=60' },
                      { id: 'doctor_m2', alias: 'M-2', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=85&w=60' },
                      { id: 'doctor_f2', alias: 'F-2', img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=85&w=60' }
                    ].map((avatar) => (
                      <button
                        type="button"
                        key={avatar.id}
                        onClick={() => setNewDoc({...newDoc, image: avatar.id})}
                        className={`p-1 rounded-xl border-2 transition-all overflow-hidden ${
                          newDoc.image === avatar.id ? 'border-indigo-600 scale-95' : 'border-slate-200'
                        }`}
                      >
                        <img src={avatar.img} alt="" className="w-full h-8 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <span className="text-[8px] font-bold text-slate-500 block text-center mt-1">{avatar.alias}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="w-full py-3.5 text-center bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Habilitar Doctor en Directorio Live
              </button>
            </form>

            {/* Live listings of active doctors list */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">médicos en convenio disponibles ({doctors.length})</span>
              
              <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto pr-2 space-y-1.5 scrollbar-thin">
                {doctors.map((doc) => (
                  <div key={doc.id} className="py-3 flex justify-between items-center text-xs gap-3">
                    <div className="flex gap-3.5 items-center">
                      <img 
                        src={doc.image} 
                        alt="" 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500">
                          {doc.specialty} • <strong>{doc.clinic} ({doc.city})</strong>
                        </p>
                        <p className="text-[9px] text-indigo-600 font-mono italic max-w-[320px] truncate" title={doc.education}>{doc.education}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-408 font-bold font-mono block">${doc.cost} / cons.</span>
                        <span className="text-[9px] text-slate-400">Rating: {doc.rating.split(' ')[0]}⭐</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Hacer de baja al ${doc.name} de la red de clínicas de Colmedical?`)) {
                            deleteDoctor(doc.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar del Directorio"
                        id={`btn-del-doc-${doc.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
