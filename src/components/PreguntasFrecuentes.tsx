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
      name: 'Periodos de Carencia',
      icon: Clock,
      items: [
        {
          question: '¿Qué es un periodo de carencia y cómo opera en Colmedical?',
          answer: 'Un periodo de carencia o tiempo de espera es el lapso de tiempo que transcurre entre el día de tu afiliación oficial y el día en que adquieres cobertura para ciertos servicios complejos de salud. Por ejemplo, urgencias médicas cuenta con cobertura inmediata (cero carencia), pero cirugías programadas complejas requieren un periodo de carencia estándar de 90 a 180 días.'
        },
        {
          question: '¿Existe algún servicio sin periodos de carencia?',
          answer: 'Sí. Las consultas médicas de medicina general, consultas de especialidad externa, odontología preventiva, telemedicina inmediata y urgencias vitales (situación imprevisible con riesgo de muerte inmediato) cuentan con un periodo de carencia de 0 días. Puedes usarlas desde el primer día útil de vigencia del contrato médico.'
        },
        {
          question: '¿Se pueden eliminar los periodos de carencia al cambiarme de seguro?',
          answer: 'Sí, llamamos a esto "Reconocimiento de Antigüedad". Si provienes de otra compañía de medicina prepagada certificada del país, y no ha transcurrido más de 30 días de la baja de tu póliza anterior, nuestro departamento técnico puede homologar o reducir tus periodos de carencia tras una evaluación de tu Declaración Jurada de Salud.'
        }
      ]
    },
    {
      id: 'preexistencias',
      name: 'Enfermedades Preexistentes',
      icon: ShieldCheck,
      items: [
        {
          question: '¿Qué se considera una Enfermedad Preexistente?',
          answer: 'Se considera preexistencia a cualquier patología, enfermedad, afección o condición clínica diagnosticada por un médico competente previo a la firma del contrato de medicina prepagada, o que haya manifestado signos y síntomas evidentes por los cuales el afiliado razonablemente debía tener conocimiento.'
        },
        {
          question: '¿Colmedical cubre enfermedades preexistentes?',
          answer: 'Sí, de acuerdo con la Ley de Medicina Prepagada de Ecuador y las normas de seguros andinas, las enfermedades preexistentes cuentan con un tratamiento especial. Cuentan con un periodo de carencia legal de hasta 24 meses y una cobertura máxima preestablecida (ej. plan estándar cubre preexistencias con un límite de hasta 20 salarios básicos unificados).'
        },
        {
          question: '¿Qué sucede si omito declarar una patología en la afiliación?',
          answer: 'Omitir dolosamente una preexistencia se considera "reticencia" y puede ser causa de la pérdida del derecho a la cobertura para esa patología específica o de la rescisión total del contrato. Recomendamos declarar con total transparencia para estructurar una cobertura adecuada.'
        }
      ]
    },
    {
      id: 'pagos',
      name: 'Copagos y Reembolsos',
      icon: DollarSign,
      items: [
        {
          question: '¿Qué es el Copago o Bono Fijo y cuánto debo abonar?',
          answer: 'El copago es el valor económico fijo o porcentual que realizas en la ventanilla de la clínica de convenio al momento de tu consulta médica. En nuestro Plan Elite el copago es de solo el 10% (abonando entre $5 y $12 dependiendo del especialista). Si te atiendes por fuera de nuestra red de convenio, no abonas copago, sino que solicitas Reembolso de Honorarios.'
        },
        {
          question: '¿Cómo tramito un reembolso de consulta externa?',
          answer: 'Es 100% digital. Inicia sesión en nuestro "Portal del Afiliado" (Oficina Virtual), ve a la sección Reembolsos, llena los datos de la factura comercial autorizada por el SRI, adjunta fotos de la factura y de la orden médica, y listo. Se te depositará el beneficio (85% a 90% del honorario pactado) en un lapso récord de 48 horas hábiles.'
        },
        {
          question: '¿Cuánto tiempo tengo para ingresar una factura para reembolso?',
          answer: 'Tienes un periodo máximo de 90 días calendario a partir de la fecha de atención y emisión de la factura de servicio para ingresarla formalmente a nuestro departamento de auditoría médica.'
        }
      ]
    },
    {
      id: 'cobertura',
      name: 'Servicios y Maternidad',
      icon: FileText,
      items: [
        {
          question: '¿Cómo opera la cobertura de Maternidad?',
          answer: 'La cobertura de maternidad (control prenatal, ecografías, parto natural o cesárea) requiere que la afiliada titular tenga una antigüedad mínima contratada de 10 meses previos al parto para activar el 100% de la cobertura estipulada en los planes Integral y Elite.'
        },
        {
          question: '¿Se incluye asistencia médica internacional?',
          answer: 'Sí. El Plan Elite y el Plan Integral de Colmedical incluyen Asistencia en Viajes Internacionales integrada que cubre emergencias médicas o accidentes fuera del país de hasta $30,000 USD y traslado médico de emergencia, gestionado por nuestro operador internacional certificado.'
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
