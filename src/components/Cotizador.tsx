import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  User, 
  Users, 
  Briefcase, 
  HeartHandshake, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  MapPin, 
  CheckCircle,
  HelpCircle,
  BadgePercent,
  Download,
  Send,
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';
import { Page, Plan, QuoteState } from '../types';
import { MEDICAL_PLANS, PROVINCIAS_EC } from '../data';
import { useColmedical } from '../context/ColmedicalContext';

interface CotizadorProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedPlanId: string;
}

export default function Cotizador({ currentPage, setCurrentPage, selectedPlanId }: CotizadorProps) {
  const { addLead } = useColmedical();

  // Wizard steps: 1 = Tipo de afiliación, 2 = Información Demográfica, 3 = Plan y Adicionales, 4 = Resumen y Envío
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Quote State Setup
  const [state, setState] = useState<QuoteState>({
    fullName: '',
    email: '',
    phone: '',
    type: 'individual',
    primaryAge: 30,
    partnerAge: 30,
    childrenCount: 0,
    childrenAges: [],
    basePlanId: selectedPlanId || 'esencial',
  });

  // Client-side validations
  const [topicErrors, setTopicErrors] = useState<Record<string, string>>({});
  const [isHandoffSubmitted, setIsHandoffSubmitted] = useState(false);
  const [leadTicket, setLeadTicket] = useState('');
  const [province, setProvince] = useState('Pichincha (Quito, etc.)');

  // Adjust child count dynamically
  const handleChildCountChange = (count: number) => {
    const updatedAges = [...state.childrenAges];
    if (count > state.childrenCount) {
      for (let i = state.childrenCount; i < count; i++) {
        updatedAges.push(8); // Default child age
      }
    } else {
      updatedAges.splice(count);
    }
    setState({ ...state, childrenCount: count, childrenAges: updatedAges });
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const updatedAges = [...state.childrenAges];
    updatedAges[index] = age;
    setState({ ...state, childrenAges: updatedAges });
  };

  // Age Factor calculations
  const getAgeFactor = (age: number): number => {
    if (age < 25) return 0.85;  // Young discount
    if (age <= 34) return 1.0;   // General subscriber age
    if (age <= 44) return 1.15;
    if (age <= 54) return 1.35;
    if (age <= 64) return 1.65;
    return 2.10;                 // Veteran age coverage
  };

  // Core Math Calculation Engine
  const calculateQuote = () => {
    const activePlan = MEDICAL_PLANS.find(p => p.id === state.basePlanId) || MEDICAL_PLANS[1];
    let totalPeopleCount = 1;
    
    // 1. Primary subscriber price
    const primaryFactor = getAgeFactor(state.primaryAge);
    let subscriberPart = activePlan.basePrice * primaryFactor;

    // 2. Spouse / partner calculation
    let partnerPart = 0;
    if (state.type === 'pareja' || state.type === 'familiar') {
      totalPeopleCount += 1;
      const partnerFactor = getAgeFactor(state.partnerAge || 30);
      partnerPart = activePlan.basePrice * partnerFactor;
    }

    // 3. Children calculations
    let childrenPart = 0;
    const childFlat = state.basePlanId === 'basico' ? 5.0 : state.basePlanId === 'esencial' ? 8.0 : 12.0;
    if (state.type === 'familiar' && state.childrenCount > 0) {
      totalPeopleCount += state.childrenCount;
      childrenPart = state.childrenCount * childFlat;
    }

    // Math aggregates
    const subtotalRaw = subscriberPart + partnerPart + childrenPart;
    const finalPremium = subtotalRaw;

    return {
      subscriberCost: subscriberPart,
      partnerCost: partnerPart,
      childrenCost: childrenPart,
      subtotalPlan: subtotalRaw,
      totalMonthly: finalPremium,
      peopleCount: totalPeopleCount
    };
  };

  const totals = calculateQuote();
  const selectedPlanObj = MEDICAL_PLANS.find(p => p.id === state.basePlanId) || MEDICAL_PLANS[1];

  // Code verification & validation helpers
  const handleNextStep = () => {
    const errorList: Record<string, string> = {};
    
    if (step === 2) {
      if (state.primaryAge < 18 || state.primaryAge > 68) {
        errorList.primaryAge = 'La edad de afiliación principal debe estar entre 18 y 68 años.';
      }
      if ((state.type === 'pareja' || state.type === 'familiar') && (state.partnerAge && (state.partnerAge < 18 || state.partnerAge > 68))) {
        errorList.partnerAge = 'La edad de tu cónyuge debe estar entre 18 y 68 años.';
      }
      if (state.type === 'familiar' && state.childrenCount > 0) {
        state.childrenAges.forEach((age, index) => {
          if (age < 0 || age > 25) {
            errorList[`childAge-${index}`] = 'Las edades de hijos permitidos son de 0 a 25 años.';
          }
        });
      }
    }

    if (Object.keys(errorList).length > 0) {
      setTopicErrors(errorList);
      return;
    }

    setTopicErrors({});
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setTopicErrors({});
    setStep(prev => Math.max(1, prev - 1));
  };

  // Submit quotation to agent simulation
  const handleFormalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const listErr: Record<string, string> = {};
    if (!state.fullName.trim()) listErr.fullName = 'Tu nombre completo es requerido';
    if (!state.email.trim() || !/\S+@\S+\.\S+/.test(state.email)) listErr.email = 'El correo electrónico no es válido';
    if (!state.phone.trim() || !/^\d{7,12}$/.test(state.phone.replace(/[\s-]/g, ''))) listErr.phone = 'Ingrese un teléfono de contacto válido';

    if (Object.keys(listErr).length > 0) {
      setTopicErrors(listErr);
      return;
    }

    setTopicErrors({});
    const randomLead = Math.floor(250000 + Math.random() * 749000);
    setLeadTicket(`PRE-${randomLead}`);
    addLead(state, totals.totalMonthly);
    setIsHandoffSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8" id="colmedical-quote-calculator">
      
      {/* 1. SECTION HEADLINE */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Cotizador Inteligente</span>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Cotiza tu Plan de Medicina Prepagada
        </h1>
        <p className="text-slate-600">
          Usa nuestro motor interactivo automatizado para simular las tarifas de tus planes médicos en tiempo real. Inspirado en el flujo ágil de Humana Ecuador.
        </p>
      </div>

      {/* 2. PROGRESS STEP BAR */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex justify-between items-center relative">
          {/* Progress baseline */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0" />
          
          {/* Progress fill */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 transition-all duration-300 z-0" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {[
            { s: 1, title: 'Afiliación' },
            { s: 2, title: 'Información' },
            { s: 3, title: 'Planes' },
            { s: 4, title: 'Precios' }
          ].map((item) => (
            <div key={item.s} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === item.s 
                    ? 'bg-teal-500 text-white ring-4 ring-teal-100 scale-108' 
                    : step > item.s 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-slate-250 text-slate-500'
                }`}
                id={`progress-dot-${item.s}`}
              >
                {step > item.s ? <Check className="w-5.5 h-5.5" /> : item.s}
              </div>
              <span className={`text-[10px] sm:text-xs font-semibold mt-2 ${
                step === item.s ? 'text-teal-600 font-bold' : 'text-slate-400'
              }`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CORE ADAPTIVE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive Wizard Forms (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 min-h-[480px] flex flex-col justify-between">
          
          {/* STEP 1: Modalidad / TIPO DE AFILIACION */}
          {step === 1 && (
            <div className="space-y-6" id="cotizador-step-1">
              <div>
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">1. Selecciona tu modalidad de afiliación</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adaptamos la cotización de acuerdo con el perfil del grupo familiar o empresarial de destino.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Individual Card */}
                <div 
                  onClick={() => setState({ ...state, type: 'individual' })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative ${
                    state.type === 'individual' 
                      ? 'border-teal-500 bg-teal-50/20 shadow-md' 
                      : 'border-slate-200 hover:border-slate-350 bg-white'
                  }`}
                  id="choice-individual"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    {state.type === 'individual' && <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-teal-100" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Individual</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Protección únicamente para ti. Cotiza basados exclusivamente en tu rango de edad.
                    </p>
                  </div>
                </div>

                {/* Pareja Card */}
                <div 
                  onClick={() => setState({ ...state, type: 'pareja' })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative ${
                    state.type === 'pareja' 
                      ? 'border-teal-500 bg-teal-50/20 shadow-md' 
                      : 'border-slate-200 hover:border-slate-350 bg-white'
                  }`}
                  id="choice-couple"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    {state.type === 'pareja' && <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-100" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">En Pareja</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Tú y tu cónyuge o conviviente. Cobertura complementaria para ambos.
                    </p>
                  </div>
                </div>

                {/* Familiar Card */}
                <div 
                  onClick={() => setState({ ...state, type: 'familiar' })}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all space-y-3 relative ${
                    state.type === 'familiar' 
                      ? 'border-teal-500 bg-teal-50/20 shadow-md' 
                      : 'border-slate-200 hover:border-slate-350 bg-white'
                  }`}
                  id="choice-family"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Users className="w-5.5 h-5.5" />
                    </div>
                    {state.type === 'familiar' && <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-teal-100" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Familiar Completo</h4>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Soporte integral para Ti, Pareja e Hijos. Las tarifas de los menores son planas y muy reducidas.
                    </p>
                  </div>
                </div>

              </div>

              <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <Info className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-xs text-slate-600">
                  ¿Sabías qué? El 76% de las personas que ingresan eligen su plan en la modalidad <strong>Familiar Completo</strong> para extender la tranquilidad a los más pequeños del hogar.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: DATOS DE AFILIACION */}
          {step === 2 && (
            <div className="space-y-6" id="cotizador-step-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">2. Completa los rangos de edad</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Las primas de medicina prepagada se calculan basados en las edades de los suscriptores activos.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Primary subscriber age slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <label className="text-slate-700">Edad del Titular:</label>
                    <span className="font-mono bg-teal-50 text-teal-700 font-bold px-2.5 py-0.5 rounded-md">
                      {state.primaryAge} Años
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="18"
                    max="68"
                    value={state.primaryAge}
                    onChange={(e) => setState({ ...state, primaryAge: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    id="slider-primary-age"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Mín: 18</span>
                    <span>Máx: 68</span>
                  </div>
                  {topicErrors.primaryAge && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {topicErrors.primaryAge}</span>}
                </div>

                {/* Partner Age slider (Conditional) */}
                {(state.type === 'pareja' || state.type === 'familiar') && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-semibold">
                      <label className="text-slate-700">Edad del Cónyuge o Conviviente:</label>
                      <span className="font-mono bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-md">
                        {state.partnerAge || 30} Años
                      </span>
                    </div>
                    <input 
                      type="range"
                      min="18"
                      max="68"
                      value={state.partnerAge || 30}
                      onChange={(e) => setState({ ...state, partnerAge: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      id="slider-partner-age"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Mín: 18</span>
                      <span>Máx: 68</span>
                    </div>
                    {topicErrors.partnerAge && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {topicErrors.partnerAge}</span>}
                  </div>
                )}

                {/* Familiar Child counter (Conditional) */}
                {state.type === 'familiar' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-semibold text-slate-700">Número de Hijos dependientes:</label>
                      
                      <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0">
                        {[0, 1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handleChildCountChange(num)}
                            className={`px-3 py-1.5 text-xs font-semibold font-mono ${
                              state.childrenCount === num
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Render children age inputs */}
                    {state.childrenCount > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-150 animate-in fade-in">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider col-span-full">Indica la edad de tus hijos:</span>
                        {state.childrenAges.map((age, childIdx) => (
                          <div key={childIdx} className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-600">Hijo #{childIdx + 1} (Años):</label>
                            <input 
                              type="number"
                              min="0"
                              max="25"
                              value={age}
                              onChange={(e) => handleChildAgeChange(childIdx, Number(e.target.value))}
                              className="w-full px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center focus:ring-1 focus:ring-teal-500"
                              id={`child-age-input-${childIdx}`}
                            />
                            {topicErrors[`childAge-${childIdx}`] && <span className="text-[10px] text-red-500">{topicErrors[`childAge-${childIdx}`]}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Coverage Province Selector */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">Provincia / Región de cobertura preferida:</label>
                  <select 
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    id="quote-province-selector"
                  >
                    {PROVINCIAS_EC.map((p, pIdx) => (
                      <option key={pIdx} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: BASE PLAN & OPTIONAL ADDONS */}
          {step === 3 && (
            <div className="space-y-6" id="cotizador-step-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">3. Elige tu Plan y Coberturas Adicionales</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Revisa cuál de nuestros planes base responde mejor a tus necesidades técnicas de hospitalización o añade complementos de bienestar.
                </p>
              </div>

              {/* Base plan selection */}
              <div className="space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Seleccionar Plan Médico Base:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MEDICAL_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setState({ ...state, basePlanId: plan.id })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${
                        state.basePlanId === plan.id
                          ? 'border-teal-500 bg-teal-50/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      id={`plan-choice-${plan.id}`}
                    >
                      <span className="block text-xs font-bold text-slate-800">{plan.name}</span>
                      <span className="block text-[10px] text-slate-500 italic mt-0.5">Soporte ${plan.maxCoverage.toLocaleString()}</span>
                      <span className="block text-sm font-mono font-bold text-slate-900 mt-2">${plan.basePrice}/m</span>
                    </div>
                  ))}
                </div>
                
                {/* Selected Plan Details */}
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-150">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-500" /> Coberturas Principales de {selectedPlanObj.name}
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPlanObj.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SOLICITUD / REGISTRO FORMULARIO AGENT HANDOFF */}
          {step === 4 && (
            <div className="space-y-6" id="cotizador-step-4">
              {isHandoffSubmitted ? (
                <div className="text-center py-12 space-y-6 max-w-md mx-auto" id="handoff-success-screen">
                  <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-950">¡Propuesta Reservada!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      La cotización ha sido calculada y bloqueada en nuestro sistema de agentes autorizados Colmedical bajo el código:
                    </p>
                    <div className="bg-slate-100 px-5 py-2 rounded-xl text-base font-mono font-bold text-slate-800 tracking-wide border border-slate-200 w-fit mx-auto">
                      {leadTicket}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hemos enviado formalmente los folios de información técnica, el tarifario desglosado y la nómina de clínicas aprobadas a tu dirección de correo electrónico <strong>{state.email}</strong>.
                  </p>
                  <div className="pt-4 flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setIsHandoffSubmitted(false);
                        setStep(1);
                      }}
                      className="px-6 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Cotizar Otro Plan
                    </button>
                    <button
                      onClick={() => setCurrentPage('home')}
                      className="px-6 py-2.5 bg-teal-500 text-white hover:bg-teal-600 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Volver al Inicio
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormalSubmit} className="space-y-6" id="handoff-form">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">4. Solicita tu cotización formal firmada</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Ingresa tus datos comerciales y de contacto a continuación para bloquear esta tarifa especial por los próximos 15 días calendario de manera formal.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">Nombre Completo del Titular *</label>
                      <input 
                        type="text"
                        value={state.fullName}
                        onChange={(e) => setState({ ...state, fullName: e.target.value })}
                        placeholder="Ej. Sofia Andrade"
                        className={`w-full px-4.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${topicErrors.fullName ? 'border-red-500' : 'border-slate-300'}`}
                        id="handoff-name"
                      />
                      {topicErrors.fullName && <span className="text-[11px] text-red-500 mt-1 block">{topicErrors.fullName}</span>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Correo Electrónico *</label>
                        <input 
                          type="email"
                          value={state.email}
                          onChange={(e) => setState({ ...state, email: e.target.value })}
                          placeholder="sofia@ejemplo.com"
                          className={`w-full px-4.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${topicErrors.email ? 'border-red-500' : 'border-slate-300'}`}
                          id="handoff-email"
                        />
                        {topicErrors.email && <span className="text-[11px] text-red-500 mt-1 block">{topicErrors.email}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-slate-700">Teléfono Celular *</label>
                        <input 
                          type="tel"
                          value={state.phone}
                          onChange={(e) => setState({ ...state, phone: e.target.value })}
                          placeholder="Ej. 0998877665"
                          className={`w-full px-4.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none ${topicErrors.phone ? 'border-red-500' : 'border-slate-300'}`}
                          id="handoff-phone"
                        />
                        {topicErrors.phone && <span className="text-[11px] text-red-500 mt-1 block">{topicErrors.phone}</span>}
                      </div>

                    </div>
                  </div>

                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900 leading-normal">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Beneficios del Registro:</strong> Te asignaremos una ejecutiva de cuenta experta que validará la exención de periodos de carencia si traes certificado de vigencia de planes de otra entidad como Humana, Cruz Blanca o similares.
                    </span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-xs shadow-md shadow-[#0C4169]/10 hover:shadow-[#0C4169]/25 transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
                      id="btn-handoff-submit"
                    >
                      <span>Lock & Enviar Cotización</span>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="block text-center text-[10px] text-slate-400 mt-2">
                      Sin compromisos financieros. Tus datos están 100% seguros con encriptación SSL.
                    </span>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Core Navigation Controls */}
          {!isHandoffSubmitted && (
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
              
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg transition-colors ${
                  step === 1 ? 'opacity-0 cursor-not-allowed pointer-events-none' : 'hover:bg-slate-100'
                }`}
                id="btn-step-prev"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="text-[10px] text-slate-400 font-mono">
                Paso {step} de 4
              </div>

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-all shadow-md group"
                  id="btn-step-next"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <div className="w-24 h-5" /> /* Placeholder space on step 4 */
              )}

            </div>
          )}

        </div>

        {/* Right Dynamic Live Invoice Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl overflow-hidden relative" id="print-invoice-area">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Invoice Header */}
          <div className="border-b border-slate-800 pb-5 space-y-2 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-teal-900/60 text-teal-300 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                Desglose en Vivo
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Simulado en {province.split(' ')[0]}</span>
            </div>
            
            <h3 className="text-xl font-display font-extrabold tracking-tight">
              Pre-Factura Estimada
            </h3>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <HeartHandshake className="w-4 h-4 text-teal-400" />
              <span>Base: Plan <strong>{selectedPlanObj.name}</strong></span>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors print:hidden"
            >
              <Download className="w-4 h-4" />
              Descargar como PDF
            </button>
          </div>

          {/* Pricing Details */}
          <div className="py-6 border-b border-slate-800 divide-y divide-slate-800/60 space-y-4 relative z-10 text-xs">
            
            {/* Primary person breakdown */}
            <div className="flex justify-between items-start pt-1">
              <div className="space-y-0.5 text-left">
                <span className="block font-semibold">Titular (Edad {state.primaryAge})</span>
                <span className="block text-[10px] text-slate-400 font-mono">Factor edad: x{getAgeFactor(state.primaryAge).toFixed(2)}</span>
              </div>
              <span className="font-mono font-semibold">${totals.subscriberCost.toFixed(2)}</span>
            </div>

            {/* Spouse partner detail */}
            {(state.type === 'pareja' || state.type === 'familiar') && (
              <div className="flex justify-between items-start pt-3">
                <div className="space-y-0.5 text-left">
                  <span className="block font-semibold">Cónyuge o Familiar (Edad {state.partnerAge})</span>
                  <span className="block text-[10px] text-slate-400 font-mono">Factor edad: x{getAgeFactor(state.partnerAge || 30).toFixed(2)}</span>
                </div>
                <span className="font-mono font-semibold">${totals.partnerCost.toFixed(2)}</span>
              </div>
            )}

            {/* Children billing detail */}
            {state.type === 'familiar' && state.childrenCount > 0 && (
              <div className="flex justify-between items-center pt-3">
                <span className="font-semibold text-slate-350 text-left">Hijos Dependientes ({state.childrenCount} menores)</span>
                <span className="font-mono font-semibold">${totals.childrenCost.toFixed(2)}</span>
              </div>
            )}

          </div>

          {/* Monthly Grand Total Display */}
          <div className="py-6 space-y-4 relative z-10">
            
            <div className="flex justify-between items-baseline">
              <div className="text-left">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-400 block">Mensualidad Calculada</span>
                <span className="text-[10px] text-slate-500">Impuestos y tasas clínicas incluidas</span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-mono font-extrabold text-teal-400" id="live-total-quote-valuation">
                  ${totals.totalMonthly.toFixed(2)}
                </span>
                <span className="block text-[10px] text-slate-400">/ mes por grupo</span>
              </div>
            </div>

          </div>

          {/* Quick Specifications Card footer */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-900 text-[11px] text-slate-400 text-left space-y-1 relative z-10">
            <span className="block text-slate-355 font-bold uppercase tracking-wider text-[9px]">Especificaciónes Técnicas Base:</span>
            <p>• Copago del afiliado reducido al {selectedPlanObj.copayPercent}% directo.</p>
            <p>• Tope hospitalario en red clínica: <strong className="font-mono text-white">${selectedPlanObj.maxCoverage.toLocaleString()} USD</strong>.</p>
            <p>• Acceso directo a {selectedPlanObj.hospitalNetwork}.</p>
          </div>

        </div>

      </div>

      <div className="mt-12 text-center max-w-2xl mx-auto space-y-4 print:hidden">
        <p className="text-sm font-semibold text-slate-600">
          ¿No encuentras lo que buscas o necesitas una asesoría especializada?
        </p>
        <button
          onClick={() => setCurrentPage('contacto')}
          className="px-6 py-3 bg-white border-2 border-slate-200 hover:border-[#0C4169] hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          Contacta a un Agente Comercial
        </button>
      </div>

    </div>
  );
}
