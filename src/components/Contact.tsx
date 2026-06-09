import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar,
  Share2
} from 'lucide-react';
import { Page } from '../types';

interface ContactProps {
  setCurrentPage: (page: Page) => void;
}

export default function Contact({ setCurrentPage }: ContactProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: 'Quito',
    topic: 'Información de Planes',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const officeLocations = [
    {
      city: 'Sede Principal - Quito',
      address: 'Av. República E6-447 Y Eloy Alfaro Ed. Castillo Sánchez',
      phones: '02-2567191 (WhatsApp: 098 702 8756)',
      email: 'info@colmedikal.com'
    }
  ];

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'El nombre completo es requerido';
    if (!formData.email.trim()) {
      tempErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'El correo electrónico no es válido';
    }
    if (!formData.phone.trim()) {
      tempErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{7,10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      tempErrors.phone = 'Ingrese un número válido de 7 a 10 dígitos';
    }
    if (!formData.message.trim()) tempErrors.message = 'Escriba brevemente su consulta';
    if (!privacyAccepted) tempErrors.privacy = 'Debe aceptar las políticas de protección de datos';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Simulate ticket generation with random index
      const randomTickets = Math.floor(100000 + Math.random() * 900000);
      setTicketId(`CLM-${randomTickets}`);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      city: 'Quito',
      topic: 'Información de Planes',
      message: ''
    });
    setErrors({});
    setIsSubmitted(false);
    setTicketId('');
  };

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedikal-contact-view">
      
      {/* 1. HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Contacto y Asistencia</span>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Estamos aquí para escucharte y asesorarte
        </h1>
        <p className="text-slate-600">
          ¿Tienes inquietudes sobre nuestras coberturas, deseas afiliarte o necesitas agendar orientación médica? Escríbenos o comunícate directamente con nuestros asesores en red.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* 2. CHANNELS INFORMATION BLOCK (5 cols) */}
        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-bold text-slate-900">
              Canales Directos 24/7
            </h3>
            <p className="text-sm text-slate-600">
              Garantizamos respuestas humanas y directas a través de nuestros canales de asistencia telefónica y digital.
            </p>

            <div className="space-y-5">
              
              <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Centro de Asistencia</span>
                  <a href="tel:022567191" className="block text-base font-bold text-slate-900 font-mono hover:text-teal-600 transition-colors">
                    02-2567191
                  </a>
                  <span className="text-[11px] text-slate-500">Asistencia telefónica y soporte nacional</span>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">💬</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">WhatsApp Citas</span>
                  <a href="https://wa.me/593987028756" target="_blank" rel="noreferrer" className="block text-base font-bold text-slate-900 font-mono hover:text-emerald-650 transition-colors">
                    098 702 8756
                  </a>
                  <span className="text-[11px] text-slate-500">Reserva de citas médicas y consultas</span>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Correo Corporativo</span>
                  <a href="mailto:info@colmedikal.com" className="block text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    info@colmedikal.com
                  </a>
                  <span className="text-[11px] text-slate-500">Respuestas en menos de 2 horas hábiles</span>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Horarios Clínicos</span>
                  <p className="text-xs font-bold text-slate-900">
                    Emergencias: 24 horas continuo
                  </p>
                  <p className="text-[11px] text-slate-500">Horario de atención: Lunes a Viernes de 08:30 - 18:30</p>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
            <MessageSquare className="w-10 h-10 text-indigo-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-indigo-950">¿Necesitas un precio formal?</h4>
              <p className="text-[11px] text-indigo-700 leading-normal mt-0.5">
                Utiliza nuestro <button onClick={() => setCurrentPage('cotizador')} className="underline font-bold text-indigo-900 cursor-pointer">cotizador de planes en tiempo real</button> para obtener una simulación de tarifas de inmediato.
              </p>
            </div>
          </div>
        </div>

        {/* 3. CONTACT FORM ENGINE (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          
          {isSubmitted ? (
            <div className="text-center py-12 space-y-6 max-w-md mx-auto" id="contact-success-card">
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-950">¡Mensaje Enviado con Éxito!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gracias por comunicarte con Colmedikal. Hemos registrado tu solicitud bajo el código de atención:
                </p>
                <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-mono font-bold text-slate-800 tracking-wide border border-slate-200 w-fit mx-auto">
                  {ticketId}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Un asesor especialista de servicio al cliente se comunicará contigo vía llamada telefónica o correo electrónico en las próximas 2 horas hábiles.
              </p>
              <div className="pt-4 flex gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Nuevo mensaje
                </button>
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-6 py-2.5 bg-teal-500 text-white hover:bg-teal-600 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" id="contact-form-submit">
              <div>
                <h3 className="text-xl font-bold text-slate-950 mb-1">Envíanos un Mensaje</h3>
                <p className="text-xs text-slate-400">Te responderemos a la brevedad posible.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Nombre Completo *</label>
                  <input 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className={`w-full px-4.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.fullName ? 'border-red-500' : 'border-slate-300'}`}
                    id="contact-name"
                  />
                  {errors.fullName && <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.fullName}</span>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Correo Electrónico *</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="ejemplo@correo.com"
                    className={`w-full px-4.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                    id="contact-email"
                  />
                  {errors.email && <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Teléfono Móvil o Celular *</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Ej. 0999999999 o 023334444"
                    className={`w-full px-4.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
                    id="contact-phone"
                  />
                  {errors.phone && <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.phone}</span>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Ciudad de Residencia</label>
                  <select 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="contact-city"
                  >
                    <option value="Quito">Quito</option>
                    <option value="Guayaquil">Guayaquil</option>
                    <option value="Cuenca">Cuenca</option>
                    <option value="Manta">Manta</option>
                    <option value="Loja">Loja</option>
                    <option value="Santo Domingo">Santo Domingo</option>
                    <option value="Otras">Otros municipios / Cobertura Nacional</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Asunto del Mensaje</label>
                <select 
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  id="contact-topic"
                >
                  <option value="Información de Planes">Quiero información para afiliarme a planes de salud</option>
                  <option value=" Planes Corporativos Colectivos">Planes gubernamentales o para colaboradores pymes</option>
                  <option value="Servicio al Afiliado Reclamos">Servicio al afiliado / Autorizaciones pendientes</option>
                  <option value="Proveedor de Salud Medico">Deseo ser proveedor de salud en red</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Cuéntanos tu consulta *</label>
                <textarea 
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Por favor, describe detalladamente tu consulta..."
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none ${errors.message ? 'border-red-500' : 'border-slate-300'}`}
                  id="contact-message"
                />
                {errors.message && <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.message}</span>}
              </div>

              <div className="pt-2 pb-1 text-left">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-slate-500 leading-tight">
                    Acepto las políticas de protección de datos personales.
                  </span>
                </label>
                {errors.privacy && <span className="text-[11px] text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.privacy}</span>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-teal-500/10 hover:shadow-teal-500/25 transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
                  id="btn-contact-submit"
                >
                  <span>Enviar Mensaje de Soporte</span>
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>

              <span className="block text-[10px] text-center text-slate-400">
                Al enviar autorizas el uso de tus datos exclusivamente para responder y brindarte asesoramiento médico por Colmedikal S.A.
              </span>
            </form>
          )}

        </div>

      </div>

      {/* 4. PHYSICAL OFFICES GRID SECTION */}
      <section className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200">
        <div className="max-w-2xl text-center md:text-left space-y-2 mb-8">
          <h3 className="text-xl font-bold font-display text-slate-900">Ubicación y Sede Principal</h3>
          <p className="text-xs text-slate-500">
            Visítanos en nuestra oficina central para atención comercial, trámites corporativos y asesoramiento personalizado.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Office Card info */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-150 space-y-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-teal-650 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full w-fit block tracking-wider uppercase">
                {officeLocations[0].city}
              </span>
              <h4 className="text-lg font-black text-slate-900">Edificio Sede Central</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nuestras modernas instalaciones cuentan con personal calificado, salas de reuniones corporativas y atención directa para todos nuestros afiliados.
              </p>
            </div>
            
            <div className="space-y-4 text-xs text-slate-650 leading-normal border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-800">Dirección</span>
                  <span>{officeLocations[0].address}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-800">Teléfono Regional</span>
                  <span className="font-mono">{officeLocations[0].phones}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-slate-800">Canal Comercial</span>
                  <span>{officeLocations[0].email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Embedded Interactive Map */}
          <div className="lg:col-span-7 bg-white p-3 rounded-2xl border border-slate-150 shadow-sm overflow-hidden min-h-[350px] flex flex-col gap-2">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-78.4932409%2C-0.1963199%2C-78.4832409%2C-0.1863199&layer=mapnik&marker=-0.1913199%2C-78.4882409"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              className="w-full flex-1 min-h-[310px] rounded-xl border-0"
              title="Mapa de Ubicación de Colmedikal Sede Principal"
            ></iframe>
            <a
              href="https://www.openstreetmap.org/?mlat=-0.1913&mlon=-78.4882#map=16/-0.1913/-78.4882"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-center text-slate-400 hover:text-teal-500 transition-colors pb-1"
            >
              Ver en mapa completo →
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
