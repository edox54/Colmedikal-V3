import { Plan, Testimonial, ServiceDetail } from './types';
import avatarValentina from './assets/images/avatar_valentina_1780025241348.png';
import avatarCarlosElena from './assets/images/avatar_carlos_elena_1780025264251.png';

export const MEDICAL_PLANS: Plan[] = [
  {
    id: 'inicio',
    name: 'Plan Inicio 2K',
    tagline: 'Disfruta de una cobertura anual de hasta USD 2.000 para atención médica, con acceso a una amplia red de prestadores de salud y servicios de alta calidad. Un plan diseñado para brindarte protección, tranquilidad y el respaldo que tú y tu familia necesitan, siempre al alcance de tus posibilidades.',
    basePrice: 8.00,
    maxCoverage: 2000,
    copayPercent: 0,
    hospitalNetwork: 'Red Colmedikal',
    highlights: ['Telemedicina', 'Urgencias cubiertas', 'Sin copago'],
    features: [
      'Consultas y Especialidades (Pediatría, Ginecología, Medicina Interna) con 100% de cobertura (Sin copago)',
      'Telemedicina sin carencia (sin período de espera)',
      'Cobertura en Cuidados Intensivos hasta $2000',
      'Honorarios médicos cubiertos hasta $2000',
      'Exámenes de laboratorio e imágenes diagnósticas: $100 en total (ambos cubiertos juntos)',
      'Muerte por accidente y gastos de sepelio',
      'Ambulancia terrestre por accidente'
    ],
    color: 'emerald'
  },
  {
    id: 'proteccion',
    name: 'Plan Protección 3K',
    tagline: 'Empieza a cuidar tu salud con un plan diseñado para brindarte respaldo y tranquilidad. Ofrece una cobertura de hasta USD 3.000 por evento, acceso a una red de atención médica de calidad y beneficios pensados para protegerte a ti y a tu familia.',
    basePrice: 12.00,
    maxCoverage: 3000,
    copayPercent: 0,
    hospitalNetwork: 'Red Colmedikal',
    highlights: ['Telemedicina 24/7', 'Bono maternidad', 'Más especialidades'],
    features: [
      'Consultas y Especialidades (Pediatría, Ginecología, Urología, Traumatología) con 100% de cobertura (Sin copago)',
      'Telemedicina ilimitada sin carencia (sin período de espera)',
      'Cobertura en Cuidados Intensivos hasta $3000',
      'Honorarios médicos cubiertos hasta $3000',
      'Exámenes de laboratorio e imágenes diagnósticas: $100 en total (ambos cubiertos juntos)',
      'Bono de maternidad estipulado hasta $500',
      'Muerte por accidente hasta $2500 y sepelio hasta $500'
    ],
    color: 'teal'
  },
  {
    id: 'plus',
    name: 'Plan Plus 5K',
    tagline: 'Vive con la tranquilidad de contar con una protección integral. Este plan te ofrece una cobertura anual de hasta USD 5.000, atención médica de calidad y el respaldo de una amplia red de prestadores para cuidar de ti y de quienes más quieres.',
    basePrice: 22.00,
    maxCoverage: 5000,
    copayPercent: 0,
    hospitalNetwork: 'Red Colmedikal',
    highlights: ['Telemedicina 24/7', 'Todas las especialidades', 'Cobertura máxima'],
    features: [
      'Consultas y Especialidades (Pediatría, Cardiología, M. Interna, Urología, etc.) con 100% de cobertura (Sin copago)',
      'Telemedicina ilimitada sin carencia (sin período de espera)',
      'Cobertura en Cuidados Intensivos hasta $5000',
      'Honorarios médicos cubiertos hasta $5000',
      'Exámenes de laboratorio e imágenes diagnósticas: $100 en total (ambos cubiertos juntos)',
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
