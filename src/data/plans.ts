// Plan catalog — single source for the Cotizador UI and the server (email PDF).
// Exact match with the provided plan specifications.
export const PLANS = [
  {
    id: 'inicio',
    name: 'Plan Inicio 2K',
    basePrice: 10,
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
    basePrice: 14,
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
    basePrice: 24,
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

export type Plan = (typeof PLANS)[number];
