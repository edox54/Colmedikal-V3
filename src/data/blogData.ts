import { BlogPost, Author } from '../types';
import avatarGomez from '../assets/images/avatar_gomez_1780024902226.png';
import avatarRestrepo from '../assets/images/avatar_restrepo_1780024921091.png';
import avatarCaballero from '../assets/images/avatar_caballero_1780024936325.png';
import postEcuadorPrepagada from '../assets/images/post_ecuador_prepagada_1780025031230.png';
import postExamenesAnuales from '../assets/images/post_examenes_anuales_1780025049525.png';
import postMaternidad from '../assets/images/post_maternidad_1780025067027.png';

export const AUTHORS: Record<string, Author> = {
  gomez: {
    id: 'gomez',
    name: 'Dr. Alejandro Gómez Pradilla',
    role: 'Director Médico de Colmedikal',
    specialty: 'Especialista en Cardiología y Medicina Interna',
    experience: 'Más de 17 años de experiencia en el sector salud en Ecuador',
    avatar: avatarGomez,
    bio: 'El Dr. Gómez cuenta con una amplia trayectoria coordinando servicios de salud preventiva y medicina integral en Ecuador. Graduado de la Universidad Central del Ecuador y con especialización en el exterior, lidera el programa de cardiología integral de Colmedikal.'
  },
  restrepo: {
    id: 'restrepo',
    name: 'Dra. Mariana Restrepo Hoyos',
    role: 'Coordinadora de Medicina y Bienestar Preventivo',
    specialty: 'Especialista en Medicina Familiar',
    experience: '12+ años de trayectoria clínica acompañando familias ecuatorianas',
    avatar: avatarRestrepo,
    bio: 'La Dra. Mariana se dedica al diseño científico de programas de medicina familiar y tamizaje temprano en el Austro y la Costa ecuatoriana. Su filosofía combina la evidencia médica de vanguardia con un trato cálido, humano e integral.'
  },
  caballero: {
    id: 'caballero',
    name: 'Dra. Sofía Caballero Restrepo',
    role: 'Directora del Programa Materno-Infantil',
    specialty: 'Ginecóloga Obstetra y Especialista en Embarazo de Alto Riesgo',
    experience: '14+ años cuidando la salud de las madres y neonatos ecuatorianos',
    avatar: avatarCaballero,
    bio: 'La Dra. Sofía es un referente en la atención de gestantes y neonatología en Ecuador. Lidera con pasión el programa de maternidad y parto humanizado de Colmedikal.'
  }
};

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'medicina-prepagada-ecuador',
    title: 'Guía Completa de Medicina Prepagada en Ecuador: ¿Cómo elegir el mejor plan?',
    slug: 'medicina-prepagada-ecuador',
    excerpt: 'Descubre las diferencias claves entre el seguro público del IESS, un plan complementario y una Medicina Prepagada auténtica en Ecuador para tomar la mejor decisión de cobertura familiar.',
    publishDate: '28 de Mayo de 2026',
    readTime: '6 min de lectura',
    category: 'Planes y Cobertura',
    author: AUTHORS.gomez,
    image: postEcuadorPrepagada,
    tags: ['Medicina Prepagada', 'Salud Ecuador', 'Elegir Plan', 'Cotizador Colmedikal'],
    content: [
      '### ¿Por qué la salud privada se ha convertido en una prioridad en Ecuador?',
      'En Ecuador, el sistema de salud público (como el IESS, los hospitales del Ministerio de Salud Pública o del ISSPOL) suele presentar retos de saturación, tiempos de espera prolongados de varios meses para especialistas y procesos burocráticos de aprobación para tratamientos o cirugías. Por ello, miles de familias ecuatorianas buscan soluciones premium para garantizar una atención médica confiable, ágil y de alta calidad técnica.',
      'Dos de las alternativas médicas voluntarias más conocidas son los planes corporativos complementarios y los planes de Medicina Prepagada de Cobertura Integral. En este artículo explicaremos en detalle cómo funciona la Medicina Prepagada en el país y qué variables clínicas y financieras debes contemplar al momento de cotizar un plan.',
      
      '### IESS vs. Plan Complementario vs. Medicina Prepagada',
      'Es vital comprender en qué se diferencia cada opción disponible en el mercado ecuatoriano para evitar falsas expectativas y optimizar tu presupuesto familiar:',
      '* **IESS (Público/Obligatorio):** Es la cobertura básica estatal financiada por la aportación patronal e individual. Cubre los servicios generales pero está sujeta a agendamientos distantes, cupos limitados y desabastecimiento ocasional de medicación.',
      '* **Plan Médico Cerrado:** Suele ser un servicio provisto por clínicas específicas que ofrece cobertura reducida a su propia red física, limitando la libertad del paciente de elegir médicos particulares.',
      '* **Medicina Prepagada (Colmedikal):** Es un plan privado independiente, robusto y auto-suficiente que te da acceso inmediato y directo a una amplísima red de clínicas de alta complejidad (hospitales de nivel 4) en Quito, Guayaquil, Cuenca, Ambato, Portoviejo y Manta. Ofrece consultas con especialistas de primer nivel sin pasar por un médico general, atención médica a domicilio las 24 horas, terapias físicas o de rehabilitación ilimitadas y cobertura completa para procedimientos ambulatorios y hospitalarios de primer orden.',
      
      '### Variables clave para seleccionar tu plan ideal',
      'Cuando te dispongas a cotizar tu medicina prepagada a través de un portal moderno como Colmedikal Ecuador, evalúa los siguientes factores:',
      '1. **El Cuadro Médico y Red de Clínicas:** Asegúrate de que el plan incluya los mejores centros asistenciales de tu zona (por ejemplo, el Hospital Vozandes, Northospital, Clínica Internacional, Clínica San Rafael en Quito, o la Clínica Panamericana en Guayaquil). El acceso a clínicas líderes es el indicador de calidad número uno.',
      '2. **Copagos y Deductibles:** Algunos planes de bajo costo mensual cobran copagos altos cada vez que vas a consulta o te realizan exámenes. Otros planes premium te exoneran de copagos o mantienen los deducibles en montos mínimos muy fáciles de cubrir.',
      '3. **Límites de Cobertura y Preexistencias:** Al afiliarte o cambiar de seguro en el Ecuador, debes reportar tu historial médico de manera transparente. El factor clave es que el plan incluya un alto límite de cobertura económica para hospitalización, cirugías complejas y maternidad.',
      '4. **Terapia y Rehabilitación Ilimitada:** En caso de accidentes o procesos post-operatorios, una buena cobertura de rehabilitación física y neurológica sin número máximo de sesiones evita costos catastróficos inesperados para tu economía familiar.',
      
      '### Conclusión y Recomendación Médica',
      'Invertir en una medicina prepagada no es solo un gasto, es blindar la tranquilidad de tu familia frente a contingencias inesperadas de salud. Un plan de medicina prepagada debidamente balanceado se adapta a las edades de tu núcleo familiar y a su presupuesto actual. Te invitamos a utilizar nuestro **Cotizador Inteligente Colmedikal** en la barra superior para explorar de manera 100% transparente el plan ideal para ti, calculando instantáneamente tarifas de acuerdo con tus miembros familiares.'
    ]
  },
  {
    id: 'examenes-preventivos-anuales',
    title: 'Salud Preventiva: 5 exámenes anuales indispensables que pueden salvar tu vida',
    slug: 'examenes-preventivos-anuales',
    excerpt: 'La prevención es el pilar de la salud moderna. Conoce los cinco chequeos del tamizaje médico que todo adulto en Ecuador debe realizarse año tras año.',
    publishDate: '26 de Mayo de 2026',
    readTime: '5 min de lectura',
    category: 'Prevención y Bienestar',
    author: AUTHORS.restrepo,
    image: postExamenesAnuales,
    tags: ['Medicina Preventiva', 'Chequeos Médicos', 'Salud Adultos', 'Tamizaje Clínico'],
    content: [
      '### Prevenir es vivir: Rompiendo el mito de "ir al médico solo cuando duele"',
      'Históricamente, la medicina del siglo XX se caracterizó por ser predominantemente reactiva: las personas asistían al hospital únicamente al presentar dolores crónicos o síntomas inmanejables. La medicina moderna y preventiva gira en torno a un paradigma opuesto: detectar de manera microscópica o temprana las alteraciones bioquímicas y fisiológicas antes de que desarrollen síntomas visibles.',
      'En Colmedikal creemos firmemente que un examen de sangre o una imagen diagnóstica rápida a los 30, 40 o 50 años puede modificar completamente la expectativa de vida de un paciente. A continuación, te explicamos cuáles son los cinco chequeos médicos anuales más urgentes para mantener un control óptimo sobre tu bienestar.',
      
      '### 1. Perfil Lipídico y Glicemia en Ayunas',
      'Las enfermedades cardiovasculares y la diabetes mellitus tipo 2 son llamadas "las asesinas silenciosas" de nuestro siglo. Muchas personas viven durante años con niveles de colesterol LDL ("malo"), triglicéridos e insulina crónicamente elevados sin sentir absolutamente nada.',
      'Un examen rápido de sangre permite capturar a tiempo la resistencia a la insulina o la acumulación de placa ateromatosa, permitiendo revertir estas patologías mediante ajustes nutricionales guiados y medicamentos antes de sufrir un infarto de miocardio.',
      
      '### 2. Tamizaje Oncológico según Edad y Género',
      'El diagnóstico temprano del cáncer incrementa las tasas de supervivencia por encima del 90%. Los chequeos de rutina indispensables son:',
      '* **Citología Cervicovaginal y Prueba de VPH:** Indispensable anualmente para mujeres desde el inicio de su vida sexual activa para prevenir el cáncer de cuello uterino.',
      '* **Mamografía Anual o Bienal:** Crucial para mujeres a partir de los 40 años o antes si existen factores genéticos o antecedentes directos de cáncer de ovario o mama.',
      '* **Examen de PSA (Antígeno Prostático Específico):** Recomendado para hombres a partir de los 40-45 años para la detección precoz del cáncer de próstata.',
      '* **Colonoscopia de tamizaje:** Fundamental una vez cada 10 años para toda persona mayor de 45 años para prevenir el cáncer colorrectal.',
      
      '### 3. Presión Arterial y Control del Endotelio',
      'La hipertensión arterial afecta a cerca del 30% de los adultos en Ecuador y daña silenciosamente los vasos sanguíneos del cerebro, corazón y riñones. Monitorear tu presión sistólica y diastólica periódicamente en consulta médica general te protege de accidentes cerebrovasculares catastróficos.',
      
      '### 4. Perfil Tiroideo (TSH y T4 libre)',
      'La glándula tiroides maneja el termostato metabólico de todo tu organismo. El hipotiroidismo (tiroides perezosa) provoca fatiga inexplicable, aumento inexplicable de masa grasa, estreñimiento de difícil manejo y estados depresivos leves que suelen confundirse con estrés cotidiano. Un simple tamizaje anual con la hormona TSH devuelve de inmediato la calidad de vida y energía.',
      
      '### Beneficios de canalizar tu prevención con Medicina Prepagada',
      'Uno de los mayores obstáculos para cumplir con estos chequeos anuales en el sistema tradicional del IESS es la burocracia para conseguir órdenes médicas y agendar las citas de especialidad. Con planes de medicina prepagada como los de **Colmedikal**, accedes directamente a laboratorios clínicos premium del país y a los médicos especialistas en prevención familiar de manera rápida, cómoda, sin autorizaciones demoradas y bajo un acompañamiento compasivo e de primer orden.'
    ]
  },
  {
    id: 'cobertura-salud-familiar-maternidad',
    title: 'Atención Materna y Familiar: Beneficios de contar con coberturas de alta complejidad',
    slug: 'cobertura-salud-familiar-maternidad',
    excerpt: 'Planificar el nacimiento de tu hijo bajo un esquema de Medicina Prepagada te garantiza tranquilidad absoluta desde las primeras semanas de gestación hasta el cuidado neonatal post-parto.',
    publishDate: '24 de Mayo de 2026',
    readTime: '5 min de lectura',
    category: 'Salud Familiar',
    author: AUTHORS.caballero,
    image: postMaternidad,
    tags: ['Salud Materna', 'Maternidad Prepagada', 'Planes Familiares', 'Cuidado Neonatal'],
    content: [
      '### La importancia de la planificación familiar y médica',
      'El embarazo y el nacimiento de un hijo es uno de los hitos más maravillosos y significativos en la vida de cualquier familia. No obstante, también representa un período de intensas demandas físicas y psicológicas, donde la incertidumbre médica respecto a las complicaciones potenciales puede generar mucho estrés.',
      'Garantizar que tu gestación, el parto y los primeros meses del recién nacido transcurran en un entorno médico con tecnología de punta, médicos altamente formados y habitaciones cómodas y privadas es una decisión que impacta el futuro saludable de tu bebé.',
      
      '### ¿Por qué contar con Medicina Prepagada durante el Embarazo?',
      'La atención obstétrica convencional suele estar restringida a tiempos breves de consulta y un control ecográfico mínimo. Optar por un plan familiar integral con Colmedikal te ofrece ventajas de valor médico incalculable:',
      '1. **Médico Ginecobstetra de Cabecera:** Elige y atiende todas tus consultas de control mensual directamente con el obstetra de tu absoluta confianza. Él te acompañará durante todo el embarazo y estará presente en el momento del parto.',
      '2. **Ecografías de Detalle Anatómico Incluidas:** Las ecografías especializadas de alta definición y de detalle anatómico de segundo trimestre (cruciales para diagnosticar malformaciones de manera temprana) e incluso ecografías genéticas iniciales se realizan sin trabas de autorización.',
      '3. **Habitación Suite Privada Individual para el Parto:** Goza de la tranquilidad de dar a luz y recuperarte en una cómoda suite hospitalaria privada, con baño propio, un sofá adaptado para el acompañante y total intimidad familiar.',
      '4. **Acceso a Unidades de Cuidado Intensivo Neonatal (UCIN):** Aunque toda futura madre anhela un parto sin percances, la prematurez o complicaciones respiratorias transitorias del neonato pueden demandar incubadora y cuidados complejos. Los planes de medicina prepagada de Colmedikal cubren la estancia en UCIN de alto nivel para tu bebé sin que se generen facturas impagables para tu economía familiar.',
      
      '### El Anexo de "Inclusión de Hijo Nacido en el Contrato"',
      'Este es un beneficio fundamental que pocas personas conocen: al tener tu Medicina Prepagada de Colmedikal contratada con anterioridad y al nacer tu bebé bajo esta cobertura, tu recién nacido queda automáticamente blindado e integrado al contrato sin restricciones por preexistencias congénitas. Es decir, si el bebé nace con alguna condición médica especial, el seguro privado cubre todo su tratamiento de por vida de forma incondicional desde el primer minuto de respiración.',
      
      '### Recomendaciones para Futuros Padres',
      'Si estás planeando tener hijos en los próximos 12 a 24 meses, la recomendación médica número uno es cotizar tu plan con anterioridad. La mayoría de seguros médicos privados de primer nivel exigen un período de carencia para la cobertura del parto (habitualmente que la concepción se dé después de la afiliación o de un tiempo estipulado). Utiliza el **Cotizador Online Colmedikal** hoy mismo, ingresando los datos de tu pareja, para estructurar el plan de maternidad perfecto con tarifas altamente competitivas.'
    ]
  }
];
