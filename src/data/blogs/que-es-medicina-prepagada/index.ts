import { BlogPost } from '../../../types';
import { AUTHORS } from '../../authors';
import postImage from '../../../assets/images/post_que_es_medicina_prepagada.webp';

export const post: BlogPost = {
  id: 'que-es-medicina-prepagada',
  title: '¿Qué es la medicina prepagada y cómo funciona exactamente?',
  slug: 'que-es-medicina-prepagada',
  excerpt: 'Descubre qué es la medicina prepagada, cómo funciona el modelo de pago mensual, qué cubre, cuáles son sus diferencias con el seguro médico tradicional y por qué miles de familias ecuatorianas la eligen cada año.',
  publishDate: '5 de Julio de 2026',
  readTime: '7 min de lectura',
  category: 'Conceptos Básicos',
  author: AUTHORS.gomez,
  image: postImage,
  tags: ['Medicina Prepagada', 'Qué es', 'Cómo funciona', 'Salud Ecuador', 'Planes de Salud'],
  content: [
    '### ¿Qué es la medicina prepagada?',
    'La medicina prepagada es un modelo de financiamiento de salud privada en el que el afiliado paga una cuota mensual fija a cambio de cobertura médica integral. A diferencia del seguro de salud tradicional —que actúa como reembolso después del gasto— la medicina prepagada funciona como un sistema de prepago directo: tú pagas antes de necesitar atención, y cuando la necesitas, la empresa cubre los costos acordados sin trámites de reembolso.',
    'En Ecuador, las empresas de medicina prepagada están reguladas por la Superintendencia de Compañías, Valores y Seguros (SCVS), que establece los requisitos mínimos de solvencia y cobertura que deben cumplir. Colmedikal opera bajo esta regulación como **Colmedikal Compañía de Medicina Prepagada S.A.**, brindando planes de salud a individuos y familias en todo el territorio nacional.',

    '### ¿Cómo funciona exactamente?',
    'El funcionamiento de la medicina prepagada se basa en tres elementos clave:',
    '1. **Cuota mensual fija:** El afiliado paga un monto mensual acordado según el plan elegido, la edad y el número de beneficiarios. En Colmedikal, los planes van desde $8 USD/mes por persona hasta planes premium con coberturas más amplias.',
    '2. **Red de prestadores:** La empresa de medicina prepagada tiene convenios con clínicas, hospitales, especialistas y laboratorios de su red. Cuando el afiliado necesita atención, acude directamente a uno de estos prestadores sin necesidad de hacer pagos de bolsillo significativos.',
    '3. **Autorización directa:** En la mayoría de los casos, la atención es autorizada en tiempo real por la empresa al prestador. El afiliado solo presenta su carné de afiliación y, en algunos planes, cubre un deducible mínimo anual (en Colmedikal: $40 USD/año de hospitalización).',
    'El resultado: atención médica inmediata, sin esperas burocráticas y sin desembolsos imprevistos de dinero en momentos de crisis de salud.',

    '### ¿Qué cubre la medicina prepagada?',
    'La cobertura varía según el plan contratado, pero en términos generales los planes de Colmedikal incluyen:',
    '* **Consultas con especialistas** sin necesidad de referencia de médico general (acceso directo a cardiología, ginecología, neurología, dermatología y más de 25 especialidades)',
    '* **Hospitalización** en clínicas privadas de primer nivel, incluyendo habitación, alimentación, medicación hospitalaria y honorarios médicos',
    '* **Cirugía programada y de emergencia** cubierta hasta el límite anual del plan',
    '* **Maternidad:** controles prenatales, parto (natural o cesárea) y atención del recién nacido',
    '* **Emergencias 24/7**, incluyendo ambulancia terrestre',
    '* **Laboratorio clínico e imagenología** (ecografías, radiografías, tomografías según el plan)',
    '* **Odontología básica** en los planes que incluyen esta prestación',
    'Puedes revisar el detalle completo de coberturas según cada plan en nuestra página de [servicios médicos](/servicios).',

    '### ¿Qué NO cubre la medicina prepagada?',
    'Es igualmente importante conocer las exclusiones más comunes para no tener sorpresas:',
    '* **Preexistencias no declaradas:** Enfermedades que el afiliado tenía antes de afiliarse y no reportó quedan excluidas permanentemente.',
    '* **Períodos de carencia:** Los primeros días o meses de afiliación tienen restricciones de uso según el tipo de prestación. Por ejemplo, en Colmedikal, las emergencias tienen 24 horas de carencia, mientras que hospitalización programada tiene 90 días.',
    '* **Cosméticos y estéticos:** Cirugías plásticas con fines estéticos (sin indicación médica) generalmente no están cubiertas.',
    '* **Preexistencias declaradas en período de exclusión:** Las enfermedades preexistentes declaradas entran a cobertura recién a partir del mes 25 de afiliación.',

    '### ¿Cuánto cuesta la medicina prepagada en Ecuador?',
    'El costo mensual depende de varios factores: la edad del afiliado, el plan elegido y el número de beneficiarios. En Colmedikal, los valores de referencia son:',
    '* **Plan Esencial:** desde $8 USD/mes por persona',
    '* **Plan Recomendado:** desde $12 USD/mes por persona',
    '* **Plan Platinum:** desde $22 USD/mes por persona',
    'Estos valores corresponden a personas adultas jóvenes; el precio aumenta progresivamente con la edad. Para conocer el valor exacto según tu perfil familiar, utiliza nuestro [cotizador en línea](/cotizador) que calcula la tarifa en segundos.',

    '### ¿Por qué elegir medicina prepagada en Ecuador?',
    'El sistema público de salud (IESS, hospitales del MSP) tiene cobertura universal pero enfrenta desafíos estructurales: agendamiento de especialistas que puede tomar semanas o meses, desabastecimiento de medicamentos e infraestructura con saturación crónica. La medicina prepagada privada es la respuesta a esa brecha:',
    '* Atención el mismo día en la mayoría de consultas de especialidad',
    '* Red de clínicas privadas de alta complejidad en todo Ecuador',
    '* Sin trámites de reembolso — la empresa paga directamente al prestador',
    '* Tranquilidad económica frente a gastos médicos imprevistos que pueden superar los $10.000 USD en un evento de hospitalización o cirugía mayor',
    'Si estás evaluando proteger la salud de tu familia, [agenda una asesoría gratuita](/agendamiento) con nuestro equipo de Colmedikal.',
    'También te puede interesar: [Seguro de salud vs. Medicina Prepagada: ¿Cuál me conviene?](/blog/seguro-salud-vs-medicina-prepagada) · [¿Vale la pena si soy joven y sano?](/blog/medicina-prepagada-personas-jovenes).'
  ]
};
