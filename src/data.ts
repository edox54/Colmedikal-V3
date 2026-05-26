import { Plan, Testimonial, ServiceDetail } from './types';

export const MEDICAL_PLANS: Plan[] = [
  {
    id: 'esencial',
    name: 'Esencial Protect',
    tagline: 'Protección óptima para estudiantes y jóvenes profesionales.',
    basePrice: 38.50,
    maxCoverage: 20000,
    copayPercent: 20,
    hospitalNetwork: 'Red Preferencial (Nivel 1 y 2)',
    features: [
      'Cobertura hospitalaria al 80%',
      'Consultas de medicina general con copago especial de $8',
      'Emergencias médicas locales 100% cubiertas',
      'Acceso a ginecología y pediatría',
      'Línea de orientación médica telefónica 24/7',
      'Descuentos del 15% en farmacias afiliadas'
    ],
    color: 'emerald'
  },
  {
    id: 'integral',
    name: 'Integral Family',
    tagline: 'El plan familiar más balanceado para la tranquilidad de tu hogar.',
    basePrice: 65.00,
    maxCoverage: 75000,
    copayPercent: 15,
    hospitalNetwork: 'Red Nacional Premium (Nivel 1, 2 y 3)',
    features: [
      'Cobertura hospitalaria al 85%',
      'Copagos fijos de $12 en consultas con especialistas',
      'Maternidad básica y neonatología cubiertas',
      'Ambulancia terrestre de emergencia ilimitada',
      'Médico a domicilio con tarifa preferencial',
      'Descuentos de hasta el 30% en medicamentos recetados'
    ],
    color: 'teal'
  },
  {
    id: 'elite',
    name: 'Elite Executive',
    tagline: 'Máxima cobertura nacional e internacional con acceso ilimitado.',
    basePrice: 110.00,
    maxCoverage: 250000,
    copayPercent: 10,
    hospitalNetwork: 'Red Global Total (Todas las Clínicas)',
    features: [
      'Cobertura hospitalaria y quirúrgica al 90%',
      'Copagos mínimos de $5 en laboratorios y consultas',
      'Maternidad premium ampliada con controles prenatales',
      'Odontología preventiva e integral incluida',
      'Asistencia médica internacional de emergencia hasta $50k',
      'Chequeo médico ejecutivo anual sin costo',
      'Reembolso libre de médicos fuera de red'
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
    content: 'Como profesional de la salud corporal, sé lo valioso que es un soporte hospitalario veloz y confiable. Colmedical siempre me ha dado la mejor red de respuesta y el cotizador me permitió ver exactamente qué pagaría sin tarifas ocultas.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 't2',
    name: 'Carlos & Elena Ramos',
    role: 'Plan Familiar Integral',
    content: 'Con tres hijos pequeños, las visitas al pediatra son constantes. Nuestro plan familiar nos ahorra cientos de dólares en copagos y la cobertura hospitalaria nos dio paz total en una hospitalización menor de nuestro hijo mayor.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200'
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
