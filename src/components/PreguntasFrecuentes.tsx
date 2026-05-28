import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  FileText, 
  Sparkles,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { Page } from '../types';

interface PreguntasFrecuentesProps {
  setCurrentPage: (page: Page) => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: any;
  items: FAQItem[];
}

export default function PreguntasFrecuentes({ setCurrentPage }: PreguntasFrecuentesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('carencias');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const categories: FAQCategory[] = [
    {
      id: 'carencias',
      name: 'Coberturas, Carencias y Emergencias Médicas',
      icon: Clock,
      items: [
        {
          question: '1. ¿Qué es el período de carencia y a partir de qué momento puedo hacer uso efectivo de mi plan?',
          answer: 'El período de carencia es el lapso de tiempo obligatorio, continuo e improrrogable que transcurre desde la firma de su contrato o la inclusión del beneficiario, durante el cual no se activan las coberturas programadas. Conforme al Acuerdo Ministerial No. 0068-2017 de la Autoridad Sanitaria Nacional y los reglamentos del plan, los plazos aplicables son:\n• Emergencia Médica y Accidentes: 24 horas\n• Atención Ambulatoria y Dental: 30 días calendario\n• Maternidad (Bono y Embarazo): 60 a 90 días calendario\n• Atención Hospitalaria y Quirúrgica: 90 días calendario\n• Enfermedades Crónicas y Catastróficas: 90 días calendario\n• Enfermedades Preexistentes Declaradas: 730 días (24 meses)'
        },
        {
          question: '2. ¿Cómo se diferencia operativamente una emergencia de una urgencia médica y cómo debo proceder en cada caso?',
          answer: 'La distinción radica en la inminencia del riesgo vital:\n\n• Emergencia Médica: Toda condición repentina, aguda e imprevista con inminente peligro de vida o viabilidad de un órgano. El beneficiario puede acudir directamente a la red sin necesidad de preautorización, y no se pueden exigir pagarés para emergencias justificadas.\n• Urgencia Médica: Situación repentina que requiere asistencia médica, pero sin riesgo de muerte inminente. Es mandatorio comunicarse previamente con el call center para la asignación y preautorización de la consulta externa.'
        },
        {
          question: '3. ¿Cómo aplica la cobertura de ambulancia terrestre por accidente y qué limitaciones tiene?',
          answer: 'El traslado en ambulancia terrestre cuenta con cobertura al 100% (copago del 0%) hasta un monto máximo de USD 200.00 por evento, siempre que se trate de un accidente debidamente comprobado y el beneficiario se encuentre en condición crítica que exija su traslado hacia un hospital de la red. El medio de transporte debe estar debidamente equipado.'
        }
      ]
    },
    {
      id: 'preexistencias',
      name: 'Preexistencias, Límites de Edad y Transición',
      icon: ShieldCheck,
      items: [
        {
          question: '4. ¿Tienen cobertura las enfermedades preexistentes y qué ocurre si omito declarar una patología?',
          answer: '• Preexistencias Declaradas: Cualquier patología detallada de forma exhaustiva tendrá cobertura obligatoria a partir del mes 25 de vigencia consecutiva del plan, hasta el límite anual contratado.\n• Preexistencias No Declaradas: Cualquier condición omitida o falseada al momento de suscripción se considera no declarada y queda permanentemente excluida de todo financiamiento, reembolso o servicio.'
        },
        {
          question: '5. ¿Qué ocurre con mis coberturas al cumplir los 65 años de edad?',
          answer: 'Al cumplir los 65 años, la Ley Orgánica (LOPAM) estipula una cláusula de transición automática y preferencial hacia el "Plan Colmedikal Sénior 65+". Esto garantiza la continuidad de su cobertura médica, respetando la antigüedad en la compañía y eximiéndolo de nuevos períodos de carencia, aplicando la tarifa técnica aprobada por la SCVS para dicho segmento.'
        }
      ]
    },
    {
      id: 'pagos',
      name: 'Gestión Comercial, Mora y Siniestralidad Colectiva',
      icon: DollarSign,
      items: [
        {
          question: '6. ¿Qué ocurre si me atraso en el pago de mi cuota mensual y de cuánto tiempo dispongo antes de perder la cobertura?',
          answer: '• A los 31 días de mora: Suspensión automática de coberturas programadas. Únicamente se mantiene activa la atención de emergencia obligatoria.\n• A los 91 días de mora consecutiva: Solución del contrato de pleno derecho (cancelado automáticamente) y cobro legal de cuotas impagas.'
        },
        {
          question: '7. ¿Cómo se determinan los ajustes en las cuotas mensuales de mi plan?',
          answer: 'Colmedikal S.A. tiene prohibido hacer incrementos unilaterales por siniestralidad personal, edad sobrevenida o enfermedades catastróficas. La revisión de precios se realiza anualmente sobre la siniestralidad colectiva acumulada de la cartera del plan, utilizando estudios actuariales aprobados previamente por la SCVS.'
        },
        {
          question: '8. ¿Qué es una "Atención Masiva" y qué implicaciones tiene en mis beneficios especiales?',
          answer: 'Se considera atención masiva a las prestaciones otorgadas a más del 20% de los afiliados de un contrato masivo, en un período de 15 días consecutivos y por un mismo prestador de la red adscrita. En este caso se excluyen ciertos beneficios (adquisición de zapatos ortopédicos, plantillas) para preservar reservas técnicas de riesgo de la compañía.'
        }
      ]
    }
  ];

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Filter based on search input
  const allMatchedItems: { categoryName: string; item: FAQItem; catId: string }[] = [];
  categories.forEach(cat => {
    cat.items.forEach(item => {
      if (
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        allMatchedItems.push({
          categoryName: cat.name,
          item: item,
          catId: cat.id
        });
      }
    });
  });

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="colmedical-faq-view">
      
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Glosario y Preguntas</span>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Preguntas Frecuentes y Dudas del Afiliado
        </h1>
        <p className="text-slate-600">
          Encuentra aclaraciones directas, sencillas y transparentes sobre el funcionamiento de tu plan, periodos de carencia, copagos, reembolsos y exclusiones médicas.
        </p>
      </div>

      {/* SEARCH AND MAIN ACTIONS */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="¿Qué duda tienes? Ej. preexistencias, copago, reembolso, maternidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder:text-slate-400 shadow-sm"
            id="faq-search-input"
          />
        </div>
      </div>

      {searchTerm.trim() === '' ? (
        /* STANDARD SECTION VIEW BY CATEGORY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Categories Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-3">Categorías de dudas</span>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setExpandedIndex(0);
                  }}
                  className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-left text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/15'
                      : 'bg-white text-slate-700 border-slate-150 hover:bg-slate-50'
                  }`}
                  id={`cat-btn-${cat.id}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List Content */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-250 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <HelpCircle className="w-5.5 h-5.5 text-teal-600" />
              <span>{categories.find(c => c.id === activeCategory)?.name}</span>
            </h3>

            <div className="divide-y divide-slate-100">
              {categories.find(c => c.id === activeCategory)?.items.map((item, idx) => {
                const isOpen = expandedIndex === idx;
                return (
                  <div key={idx} className="py-4.5 first:pt-2 last:pb-2">
                    <button
                      onClick={() => handleToggle(idx)}
                      className="w-full flex justify-between items-center text-left gap-4 group cursor-pointer"
                      id={`faq-btn-${activeCategory}-${idx}`}
                    >
                      <span className="text-sm font-bold text-slate-850 group-hover:text-teal-600 transition-colors leading-snug">
                        {item.question}
                      </span>
                      <div className={`p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors shrink-0`}>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-1">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* SEARCH RESULTS VIEW */
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-semibold text-slate-400 block font-mono">
            Se encontraron {allMatchedItems.length} resultados relacionados con "{searchTerm}"
          </span>

          {allMatchedItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {allMatchedItems.map(({ categoryName, item, catId }, idx) => (
                <div key={idx} className="py-5 first:pt-2 last:pb-2 space-y-2">
                  <span className="inline-block bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {categoryName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.question}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/40 p-3 rounded-lg border border-slate-100">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-350 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No encontramos respuestas para "{searchTerm}"</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-normal">
                Prueba buscando términos simplificados como "preexistencias", "copagos", "ingresar" o "maternidad". También puedes escribirnos de forma directa en Asistencia.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-teal-600 hover:underline pt-2 cursor-pointer"
              >
                Limpiar campo de búsqueda
              </button>
            </div>
          )}
        </div>
      )}

      {/* ADDITIONAL CTAS FOR SUPPORT */}
      <section className="bg-slate-900 rounded-3xl p-8 text-white text-center max-w-4xl mx-auto relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-teal-500/5 blur-3xl"></div>
        <div className="relative z-10 space-y-4 max-w-xl mx-auto">
          <Sparkles className="w-8 h-8 text-teal-400 mx-auto animate-pulse" />
          <h4 className="text-xl font-bold font-display">¿Aún tienes dudas técnicas del plan?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nuestros asesores clínicos poseen entrenamiento para responder inquietudes de copagos, preexistencias declaradas o límites de hospitalización nacional o internacional de inmediato.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setCurrentPage('contacto')}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Contactar un Asesor Humano
            </button>
            <button
              onClick={() => setCurrentPage('cotizador')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-teal-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ir al Cotizador Virtual</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
