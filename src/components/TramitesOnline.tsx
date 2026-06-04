import React, { useState, useRef } from 'react';
import { 
  FileText, 
  DollarSign, 
  Upload, 
  CheckCircle, 
  FileCheck, 
  Send, 
  Eye, 
  File, 
  MapPin, 
  Phone, 
  ArrowLeft,
  Mail,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Page } from '../types';

interface TramitesOnlineProps {
  setCurrentPage: (page: Page) => void;
}

export default function TramitesOnline({ setCurrentPage }: TramitesOnlineProps) {
  const [activeForm, setActiveForm] = useState<'reembolso' | 'autorizacion'>('reembolso');
  
  // SHARED MANDATORY FIELDS
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // SPECIFIC FIELDS
  // Reimbursement
  const [reimbursementType, setReimbursementType] = useState('consulta'); // consulta, farmacia, laboratorio
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  // Authorization
  const [medicalSpec, setMedicalSpec] = useState('Cardiología');
  const [medicalFacility, setMedicalFacility] = useState('Hospital Metropolitano');
  const [authProcedure, setAuthProcedure] = useState('');
  
  // Upload States
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
  };

  const resetForm = () => {
    setFullName('');
    setCedula('');
    setPhone('');
    setEmail('');
    setInvoiceAmount('');
    setInvoiceNumber('');
    setAuthProcedure('');
    setAttachedFile(null);
    setAttachedFileName('');
    setSubmissionSuccess(false);
    setSubmittedData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attachedFileName) {
      alert('Por favor adjunte el documento requerido.');
      return;
    }

    setIsSubmitting(true);

    // Simulate sending data and triggering notifications
    setTimeout(() => {
      const data = {
        id: 'TKT-' + Math.floor(Math.random() * 900000 + 100000),
        timestamp: new Date().toLocaleString(),
        type: activeForm === 'reembolso' ? 'Solicitud de Reembolso' : 'Solicitud de Autorización de Examen',
        fullName,
        cedula,
        phone,
        email,
        fileName: attachedFileName,
        specifics: activeForm === 'reembolso' ? {
          tipo: reimbursementType,
          monto: invoiceAmount,
          factura: invoiceNumber
        } : {
          especialidad: medicalSpec,
          clinica: medicalFacility,
          procedimiento: authProcedure
        },
        executiveAssigned: 'Lcda. Mercedes Guarderas (Auditoría Médica)',
        corpEmailTarget: 'reembolsos.autorizaciones@colmedikal.ec',
        corpWhatsappTarget: '+593 98 445 2211'
      };

      setSubmittedData(data);
      setIsSubmitting(false);
      setSubmissionSuccess(true);
    }, 1800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12" id="tramites-online-content">
      {/* Header section with illustrative presentation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <span className="text-xs font-bold text-[#4597CA] uppercase tracking-widest font-mono">Trámites y Gestiones en Línea</span>
          <h1 className="text-3xl font-extrabold text-[#0C4169] tracking-tight mt-1">
            Gestión Documental de Excelencia
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Cargue de forma segura sus comprobantes para reembolsos médicos o cargue recetas y órdenes de examen para emitir sus autorizaciones en menos de 4 horas hábiles.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#4597CA]" />
          <span>Volver al Inicio</span>
        </button>
      </div>

      {simulationDisplay()}

      {/* Main Content Area */}
      {!submissionSuccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Instructions & Selection Tab */}
          <div className="lg:col-span-4 shrink-0 flex flex-col gap-5 justify-between">
            <div className="space-y-4">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paso 1: Selecciona el Trámite</span>
              
              <div className="flex flex-col gap-3">
                {/* Reembolso Selector */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveForm('reembolso');
                    resetForm();
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeForm === 'reembolso'
                      ? 'bg-gradient-to-br from-white to-[#4597CA]/5 border-[#4597CA] shadow-md ring-2 ring-[#4597CA]/10'
                      : 'bg-white border-slate-250 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${activeForm === 'reembolso' ? 'bg-[#4597CA] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#0C4169]">1. Solicitud de Reembolso</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Facturas particulares de consulta, odontología o farmacia.</p>
                    </div>
                  </div>
                </button>

                {/* Autorización Selector */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveForm('autorizacion');
                    resetForm();
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeForm === 'autorizacion'
                      ? 'bg-gradient-to-br from-white to-teal-50/5 border-teal-500 shadow-md ring-2 ring-teal-500/10'
                      : 'bg-white border-slate-250 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${activeForm === 'autorizacion' ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#0C4169]">2. Solicitud de Autorización</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Órdenes médicas para exámenes clínicos o intervenciones.</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Side Callout Box */}
            <div className="bg-slate-950 p-6 rounded-2xl text-white space-y-4">
              <div className="flex items-center gap-2 text-teal-400 bg-teal-950/50 border border-teal-900 px-2.5 py-1 rounded-lg w-fit text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Auditoría Segura</span>
              </div>
              <h4 className="text-xs font-extrabold text-white leading-snug">
                ¿Qué sucede tras subir la documentación?
              </h4>
              <p className="text-[11px] text-slate-300 leading-normal">
                Nuestros auditores médicos ingresan la solicitud al sistema. Se crea automáticamente un ticket de seguimiento que le llegará por SMS y correo electrónico, notificando la aprobación y depósito.
              </p>
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Tránsito Promedio:</span>
                <span className="text-teal-400 font-bold">2 - 4 Horas</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-205 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <span className="block text-xs font-bold text-[#4597CA] uppercase tracking-wider border-b border-slate-100 pb-2">
                📂 {activeForm === 'reembolso' ? 'Detalles de la Solicitud de Reembolso' : 'Detalles de la Autorización Médica'}
              </span>

              {/* 1. SECTOR DE DATOS COMPARTIDOS (MANDATORIOS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Nombre Completo: <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    placeholder="Ej. Juan Andrés Pérez Delgado"
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-55 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Número de Cédula: <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={cedula}
                    placeholder="Ej. 1729004812"
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-55 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Teléfono Celular: <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    placeholder="Ej. +593 99 444 1122"
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-55 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Correo Electrónico: <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={email}
                    placeholder="Ej. juan.perez@cuenta.com"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-55 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                  />
                </div>
              </div>

              {/* 2. SECTOR DE DATOS ESPECÍFICOS */}
              {activeForm === 'reembolso' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#4597CA]/5 p-5 rounded-2xl border border-[#4597CA]/10">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Tipo de Servicio:</label>
                    <select
                      value={reimbursementType}
                      onChange={(e) => setReimbursementType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
                    >
                      <option value="consulta">Consulta de Especialidad</option>
                      <option value="farmacia">Compra Farmacia en Convenio</option>
                      <option value="laboratorio">Exámenes de Laboratorio</option>
                      <option value="odontologia">Tratamiento Odontológico</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 font-sans">Nro Factura SRI:</label>
                    <input
                      type="text"
                      required
                      placeholder="001-002-00123"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Monto Facturado ($USD):</label>
                    <input
                      type="number"
                      required
                      placeholder="Ej. 125.00"
                      min="1"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none text-center"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-teal-50/40 p-5 rounded-2xl border border-teal-550/10">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Especialidad Médica:</label>
                    <select
                      value={medicalSpec}
                      onChange={(e) => setMedicalSpec(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      <option value="Cardiología">Cardiología</option>
                      <option value="Pediatría">Pediatría</option>
                      <option value="Ginecología">Ginecología / Obstetricia</option>
                      <option value="Imagen Diagnóstica">Imagenología (Ecos, RMN)</option>
                      <option value="Traumatología">Traumatología / Fisioterapia</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Centro Médico Destino:</label>
                    <select
                      value={medicalFacility}
                      onChange={(e) => setMedicalFacility(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    >
                      <option value="Hospital Metropolitano">Hospital Metropolitano (UIO)</option>
                      <option value="Hospital Vozandes">Hospital Vozandes (UIO)</option>
                      <option value="Clínica Kennedy">Clínica Kennedy (GYE)</option>
                      <option value="Clínica Santa Inés">Clínica Santa Inés (CUE)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Procedimiento Solicitado:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ecocardiograma, Resonancia..."
                      value={authProcedure}
                      onChange={(e) => setAuthProcedure(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 3. DOCUMENT CARRIER DRAG & DROP FOR ATTACHMENT */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  <span>Adjuntar Documento Comprobatorio: <span className="text-rose-500">*</span></span>
                  <span className="block text-[10px] text-slate-400 font-normal">
                    {activeForm === 'reembolso' 
                      ? '(Requisito de reembolso: Factura SRI legible, receta con diagnóstico)' 
                      : '(Solicitud de autorización: Orden médica firmada por el especialista de red)'}
                  </span>
                </label>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#4597CA] bg-[#4597CA]/5'
                      : attachedFileName
                      ? 'border-teal-500 bg-teal-500/5'
                      : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-[#4597CA]'
                  }`}
                  onClick={() => document.getElementById('document-file-picker')?.click()}
                >
                  <input
                    type="file"
                    id="document-file-picker"
                    className="hidden"
                    accept=".pdf, .png, .jpg, .jpeg"
                    onChange={handleFileChange}
                  />

                  {attachedFileName ? (
                    <div className="space-y-2">
                      <FileCheck className="w-10 h-10 text-teal-600 mx-auto" />
                      <div className="text-xs font-semibold text-slate-800">
                        {attachedFileName}
                      </div>
                      <span className="inline-block bg-teal-100 text-teal-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                        Archivo Cargado Exitosamente
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
                        Arrastre su comprobante aquí o haga clic para buscar
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Formatos soportados: PDF, JPG, PNG de hasta 5MB. Receta u orden deben ser legibles.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Required Terms */}
              <div className="bg-slate-50 p-4 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-150">
                Certifico bajo gravedad de juramento que la información y documentos adjuntados son auténticos y corresponden al expediente médico del asegurado. Autorizo el cruzamiento de datos de auditoría médica para verificar la cobertura establecida en el contrato de medicina prepagada.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-[#0C4169] bg-gradient-to-r from-[#4597CA] to-sky-300 border border-[#4597CA]/10 text-xs font-extrabold uppercase tracking-wider text-center text-white cursor-pointer shadow-md shadow-[#4597CA]/10 active:scale-98 hover:shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Cargando en Servidor Seguro y Registrando CRM...</span>
                  </span>
                ) : (
                  <span>Enviar Trámite Web de Forma Segura</span>
                )}
              </button>

            </form>
          </div>

        </div>
      ) : (
        /* CONFIRMATION STATE - HIGH FIDELITY SIMULATION OF CORRESPONDING CRM & WHATSAPP LOGGING */
        <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl font-bold shadow-lg shadow-teal-500/10">
              ✓
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                Radicación Exitosa
              </span>
              <h2 className="text-2xl font-extrabold text-[#0C4169] tracking-tight">{submittedData.type} Ingresada</h2>
              <p className="text-xs text-slate-500">
                Código del trámite en Colmedikal: <strong className="text-slate-800 font-mono font-bold leading-none">{submittedData.id}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              Muchas gracias, <strong>{submittedData.fullName}</strong>. Su trámite ha sido indexado y procesado satisfactoriamente por los coordinadores médicos. Un agente se comunicará a su celular <strong>{submittedData.phone}</strong> para finiquitar el desembolso.
            </p>

            <div className="pt-4 flex flex-wrap gap-3 justify-center">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Ingresar Otro Trámite
              </button>
              
              <button
                onClick={() => setCurrentPage('home')}
                className="px-5 py-2.5 bg-[#0C4169] text-white hover:bg-slate-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Regresar a la Página Principal
              </button>
            </div>
          </div>

          {/* CRM Notification and Whatsapp API Logs Simulation Card */}
          <div className="bg-slate-950 rounded-3xl text-slate-300 p-6 shadow-xl space-y-5 border border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-xs font-black tracking-widest text-[#4597CA] uppercase font-mono">
                  CRM WEBHOOK & AUTOMATION ENGINE STATUS
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                SIMULADOR AUTOMÁTICO EN LINEA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              {/* Box 1: Simulated Corporate Email dispatch */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3.5">
                <div className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-1.5">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>📧 Notificación de Correo Corporativo</span>
                </div>
                
                <div className="font-mono text-[10px] space-y-1 text-slate-300">
                  <p><span className="text-slate-500">De:</span> server.gateway@colmedikal.ec</p>
                  <p><span className="text-slate-500">Para:</span> {submittedData.corpEmailTarget}</p>
                  <p><span className="text-slate-500">Copia:</span> {submittedData.email}</p>
                  <p><span className="text-slate-500">Asunto:</span> [{submittedData.id}] Nuevo trámite de {submittedData.fullName}</p>
                </div>
                
                <div className="bg-slate-900 p-2.5 rounded text-[10px] block overflow-x-auto text-slate-400 font-mono leading-normal whitespace-pre-wrap border border-slate-800">
                  {`Se ha recibido una nueva solicitud de trámite desde la web oficial.
Auditores asignados debidamente.

Detalles:
- Asegurado: ${submittedData.fullName}
- Identificación: ${submittedData.cedula}
- Teléfono: ${submittedData.phone}
- Documento Adjunto: ${submittedData.fileName}
${activeForm === 'reembolso' ? `- Factura SRI: ${submittedData.specifics.factura}\n- Monto Reembolso: $${submittedData.specifics.monto} USD` : `- Examen: ${submittedData.specifics.procedimiento}\n- Convenio: ${submittedData.specifics.clinica}`}`}
                </div>
              </div>

              {/* Box 2: WhatsApp notification alert */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3.5">
                <div className="flex items-center gap-2 text-white font-bold border-b border-white/10 pb-1.5">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>💬 Notificación WhatsApp Business</span>
                </div>

                <div className="font-mono text-[10px] space-y-1 text-slate-300">
                  <p><span className="text-slate-500">API Endpoint:</span> gateway.whatsapp.com/v1/messages</p>
                  <p><span className="text-slate-500">Destinatario Empresarial:</span> {submittedData.corpWhatsappTarget}</p>
                  <p><span className="text-slate-500">Estado de Envíos:</span> <span className="text-emerald-400">Entregado/Leído ✓✓</span></p>
                </div>

                <div className="p-3 bg-slate-900 rounded border border-slate-800 font-sans text-[10.5px]">
                  <p className="font-bold text-slate-400">Mensaje enviado en plantilla homologada:</p>
                  <p className="text-white mt-1 italic leading-snug">
                    {`"¡Hola Colmedikal Operaciones! Se ha radicado un nuevo trámite web con código ${submittedData.id}. El cliente ${submittedData.fullName} con cédula ${submittedData.cedula} ha solicitado la gestión de su adjunto ${submittedData.fileName}. Por favor verificar y realizar la asignación de pagos."`}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-mono text-center">
              Lógica del CRM unificada: Oportunidad de cliente agilizada de forma inmediata y registrada en el pipeline general de la empresa.
            </p>
          </div>

        </div>
      )}

      {/* FAQs inline banner for trust context */}
      <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-xs font-bold text-slate-900">¿Tienes dudas adicionales sobre reembolsos y copagos?</h4>
          <p className="text-xs text-slate-500 mt-1">Conozca tiempos reglamentarios en el manual de coberturas.</p>
        </div>
        <button
          onClick={() => setCurrentPage('faqs')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Consultar Preguntas Frecuentes
        </button>
      </div>

    </div>
  );

  function simulationDisplay() {
    return null; // Inline template definition wrapper helper safely returning empty, keep code structure elegant or display subtle status
  }
}
