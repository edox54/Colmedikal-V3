// Public "Trámites en línea" page. Requests are now filed from the client
// portal (Mi Colmedikal), where the affiliate is authenticated and documents
// are stored privately — this page explains the process and hands out the
// official blank forms for the doctor.
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, DollarSign, Download, FileCheck, MessageCircle } from 'lucide-react';
import { Page } from '../types';
import { BLANK_FORM_URL, CLAIM_LABEL, FILE_KINDS, type ClaimType } from '../data/claims';

interface TramitesOnlineProps {
  setCurrentPage: (page: Page) => void;
}

const INTRO: Record<ClaimType, string> = {
  reembolso: 'Recupera lo que pagaste en consultas, medicinas y exámenes dentro de tu cobertura. Tienes hasta 90 días desde la fecha del gasto.',
  preautorizacion: 'Autoriza tu cirugía u hospitalización programada. Preséntala al menos 72 horas antes del ingreso.',
};

export default function TramitesOnline({ setCurrentPage }: TramitesOnlineProps) {
  const navigate = useNavigate();
  const goPortal = () => navigate('/mi-colmedikal');
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16" id="tramites-online-content">
      <div className="flex flex-col items-start justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-center">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#4597CA]">Trámites en línea</span>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0C4169]">Reembolsos y preautorizaciones</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Todo el trámite se hace desde <b>Mi Colmedikal</b>: llenas el formulario, subes tus documentos y sigues el estado de tu solicitud hasta su aprobación.
          </p>
        </div>
        <button onClick={() => setCurrentPage('home')} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4 text-[#4597CA]" />Volver al inicio
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(['reembolso', 'preautorizacion'] as ClaimType[]).map(t => (
          <section key={t} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${t === 'reembolso' ? 'bg-sky-50 text-[#4597CA]' : 'bg-teal-50 text-teal-600'}`}>
              {t === 'reembolso' ? <DollarSign className="h-5 w-5" /> : <FileCheck className="h-5 w-5" />}
            </div>
            <h2 className="mt-3 text-lg font-extrabold text-[#0C4169]">{CLAIM_LABEL[t]}</h2>
            <p className="mt-1 text-xs text-slate-500">{INTRO[t]}</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Qué necesitas</p>
            <ul className="mt-2 flex-1 space-y-1.5">
              {FILE_KINDS[t].filter(k => k.kind !== 'otro').map(k => (
                <li key={k.kind} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${k.required ? 'text-teal-600' : 'text-slate-300'}`} />
                  <span>{k.label}{!k.required && <span className="text-slate-400"> (si aplica)</span>}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={BLANK_FORM_URL[t]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-[#0C4169] hover:bg-slate-50">
                <Download className="h-3.5 w-3.5" />Formulario para tu médico
              </a>
              <button onClick={goPortal} className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0C4169] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900">
                Solicitar en Mi Colmedikal<ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>
        ))}
      </div>

      <ol className="grid gap-4 rounded-3xl bg-slate-50 p-6 sm:grid-cols-4">
        {[
          ['Descarga el formulario', 'y pide a tu médico que llene y firme su sección.'],
          ['Ingresa a Mi Colmedikal', 'con tu cédula y contraseña.'],
          ['Llena y sube tus documentos', 'fotos nítidas o PDF de facturas, informes y exámenes.'],
          ['Sigue tu solicitud', 'te avisamos por correo cada cambio de estado.'],
        ].map(([t, d], i) => (
          <li key={t} className="text-xs text-slate-600"><span className="mb-1 grid h-7 w-7 place-items-center rounded-full bg-[#0C4169] text-xs font-black text-white">{i + 1}</span><b className="block text-slate-800">{t}</b>{d}</li>
        ))}
      </ol>

      <p className="text-center text-xs text-slate-500">
        ¿Aún no tienes acceso a Mi Colmedikal?{' '}
        <a href="https://wa.me/593987028756?text=Hola%2C%20necesito%20acceso%20a%20Mi%20Colmedikal" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-teal-700 hover:underline"><MessageCircle className="h-3.5 w-3.5" />Escríbenos por WhatsApp</a>
      </p>
    </div>
  );
}
