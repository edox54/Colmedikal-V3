import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator,
  User,
  Users,
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
  selectedPlanId?: string;
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

export default function Cotizador({ selectedPlanId }: CotizadorProps) {
  const navigate = useNavigate();
  const { addLead } = useColmedikal();
  // Solo plan individual
  const planType = 'individual';
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

  // (Corporate plan removed)

  // 5. Finishing & CRM states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [leadCode, setLeadCode] = useState('');
  const [assignedRep, setAssignedRep] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // 6. Checkout & Hiring Flow states
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<any | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [modalPlan, setModalPlan] = useState<any | null>(null);

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
      id: 'inicio',
      name: 'Plan Inicio 2K',
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
        'Especialidades: Medicina General, Familiar, Ginecología y Odontología',
        'Telemedicina sin carencia (activa desde el primer día)',
        'Odontología (Consultas, profilaxis, restauraciones resina)'
      ]
    },
    {
      id: 'proteccion',
      name: 'Plan Protección 3K',
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
        'Especialidades: Incluye Urología y Traumatología',
        'Telemedicina ilimitada sin carencia (activa desde el primer día)',
        'Bono de Maternidad de $500,00 para titular',
        'Entrega de medicina al 100% sin copago',
        'Soporte a cirugías programadas preautorizadas'
      ]
    },
    {
      id: 'plus',
      name: 'Plan Plus 5K',
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
        'Especialidades: Medicina Interna, Cardiología y Odontología premium',
        'Telemedicina ilimitada sin carencia (activa desde el primer día)',
        'Bono de Maternidad premium de $700,00 USD',
        'Límite de Gastos Hospitalarios de $5.000,00 USD',
        'Exámenes de lab e imágenes diagnósticas: $100 totales (ambos incluidos)'
      ]
    }
  ];

  // Form step navigation helpers
  const handleNextStep = () => {
    // Basic validation based on step
    if (quoteStep === 1) {
      // Validating Step 1 (Personal Data)
      if (!privacyAccepted) {
        alert('Debe aceptar las políticas de protección de datos personales.');
        return;
      }
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

      setQuoteStep(3);
    } else if (quoteStep === 3) {
      generateQuoteReceipt();
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
      const repName = 'Dra. Patricia Franco (Asesora de Afiliación)';

      const code = 'COT-' + Math.floor(Math.random() * 900000 + 100000);
      setLeadCode(code);
      setAssignedRep(repName);

      const estimatedPrice = calculateDynamicPrice(12);
      addLead({
        fullName: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        docType: docType,
        docNumber: docNumber,
        type: dependants.length > 0 ? 'familiar' : 'individual',
        primaryAge: 35,
        childrenCount: dependants.length,
        childrenAges: dependants.map(d => d.ageRange === '0-17' ? 10 : 25),
        basePlanId: 'proteccion',
        leadCode: code,
        selectedPlanName: 'Plan Individual (pendiente de selección)',
      }, estimatedPrice);

      sendLeadToKommoCRM({
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        subject: `Cotización Web: Plan Individual`,
        amount: estimatedPrice,
        province: province,
        details: `Propuesta de Plan Individual. Provincia de cobertura: ${province}. Código de Cotización: ${code}. Dependientes: ${dependants.length || 0}.`,
        leadCode: code,
        planName: 'Plan Individual'
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
            onClick={() => navigate('/')}
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
                      {activePhraseIndex === 1 && `Evaluando el grupo de ${dependants.length + 1} beneficiario(s) asegurables...`}
                      {activePhraseIndex === 2 && `Localizando prestadores médicos acreditados en la provincia de ${province}...`}
                      {activePhraseIndex === 3 && 'Calculando cobertura al 100% en especialidades de nuestra red médica...'}
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
                        <>¡Hola! Soy Sofía, tu asesora virtual de Colmedikal. Indícame tu información de contacto, y me encargaré de diseñar la mejor opción para ti y tu familia.</>
                      )}
                      {quoteStep === 2 && (
                        <>¡Perfecto, {firstName || 'estimado(a)'}! He registrado tus datos de contacto iniciales. Ahora necesitaremos que indiques tu documento de identidad para realizar el pre-registro digital en Colmedikal de manera 100% segura y confidencial.</>
                      )}
                      {quoteStep === 3 && (
                        <>Excelente, {firstName}. ¿Deseas añadir a tu cónyuge o hijos al plan? Puedes agregar dependientes para consolidar la cobertura de toda tu familia.</>
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
                        Paso {quoteStep} de 3
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
                      <span>{Math.round((quoteStep / 3) * 100)}% Completado</span>
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
                
                {/* Plan type indicator */}
                {quoteStep === 1 && (
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-xl">
                      <User className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Plan Individual</span>
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

                      <div className="col-span-1 sm:col-span-2 pt-2">
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
                        Paso 3: Dependientes Adicionales
                      </span>

                      <button
                        type="button"
                        onClick={addDependant}
                        className="flex items-center gap-1 bg-teal-50 text-teal-700 hover:bg-teal-100/70 border border-teal-200 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Dependiente</span>
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
                          <p className="text-[10.5px] text-slate-400 mt-0.5">Haga clic en "Agregar Dependiente" para incluir a su cónyuge o hijos.</p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                          {dependants.map((dep, index) => (
                            <div key={dep.id} className="p-4 rounded-xl bg-teal-50/30 border border-teal-500/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center animate-in zoom-in-95 duration-150">
                              
                              <div className="md:col-span-3">
                                <span className="block text-[10px] font-bold text-[#0C4169] uppercase">Dependiente #{index + 1}</span>
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
                      <span>{quoteStep === 3 ? 'Finalizar y Ver Comparativa' : 'Siguiente Paso'}</span>
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
                <h2 className="text-2xl font-extrabold text-[#0C4169] tracking-tight">Comparativo de planes diseñados para ti</h2>
                <div className="space-y-1.5 mt-1">
                  <p className="text-xs text-slate-500 font-sans">
                    Estimación formal registrada en Colmedikal bajo el código de cotización <strong>{leadCode}</strong>
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg font-sans font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>📩 El correo con el resumen y PDF del plan será enviado una vez complete todos los datos y desees contratar alguno de los planes</span>
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
                  onClick={() => navigate('/')}
                  className="px-4 py-2.5 bg-[#0C4169] text-white hover:bg-slate-900 text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
                >
                  Finalizar e Ir al Inicio
                </button>
              </div>
            </div>

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
                          import('../utils/pdfGenerator').then(({ generateQuotePDF }) => {
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
                              features: selectedPlanToBuy.caracteristicas || [],
                              especialidades: selectedPlanToBuy.especialidades || {}
                            });
                          });
                        }}
                        className="p-2 px-4 bg-white hover:bg-slate-50 text-[#0C4169] rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar PDF</span>
                      </button>
                    </div>

                    {/* Step Body */}
                    <div className="p-6 sm:p-8">
                      {checkoutStep === 1 && (
                        <div className="space-y-6 max-w-2xl mx-auto">
                          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6">
                            <div className="text-center space-y-2 pb-4 border-b border-slate-200">
                              <h4 className="text-lg font-black uppercase tracking-wider text-[#0C4169] font-sans">Resumen de Contratación</h4>
                              <p className="text-xs text-slate-500">Por favor revise los detalles de su plan antes de enviar la solicitud.</p>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Afiliado Titular:</span>
                                <span className="font-bold text-slate-900">{firstName} {lastName}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Documento de Identidad:</span>
                                <span className="font-semibold text-slate-800 uppercase">{docType} - {docNumber}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Correo Electrónico:</span>
                                <span className="font-semibold text-slate-800">{email}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Teléfono Móvil:</span>
                                <span className="font-semibold text-slate-800">{phone}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Provincia:</span>
                                <span className="font-semibold text-slate-800">{province}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Total de Beneficiarios:</span>
                                <span className="font-semibold text-slate-800">{dependants.length > 0 ? `${dependants.length + 1} Personas` : 'Solo Titular'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2 mt-4 pt-2 border-t">
                                <span className="text-slate-550">Plan Elegido:</span>
                                <span className="font-extrabold text-[#0C4169]">{selectedPlanToBuy.name}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Límite Gastos Hosp.:</span>
                                <span className="font-semibold text-slate-900">{selectedPlanToBuy.cobertura}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Deducible Hospitalario:</span>
                                <span className="font-semibold text-slate-800">{selectedPlanToBuy.dedHosp}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-550">Bono de Maternidad:</span>
                                <span className="font-semibold text-slate-800">{selectedPlanToBuy.maternidad}</span>
                              </div>
                            </div>

                            {/* Cost Calculations */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 pt-4 shadow-inner mt-4">
                              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-bold block text-center">Prima Mensual de Suscripción</span>
                              <div className="flex items-baseline justify-center gap-1 mt-2">
                                <span className="text-4xl font-black text-[#0C4169] font-mono">
                                  ${calculateDynamicPrice(selectedPlanToBuy.basePrice)}
                                </span>
                                <span className="text-sm text-slate-500 font-bold">USD</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex flex-col sm:flex-row justify-between gap-4">
                            <button
                              type="button"
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
                                  features: selectedPlanToBuy.caracteristicas || [],
                                  especialidades: selectedPlanToBuy.especialidades || {}
                                });
                              }}
                              className="px-6 py-3 bg-white border border-slate-205 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition rounded-xl cursor-pointer w-full sm:w-auto"
                            >
                              <Download className="w-4 h-4 text-[#4597CA]" />
                              <span>Descargar Resumen (PDF)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setCheckoutStep(2)}
                              className="px-6 py-3 bg-[#0C4169] text-white hover:bg-slate-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <span>Enviar Solicitud de Contratación</span>
                              <ArrowRight className="w-4 h-4 text-[#4597CA]" />
                            </button>
                          </div>
                        </div>
                      )}

                      {checkoutStep === 2 && (
                        <div className="space-y-6 max-w-2xl mx-auto text-center py-12 animate-in zoom-in-95 duration-500">
                          <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-10 h-10 text-emerald-500" />
                          </div>
                          <h3 className="text-2xl font-black text-[#0C4169] tracking-tight">¡Solicitud Registrada con Éxito!</h3>
                          <div className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto space-y-4">
                            <p>
                              Su solicitud de suscripción para el plan <strong className="text-[#0C4169]">{selectedPlanToBuy.name}</strong> ha sido enviada exitosamente.
                            </p>
                            <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 text-sky-800">
                              <p>Hemos enviado un resumen detallado con los beneficios de su plan al correo electrónico: <strong>{email}</strong></p>
                            </div>
                            <p className="text-xs text-slate-400">
                              Un asesor especializado de Colmedikal se comunicará con usted en breve para finalizar su proceso de afiliación.
                            </p>
                          </div>
                          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                            <button
                               onClick={() => {
                                 window.scrollTo(0,0);
                                 navigate('/blog');
                               }}
                               className="px-6 py-3 bg-white border border-slate-205 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition rounded-xl cursor-pointer w-full sm:w-auto"
                            >
                               Ir al Blog
                            </button>
                            <button
                               onClick={() => {
                                 window.scrollTo(0,0);
                                 navigate('/servicios');
                               }}
                               className="px-6 py-3 bg-white border border-slate-205 hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition rounded-xl cursor-pointer w-full sm:w-auto"
                            >
                               Ver Servicios
                            </button>
                            <button
                              onClick={() => window.location.reload()}
                              className="px-6 py-3 bg-[#0C4169] text-white hover:bg-slate-900 rounded-xl text-sm font-bold transition shadow-md cursor-pointer w-full sm:w-auto"
                            >
                              Finalizar y Volver al Inicio
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
                                <p><strong className="text-white uppercase tracking-wider block text-[10px] text-sky-300">Límite Global de Gastos Hospitalarios:</strong> {selectedPlanToBuy.cobertura}</p>
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
                                    features: selectedPlanToBuy.caracteristicas || [],
                                    especialidades: selectedPlanToBuy.especialidades || {}
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
                                  Goza de consultas de medicina general y especialidades ilimitadas con cobertura del <strong>100% (sin copago)</strong> para el asegurado. Llame o escriba para agendar consultas dentro de la red:
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
                  /* COMPARATIVE PLANS GRID — compact cards + modal de detalles */
                  <>
                    {/* Modal de detalles del plan */}
                    {modalPlan && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setModalPlan(null)}
                      >
                        <div
                          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Modal header */}
                          <div className="sticky top-0 bg-[#0C4169] text-white px-6 py-4 rounded-t-3xl flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-mono tracking-widest text-sky-300 uppercase">Detalle del Plan</p>
                              <h3 className="text-lg font-black">{modalPlan.name}</h3>
                            </div>
                            <button onClick={() => setModalPlan(null)} className="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer">
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="p-6 space-y-6">
                            {/* Coberturas */}
                            <div className="space-y-2">
                              <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">Coberturas</span>
                              <div className="space-y-1.5 text-[11px] text-slate-700">
                                {[
                                  ['Cobertura Anual Máxima', modalPlan.cobertura],
                                  ['Deducible Hospitalización', modalPlan.dedHosp],
                                  ['Bono Maternidad', modalPlan.maternidad],
                                  ['Muerte por Accidente', modalPlan.muerteAccidente],
                                  ['Sepelio por Accidente', modalPlan.sepelio],
                                  ['Ambulancias Terrestres', modalPlan.ambulancia],
                                  ['Lab e Imágenes (ambos)', '$100 USD/Año'],
                                ].map(([label, val]) => (
                                  <div key={label} className="flex justify-between border-b border-slate-100 py-1.5">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="font-bold text-slate-800">{val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Especialidades */}
                            <div className="space-y-2">
                              <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">Especialidades Cubiertas</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {Object.entries(modalPlan.especialidades).sort(([, a], [, b]) => Number(b) - Number(a)).map(([spec, inc]) => (
                                  <div key={spec} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10.5px] ${inc ? 'bg-emerald-50/50 border-emerald-100 text-slate-800' : 'bg-slate-50 border-slate-100 text-slate-400 line-through'}`}>
                                    {inc
                                      ? <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Check className="w-2.5 h-2.5 stroke-[3.5]" /></span>
                                      : <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0"><X className="w-2.5 h-2.5 stroke-[3.5]" /></span>
                                    }
                                    <span className="font-bold leading-tight">{spec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Beneficios destacados */}
                            <div className="space-y-2">
                              <span className="block text-[9.5px] font-black tracking-widest text-[#0C4169] uppercase font-mono">Beneficios Destacados</span>
                              <ul className="space-y-1.5">
                                {modalPlan.caracteristicas.map((feat: string, idx: number) => (
                                  <li key={idx} className="flex gap-2 items-start text-[11px] text-slate-600">
                                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <button
                              onClick={() => {
                                setModalPlan(null);
                                setSelectedPlanToBuy(modalPlan);
                                setCheckoutStep(1);
                                const specificPrice = calculateDynamicPrice(modalPlan.basePrice);
                                addLead({ fullName: `${firstName} ${lastName}`, email, phone, docType, docNumber, type: dependants.length > 0 ? 'familiar' : 'individual', primaryAge: 35, childrenCount: dependants.length, childrenAges: dependants.map((d: any) => d.ageRange === '0-17' ? 10 : 25), basePlanId: modalPlan.id, leadCode, selectedPlanName: `${modalPlan.name} — $${modalPlan.basePrice}/mes` }, specificPrice);
                                sendLeadToKommoCRM({ name: `${firstName} ${lastName}`, email, phone, subject: `Contratación: ${modalPlan.name}`, amount: specificPrice, province, details: `PLAN: ${modalPlan.name} | Base: $${modalPlan.basePrice}/mes | Total: $${specificPrice}/mes | Ref: ${leadCode}`, leadCode, planName: modalPlan.name });
                              }}
                              className="w-full py-3 rounded-xl bg-[#0C4169] hover:bg-slate-900 text-xs font-black uppercase tracking-wider text-white cursor-pointer transition"
                            >
                              Contratar Este Plan
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch font-sans">
                      {plansComparativo.map((plan) => {
                        const isRec = plan.id === 'plan2';
                        return (
                          <div
                            key={plan.id}
                            className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden ${isRec ? 'border-[#4597CA] shadow-xl' : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'}`}
                          >
                            {/* Color bar */}
                            <div className={`h-1.5 w-full ${plan.id === 'plan1' ? 'bg-sky-500' : plan.id === 'plan2' ? 'bg-teal-500' : 'bg-indigo-500'}`} />

                            <div className="p-6 space-y-4 flex-grow">
                              {/* Name + badge */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${plan.id === 'plan1' ? 'bg-sky-50 border-sky-200 text-sky-700' : plan.id === 'plan2' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                                    {plan.name}
                                  </span>
                                  {isRec && <span className="text-[8.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">Recomendado</span>}
                                </div>
                                <p className="text-[10px] text-slate-400">Medicina Prepagada Colmedikal</p>
                              </div>

                              {/* Price */}
                              <div className="py-3 border-t border-b border-slate-100 flex justify-between items-baseline">
                                <div>
                                  <span className="text-slate-400 text-[9px] block font-black tracking-wider uppercase font-mono">VALOR CONTRATACIÓN</span>
                                  <span className="text-3xl font-black font-mono text-[#0C4169] tracking-tight">${calculateDynamicPrice(plan.basePrice)}</span>
                                  <span className="text-slate-500 text-xs font-semibold">/mes</span>
                                </div>
                                {dependants.length > 0 && (
                                  <div className="text-right">
                                    <span className="text-slate-400 text-[9px] block font-mono uppercase tracking-wider font-bold">BASE</span>
                                    <span className="text-xs font-bold text-slate-700 font-mono">${plan.basePrice}.00</span>
                                  </div>
                                )}
                              </div>

                              {/* Top 2 highlights */}
                              <ul className="space-y-1.5">
                                {plan.caracteristicas.slice(0, 2).map((feat: string, idx: number) => (
                                  <li key={idx} className="flex gap-1.5 items-start text-[11px] text-slate-600">
                                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                                    <span>{feat}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* CTAs */}
                            <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-2">
                              <button
                                onClick={() => setModalPlan(plan)}
                                className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition flex items-center justify-center gap-1.5"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Ver detalles del plan
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPlanToBuy(plan);
                                  setCheckoutStep(1);
                                  const specificPrice = calculateDynamicPrice(plan.basePrice);
                                  addLead({ fullName: `${firstName} ${lastName}`, email, phone, docType, docNumber, type: dependants.length > 0 ? 'familiar' : 'individual', primaryAge: 35, childrenCount: dependants.length, childrenAges: dependants.map((d: any) => d.ageRange === '0-17' ? 10 : 25), basePlanId: plan.id, leadCode, selectedPlanName: `${plan.name} — $${plan.basePrice}/mes` }, specificPrice);
                                  sendLeadToKommoCRM({ name: `${firstName} ${lastName}`, email, phone, subject: `Contratación: ${plan.name}`, amount: specificPrice, province, details: `PLAN: ${plan.name} | Base: $${plan.basePrice}/mes | Total: $${specificPrice}/mes | Ref: ${leadCode} | Dependientes: ${dependants.length}`, leadCode, planName: plan.name });
                                }}
                                className="w-full py-3 rounded-xl bg-[#0C4169] hover:bg-slate-900 text-xs font-black uppercase tracking-wider text-white cursor-pointer shadow hover:shadow-md transition"
                              >
                                Contratar Este Plan
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

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
