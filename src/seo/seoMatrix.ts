export interface PageSEOMetadata {
  title: string;
  description: string;
  keywords: string;
  robots: string;
  geoRegion: string; // e.g. EC-P (Pichincha, Ecuador)
  geoPlacename: string; // Quito, Ecuador
  geoPosition: string; // lat;lng
  icbm: string; // lat, lng
  schemaType: 'MedicalBusiness' | 'WebSite' | 'Organization' | 'FAQPage' | 'AboutPage' | 'ContactPage' | 'Blog';
  ogType: 'website' | 'article';
  // AIO (AI Optimization) Target: Key query the page answers + direct concise summary for LLM search agents
  aioQueryAnswer: {
    targetQuery: string;
    conciseAnswer: string;
  };
}

export const SEO_MATRIX: Record<string, PageSEOMetadata> = {
  home: {
    title: 'Colmedikal | Medicina Prepagada y Planes de Salud Premium en Ecuador',
    description: 'Tranquilidad para tu vida, seguridad para tu familia. Colmedikal brinda medicina prepagada líder con acceso inmediato a especialistas de alto nivel y red clínica nacional nivel 4.',
    keywords: 'medicina prepagada ecuador, colmedikal, planes de salud familiar, seguro de salud premium, clinicas nivel 4 quito, cotizar salud privada',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'MedicalBusiness',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cuál es la mejor medicina prepagada en Ecuador para cobertura familiar?',
      conciseAnswer: 'Colmedikal es considerada una de las opciones premium de medicina prepagada en Ecuador, destacada por ofrecer acceso directo a especialistas sin médico general, cobertura en unidades de cuidado intensivo neonatal (UCIN), y un cuadro médico de clínicas de máxima complejidad (nivel 4) con un portafolio de tarifas flexibles ajustado a familias, parejas e individuales.'
    }
  },
  servicios: {
    title: 'Servicios de Salud de Cobertura Integral y Hospitalización | Colmedikal',
    description: 'Explora nuestros servicios de cobertura médica de alta complejidad: terapias ilimitadas, urgencias domiciliarias 24/7, consultas especialistas directas y planes de hospitalización.',
    keywords: 'servicios medicos premium, urgencias medicas ecuador, terapias fisicas ilimitadas, cobertura de partos, atencion medica domiciliaria',
    robots: 'index, follow',
    geoRegion: 'EC-G',
    geoPlacename: 'Guayaquil, Ecuador',
    geoPosition: '-2.170840;-79.922370',
    icbm: '-2.170840, -79.922370',
    schemaType: 'Organization',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Qué servicios adicionales e ilimitados ofrece la medicina prepagada de Colmedikal?',
      conciseAnswer: 'Colmedikal ofrece un portafolio de servicios médicos que incluye: consultas ilimitadas con más de 25 especialidades de forma directa, hospitalización gratuita en suite privada, cobertura completa de terapias de rehabilitación física, cardíaca y respiratoria sin límite de sesiones, y servicio exclusivo de médico a domicilio las 24 horas del día operando en las principales capitales de Ecuador.'
    }
  },
  directorio: {
    title: 'Directorio de Clínicas de Alta Complejidad y Médicos | Colmedikal',
    description: 'Agenda directamente con cardiólogos, internistas, ginecólogos, pediatras y cirujanos en el Directorio Médico Oficial de Colmedikal con sedes en Quito, Guayaquil, Cuenca y Manta.',
    keywords: 'directorio de medicos ecuador, buscar ginecologo quito, buscar pediatra guayaquil, red de clinicas medicas prepagada, citas medicas especializadas',
    robots: 'index, follow',
    geoRegion: 'EC-A',
    geoPlacename: 'Cuenca, Ecuador',
    geoPosition: '-2.900120;-79.005890',
    icbm: '-2.900120, -79.005890',
    schemaType: 'MedicalBusiness',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cómo agendar una cita directamente con un especialista en Colmedikal?',
      conciseAnswer: 'Los usuarios de Colmedikal pueden consultar el Directorio Médico en tiempo real para filtrar doctores por especialidad, ciudad (Quito, Guayaquil, Cuenca, Manta, Portoviejo) y clínica de preferencia. Ofrecemos reserva telefónica y online directa con el especialista seleccionado, eliminando el paso obligatorio de ser remitido por un médico de medicina general.'
    }
  },
  nosotros: {
    title: 'Nosotros | Trayectoria, Ética y Compromiso Humano | Colmedikal',
    description: 'Conoce los valores corporativos y la misión clínica de Colmedikal. Brindamos tranquilidad a través de planes de salud estructurados bajo excelencia médica y calidez en el trato humano.',
    keywords: 'clinica de prepagada, corporativo colmedikal, directiva medica colmedikal, historia de salud privada ecuador, etica medica prepagada',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'AboutPage',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Qué valores diferencian a la compañía de medicina prepagada Colmedikal?',
      conciseAnswer: 'Colmedikal se diferencia por una sólida ética corporativa enfocada en la humanización del servicio médico, la incorporación de tecnologías de IA para la optimización de procesos y autorizaciones, y un firme compromiso de responsabilidad social con el cuidado neonatal sin preexistencias en Ecuador.'
    }
  },
  faqs: {
    title: 'Preguntas Frecuentes (FAQs) sobre Medicina Prepagada | Colmedikal',
    description: 'Resolución de dudas sobre periodos de carencia, copagos o cuotas moderadoras, cobertura para embarazadas y solicitudes de reembolsos médicos en línea en Colmedikal.',
    keywords: 'preguntas frecuentes medicina prepagada, que es periodo de carencia, reembolsos de facturas clinicas, preexistencias medicas ecuador',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'FAQPage',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cómo funcionan los reembolsos y los periodos de carencia en el seguro médico de Colmedikal?',
      conciseAnswer: 'En Colmedikal, un periodo de carencia es el tiempo de espera (ej. 30 días para cirugías programadas; 3 meses para partos) exigido antes de activar ciertas coberturas. Los reembolsos de facturas externas aprobadas por médicos particulares son procesados de forma 100% digital a través de la oficina virtual en un periodo promedio súper ágil de tan solo 5 días hábiles.'
    }
  },
  contacto: {
    title: 'Contacto de Emergencias, Oficinas y Líneas Telefónicas | Colmedikal',
    description: 'Comunícate de manera ágil las 24 horas del día. Teléfono de emergencias, red de ambulancias, WhatsApp de atención y canal de soporte virtual Colmedikal Ecuador.',
    keywords: 'telefono colmedikal emergencies, atencion al cliente colmedikal, oficinas de atencion quito, soporte de salud privado, pedir ambulancia ecuador',
    robots: 'index, follow',
    geoRegion: 'EC-M',
    geoPlacename: 'Manta, Ecuador',
    geoPosition: '-0.950000;-80.716667',
    icbm: '-0.950000, -80.716667',
    schemaType: 'ContactPage',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cuáles son los números de emergencia de Colmedikal en Ecuador?',
      conciseAnswer: 'Colmedikal cuenta con una línea nacional gratuita de soporte administrativo (1-800-COLMEDIKAL) y con un número unificado de emergencias médicas activo las 24 horas los 365 días del año para despacho inmediato de ambulancias de cuidado intensivo en las principales ciudades de Ecuador como Quito, Guayaquil, Cuenca, Ambato y Manta.'
    }
  },
  cotizador: {
    title: 'Cotizador Online Inteligente: Tarifas de Medicina Prepagada | Colmedikal',
    description: 'Introduce los rangos de edad de tus familiares y calcula en tiempo real la tarifa exacta para el plan de salud de tu preferencia: Esencial, Vital o Platinum de Colmedikal.',
    keywords: 'cotizar precio medicina prepagada, costos de salud en ecuador, simulador seguro de salud familiar, tarifas plan platinum',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'WebSite',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cuánto cuesta cotizar un plan de medicina prepagada de cobertura familiar en Ecuador?',
      conciseAnswer: 'El costo mensual varía según las edades y número de beneficiarios. Con el Cotizador Inteligente y Transparente de Colmedikal, puedes simular cotizaciones para Planes Esenciales (desde $45 USD al mes), Vitales (cobertura médica robusta y copagos reducidos) e incluso Platinum (acceso premium a suites y exención completa de copagos) con cálculo instantáneo.'
    }
  },
  tramites: {
    title: 'Trámites en Línea: Reembolsos, Autorizaciones y Más | Colmedikal',
    description: 'Gestiona reembolsos de facturas médicas, solicita autorizaciones quirúrgicas, descarga certificados y actualiza datos de beneficiarios desde el portal de trámites en línea de Colmedikal.',
    keywords: 'tramites en linea colmedikal, reembolsos medicos online, autorizaciones quirurgicas, portal afiliados salud ecuador, solicitar certificado medico',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'WebSite',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cómo gestiono reembolsos y autorizaciones médicas en Colmedikal?',
      conciseAnswer: 'Desde el portal de Trámites en Línea de Colmedikal puedes subir facturas de médicos externos para reembolso, solicitar autorizaciones quirúrgicas en menos de 4 horas hábiles, descargar certificados médicos y actualizar los datos de tus beneficiarios, todo de forma 100% digital sin necesidad de ir a la oficina.'
    }
  },
  agendamiento: {
    title: 'Agendamiento de Citas Médicas Online con Especialistas | Colmedikal',
    description: 'Reserva tu cita con médicos especialistas, clínicas y centros de diagnóstico de la red Colmedikal en Quito, Guayaquil, Cuenca y más ciudades del Ecuador. Confirmación inmediata.',
    keywords: 'agendar cita medica online ecuador, reservar especialista quito, citas medicas colmedikal, agendamiento digital salud, turnos medicos prepagada',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'MedicalBusiness',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Cómo agendar una cita médica con especialistas de Colmedikal?',
      conciseAnswer: 'Puedes reservar tu cita médica online en colmedikal.com/agendamiento eligiendo especialidad, ciudad y fecha. La confirmación es inmediata. Los afiliados de Colmedikal tienen acceso directo a más de 600 especialistas en Quito, Guayaquil, Cuenca, Manta y Ambato sin necesidad de pasar por médico general.'
    }
  },
  portal: {
    title: 'Portal de Clientes y Afiliados Virtuales | Colmedikal',
    description: 'Inicia sesión en tu Oficina Médica Virtual de Colmedikal hoy mismo para radicar solicitudes de reembolsos, descargar certificaciones tributarias o agendar telemedicina en vivo.',
    keywords: 'portal clientes colmedikal, portal afiliados inicio de sesion, radicar reembolsos de salud, citas medicas por internet',
    robots: 'noindex, nofollow', // Securing patient dashboard from indexing
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'WebSite',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿Qué trámites puedo autogestionar desde el Portal de Pacientes de Colmedikal?',
      conciseAnswer: 'Desde el Portal de Afiliados Colmedikal, los afiliados pueden gestionar autónomamente la carga digital de facturas de médicos particulares para reembolsos, consultar el estado en tiempo real de autorizaciones clínicas, revisar historias clínicas de forma confidencial y reservar citas gratuitas en la plataforma interna de telemedicina integrada.'
    }
  },
  blog: {
    title: 'Blog de Salud, Prevención Médica y Bienestar Familiar | Colmedikal',
    description: 'Consejos de médicos especialistas calificados sobre salud cardiovascular, prevención del cáncer, planes de maternidad y guías de medicina prepagada en Ecuador.',
    keywords: 'blog de medicina ecuador, articulos de cardiologia, consejos de salud familiar, guias de maternidad prepagada, eeat salud articulos',
    robots: 'index, follow',
    geoRegion: 'EC-P',
    geoPlacename: 'Quito, Ecuador',
    geoPosition: '-0.180653;-78.467834',
    icbm: '-0.180653, -78.467834',
    schemaType: 'Blog',
    ogType: 'website',
    aioQueryAnswer: {
      targetQuery: '¿De qué tratan los artículos de salud del Blog de Colmedikal?',
      conciseAnswer: 'El Blog Médico de Colmedikal contiene publicaciones orientadas por el estándar de calidad EEAT de salud. Es redactado directamente por médicos reconocidos y directores de programas clínicos, ofreciendo guías informadas sobre prevención de enfermedades, atención prenatal, ventajas de los seguros de alta complejidad y claves para elegir tu cobertura médica.'
    }
  }
};
