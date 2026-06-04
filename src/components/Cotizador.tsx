import React, { useState } from 'react';
import { 
  Calculator, 
  User, 
  Users, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Building,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Lock,
  X,
  FileCheck,
  Download
} from 'lucide-react';
import { Page } from '../types';
import Logo from './Logo';
import { useColmedikal } from '../context/ColmedikalContext';
import { generateQuotePDF } from '../utils/pdfGenerator';
import { sendLeadToKommoCRM } from '../utils/crm';

interface CotizadorProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedPlanId: string;
}

interface Dependant {
  id: string;
  gender: string;
  ageRange: string;
  birthDate: string;
  isPrimary: boolean;
}

const PROVINCES = [
  'Pichincha (Quito, etc.)',
  'Guayas (Guayaquil, etc.)',
  'Azuay (Cuenca, etc.)',
  'Manabí (Manta, Portoviejo)',
  'Loja',
  'Tungurahua (Ambato)',
  'El Oro (Machala)',
  'Imbabura (Ibarra)',
  'Santo Domingo de los Tsáchilas',
  'Santa Elena',
  'Los Ríos',
  'Esmeraldas',
  'Chimborazo (Riobamba)',
  'Cotopaxi (Latacunga)',
  'Carchi',
  'Bolívar',
  'Cañar',
  'Galápagos',
  'Morona Santiago',
  'Napo',
  'Orellana',
  'Pastaza',
  'Sucumbíos',
  'Zamora Chinchipe'
];

