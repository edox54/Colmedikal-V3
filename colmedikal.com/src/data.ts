import { Plan, Testimonial, ServiceDetail } from './types';
import avatarValentina from './assets/images/avatar_valentina_1780025241348.png';
import avatarCarlosElena from './assets/images/avatar_carlos_elena_1780025264251.png';

export const MEDICAL_PLANS: Plan[] = [
  {
    id: 'basico',
    name: 'Plan Colmedikal Basico',
    tagline: 'Cobertura médica esencial ambulatoria y hospitalaria.',
    basePrice: 8.00,
    maxCoverage: 2000,
    copayPercent: 0,
    hospitalNetwork: 'Red Colmedikal',
    features: [
      'Consultas y Especialidades (Pediatría, Ginecología, Medicina Interna) con 100% de cobertura (Sin copago)',
      'Cobertura en Cuidados Intensivos hasta $2000',
      'Honorarios médicos cubiertos hasta $2000',
      'Exámenes de laboratorio e imagen elementales hasta $100',
      'Muerte por accidente y gastos de sepelio',
      'Ambulancia terrestre por accidente'
    ],
    color: 'emerald'
  },
  {
    id: 'esencial',
    name: 'Plan Colmedikal Esencial',
    tagline: 'Protección equilibrada y accesible para mayor tranquilidad.',
    basePrice: 12.00,
    maxCoverage: 3000,
    copayPercent: 0,
    hospitalNetwork: 'Red Colmedikal',
    features: [
      'Consultas y Especialidades (Pediatría, Ginecología, Urología, Traumatología) con 100% de cobertura (Sin copago)',
      'Cobertura en Cuidados Intensivos hasta $3000',
      'Honorarios médicos cubiertos hasta $3000',
      'Exámenes de laboratorio e imagen elementales hasta $100',
      'Bono de maternidad estipulado hasta $500',
      'Muerte por accidente hasta $2500 y sepelio hasta $500'
    ],
    color: 'teal'
  },
  {
    id: 'premium',
    name: 'Plan Colmedikal Premium',
    tagline: 'Máxima cobertura para ti y tu familia en toda la red.',
    basePrice: 22.00,
    maxCoverage: 5000,
    copayPercent: 0,
    hospitalNetwork: 'Red Colmedikal',
    features: [
      'Consultas y Especialidades (Pediatría, Cardiología, M. Interna, Urología, etc.) con 100% de cobertura (Sin copago)',
      'Cobertura en Cuidados Intensivos hasta $5000',
      'Honorarios médicos cubiertos hasta $5000',
      'Exámenes de laboratorio e imagen elementales hasta $100',
      'Bono de maternidad estipulado hasta $700',
      'Muerte por accidente hasta $3500 y sepelio hasta $800'
    ],
    color: 'indigo'
  }
];

export const SERVICES_LIST: ServiceDetail[] = [
  {
    id: 'consulta-externa',
    title: 'Consulta Médica Externa',
    description: 'Accede a la red de especialistas más prestigiosa del país. Elige a tu médico de cabecera en pediatría, cardiología, dermatología y más de 40 especialidades con copagos mínimos.',
    iconName: 'UserCheck',
    benefits: ['Copagos fijos reducidos', 'Agendamiento digital ágil', 'Sin largos periodos de espera']
  },
  {
    id: 'hospitalizacion',
    title: 'Hospitalización y Cirugía',
    description: 'Garantía de cobertura total en procedimientos quirúrgicos programados y de emergencia. Habitaciones privadas y atención hospitalaria de primer nivel.',
    iconName: 'BedDouble',
    benefits: ['Habitaciones privadas confortables', 'Honorarios quirúrgicos cubiertos', 'Medicamentos intrahospitalarios']
  },
  {
    id: 'emergencias-24-7',
    title: 'Emergencias 24/7 y Ambulancia',
    description: 'Servicio de teleasistencia inmediata, traslados medicalizados terrestres rápidos y atención prioritaria en salas de emergencia de las mejores clínicas del país.',
    iconName: 'Activity',
    benefits: ['Respuesta inmediata programada', 'Ambulancias de alta tecnología', 'Línea de atención exclusiva']
  },
  {
    id: 'maternidad',
    title: 'Maternidad y Control Prenatal',
    description: 'Acompañamiento integral para la futura mamá. Cubrimos desde las ecografías prenatales de control hasta el parto natural o cesárea y cuidados del recién nacido.',
    iconName: 'Baby',
    benefits: ['Monitoreo continuo del embarazo', 'Cobertura especial de neonatología', 'Obsequio de bienvenida para el bebé']
  },
  {
    id: 'odontologia',
    title: 'Odontología Preventiva',
    description: 'Limpiezas, obturaciones y tratamientos de salud dental preventiva para mantener el bienestar de tu sonrisa y la de tu familia.',
    iconName: 'Sparkles',
    benefits: ['2 limpiezas integrales gratuitas al año', 'Tarifas preferenciales en ortodoncia', 'Urgencias dentales 24h']
  },
  {
    id: 'farmacia',
    title: 'Cobertura de Farmacia',
    description: 'Convenios directos con las cadenas farmacéuticas más grandes del país para obtener tus medicamentos recetados pagando únicamente tu copago.',
    iconName: 'HeartHandshake',
    benefits: ['Descuentos de hasta el 40%', 'Entrega a domicilio disponible', 'Cobertura de enfermedades crónicas']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Dra. Valentina Mendoza',
    role: 'Odontóloga / Afiliada Individual',
    content: 'Como profesional de la salud corporal, sé lo valioso que es un soporte hospitalario veloz y confiable. Colmedikal siempre me ha dado la mejor red de respuesta y el cotizador me permitió ver exactamente qué pagaría sin tarifas ocultas.',
    rating: 5,
    image: avatarValentina
  },
  {
    id: 't2',
    name: 'Carlos & Elena Ramos',
    role: 'Plan Familiar Integral',
    content: 'Con tres hijos pequeños, las visitas al pediatra son constantes. Nuestro plan familiar nos ahorra cientos de dólares en copagos y la cobertura hospitalaria nos dio paz total en una hospitalización menor de nuestro hijo mayor.',
    rating: 5,
    image: avatarCarlosElena
  }
];

export const PROVINCIAS_EC = [
  'Pichincha (Quito, etc.)',
  'Guayas (Guayaquil, etc.)',
  'Azuay (Cuenca, etc.)',
  'Manabí (Manta, Portoviejo)',
  'Tungurahua (Ambato)',
  'Loja',
  'Imbabura (Ibarra)',
  'El Oro (Machala)',
  'Santo Domingo',
  'Otras Provincias / Cobertura Nacional'
];
