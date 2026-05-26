import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  Video, 
  GraduationCap, 
  CheckCircle,
  X,
  Sparkles,
  Award,
  Stethoscope,
  HeartPulse,
  ChevronRight
} from 'lucide-react';
import { Page, Doctor } from '../types';
import { useColmedical } from '../context/ColmedicalContext';

interface DirectorioMedicoProps {
  setCurrentPage: (page: Page) => void;
}

export default function DirectorioMedico({ setCurrentPage }: DirectorioMedicoProps) {
  const { doctors, addAppointment } = useColmedical();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Booking form state
  const [bookingStep, setBookingStep] = useState<1 | 2>(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    patientId: '',
    patientPhone: '',
    aptDate: '2026-05-25',
    aptTime: '09:00',
    modality: 'presencial' // presencial or telemedicina
  });

  const specialties = [
    { id: 'all', name: 'Todas las Especialidades' },
    { id: 'cardiologia', name: 'Cardiología' },
    { id: 'pediatria', name: 'Pediatría y Neonatología' },
    { id: 'ginecologia', name: 'Ginecología y Obstetricia' },
    { id: 'traumatologia', name: 'Traumatología y Ortopedia' },
    { id: 'dermatologia', name: 'Dermatología' },
    { id: 'odontologia', name: 'Odontología y Maxilofacial' },
    { id: 'general', name: 'Medicina General' }
  ];

  const cities = [
    { id: 'all', name: 'Todas las Ciudades' },
    { id: 'Quito', name: 'Quito' },
    { id: 'Guayaquil', name: 'Guayaquil' },
    { id: 'Cuenca', name: 'Cuenca' }
  ];

  // Filters logic
  const filteredDoctors = doctors.filter(doc => {
    // Search Term match
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.education.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Specialty match
    let matchesSpecialty = true;
    if (selectedSpecialty !== 'all') {
      const activeObj = specialties.find(s => s.id === selectedSpecialty);
      if (activeObj) {
        matchesSpecialty = doc.specialty.toLowerCase().includes(activeObj.name.substring(0, 8).toLowerCase());
      }
    }

    // City match
    let matchesCity = true;
    if (selectedCity !== 'all') {
      matchesCity = doc.city === selectedCity;
    }

    return matchesSearch && matchesSpecialty && matchesCity;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingData.patientName.trim() && bookingData.patientId.trim() && bookingData.patientPhone.trim() && selectedDoctor) {
      addAppointment({
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        patientName: bookingData.patientName,
        patientId: bookingData.patientId,
        patientPhone: bookingData.patientPhone,
        aptDate: bookingData.aptDate,
        aptTime: bookingData.aptTime,
        modality: bookingData.modality as 'presencial' | 'telemedicina',
        clinic: selectedDoctor.clinic,
        city: selectedDoctor.city,
        cost: selectedDoctor.cost,
        status: 'Pendiente'
      });
      setBookingSuccess(true);
    } else {
      alert('Por favor complete todos los datos del paciente titular.');
    }
  };


  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setBookingStep(1);
    setBookingSuccess(false);
    setBookingData({
      patientName: '',
      patientId: '',
      patientPhone: '',
      aptDate: '2026-05-25',
      aptTime: '09:00',
      modality: 'presencial'
    });
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedical-directorio-view">
      
      {/* 1. HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Red de Especialistas</span>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Directorio Médico y Clínicas de Convenio
        </h1>
        <p className="text-slate-600">
          Usa los filtros avanzados para buscar médicos por especialidad, ciudad o clínica afiliada. Agenda de forma inmediata una videoconsulta o cita presencial con cobertura directa Colmedical.
        </p>
      </div>

      {/* 2. ADVANCED FILTER BOARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-5xl mx-auto">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-normal">Filtros de búsqueda médica</span>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Key Term search */}
          <div className="md:col-span-5 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por nombre del médico, clínica, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-350 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400 font-medium"
              id="doc-keyword-search"
            />
          </div>

          {/* Specialty selector */}
          <div className="md:col-span-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-350 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              id="doc-specialty-select"
            >
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>
          </div>

          {/* City selector */}
          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-350 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
              id="doc-city-select"
            >
              {cities.map(ct => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. DOCTORS GRID LEDGER */}
      <section className="space-y-6">
        <div className="flex justify-between items-center max-w-5xl mx-auto border-b border-slate-200 pb-4">
          <span className="text-xs font-bold text-slate-500">
            {filteredDoctors.length} Especialistas médicos coinciden con tu criterio
          </span>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('all');
              setSelectedCity('all');
            }} 
            className="text-[11px] font-mono font-bold text-teal-650 hover:underline cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                id={`doctor-card-${doc.id}`}
              >
                <div className="flex gap-4 items-start sm:items-center">
                  <img 
                    src={doc.image} 
                    alt={doc.name} 
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {doc.specialty}
                      </span>
                      <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                        {doc.city}
                      </span>
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{doc.clinic}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 text-slate-600">
                    <p className="flex items-center gap-1 text-[11px]">
                      <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]" title={doc.education}>{doc.education}</span>
                    </p>
                    <p className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{doc.availability}</span>
                    </p>
                  </div>

                  <div className="space-y-1.5 text-right flex flex-col items-start sm:items-end justify-center">
                    <div className="text-[10px] text-slate-400 font-medium">Cons. Copago Estimado:</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      ${(doc.cost * 0.15).toFixed(2)} 
                      <span className="text-[10px] text-slate-400 font-normal ml-1">(Plan Integral - 85%)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <a 
                    href={`tel:${doc.phone}`}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs text-center flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Llamar Directo</span>
                  </a>
                  <button
                    onClick={() => handleOpenBooking(doc)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Consulta</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
            <Stethoscope className="w-12 h-12 text-slate-350 mx-auto" strokeWidth={1.5} />
            <h4 className="text-sm font-bold text-slate-700">No encontramos ningún médico</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
              Prueba modificando los filtros a "Todas las Especialidades" o ingresando términos de búsqueda generales como "San Francisco" o "Hospital".
            </p>
          </div>
        )}
      </section>

      {/* 4. MODAL DETAILED BOOKING ENGINE (MOCKUP IN-PAGE OVERLAY) */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center relative">
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-6 h-6 text-teal-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white">Agendamiento de Citas</h3>
                  <span className="text-[10px] text-teal-300 font-mono">Oficina Virtual Colmedical</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {!bookingSuccess ? (
                /* STEP FORM */
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  
                  {/* Doctor Info Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex gap-3.5 items-center">
                    <img 
                      src={selectedDoctor.image} 
                      alt="" 
                      className="w-11 h-11 rounded-xl object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[9px] font-bold text-teal-650 bg-teal-50 px-2 py-0.2 rounded uppercase">
                        {selectedDoctor.specialty}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{selectedDoctor.name}</h4>
                      <p className="text-[10px] text-slate-500">{selectedDoctor.clinic} ({selectedDoctor.city})</p>
                    </div>
                  </div>

                  {/* Booking Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Date */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Fecha de Consulta:</label>
                        <input 
                          type="date"
                          value={bookingData.aptDate}
                          onChange={(e) => setBookingData({...bookingData, aptDate: e.target.value})}
                          min="2026-05-25"
                          max="2026-06-15"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>

                      {/* Time */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-700">Hora Preferida:</label>
                        <select 
                          value={bookingData.aptTime}
                          onChange={(e) => setBookingData({...bookingData, aptTime: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="08:00">08:00 AM</option>
                          <option value="09:00">09:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="15:00">03:00 PM</option>
                          <option value="16:00">04:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Modality Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-slate-700">Modalidad de Atención:</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setBookingData({...bookingData, modality: 'presencial'})}
                          className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            bookingData.modality === 'presencial'
                              ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 font-bold'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px]">Cita Presencial</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBookingData({...bookingData, modality: 'telemedicina'})}
                          className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                            bookingData.modality === 'telemedicina'
                              ? 'border-indigo-600 bg-indigo-50/20 text-indigo-950 font-bold'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <Video className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px]">Telemedicina Express</span>
                        </button>
                      </div>
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identidad del Paciente Asegurado:</span>
                      
                      <div className="space-y-2">
                        <input 
                          type="text"
                          required
                          placeholder="Nombre Completo del Paciente Titular"
                          value={bookingData.patientName}
                          onChange={(e) => setBookingData({...bookingData, patientName: e.target.value})}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-500"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            type="text"
                            required
                            placeholder="Cédula / Documento de Afiliado"
                            value={bookingData.patientId}
                            onChange={(e) => setBookingData({...bookingData, patientId: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                          <input 
                            type="tel"
                            required
                            placeholder="Teléfono Celular"
                            value={bookingData.patientPhone}
                            onChange={(e) => setBookingData({...bookingData, patientPhone: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Action CTAs */}
                  <button
                    type="submit"
                    className="w-full py-3.5 text-center bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Confirmar Agenda Médica en Línea
                  </button>
                </form>
              ) : (
                /* SUCCESS PANEL AND VOUCHER */
                <div className="space-y-6 text-center py-6" id="booking-success-report">
                  <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">¡Cita Médica Agendada Satisfactoriamente!</h4>
                    <p className="text-xs text-slate-500">Hemos procesado tu reserva con cobertura directa Colmedical.</p>
                  </div>

                  {/* Medical Voucher Card Details */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 text-left p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        CÓDIGO: RES-{(100000 + Math.random() * 900000).toFixed(0)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">Generado el 22/05/2026</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Médico Tratante:</span>
                        <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
                        <span className="text-[10px] text-slate-500 block">{selectedDoctor.specialty}</span>
                      </div>
                      
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Pacientes:</span>
                        <span className="font-bold text-slate-900">{bookingData.patientName}</span>
                        <span className="text-[10px] text-slate-500 block">ID: {bookingData.patientId}</span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Fecha y Hora:</span>
                        <span className="font-semibold text-slate-800">{bookingData.aptDate} / {bookingData.aptTime}</span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">Sede de Convenio:</span>
                        <span className="font-semibold text-slate-800">
                          {bookingData.modality === 'presencial' ? selectedDoctor.clinic : 'Sala de Telemedicina Express'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 bg-white p-3 rounded-lg border border-slate-150">
                      <p className="text-[10px] text-slate-500 leading-normal">
                        💡 <strong>Instrucciones:</strong> {bookingData.modality === 'presencial' 
                          ? `Asiste 15 minutos antes a ${selectedDoctor.clinic} con tu carné digital o cédula. Abona el copago preferencial de $${(selectedDoctor.cost * 0.15).toFixed(2)}.` 
                          : `Recibirás un SMS y un correo electrónico con el link de la consulta privada virtual un par de horas antes de la cita.`}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cerrar Ventana de Confirmación
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