export default function Cotizador({ currentPage, setCurrentPage, selectedPlanId }: CotizadorProps) {
  const { addLead } = useColmedikal();
  // 1. Selector of Plan Type: masivo | individual | corporativo
  const [planType, setPlanType] = useState<'masivo' | 'individual' | 'corporativo'>('masivo');
  const [quoteStep, setQuoteStep] = useState(1); // Steps count varies depending on flow

  // 2. Personal & Identity state (Shared)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState(PROVINCES[0]);
  const [docType, setDocType] = useState<'cedula' | 'pasaporte'>('cedula');
  const [docNumber, setDocNumber] = useState('');

  // 3. Dependents block state (For Individual plan only)
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [isPrimaryTitular, setIsPrimaryTitular] = useState(true);

  // 4. Volume block state (For Corporate plans only)
  const [numberOfPeople, setNumberOfPeople] = useState('');

  // 5. Finishing & CRM states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [leadCode, setLeadCode] = useState('');
  const [assignedRep, setAssignedRep] = useState('');

  // 6. Checkout & Hiring Flow states
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);

  // Billing and debit details
  const [paymentMethod, setPaymentMethod] = useState<'cuenta' | 'tarjeta'>('cuenta');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'ahorros' | 'corriente'>('ahorros');
  const [accountNumber, setAccountNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState<'mensual' | 'anual'>('mensual');
  const [coverageStartDate, setCoverageStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tomorrow
    return d.toISOString().split('T')[0];
  });

  // Verification & signature checkboxes
  const [signatureAccepted, setSignatureAccepted] = useState(false);
  const [carenciasAccepted, setCarenciasAccepted] = useState(false);
  const [healthDeclaration, setHealthDeclaration] = useState(false);
  const [signatureText, setSignatureText] = useState('');
  const [isContracting, setIsContracting] = useState(false);

  // Static Plan Comparativos - exact match with provided specifications
  const plansComparativo = [
    {
      id: 'plan1',
      name: 'Plan 1',
      basePrice: 8,
      cobertura: '$2.000,00 USD Anual',
      dedHosp: '$40,00 USD Anual',
      maternidad: '$250,00 USD',
      muerteAccidente: '$1.500,00 USD',
      sepelio: '$500,00 USD',
      ambulancia: '$200,00 USD',
      evacuacion: '$200,00 USD',
      laboratorio: '$100,00 USD/Año',
      imagen: '$100,00 USD/Año',
      especialidades: {
        'Medicina General': true,
        'Medicina Familiar': true,
        'Ginecología': true,
        'Gastroenterología': true,
        'Urología': false,
        'Traumatología': false,
        'Medicina Interna': false,
        'Cardiología': false,
        'Odontología (6 proced./año)': true
      },
      caracteristicas: [
        'Entrega de medicina al 100% (Sin costo ni copago)',
        'Especialidades básicas de Asistencia Médica',
        'Carencias preferenciales (30 días ambulatorio)',
        'Odontología (Consultas, profilaxis, restauraciones resina)'
      ]
    },
    {
      id: 'plan2',
      name: 'Plan 2 (Recomendado)',
      basePrice: 12,
      cobertura: '$3.000,00 USD Anual',
      dedHosp: '$40,00 USD Anual',
      maternidad: '$500,00 USD',
      muerteAccidente: '$2.500,00 USD',
      sepelio: '$500,00 USD',
      ambulancia: '$200,00 USD',
      evacuacion: '$200,00 USD',
      laboratorio: '$100,00 USD/Año',
      imagen: '$100,00 USD/Año',
      especialidades: {
        'Medicina General': true,
        'Medicina Familiar': true,
        'Ginecología': true,
        'Gastroenterología': true,
        'Urología': true,
        'Traumatología': true,
        'Medicina Interna': false,
        'Cardiología': false,
        'Odontología (6 proced./año)': true
      },
      caracteristicas: [
        'Incluye Urología y Traumatología en red prestadores',
        'Bono de Maternidad de $500,00 para titular',
        'Entrega de medicina al 100% sin copago',
        'Soporte a cirugías programadas preautorizadas'
      ]
    },
    {
      id: 'plan3',
      name: 'Plan 3 Platinum',
      basePrice: 22,
      cobertura: '$5.000,00 USD Anual',
      dedHosp: '$40,00 USD Anual',
      maternidad: '$700,00 USD',
      muerteAccidente: '$3.500,00 USD',
      sepelio: '$800,00 USD',
      ambulancia: '$200,00 USD',
      evacuacion: '$200,00 USD',
      laboratorio: '$100,00/Año',
      imagen: '$100,00/Año',
      especialidades: {
        'Medicina General': true,
        'Medicina Familiar': true,
        'Ginecología': true,
        'Gastroenterología': true,
        'Urología': true,
        'Traumatología': true,
        'Medicina Interna': true,
        'Cardiología': true,
        'Odontología (6 proced./año)': true
      },
      caracteristicas: [
        'Cobertura total en Medicina Interna y Cardiología',
        'Bono de Maternidad premium de $700,00 USD',
        'Límite de Gastos Hospitalarios de $5.000,00 USD',
        'Exámenes de diagnóstico complementarios con cobertura'
      ]
    }
  ];

  // Form step navigation helpers
  const handleNextStep = () => {
    // Basic validation based on step
    if (quoteStep === 1) {
      // Validating Step 1 (Personal Data)
      if (!firstName || !lastName || !email || !phone) {
        alert('Por favor complete todos sus datos personales obligatorios.');
        return;
      }
      if (!email.includes('@')) {
        alert('Por favor ingrese un correo electrónico válido.');
        return;
      }
      setQuoteStep(2);
    } else if (quoteStep === 2) {
      // Validating Step 2 (Document Identification Data)
      if (!docNumber) {
        alert('Por favor ingrese su número de documento de identificación.');
        return;
      }
      if (docType === 'cedula' && docNumber.length < 10) {
        alert('Una cédula ecuatoriana válida contiene al menos 10 dígitos.');
        return;
      }

      // Decide routing depending on plan type
      if (planType === 'masivo') {
        // Massive goes directly to Results! Let's submit data to generateQuoteReceipt first
        generateQuoteReceipt();
      } else if (planType === 'individual') {
        // Individual goes to Step 3 (Dependants)
        setQuoteStep(3);
      } else if (planType === 'corporativo') {
        // Corporate goes to Volume Input
        setQuoteStep(3);
      }
    } else if (quoteStep === 3) {
      // If we are individual, we advance to results. Let's submit to generateQuoteReceipt!
      if (planType === 'individual') {
        generateQuoteReceipt();
      } else if (planType === 'corporativo') {
        // Validate volume
        if (!numberOfPeople) {
          alert('Por favor ingrese el número proyectado de colaboradores.');
          return;
        }
        generateQuoteReceipt();
      }
    }
  };

  const handlePrevStep = () => {
    if (quoteStep > 1) {
      setQuoteStep(quoteStep - 1);
    }
  };

  const addDependant = () => {
    const newDep: Dependant = {
      id: 'dep-' + Date.now(),
      gender: 'masculino',
      ageRange: '18-35',
      birthDate: '',
      isPrimary: false
    };
    setDependants([...dependants, newDep]);
  };

  const removeDependant = (id: string) => {
    setDependants(dependants.filter(d => d.id !== id));
  };

  const updateDependantField = (id: string, field: keyof Dependant, value: any) => {
    setDependants(dependants.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // 5. Finishing & Quotation status states
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  // Simulate Quote Generation
  const generateQuoteReceipt = () => {
    setIsSubmitting(true);
    setActivePhraseIndex(0);

    const intervalId = setInterval(() => {
      setActivePhraseIndex((prev) => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 1100);

    setTimeout(() => {
      clearInterval(intervalId);
      // Assign executive based on plan type and region
      let repName = 'Ing. Carolina Delgado (Asesor Corporativo)';
      if (planType === 'masivo') repName = 'Lcdo. Francisco Meza (Atención Canales)';
      else if (planType === 'individual') repName = 'Dra. Patricia Franco (Asesor de Afiliación)';

      const code = 'COT-' + Math.floor(Math.random() * 900000 + 100000);
      setLeadCode(code);
      setAssignedRep(repName);

      // Save lead inside central context and send to Kommo CRM
      const estimatedPrice = planType === 'corporativo' ? Number(numberOfPeople || 10) * 18 : calculateDynamicPrice(45);
      addLead({
        fullName: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        type: planType === 'masivo' ? 'individual' : 'familiar',
        primaryAge: 35,
        childrenCount: dependants.length,
        childrenAges: dependants.map(d => d.ageRange === '0-17' ? 10 : 25),
        basePlanId: planType === 'masivo' ? 'esencial' : 'premium'
      }, estimatedPrice);

      sendLeadToKommoCRM({
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        subject: `Cotización Web: Plan ${planType.toUpperCase()}`,
        amount: estimatedPrice,
        province: province,
        details: `Propuesta de Plan de salud ${planType.toUpperCase()}. Provincia de cobertura: ${province}. Código de Cotización: ${code}. Dependientes: ${dependants.length || 0} familiares.`,
        leadCode: code,
        planName: `Plan ${planType.toUpperCase()}`
      });

      setIsSubmitting(false);
      setShowResultScreen(true);
    }, 6600); // 6 phrases * 1100ms
  };

  const calculateDynamicPrice = (basePrice: number) => {
    // Add logic to charge for titular and dependants
    let total = basePrice;
    
    // Add charges for dependants
    dependants.forEach(dep => {
      if (dep.ageRange === '0-17') total += basePrice * 0.5; // Kids get 50% discount
      else if (dep.ageRange === '18-35') total += basePrice * 0.9; // 10% youth discount
      else if (dep.ageRange === '36-49') total += basePrice * 1.0; // standard price
      else if (dep.ageRange === '50-64') total += basePrice * 1.25; // 25% age loading
      else total += basePrice * 1.6; // elderly
    });

    return Math.round(total * 100) / 100;
  };

  const getDependantAgeLabel = (range: string) => {
    switch (range) {
      case '0-17': return 'Menor de edad (0 a 17 años)';
      case '18-35': return 'Adulto Joven (18 a 35 años)';
      case '36-49': return 'Adulto General (36 a 49 años)';
      case '50-64': return 'Adulto Mayor (50 a 64 años)';
      case '65+': return 'Tercera Edad (Más de 65 años)';
      default: return '18-35';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="cotizador-dedicated-view">
      
      {/* Visual, Distraction-Free Header inside Cotizador (No Header Navigation to distract user) */}
      <header className="bg-white border-b border-slate-205 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Logo className="h-9 sm:h-11 w-auto" />
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <span className="text-[11px] font-bold text-[#4597CA] uppercase tracking-wider font-sans select-none hidden sm:inline">
              Módulo de Cotización Premium
            </span>
          </div>

          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1.5 px-4 font-sans py-2 text-xs font-black text-slate-700 bg-white border border-slate-250 hover:bg-slate-50 rounded-xl transition duration-200 active:scale-97 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#4597CA]" />
            <span>Volver a la Página de Inicio</span>
          </button>

        </div>
      </header>

      {/* Main wizard contents */}
      <main className="flex-grow py-8 sm:py-12 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {isSubmitting ? (
          <div className="bg-[#093556] rounded-3xl border border-sky-900/40 shadow-2xl p-8 sm:p-12 text-white flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden text-center animate-in fade-in duration-300">
             {/* Decorative radial lighting */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

             <div className="relative z-10 max-w-xl mx-auto space-y-8">
                {/* Modern visual scanner / radar loop */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-36 h-36 rounded-full border border-sky-500/10 animate-ping"></div>
                  <div className="absolute w-28 h-28 rounded-full border border-sky-400/20 animate-pulse"></div>
                  <div className="absolute w-20 h-20 rounded-full bg-sky-950/45 border border-sky-800 flex items-center justify-center shadow-lg">
                    <Logo className="h-6 w-auto text-white" isDarkBg={true} />
                  </div>
                  
                  {/* Outer spinning radar circle */}
                  <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-[#4597CA] animate-spin duration-1000"></div>
                </div>

                <div className="space-y-3">
                  <span className="inline-block bg-teal-500/15 text-teal-350 font-mono text-[10px] font-bold px-3.5 py-1 rounded-full tracking-widest uppercase border border-teal-500/20">
                    Motor de Precios e Inteligencia Actuarial
                  </span>
                  <h3 className="text-xl sm:text-3xl font-black font-sans tracking-tight leading-tight">
                    Estructurando y Calculando tu Propuesta
                  </h3>
                  <p className="text-xs text-sky-200/70 max-w-md mx-auto leading-relaxed">
                    Estamos procesando las cotizaciones en tiempo real, aplicando descuentos grupales y validando prestadores médicos en la red de {province}.
                  </p>
                </div>

                {/* Progress bar and phrase loading area */}
                <div className="bg-sky-950/45 p-5 sm:p-7 rounded-2xl border border-sky-900/40 space-y-5 shadow-2xl">
                  
                  {/* Dynamic loading messages sequence */}
                  <div className="min-h-[44px] flex items-center justify-center p-1 bg-sky-950/20 rounded-lg">
                    <p key={activePhraseIndex} className="text-xs sm:text-[13px] font-bold font-sans text-teal-300 animate-in slide-in-from-bottom-2 duration-300">
                      {activePhraseIndex === 0 && `Iniciando análisis multivariable de políticas de Colmedikal para ${firstName || 'beneficiario'} ${lastName || ''}...`}
                      {activePhraseIndex === 1 && (planType === 'corporativo' ? `Dimensionando tasas preferenciales y volumen técnico para ${numberOfPeople || '30'} personas...` : `Evaluando el grupo de ${dependants.length + 1} beneficiario(s) asegurables...`)}
                      {activePhraseIndex === 2 && `Localizando prestadores médicos acreditados en la provincia de ${province}...`}
                      {activePhraseIndex === 3 && 'Calculando copagos de especialidades regulados por red médica ($15.00 USD)...'}
                      {activePhraseIndex === 4 && 'Aplicando descuentos de escala digital Colmedikal...'}
                      {activePhraseIndex === 5 && 'Estructurando cotización certificada segura autorizada...'}
                    </p>
                  </div>

                  {/* Percentage Bar */}
                  <div className="space-y-2">
                    <div className="h-2 bg-sky-950/80 rounded-full overflow-hidden border border-sky-900/20 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-405 via-sky-400 to-[#4597CA] rounded-full transition-all duration-355" 
                        style={{ width: `${Math.min(100, Math.round(((activePhraseIndex + 1) / 6) * 100))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                      <span className="tracking-wider">AUTOMATED CALCULATIONS</span>
                      <span className="text-teal-400 font-black">
                        {Math.min(100, Math.round(((activePhraseIndex + 1) / 6) * 100))}%
                      </span>
                    </div>
                  </div>

                </div>

                <div className="text-[10px] text-slate-400 font-medium font-sans">
                  🔒 Conexión segura SSL de 256 bits • Datos encriptados de extremo a extremo
                </div>
             </div>
          </div>
        ) : !showResultScreen ? (
          <div className="bg-white rounded-3xl border border-slate-205 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[500px]">
            
            {/* Left Column: Live Virtual Assistant Panel */}
            <div className="md:col-span-4 bg-gradient-to-b from-[#093556] to-[#0A2640] p-7 sm:p-8 text-white flex flex-col justify-between space-y-8 relative overflow-hidden" id="cotizador-assistant-panel">
              
              {/* Dynamic decorative backdrop light */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
              
              <div className="space-y-6 relative z-10">
                {/* Assistant Virtual Greeting Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-sky-500/15 text-sky-300 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-sky-400/20">
                    Asistencia en Vivo
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">En línea</span>
                  </div>
                </div>

                {/* Avatar Card */}
                <div className="flex items-center gap-3.5 bg-sky-950/40 p-3.5 rounded-2xl border border-sky-900/40 shadow-inner">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#4597CA] to-sky-400 flex items-center justify-center font-black text-white text-base shadow-md border-2 border-sky-900">
                      S
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#093556] flex items-center justify-center shadow-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black tracking-tight text-white leading-none">Sofía Delgado</h4>
                    <span className="inline-block text-[9.5px] text-sky-300 font-bold uppercase tracking-wider">Asesora Virtual Activa</span>
                    <p className="text-[9px] text-slate-400 font-medium">Colmedikal Red Digital</p>
                  </div>
                </div>

                {/* Live Message Bubble */}
                <div className="relative bg-white text-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in duration-300">
                  {/* Decorative bubble tail pointing to avatar */}
                  <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white transform rotate-45 border-t border-l border-slate-100/80"></div>
                  
                  <div className="relative z-10 space-y-2 font-sans leading-relaxed">
                    <p className="text-[10.5px] font-bold text-[#0C4169] flex items-center gap-1">
                      <span>Sofía Delgado escribe:</span>
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium font-sans leading-normal">
                      {quoteStep === 1 && (
                        <>¡Hola! Qué gusto saludarte. Soy Sofía, tu asesora virtual de Colmedikal. Para empezar, indícame tu información de contacto y selecciona si cotizas un plan de salud <strong>Individual</strong>, <strong>Familiar</strong> o <strong>Corporativo</strong>. ¡Me encargaré de diseñar tu propuesta ideal!</>
                      )}
                      {quoteStep === 2 && (
                        <>¡Perfecto, {firstName || 'estimado(a)'}! He registrado tus datos de contacto iniciales. Ahora necesitaremos que indiques tu documento de identidad para realizar el pre-registro digital en Colmedikal de manera 100% segura y confidencial.</>
                      )}
                      {quoteStep === 3 && planType === 'individual' && (
                        <>Excelente, {firstName}. ¿Deseas añadir cónyuge o hijos? El Plan Colectivo Llave en Mano ofrece tarifas muy reducidas cuando se consolida para un grupo familiar de 3 o más personas.</>
                      )}
                      {quoteStep === 3 && planType === 'corporativo' && (
                        <>Excelente decisión empresarial, {firstName}. El volumen corporativo nos permite aplicar importantes descuentos de escala grupal. Indícame cuántas personas conformarán el colectivo.</>
                      )}
                    </p>
                    
                    {/* Micro indicators like typing dots for dynamic feedback */}
                    <div className="flex gap-1 pt-0.5 items-center">
                      <span className="w-1.2 h-1.2 bg-teal-500 rounded-full animate-bounce"></span>
                      <span className="w-1.2 h-1.2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.2 h-1.2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[9px] text-slate-400 font-mono ml-1 font-medium select-none">Pensando...</span>
                    </div>
                  </div>
                </div>

                {/* Steps Navigator */}
                <div className="bg-sky-950/25 p-4 rounded-2xl border border-sky-900/30 space-y-3">
                  <span className="block text-[9px] font-black uppercase tracking-wider text-sky-300/80 font-mono">Progreso de la Asesoría</span>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">Formulación Digital</span>
                      <span className="font-mono text-[9.5px] text-sky-300 font-bold animate-pulse">
                        Paso {quoteStep} de {planType === 'masivo' ? '2' : '3'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-sky-950/60 rounded-full overflow-hidden border border-sky-900/20">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-400 via-sky-400 to-[#4597CA] transition-all duration-500 rounded-full" 
                        style={{ width: quoteStep === 1 ? '33%' : quoteStep === 2 ? '66%' : '100%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9.5px] text-slate-400 font-medium pt-0.5">
                      <span>Proceso Activo</span>
                      <span>{Math.round((quoteStep / (planType === 'masivo' ? 2 : 3)) * 100)}% Completado</span>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Trust Footer Note */}
              <div className="text-[9.5px] text-slate-350/90 leading-normal border-t border-sky-900/40 pt-4 font-sans space-y-1.5 relative z-10">
                <div className="flex items-center gap-1.5 text-sky-300 font-bold text-[10px]">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                  <span>Conexión de Datos Protegida</span>
                </div>
                <p className="leading-relaxed">Tus datos médicos y de afiliación están amparados bajo la Ley Orgánica de Protección de Datos Personales de la República de Ecuador.</p>
              </div>

            </div>

            {/* Right Column: Form interactive contents */}
            <div className="md:col-span-8 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                
                {/* INITIAL PLAN TYPE CHOICE selector (Only visible in step 1) */}
                {quoteStep === 1 && (
                  <div className="space-y-4 mb-8">
                    <span className="block text-[10px] font-black tracking-wider text-[#4597CA] uppercase font-mono">
                      Selección del Segmento de Afiliación
                    </span>
                    <div className="grid grid-cols-3 gap-3">
                      
                      <button
                        type="button"
                        onClick={() => {
                          setPlanType('masivo');
                          setDependants([]);
                          setNumberOfPeople('');
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          planType === 'masivo'
                            ? 'bg-gradient-to-br from-white to-[#4597CA]/5 border-[#4597CA] shadow-sm font-bold ring-2 ring-[#4597CA]/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Calculator className={`w-5 h-5 mb-1 ${planType === 'masivo' ? 'text-[#4597CA]' : 'text-slate-400'}`} />
                        <span className="text-[10px] uppercase font-sans tracking-tight text-slate-800 font-bold">Plan Masivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlanType('individual');
                          setNumberOfPeople('');
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          planType === 'individual'
                            ? 'bg-gradient-to-br from-white to-teal-50/5 border-teal-500 shadow-sm font-bold ring-2 ring-teal-500/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <User className={`w-5 h-5 mb-1 ${planType === 'individual' ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span className="text-[10px] uppercase tracking-tight text-slate-800 font-bold">Plan Individual</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlanType('corporativo');
                          setDependants([]);
                        }}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                          planType === 'corporativo'
                            ? 'bg-gradient-to-br from-white to-indigo-50/5 border-indigo-500 shadow-sm font-bold ring-2 ring-indigo-500/10'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Briefcase className={`w-5 h-5 mb-1 ${planType === 'corporativo' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-[10px] uppercase tracking-tight text-slate-800 font-bold">Corporativo</span>
                      </button>

                    </div>
                  </div>
                )}

                {/* STEP 1: PERSONAL DATA FIELDS FORM */}
                {quoteStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-350">
                    <span className="block text-xs font-bold text-[#0C4169] uppercase tracking-wider border-b border-slate-105 pb-1">
                      Paso 1: Datos de Contacto
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Nombre: <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Juan Andrés"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Apellido: <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Pérez Delgado"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Correo Electrónico: <span className="text-rose-500">*</span></label>
                        <input
                          type="email"
                          required
                          placeholder="Ej. juan.perez@ecuador.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">WhatsApp / Teléfono: <span className="text-rose-500">*</span></label>
                        <input
                          type="tel"
                          required
                          placeholder="Ej. 0994452211"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none font-mono"
                        />
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-slate-700">Provincia de Residencia / Proyecto: <span className="text-rose-500">*</span></label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                        >
                          {PROVINCES.map((prov, i) => (
                            <option key={i} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>
                )}

                {/* STEP 2: DOC IDENTIFICATION DATA FORM */}
                {quoteStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-350">
                    <span className="block text-xs font-bold text-[#0C4169] uppercase tracking-wider border-b border-slate-105 pb-1">
                      Paso 2: Confirmar Documento de Identidad
                    </span>

                    <div className="space-y-5">
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Seleccionar el Tipo de Documento: <span className="text-rose-500">*</span></label>
                        <div className="flex gap-6 items-center">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-755 cursor-pointer">
                            <input
                              type="radio"
                              name="docTypeCheck"
                              checked={docType === 'cedula'}
                              onChange={() => setDocType('cedula')}
                              className="w-4 h-4 text-[#4597CA] focus:ring-[#4597CA] cursor-pointer"
                            />
                            <span>Cédula de Identidad Nacional (Ecuador)</span>
                          </label>

                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-755 cursor-pointer">
                            <input
                              type="radio"
                              name="docTypeCheck"
                              checked={docType === 'pasaporte'}
                              onChange={() => setDocType('pasaporte')}
                              className="w-4 h-4 text-[#4597CA] focus:ring-[#4597CA] cursor-pointer"
                            />
                            <span>Pasaporte Regular / Diplomático</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1 max-w-md">
                        <label className="block text-xs font-bold text-slate-700">Número de Identificación: <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder={docType === 'cedula' ? 'Cédula (Ej. 1729004812)' : 'Nro Pasaporte (Ej. AA129033)'}
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs focus:ring-1 focus:ring-[#4597CA] outline-none font-mono"
                        />
                        <span className="block text-[10px] text-slate-400 mt-1">Este dato es requerido por auditoría médica de Colmedikal para corroborar compatibilidad legal.</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* STEP 3 (FOR INDIVIDUAL ONLY): FAMILY DEPENDANT CONFIG */}
                {quoteStep === 3 && planType === 'individual' && (
                  <div className="space-y-4 animate-in fade-in duration-350">
                    <div className="flex justify-between items-center border-b border-slate-105 pb-1">
                      <span className="block text-xs font-bold text-[#0C4169] uppercase tracking-wider">
                        Paso 3: Grupo Familiar Adicional
                      </span>
                      
                      <button
                        type="button"
                        onClick={addDependant}
                        className="flex items-center gap-1 bg-teal-50 text-teal-700 hover:bg-teal-100/70 border border-teal-200 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Familiar</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      
                      {/* Titular check box selector */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-xs font-bold text-slate-800">¿El cotizante {firstName} es el titular del plan?</label>
                          <p className="text-[10px] text-slate-500">Marque sí para consolidar el precio unitario preferente.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={isPrimaryTitular}
                          onChange={(e) => setIsPrimaryTitular(e.target.checked)}
                          className="w-4 h-4 text-[#4597CA] rounded focus:ring-1 focus:ring-[#4597CA] cursor-pointer"
                        />
                      </div>

                      {dependants.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <p className="text-xs text-slate-500 font-medium">No ha agregado dependientes a su cotización regular.</p>
                          <p className="text-[10.5px] text-slate-400 mt-0.5">Haga clic en "Agregar Familiar" para cotizar a su cónyuge o hijos.</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                          {dependants.map((dep, index) => (
                            <div key={dep.id} className="p-4 rounded-xl bg-teal-50/30 border border-teal-500/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center animate-in zoom-in-95 duration-150">
                              
                              <div className="md:col-span-3">
                                <span className="block text-[10px] font-bold text-[#0C4169] uppercase">Familiar #{index + 1}</span>
                              </div>

                              {/* Gender dropdown */}
                              <div className="md:col-span-3">
                                <label className="block text-[10px] text-slate-500">Género:</label>
                                <select
                                  value={dep.gender}
                                  onChange={(e) => updateDependantField(dep.id, 'gender', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white outline-none"
                                >
                                  <option value="masculino">Masculino</option>
                                  <option value="femenino">Femenino</option>
                                </select>
                              </div>

                              {/* Age Bracket */}
                              <div className="md:col-span-3">
                                <label className="block text-[10px] text-slate-500">Rango de Edad:</label>
                                <select
                                  value={dep.ageRange}
                                  onChange={(e) => updateDependantField(dep.id, 'ageRange', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white outline-none"
                                >
                                  <option value="0-17">0 a 17 años</option>
                                  <option value="18-35">18 a 35 años</option>
                                  <option value="36-49">36 a 49 años</option>
                                  <option value="50-64">50 a 64 años</option>
                                  <option value="65+">Más de 65 años</option>
                                </select>
                              </div>

                              {/* Date of Birth input */}
                              <div className="md:col-span-2">
                                <label className="block text-[10px] text-slate-500">F. Nacimiento:</label>
                                <input
                                  type="date"
                                  value={dep.birthDate}
                                  required
                                  onChange={(e) => updateDependantField(dep.id, 'birthDate', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white outline-none text-center font-mono"
                                />
                              </div>

                              <div className="md:col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeDependant(dep.id)}
                                  className="p-1 text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg transition duration-150 shadow-xs cursor-pointer inline-flex items-center justify-center"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* STEP 3 (FOR CORPORATIVE ONLY): VOLUME COLLABORATOR REQUIRED INPUT */}
                {quoteStep === 3 && planType === 'corporativo' && (
                  <div className="space-y-4 animate-in fade-in duration-350">
                    <span className="block text-xs font-bold text-[#0C4169] uppercase tracking-wider border-b border-slate-105 pb-1">
                      Paso 3: Proyección del Colectivo Institucional
                    </span>

                    <div className="p-5 bg-indigo-50/25 border border-indigo-500/10 rounded-2xl space-y-6">
                      
                      <div className="space-y-1.5 max-w-sm">
                        <label className="block text-xs font-bold text-slate-800">Número de personas para la cotización: <span className="text-rose-500">*</span></label>
                        <input
                          type="number"
                          required
                          min="3"
                          placeholder="Ej. 15"
                          value={numberOfPeople}
                          onChange={(e) => setNumberOfPeople(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <span className="block text-[10px] text-slate-400 leading-tight">Mínimo legal de 3 beneficiarios o dependientes para consolidar tasas de Plan Colectivo Llave en Mano.</span>
                      </div>

                      <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                        <p className="font-bold text-[#0C4169]">Beneficios corporativos de red unificados:</p>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                          <li>Financiamiento corporativo con tasas deducibles de Impuesto a la Renta.</li>
                          <li>Exclusiones preexistentes negociables según volumen de la cuenta.</li>
                          <li>Precios diferenciados estables por encima de los 10 inscritos directos.</li>
                        </ul>
                      </div>

                    </div>
                  </div>
                )}

              </div>

              {/* Progress Wizard Controls */}
              <div className="flex justify-between items-center border-t border-slate-150 pt-6 mt-6 shrink-0">
                
                {quoteStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-bold font-sans cursor-pointer py-2 px-3 hover:bg-slate-100 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Atrás</span>
                  </button>
                ) : (
                  <div></div> /* Balance placeholder */
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-5 py-3 text-xs bg-[#0C4169] text-white hover:bg-slate-900 font-extrabold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all active:scale-97 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Generando Cotización...</span>
                  ) : (
                    <>
                      <span>{
                        (quoteStep === 2 && planType === 'masivo') || (quoteStep === 3)
                          ? 'Finalizar y Ver Comparativa' 
                          : 'Siguiente Paso'
                      }</span>
                      <ArrowRight className="w-4 h-4 text-[#4597CA]" />
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>
        ) : (
          /* RESULT DISPLAY SCREEN GRID MODULE WITH DYNAMIC CRM FEEDBACK LOGS */
          <div className="space-y-8 animate-in zoom-in-95 duration-400" id="cotizador-results-module">
            
            {/* Header top banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-205 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1 font-sans">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#0C4169] bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full">
                  Cotización Generada Exitosamente
                </span>
                <h2 className="text-2xl font-extrabold text-[#0C4169] tracking-tight">Comparativa de Planes Diseñada para Ti</h2>
                <div className="space-y-1.5 mt-1">
                  <p className="text-xs text-slate-500 font-sans">
                    Estimación formal registrada en Colmedikal bajo el código de cotización <strong>{leadCode}</strong>
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg font-sans font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>📩 Se ha enviado una copia en PDF con esta propuesta formal al correo: <strong>{email}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResultScreen(false);
                    setQuoteStep(1);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
                >
                  Nueva Cotización
                </button>
                
                <button
                  onClick={() => setCurrentPage('home')}
                  className="px-4 py-2.5 bg-[#0C4169] text-white hover:bg-slate-900 text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
                >
                  Finalizar e Ir al Inicio
                </button>
              </div>
            </div>

            {/* If it was corporate plan type, display corporate call to action */}
            {planType === 'corporativo' ? (
              <div className="bg-[#0C4169] p-8 rounded-3xl text-white space-y-6 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute right-0 top-0 pointer-events-none z-0 opacity-15 overflow-hidden translate-x-12 -translate-y-12">
                  <svg className="w-72 h-72 text-white" fill="currentColor" viewBox="0 0 100 100">
                    <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-3 max-w-2xl">
                  <span className="text-[10px] font-bold text-sky-300 font-mono tracking-wider uppercase border border-sky-400/20 px-2.5 py-0.5 rounded bg-sky-950/30">
                    Cotización Colectiva Corporativa
                  </span>
                  
                  <h3 className="text-xl sm:text-2xl font-black font-sans leading-tight">
                    ¡Gracias por cotizar! Nuestro comercial te contactará para un plan a la medida
                  </h3>
                  
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    Hemos registrado tu solicitud de cotización para el proyecto de <strong>{numberOfPeople} personas</strong> corporativas en la provincia de {province}. Tu ejecutivo comercial asignado es <strong>{assignedRep}</strong>, quien formulará una propuesta integral llave en mano con tarifas preferenciales y descuentos de escala.
                  </p>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 relative z-10 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-mono">Territorio Asignado:</span>
                    <span className="text-white font-bold block">{province}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-mono">Colaboradores Proyectados:</span>
                    <span className="text-white font-bold block">{numberOfPeople} Integrantes</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-mono">Canal Comercial:</span>
                    <span className="text-sky-300 font-bold block">1800-COLMED Premium Account</span>
                  </div>
                </div>
              </div>
            ) : (
              /* OTHERWISE: Plan Masivo or Plan Individual results comparison grid */
              <div className="space-y-8">
                {selectedPlanToBuy ? (
                  /* ACTIVE CONTRACTING / CHECKOUT WIZARD FLOW */
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Checkout Header */}
                    <div className="bg-[#0C4169] p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-sky-300" />
                          <span className="text-[10px] font-mono tracking-widest text-sky-200 uppercase font-bold">
                            CONTRATACIÓN DIRECTA SEGURA
                          </span>
                        </div>
                        <h3 className="text-xl font-bold font-sans">
                          Suscripción Inmediata - {selectedPlanToBuy.name}
                        </h3>
                        <p className="text-xs text-sky-100">
                          Afiliado Titular: <strong className="text-white">{firstName} {lastName}</strong> • Referencia: {leadCode}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPlanToBuy(null);
                          setCheckoutStep(1);
                        }}
                        className="p-2 px-3 bg-white/10 hover:bg-white/20 hover:text-white rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Volver a Planes</span>
                      </button>
                    </div>

                    {/* Checkout Progress Steps Bar */}
                    <div className="bg-slate-50 border-b border-slate-150 p-4 px-6 flex justify-between items-center text-xs text-slate-500 font-bold font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 2 ? 'bg-[#0c4169] text-white font-mono' : 'bg-emerald-100 text-emerald-800'}`}>1</span>
                        <span className={checkoutStep === 2 ? 'text-[#0c4169]' : 'text-slate-500'}>1. Declaración y Firma Jurada</span>
                      </div>
                      <div className="w-16 sm:w-24 h-px bg-slate-300"></div>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${checkoutStep === 3 ? 'bg-[#0c4169] text-white font-mono' : 'bg-slate-200 text-slate-500'}`}>2</span>
                        <span className={checkoutStep === 3 ? 'text-[#0c4169]' : 'text-slate-500'}>2. Certificado & Descargas</span>
                      </div>
                    </div>

                    {/* Step Body */}
                    <div className="p-6 sm:p-8">
                      {checkoutStep === 1 && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            
                            {/* Summary side */}
                            <div className="md:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                              <h4 className="text-xs font-black uppercase tracking-wider text-[#0C4169] font-mono">Resumen de Cobertura</h4>
                              
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                                  <span className="text-slate-550">Plan Elegido:</span>
                                  <span className="font-extrabold text-slate-900">{selectedPlanToBuy.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                                  <span className="text-slate-550">Gastos Hosp.:</span>
                                  <span className="font-extrabold text-slate-900">{selectedPlanToBuy.cobertura}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                                  <span className="text-slate-550">Deducible Hospital:</span>
                                  <span className="font-semibold text-slate-800">{selectedPlanToBuy.dedHosp}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                                  <span className="text-slate-550">Maternidad Titular:</span>
                                  <span className="font-semibold text-slate-800">{selectedPlanToBuy.maternidad}</span>
                                </div>
                                <div className="flex justify-between pb-1.5">
                                  <span className="text-slate-550">Provincia:</span>
                                  <span className="font-semibold text-slate-800">{province}</span>
                                </div>
                              </div>

                              {/* Frequency Choice */}
                              <div className="space-y-2 pt-2">
                                <label className="block text-[11px] font-black text-[#0c4169] uppercase tracking-wide">Frecuencia de Recaudación:</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPaymentFrequency('mensual')}
                                    className={`p-2.5 rounded-xl border text-xs text-center font-bold tracking-tight transition cursor-pointer ${paymentFrequency === 'mensual' ? 'border-[#0C4169] bg-[#0c4169]/5 text-[#0C4169]' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                  >
                                    <span>Mensual Recurrente</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentFrequency('anual')}
                                    className={`p-2.5 rounded-xl border text-xs text-center font-bold tracking-tight transition cursor-pointer ${paymentFrequency === 'anual' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                                  >
                                    <span className="block text-[8px] uppercase tracking-widest font-black text-emerald-600">Ahorra 10%</span>
                                    <span>Pago Anual Único</span>
                                  </button>
                                </div>
                              </div>

                              {/* Cost Calculations */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 pt-3 shadow-inner">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold block">Prima de Suscripción</span>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <span className="text-3xl font-black text-slate-900 font-mono">
                                    ${paymentFrequency === 'mensual' 
                                      ? calculateDynamicPrice(selectedPlanToBuy.basePrice)
                                      : Math.round(calculateDynamicPrice(selectedPlanToBuy.basePrice) * 12 * 0.9 * 100) / 100
                                    }
                                  </span>
                                  <span className="text-xs text-slate-500 font-bold">USD</span>
                                  <span className="text-slate-400 text-[10px] pl-1 font-sans">
                                    {paymentFrequency === 'mensual' ? 'al mes' : 'única anual'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Payment Inputs */}
                            <div className="md:col-span-7 space-y-5">
                              <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-800">Canal de Débito Bancario de la Red:</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cuenta')}
                                    className={`flex-1 p-3.5 border rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${paymentMethod === 'cuenta' ? 'border-[#0C4169] bg-[#0c4169]/5 font-bold ring-2 ring-[#0c4169]/10' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                  >
                                    <input
                                      type="radio"
                                      checked={paymentMethod === 'cuenta'}
                                      readOnly
                                      className="w-4 h-4 text-[#0C4169]"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-slate-800 font-bold">Débito Bancario Directo</span>
                                      <span className="text-[10px] text-slate-400 font-normal">Soporte Ahorros / Corriente (Sin Costo)</span>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setPaymentMethod('tarjeta')}
                                    className={`flex-1 p-3.5 border rounded-2xl flex items-center gap-2.5 transition text-left cursor-pointer ${paymentMethod === 'tarjeta' ? 'border-[#0C4169] bg-[#0c4169]/5 font-bold ring-2 ring-[#0c4169]/10' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                                  >
                                    <input
                                      type="radio"
                                      checked={paymentMethod === 'tarjeta'}
                                      readOnly
                                      className="w-4 h-4 text-[#0C4169]"
                                    />
                                    <div className="flex flex-col">
                                      <span className="text-xs text-slate-800 font-bold">Tarjeta de Crédito</span>
                                      <span className="text-[10px] text-slate-400 font-normal">Visa, Mastercard, Amex, Diners</span>
                                    </div>
                                  </button>
                                </div>
                              </div>

                              {paymentMethod === 'cuenta' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
                                  <div className="col-span-1 sm:col-span-2 space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">Banco del Afiliado: <span className="text-rose-500">*</span></label>
                                    <select
                                      value={bankName}
                                      onChange={(e) => setBankName(e.target.value)}
                                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0C4169]"
                                    >
                                      <option value="">-- Seleccionar Institución Financiera --</option>
                                      <option value="Banco Pichincha">Banco Pichincha</option>
                                      <option value="Banco Guayaquil">Banco Guayaquil</option>
                                      <option value="Produbanco">Produbanco (Promerica)</option>
                                      <option value="Banco del Pacífico">Banco del Pacífico</option>
                                      <option value="Banco Internacional">Banco Internacional</option>
                                      <option value="Banco Bolivariano">Banco Bolivariano</option>
                                      <option value="Cooperativa JEP">Cooperativa JEP</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">Tipo de Cuenta: <span className="text-rose-500">*</span></label>
                                    <select
                                      value={accountType}
                                      onChange={(e) => setAccountType(e.target.value as any)}
                                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#0C4169]"
                                    >
                                      <option value="ahorros">Cuenta de Ahorros</option>
                                      <option value="corriente">Cuenta Corriente</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">Número de Cuenta Bancaria: <span className="text-rose-500">*</span></label>
                                    <input
                                      type="text"
                                      placeholder="Ej. 2200481234"
                                      value={accountNumber}
                                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-[#0C4169]"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in fade-in duration-200">
                                  <div className="space-y-1">
                                    <label className="block text-xs font-bold text-slate-700">Titular impreso en la tarjeta: <span className="text-rose-500">*</span></label>
                                    <input
                                      type="text"
                                      placeholder="Ej. JUAN A PEREZ DELGADO"
                                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none uppercase focus:ring-1 focus:ring-[#0C4169]"
                                    />
                                  </div>

                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2 space-y-1">
                                      <label className="block text-xs font-bold text-slate-700">Número de Tarjeta de Crédito: <span className="text-rose-500">*</span></label>
                                      <input
                                        type="text"
                                        maxLength={16}
                                        placeholder="4111 2222 3333 4444"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none font-mono focus:ring-1 focus:ring-[#0C4169]"
                                      />
                                    </div>

                                    <div className="space-y-1">
                                      <label className="block text-xs font-bold text-slate-700">Vence (MM/AA): <span className="text-rose-500">*</span></label>
                                      <input
                                        type="text"
                                        placeholder="12/29"
                                        value={cardExpiry}
                                        onChange={(e) => setCardExpiry(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none text-center font-mono focus:ring-1 focus:ring-[#0C4169]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">Fecha de Inicio de Cobertura de Salud:</label>
                                <input
                                  type="date"
                                  value={coverageStartDate}
                                  onChange={(e) => setCoverageStartDate(e.target.value)}
                                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none font-mono bg-white focus:ring-1 focus:ring-[#0C4169] cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-400">Los 30 días reglamentarios de carencia asistencial ambulatoria se computarán desde esta fecha calendarizada.</p>
                              </div>

                            </div>

                          </div>

                          <div className="border-t border-slate-150 pt-6 flex justify-between">
                            <button
                              type="button"
                              onClick={() => setSelectedPlanToBuy(null)}
                              className="px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Volver a la Comparativa
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (paymentMethod === 'cuenta' && (!bankName || !accountNumber)) {
                                  alert('Por favor complete la selección de su Entidad Bancaria y el Número de Cuenta.');
                                  return;
                                }
                                if (paymentMethod === 'tarjeta' && (!cardNumber || cardNumber.length < 15)) {
                                  alert('Por favor complete los datos válidos de su Tarjeta de Crédito de Red.');
                                  return;
                                }
                                setCheckoutStep(2);
                              }}
                              className="px-6 py-2.5 bg-[#0C4169] text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <span>Confirmar Cuenta de Pago</span>
                              <ArrowRight className="w-4 h-4 text-[#4597CA]" />
                            </button>
                          </div>
                        </div>
                      )}

                      {checkoutStep === 2 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                          <div className="p-5 bg-teal-50/40 border border-teal-200 rounded-2xl space-y-4">
                            <h4 className="text-xs font-black text-teal-900 uppercase tracking-wide flex items-center gap-2 font-mono">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                              <span>Consentimiento y Declaración Médica</span>
                            </h4>

                            <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-sans">
                              
                              <label className="flex items-start gap-3 p-3 bg-white border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50/20 transition">
                                <input
                                  type="checkbox"
                                  checked={carenciasAccepted}
                                  onChange={(e) => setCarenciasAccepted(e.target.checked)}
                                  className="w-4 h-4 mt-0.5 rounded text-teal-600 border-teal-300 focus:ring-teal-500 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 block">Suscripción y Periodos de Carencia:</span>
                                  <p className="text-[10.5px] text-slate-500 leading-normal">
                                    Acepto expresamente el periodo de <strong>30 días de carencia</strong> para consultas de medicina externa y red ágil, así como <strong>90 días</strong> para cirugías programadas, hospitalización y el desembolso del bono de maternidad.
                                  </p>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 bg-white border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50/20 transition">
                                <input
                                  type="checkbox"
                                  checked={healthDeclaration}
                                  onChange={(e) => setHealthDeclaration(e.target.checked)}
                                  className="w-4 h-4 mt-0.5 rounded text-teal-600 border-teal-300 focus:ring-teal-500 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 block">Condición Preexistente:</span>
                                  <p className="text-[10.5px] text-slate-500 leading-normal">
                                    Declaro no contar con cirugías mayores pendientes u hospitalización activa para patologías crónicas no notificadas en mi expediente. Las dolencias previas se cubren tras 24 meses de aportes continuos.
                                  </p>
                                </div>
                              </label>

                              <label className="flex items-start gap-3 p-3 bg-white border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50/20 transition">
                                <input
                                  type="checkbox"
                                  checked={signatureAccepted}
                                  onChange={(e) => setSignatureAccepted(e.target.checked)}
                                  className="w-4 h-4 mt-0.5 rounded text-teal-600 border-teal-300 focus:ring-teal-500 cursor-pointer"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 block">Autorización de Recaudación y Vademécum:</span>
                                  <p className="text-[10.5px] text-slate-500 leading-normal">
                                    Autorizo a efectuar el débito bancario correspondiente y ratifico que conozco que el 100% de cobertura en medicamentos requiere prescripción médica de red y retiro en Fybeca, Medicity, Sana Sana o Económicas.
                                  </p>
                                </div>
                              </label>

                            </div>
                          </div>

                          {/* Digital Signature Panel */}
                          <div className="space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Firma Autógrafa Autorizada:</label>
                            
                            <div className="bg-white border border-slate-250 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 shadow-inner min-h-[140px] relative overflow-hidden">
                              {signatureText ? (
                                <div className="text-center font-serif text-3xl text-[#0C4169] border-b border-sky-200 pb-2 w-full max-w-xs italic opacity-90 select-none antialiased">
                                  {signatureText}
                                </div>
                              ) : (
                                <p className="text-slate-400 text-xs italic">Escriba su firma digital colocando su nombre completo abajo</p>
                              )}
                              <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[8.5px] font-mono text-slate-405 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>SECURE KEY: {leadCode}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-450 uppercase font-mono tracking-wider font-bold">Firma Digital (Escriba su Nombre y Apellido):</span>
                              <input
                                type="text"
                                placeholder="Coloque su firma aquí"
                                value={signatureText}
                                onChange={(e) => setSignatureText(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none font-bold text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPlanToBuy(null);
                                setCheckoutStep(1);
                              }}
                              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              Volver a Planes
                            </button>

                            <button
                              type="button"
                              disabled={isContracting || !signatureAccepted || !carenciasAccepted || !healthDeclaration || !signatureText}
                              onClick={() => {
                                setIsContracting(true);
                                setTimeout(() => {
                                  setIsContracting(false);
                                  setCheckoutStep(3);
                                }, 1800);
                              }}
                              className="px-6 py-3 bg-[#0C4169] disabled:bg-slate-300 disabled:cursor-not-allowed text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              {isContracting ? (
                                <>
                                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Procesando Contrato...</span>
                                </>
                              ) : (
                                <>
                                  <span>Legalizar y Firmar Contrato</span>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {checkoutStep === 3 && (
                        <div className="space-y-8 max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
                          
                          {/* Printable Premium Digital Certificate Block */}
                          <div className="bg-[#0C4169] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl border-4 border-slate-100 relative overflow-hidden">
                            <div className="absolute -right-12 -bottom-12 pointer-events-none opacity-10">
                              <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 100 100">
                                <path d="M 38 10 H 62 V 38 H 90 V 62 H 62 V 90 H 38 V 62 H 10 V 38 H 38 Z" />
                              </svg>
                            </div>

                            {/* Top Certificate Header */}
                            <div className="flex justify-between items-start border-b border-white/25 pb-4 relative z-10">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-mono tracking-widest text-[#4597CA] bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded font-black">
                                  CERTIFICADO DIGITAL DE AFILIACIÓN DE RED
                                </span>
                                <h4 className="text-xl font-black font-sans tracking-tight">Colmedikal, Medicina Prepagada S.A.</h4>
                              </div>
                              <Logo className="h-8 w-auto text-white" isDarkBg={true} />
                            </div>

                            {/* Core Certificate Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 text-xs font-sans leading-relaxed text-sky-100">
                              <div className="space-y-2">
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Asegurado Titular:</strong> {firstName} {lastName}</p>
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Tipo de Documento:</strong> {docType.toUpperCase()}: {docNumber}</p>
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Programa Activo:</strong> {selectedPlanToBuy.name} de Red Directa</p>
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Residencia / Provincia:</strong> {province}</p>
                              </div>

                              <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-white/10 font-sans text-sky-100">
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Suscripción CUC:</strong> <span className="font-mono text-yellow-350">{leadCode}-AF-SECURE</span></p>
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Inicio de Cobertura de Plan:</strong> {new Date(coverageStartDate).toLocaleDateString('es-EC', {day: '2-digit', month: 'long', year: 'numeric'})}</p>
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Límite Global de Gastos Hospitalarios:</strong> {selectedPlanToBuy.cobertura} por evento</p>
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Frecuencia Débito:</strong> {paymentFrequency === 'mensual' ? 'Mensual Recurrente' : 'Anual pagado completo'}</p>
                              </div>
                            </div>

                            {/* Footer Sign labels */}
                            <div className="border-t border-white/15 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px] relative z-10 font-mono text-slate-350">
                              <div className="space-y-1">
                                <p className="text-slate-400 font-sans">Suscripción Electrónica Firmada por:</p>
                                <p className="text-white font-serif text-lg italic tracking-wide">{signatureText}</p>
                                <p className="text-[8.5px] text-slate-500">Autorización legalizada bajo Ley de Comercio Electrónico de Ecuador</p>
                              </div>
                            </div>

                          </div>

                          {/* Unique PDF Quote download and email panel */}
                          <div className="bg-emerald-50 border border-emerald-150 p-6 rounded-2xl space-y-4 font-sans text-xs">
                            <div className="flex items-start gap-3">
                              <span className="p-2 bg-emerald-500 text-white rounded-xl shadow-md shrink-0">
                                <FileCheck className="w-5 h-5 text-teal-105" />
                              </span>
                              <div className="space-y-1.5 flex-grow text-slate-800">
                                <h4 className="font-extrabold text-emerald-950 text-sm">¡Propuesta Emitida y Comprobante Digital Listo!</h4>
                                <p className="text-emerald-800 leading-normal font-medium">
                                  Su cotización formal ha sido compilada con un <strong className="text-emerald-900 font-bold">formato único oficial de Colmedikal</strong>. Se ha enviado un correo electrónico de bienvenida de parte de <strong className="text-slate-900">Colmedikal</strong> con los detalles completos y la propuesta de Medicina Prepagada en formato PDF adjunto a su casilla: <strong className="text-slate-900 font-black">{email}</strong>.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3 pt-1">
                              <button
                                onClick={() => {
                                  generateQuotePDF({
                                    leadCode: leadCode,
                                    fullName: `${firstName} ${lastName}`,
                                    email: email,
                                    phone: phone,
                                    docNumber: docNumber || '1712345678',
                                    docType: docType || 'cedula',
                                    planName: selectedPlanToBuy.name,
                                    basePrice: selectedPlanToBuy.basePrice,
                                    finalPrice: calculateDynamicPrice(selectedPlanToBuy.basePrice),
                                    province: province,
                                    coverageStartDate: coverageStartDate,
                                    dependents: dependants.map(d => ({
                                      relation: getDependantAgeLabel(d.ageRange),
                                      age: d.ageRange === '0-17' ? 10 : d.ageRange === '18-35' ? 25 : d.ageRange === '36-49' ? 42 : d.ageRange === '50-64' ? 58 : 70
                                    })),
                                    hospitalNetwork: selectedPlanToBuy.cobertura ? 'Red Cobertura Directa Colmedikal' : 'Red Sede Principal',
                                    maxCoverage: selectedPlanToBuy.cobertura,
                                    dedHosp: selectedPlanToBuy.dedHosp,
                                    signatureText: signatureText,
                                    features: selectedPlanToBuy.caracteristicas || []
                                  });
                                }}
                                className="flex items-center gap-2 p-3 px-5 bg-[#0C4169] text-white hover:bg-slate-900 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow transition"
                              >
                                <Download className="w-4 h-4 text-sky-200" />
                                <span>Descargar Cotización (PDF Único)</span>
                              </button>

                              <button
                                onClick={() => {
                                  alert(`Se ha despachado un nuevo correo electrónico formal de servicio al usuario con el adjunto PDF a: ${email}`);
                                }}
                                className="p-3 px-5 bg-white border border-slate-205 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition"
                              >
                                Re-enviar por Correo Electrónico
                              </button>
                            </div>
                          </div>

                          {/* How to use guidelines */}
                          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex gap-2 items-center text-[#0C4169] font-black uppercase text-xs tracking-wider border-b border-slate-200 pb-2">
                              <HelpCircle className="w-5 h-5 text-[#4597CA]" />
                              <span>Guía de Uso Directo de su Plan de Medicina Prepagada</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed font-sans">
                              
                              <div className="space-y-2">
                                <h5 className="font-extrabold text-[#0C4169] text-xs">🩺 Coordinación de Consultas del Plan</h5>
                                <p>
                                  Goza de 8 consultas de medicina general y especialidades al año por asegurado abonando solamente su copago directo de <strong>$15,00 USD</strong>. Llame o escriba para agendar consultas dentro de la red:
                                </p>
                                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-1 mt-1 font-bold text-slate-800 text-[10.5px]">
                                  <p>📞 Central Fija: 022 567191</p>
                                  <p>💬 WhatsApp Red: 0987028756 - 0981975410</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h5 className="font-extrabold text-[#0C4169] text-xs">💊 Farmacias Aliadas para Medicina al 100%</h5>
                                <p>
                                  Retire sus medicamentos recetados por médicos de la red 100% cubiertos (sin pagar excedentes) en los siguientes puntos indicando su documento de identidad y CUC del certificado:
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-black text-[9.5px]">Medicity</span>
                                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-black text-[9.5px]">Fybeca</span>
                                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-black text-[9.5px]">Sana Sana</span>
                                  <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-black text-[9.5px]">Farmacias Económicas</span>
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Final Buttons */}
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={() => {
                                setSelectedPlanToBuy(null);
                                setShowResultScreen(false);
                                setQuoteStep(1);
                              }}
                              className="px-8 py-3 bg-[#0C4169] text-white hover:bg-slate-900 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md transition hover:scale-101"
                            >
                              Finalizar Contratación
                            </button>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  /* COMPARATIVE PLANS GRID */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch font-sans">
                    {plansComparativo.map((plan) => (
                      <div 
                        key={plan.id}
                        className="bg-white rounded-3xl border border-slate-200 hover:border-[#4597CA] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                      >
                        
                        {/* Header tier info */}
                        <div className="p-6 sm:p-7 space-y-4 border-b border-slate-100 flex-grow">
                          <div>
                            {plan.id === 'plan2' && (
                              <span className="inline-block bg-teal-50 border border-teal-250 text-teal-700 font-extrabold text-[8.5px] uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2">
                                Elección Recomendada
                              </span>
                            )}
                            <h3 className="text-lg font-black text-[#0C4169]">{plan.name}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Asistencia médica familiar Colmedikal</p>
                          </div>

                          {/* Pricing block */}
                          <div className="py-2.5 border-t border-b border-slate-50 flex justify-between items-baseline">
                            <div>
                              <span className="text-slate-400 text-[9px] block leading-none font-black tracking-wider uppercase font-mono">VALOR CONTRATACIÓN</span>
                              <span className="text-3xl font-black font-mono text-[#0C4169] tracking-tight">
                                ${calculateDynamicPrice(plan.basePrice)}
                              </span>
                              <span className="text-slate-500 text-xs font-semibold">/mes</span>
                            </div>
                            {dependants.length > 0 && (
                              <div className="text-right">
                                <span className="text-slate-400 text-[9px] block leading-none font-mono uppercase tracking-wider font-bold">BASE</span>
                                <span className="text-xs font-bold text-slate-700 font-mono">${plan.basePrice}.00</span>
                              </div>
                            )}
                          </div>

                          {/* Coverages table details */}
                          <div className="space-y-2 text-[11px] text-slate-700 font-sans border-b border-slate-100 pb-3">
                            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
                              <span className="text-slate-450 text-[10px]">Límite por Evento:</span>
                              <span className="font-extrabold text-slate-800 text-right">{plan.cobertura}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
                              <span className="text-slate-450 text-[10px]">Deducible Hospitalización:</span>
                              <span className="font-semibold text-slate-800 text-right">{plan.dedHosp}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
                              <span className="text-emerald-700 font-bold text-[10px]">Bono Maternidad:</span>
                              <span className="font-semibold text-slate-800 text-right">{plan.maternidad}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
                              <span className="text-slate-450 text-[10px]">Muerte por Accidente:</span>
                              <span className="font-semibold text-slate-800 text-right">{plan.muerteAccidente}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
                              <span className="text-slate-450 text-[10px]">Sepelio por Accidente:</span>
                              <span className="font-semibold text-slate-800 text-right">{plan.sepelio}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-50/50">
                              <span className="text-slate-450 text-[10px]">Ambulancias Terrestres:</span>
                              <span className="font-semibold text-slate-800 text-right">{plan.ambulancia}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 font-sans">
                              <span className="text-[#4597CA] text-[10px] font-bold">Exámenes al Año (Lab/Img):</span>
                              <span className="font-semibold text-slate-850 text-right">Hasta ${parseInt(plan.laboratorio.replace(/\D/g, '')) + parseInt(plan.imagen.replace(/\D/g, ''))}.00</span>
                            </div>
                          </div>

                          {/* Specialties Matrix */}
                          <div className="space-y-2 pt-2">
                            <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">
                              Especialidades Cubiertas:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10.5px]">
                              {Object.entries(plan.especialidades).map(([spec, inc]) => (
                                <div 
                                  key={spec} 
                                  className={`flex items-start gap-1.5 px-2 py-1 rounded-md border transition-all duration-300 ${
                                    inc 
                                      ? 'bg-emerald-50/50 border-emerald-100/75 text-slate-800' 
                                      : 'bg-slate-50/60 border-slate-100 text-slate-400 line-through decoration-slate-200'
                                  }`}
                                >
                                  {inc ? (
                                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 animate-in fade-in zoom-in-50">
                                      <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                                    </span>
                                  ) : (
                                    <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                                      <X className="w-2.5 h-2.5 stroke-[3.5]" />
                                    </span>
                                  )}
                                  <span className={`text-[9.5px] font-bold leading-tight ${inc ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
                                    {spec}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="space-y-2 pt-3 border-t border-slate-100">
                            <span className="block text-[9px] font-black tracking-widest text-slate-450 uppercase font-mono">Beneficios Destacados:</span>
                            <ul className="space-y-1 text-[11px] text-slate-600 leading-normal">
                              {plan.caracteristicas.map((feat, idx) => (
                                <li key={idx} className="flex gap-1.5 items-start">
                                  <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                        </div>

                        {/* Bottom CTA container */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2 font-sans">
                          <button
                            onClick={() => {
                              setSelectedPlanToBuy(plan);
                              setCheckoutStep(2); // Skip Step 1 (payment) and go directly to Step 2 (Declaration)
                            }}
                            className="w-full py-3 rounded-xl bg-[#0C4169] hover:bg-slate-900 text-xs font-black uppercase tracking-wider text-center cursor-pointer shadow hover:shadow-md transition active:scale-97 text-white"
                          >
                            Contratar Este Plan
                          </button>
                          
                          <button
                            onClick={() => {
                              generateQuotePDF({
                                leadCode: 'PRE-' + Math.floor(Math.random() * 900000 + 100000),
                                fullName: `${firstName} ${lastName}`,
                                email: email,
                                phone: phone,
                                docNumber: docNumber || '1712345678',
                                docType: docType || 'cedula',
                                planName: plan.name,
                                basePrice: plan.basePrice,
                                finalPrice: calculateDynamicPrice(plan.basePrice),
                                province: province,
                                coverageStartDate: coverageStartDate,
                                dependents: dependants.map(d => ({
                                  relation: getDependantAgeLabel(d.ageRange),
                                  age: d.ageRange === '0-17' ? 10 : d.ageRange === '18-35' ? 25 : d.ageRange === '36-49' ? 42 : d.ageRange === '50-64' ? 58 : 70
                                })),
                                hospitalNetwork: plan.cobertura ? 'Red Cobertura Directa Colmedikal' : 'Red Sede Principal',
                                maxCoverage: plan.cobertura,
                                dedHosp: plan.dedHosp,
                                features: plan.caracteristicas || []
                              });
                            }}
                            className="w-full py-2 cursor-pointer bg-white border border-slate-205 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center justify-center gap-1.5 transition rounded-xl"
                          >
                            <Download className="w-3.5 h-3.5 text-[#4597CA]" />
                            <span>Descargar Cotización (PDF)</span>
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Discretion-free simple footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Colmedikal - Módulo de Cotización Independiente Protegido. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
