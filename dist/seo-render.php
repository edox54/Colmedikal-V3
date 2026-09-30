<?php
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim($path, '/') ?: '/';

// Normalize slug-based routes
$basePath = $path;
if (preg_match('/^\/blog\//', $path)) $basePath = '/blog-detalle';

$routes = [
  '/' => [
    'title'       => 'Colmedikal | Medicina Prepagada en Ecuador — Planes Familia e Individual',
    'description' => 'Compara planes de medicina prepagada en Ecuador. Cobertura completa sin IESS obligatorio, acceso a médicos especialistas y clínicas privadas desde $35/mes.',
    'keywords'    => 'medicina prepagada Ecuador, seguro médico privado, plan médico familia, Colmedikal',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/servicios' => [
    'title'       => 'Servicios de Medicina Prepagada | Colmedikal Ecuador',
    'description' => 'Conoce todos los servicios de Colmedikal: hospitalización, cirugías, maternidad, atención ambulatoria y más. Planes desde $35 al mes.',
    'keywords'    => 'servicios medicina prepagada, hospitalización privada Ecuador, maternidad prepagada',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/directorio' => [
    'title'       => 'Directorio de Médicos Especialistas y Clínicas | Colmedikal Ecuador',
    'description' => 'Encuentra médicos especialistas, clínicas y hospitales en Ecuador. Directorio verificado con profesionales de salud en Quito, Guayaquil y todo el país.',
    'keywords'    => 'médicos especialistas Ecuador, directorio médico Quito, clínicas privadas Ecuador',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/nosotros' => [
    'title'       => 'Sobre Colmedikal | Medicina Prepagada con Respaldo Real en Ecuador',
    'description' => 'Conoce al equipo de Colmedikal: nuestra misión, valores y el compromiso con la salud de las familias ecuatorianas.',
    'keywords'    => 'Colmedikal Ecuador, empresa medicina prepagada, seguro médico privado',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/cotizador' => [
    'title'       => 'Cotiza tu Plan de Medicina Prepagada | Colmedikal Ecuador',
    'description' => 'Cotiza en línea tu plan de medicina prepagada. Precios personalizados según edad y tipo de cobertura. Sin compromisos ni papeleo.',
    'keywords'    => 'cotizar medicina prepagada Ecuador, precio plan médico familiar, cotizador seguro salud',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/tramites' => [
    'title'       => 'Trámites en Línea | Portal de Afiliados Colmedikal',
    'description' => 'Gestiona tus trámites de medicina prepagada en línea: solicitudes de reembolso, autorizaciones médicas y más.',
    'keywords'    => 'trámites medicina prepagada, reembolso médico Ecuador, portal afiliados',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/agendamiento' => [
    'title'       => 'Agendamiento de Citas Médicas | Colmedikal Ecuador',
    'description' => 'Agenda tu cita médica con especialistas de Colmedikal. Atención presencial y telemedicina disponibles.',
    'keywords'    => 'agendar cita médica Ecuador, telemedicina prepagada, consulta médica online',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/faqs' => [
    'title'       => 'Preguntas Frecuentes sobre Medicina Prepagada | Colmedikal',
    'description' => '¿Qué es la medicina prepagada? ¿En qué se diferencia del IESS? Resolvemos todas tus dudas sobre planes médicos privados en Ecuador.',
    'keywords'    => 'preguntas medicina prepagada, diferencia IESS seguro privado, cómo funciona prepagada',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/contacto' => [
    'title'       => 'Contacto | Colmedikal Ecuador — Asesores de Medicina Prepagada',
    'description' => 'Contáctanos para asesoría personalizada sobre planes de medicina prepagada en Ecuador. WhatsApp, email y atención presencial disponibles.',
    'keywords'    => 'contacto Colmedikal, asesor medicina prepagada Ecuador, WhatsApp salud',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/blog' => [
    'title'       => 'Blog Médico y Guía de Bienestar | Colmedikal Ecuador',
    'description' => 'Artículos sobre medicina prepagada, prevención y salud en Ecuador escritos por especialistas de Colmedikal.',
    'keywords'    => 'blog salud Ecuador, artículos medicina prepagada, guía bienestar',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
  '/blog-detalle' => [
    'title'       => 'Blog | Colmedikal Ecuador',
    'description' => 'Lee este artículo del blog médico de Colmedikal Ecuador.',
    'keywords'    => 'blog salud Ecuador, Colmedikal',
    'og_image'    => 'https://colmedikal.com/og-image.png',
  ],
];

$meta = $routes[$basePath] ?? $routes['/'];

$indexFile = __DIR__ . '/index.html';
if (!file_exists($indexFile)) {
    http_response_code(404);
    echo 'index.html not found';
    exit;
}

$html = file_get_contents($indexFile);

// Replace <title>
$title = htmlspecialchars($meta['title'], ENT_QUOTES, 'UTF-8');
$html = preg_replace('/<title>[^<]*<\/title>/', "<title>{$title}</title>", $html);

// Inject meta + OG tags before </head>
$desc    = htmlspecialchars($meta['description'], ENT_QUOTES, 'UTF-8');
$kw      = htmlspecialchars($meta['keywords'],    ENT_QUOTES, 'UTF-8');
$ogImg   = htmlspecialchars($meta['og_image'],    ENT_QUOTES, 'UTF-8');
$canonical = 'https://colmedikal.com' . htmlspecialchars($path, ENT_QUOTES, 'UTF-8');

$inject = "
  <meta name=\"description\" content=\"{$desc}\" />
  <meta name=\"keywords\" content=\"{$kw}\" />
  <link rel=\"canonical\" href=\"{$canonical}\" />
  <meta property=\"og:title\" content=\"{$title}\" />
  <meta property=\"og:description\" content=\"{$desc}\" />
  <meta property=\"og:type\" content=\"website\" />
  <meta property=\"og:url\" content=\"{$canonical}\" />
  <meta property=\"og:image\" content=\"{$ogImg}\" />
  <meta name=\"twitter:card\" content=\"summary_large_image\" />
  <meta name=\"twitter:title\" content=\"{$title}\" />
  <meta name=\"twitter:description\" content=\"{$desc}\" />";

$html = str_replace('</head>', $inject . "\n  </head>", $html);

header('Content-Type: text/html; charset=UTF-8');
echo $html;
