import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Page, BlogPost } from '../types';
import { SEO_MATRIX, PageSEOMetadata } from './seoMatrix';
import { BLOG_POSTS } from '../data/blogData';
import { useColmedikal } from '../context/ColmedikalContext';
const sedePrincipalBuilding = '/og-image.jpg';

const PROTECTED_PATHS = ['/seo-panel', '/power-seo', '/admin'];

export default function SEOController() {
  const location = useLocation();
  const { seoMetaOverrides } = useColmedikal();

  useEffect(() => {
    const path = location.pathname;

    // Helper — defined first so it works in early returns too
    const upsertMeta = (attr: string, val: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    // Protected admin routes → force noindex and bail out early
    if (PROTECTED_PATHS.some(p => path.startsWith(p))) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
      return;
    }

    // 1. Resolve current page key
    let currentPage = 'home';
    let activeBlogPost: BlogPost | null = null;

    if (path === '/' || path === '/home') currentPage = 'home';
    else if (path.startsWith('/servicios'))    currentPage = 'servicios';
    else if (path.startsWith('/directorio'))   currentPage = 'directorio';
    else if (path.startsWith('/nosotros'))     currentPage = 'nosotros';
    else if (path.startsWith('/faqs'))         currentPage = 'faqs';
    else if (path.startsWith('/contacto'))     currentPage = 'contacto';
    else if (path.startsWith('/cotizador'))    currentPage = 'cotizador';
    else if (path.startsWith('/tramites'))     currentPage = 'tramites';
    else if (path.startsWith('/agendamiento')) currentPage = 'agendamiento';
    else if (path.startsWith('/portal'))       currentPage = 'portal';
    else if (path.startsWith('/blog')) {
      const slug = path.replace('/blog/', '').replace('/blog', '');
      if (slug && slug !== '/') {
        currentPage = 'blog-detalle';
        activeBlogPost = BLOG_POSTS.find(p => p.slug === slug || p.id === slug) || null;
      } else {
        currentPage = 'blog';
      }
    }

    // 2. Pick metadata
    let meta: PageSEOMetadata | null = null;
    if (currentPage === 'blog-detalle' && activeBlogPost) {
      meta = {
        title: `${activeBlogPost.title} | Blog Colmedikal`,
        description: activeBlogPost.excerpt,
        keywords: activeBlogPost.tags.join(', '),
        robots: 'index, follow',
        geoRegion: 'EC-P',
        geoPlacename: 'Quito, Ecuador',
        geoPosition: '-0.180653;-78.467834',
        icbm: '-0.180653, -78.467834',
        schemaType: 'Blog',
        ogType: 'article',
        aioQueryAnswer: {
          targetQuery: `Explicación sobre: ${activeBlogPost.title}`,
          conciseAnswer: activeBlogPost.excerpt
        }
      };
    } else {
      meta = SEO_MATRIX[currentPage] || SEO_MATRIX['home'];
    }

    if (!meta) return;

    // 3. DB override wins over seoMatrix
    const ovKey = location.pathname.replace(/\/$/, '') || '/';
    const ov = seoMetaOverrides?.[ovKey];
    if (ov) {
      meta = {
        ...meta,
        title:       ov.title       || meta.title,
        description: ov.description || meta.description,
        keywords:    ov.keywords    || meta.keywords,
      };
    }

    // 4. Core meta tags
    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'keywords',    meta.keywords);
    upsertMeta('name', 'robots',      meta.robots || 'index, follow');

    // 5. GEO tags
    upsertMeta('name', 'geo.region',    meta.geoRegion);
    upsertMeta('name', 'geo.placename', meta.geoPlacename);
    upsertMeta('name', 'geo.position',  meta.geoPosition);
    upsertMeta('name', 'ICBM',          meta.icbm);

    // 6. Canonical + og:url
    const canonicalUrl = 'https://colmedikal.com' + (location.pathname === '/' ? '' : location.pathname.replace(/\/$/, ''));
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 7. OpenGraph
    const ogImage = (currentPage === 'blog-detalle' && activeBlogPost) ? activeBlogPost.image : sedePrincipalBuilding;
    upsertMeta('property', 'og:title',       meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:type',        meta.ogType);
    upsertMeta('property', 'og:url',         canonicalUrl);
    upsertMeta('property', 'og:site_name',   'Colmedikal Prepagada');
    upsertMeta('property', 'og:image',       ogImage);

    // 8. Twitter Card
    upsertMeta('name', 'twitter:card',        'summary_large_image');
    upsertMeta('name', 'twitter:title',       meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image',       ogImage);

    // 9. AIO
    upsertMeta('name', 'aio-target-query',  meta.aioQueryAnswer.targetQuery);
    upsertMeta('name', 'aio-answer-summary', meta.aioQueryAnswer.conciseAnswer);

    // 10. Schema JSON-LD
    const orgBase = {
      '@type': 'Organization',
      '@id': 'https://colmedikal.com/#organization',
      'name': 'Colmedikal S.A.',
      'url': 'https://colmedikal.com',
      'logo': 'https://colmedikal.com/logo.png',
      'sameAs': ['https://www.facebook.com/colmedikal', 'https://www.instagram.com/colmedikal', 'https://www.linkedin.com/company/colmedikal']
    };

    const addressBase = {
      '@type': 'PostalAddress',
      'streetAddress': 'Av. República E6-447 y Eloy Alfaro, Ed. Castillo Sánchez',
      'addressLocality': 'Quito',
      'addressRegion': 'Pichincha',
      'postalCode': '170150',
      'addressCountry': 'EC'
    };

    let schemaJson: Record<string, any> | null = null;

    if (currentPage === 'blog-detalle' && activeBlogPost) {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'mainEntityOfPage': { '@type': 'WebPage', '@id': `https://colmedikal.com/blog/${activeBlogPost.slug}` },
        'headline': activeBlogPost.title,
        'description': activeBlogPost.excerpt,
        'image': activeBlogPost.image,
        'datePublished': activeBlogPost.publishDate,
        'author': {
          '@type': 'Person',
          'name': activeBlogPost.author.name,
          'jobTitle': activeBlogPost.author.role,
          'description': activeBlogPost.author.bio,
          'knowsAbout': [activeBlogPost.author.specialty || 'Medicina Prepagada']
        },
        'publisher': { '@type': 'Organization', 'name': 'Colmedikal', 'logo': { '@type': 'ImageObject', 'url': 'https://colmedikal.com/logo.png' } }
      };

    } else if (currentPage === 'faqs') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          { '@type': 'Question', 'name': '¿Quiénes somos y qué ofrecemos para ti y tu familia?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Colmedikal S.A. es una empresa ecuatoriana de medicina prepagada que brinda soluciones integrales de salud. Nuestros planes ofrecen acceso a una amplia red de médicos, especialistas, clínicas y hospitales, con el respaldo de una atención oportuna, cercana y de calidad. Más de 15 años nos respaldan.' } },
          { '@type': 'Question', 'name': '¿Cómo puedo contratar un plan de medicina prepagada con Colmedikal?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Ingresa al cotizador en nuestra página web (colmedikal.com/cotizador), completa tus datos personales, selecciona el tipo de plan (individual, pareja o familiar), revisa tu cotización personalizada y elige el plan ideal: Plan Inicio 2K, Plan Protección 3K o Plan Plus 5K. Contáctanos a través del formulario o vía WhatsApp.' } },
          { '@type': 'Question', 'name': '¿Es posible incluir a mi familia en un solo plan de medicina prepagada?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Sí. En Colmedikal S.A. ofrecemos planes familiares que permiten proteger a tus seres queridos con una sola afiliación, brindándoles acceso a atención médica de calidad, beneficios integrales y el respaldo de una amplia red de prestadores de salud.' } },
          { '@type': 'Question', 'name': '¿Qué debo hacer para reservar una cita médica?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Puedes agendar tu cita médica en colmedikal.com/agendamiento, comunicándote con nuestro equipo de Atención al Cliente, o ingresando a la sección Trámites en Línea (colmedikal.com/tramites) de nuestra página web.' } },
          { '@type': 'Question', 'name': '¿En qué clínicas y centros médicos puedo utilizar mi plan?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Nuestra red de prestadores está conformada por clínicas, hospitales y centros médicos de reconocida trayectoria en Quito, Guayaquil, Cuenca, Manta y Ambato. Consulta el listado completo en colmedikal.com/directorio.' } },
          { '@type': 'Question', 'name': '¿Cómo puedo comunicarme con un asesor de Colmedikal?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Puedes enviarnos un mensaje de contacto en colmedikal.com/contacto, escribirnos por WhatsApp al 098 702 8756, o llamarnos al 02-2567191. Nuestro equipo estará encantado de atenderte.' } },
          { '@type': 'Question', 'name': '¿Qué es el período de carencia y cuándo puedo hacer uso de mi plan?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'El período de carencia es el tiempo obligatorio desde la firma del contrato antes de que se activen las coberturas. Los plazos son: Emergencia y Accidentes: 24 horas; Atención Ambulatoria y Dental: 30 días; Maternidad: 60-90 días; Hospitalización y Cirugía: 90 días; Enfermedades Preexistentes Declaradas: 730 días (24 meses).' } },
          { '@type': 'Question', 'name': '¿Tienen cobertura las enfermedades preexistentes?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Sí. Las preexistencias declaradas tendrán cobertura obligatoria a partir del mes 25 de vigencia consecutiva del plan, hasta el límite anual contratado, de conformidad con la Ley ecuatoriana vigente. Las condiciones no declaradas quedan excluidas permanentemente.' } }
        ]
      };

    } else if (currentPage === 'nosotros') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://colmedikal.com/#organization',
        'name': 'Colmedikal S.A.',
        'url': 'https://colmedikal.com',
        'logo': 'https://colmedikal.com/logo.png',
        'foundingDate': '2011-10-05',
        'description': meta.description,
        'address': addressBase,
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+593-2-2567191',
          'contactType': 'customer service',
          'areaServed': 'EC',
          'availableLanguage': 'Spanish'
        },
        'sameAs': ['https://www.facebook.com/colmedikal', 'https://www.instagram.com/colmedikal', 'https://www.linkedin.com/company/colmedikal']
      };

    } else if (currentPage === 'servicios') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        '@id': 'https://colmedikal.com/#medorg',
        'name': 'Colmedikal — Servicios de Medicina Prepagada',
        'url': 'https://colmedikal.com/servicios',
        'description': meta.description,
        'address': addressBase,
        'medicalSpecialty': ['Emergency', 'Geriatric', 'Pediatric', 'Obstetrics'],
        'availableService': [
          { '@type': 'MedicalTherapy', 'name': 'Consulta Externa con Especialistas' },
          { '@type': 'MedicalTherapy', 'name': 'Hospitalización en Suite Privada' },
          { '@type': 'EmergencyService', 'name': 'Emergencias Médicas 24/7' },
          { '@type': 'MedicalTherapy', 'name': 'Maternidad y Cuidado Neonatal (UCIN)' },
          { '@type': 'MedicalTherapy', 'name': 'Odontología Integral' },
          { '@type': 'MedicalTherapy', 'name': 'Farmacia y Medicamentos' }
        ],
        'areaServed': [
          { '@type': 'City', 'name': 'Quito' },
          { '@type': 'City', 'name': 'Guayaquil' },
          { '@type': 'City', 'name': 'Cuenca' },
          { '@type': 'City', 'name': 'Manta' },
          { '@type': 'City', 'name': 'Ambato' }
        ]
      };

    } else if (currentPage === 'contacto') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': 'https://colmedikal.com/#localbusiness',
        'name': 'Colmedikal Medicina Prepagada',
        'image': sedePrincipalBuilding,
        'url': 'https://colmedikal.com',
        'telephone': '+593-2-2567191',
        'address': addressBase,
        'geo': { '@type': 'GeoCoordinates', 'latitude': -0.180653, 'longitude': -78.467834 },
        'openingHoursSpecification': [
          { '@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday','Tuesday','Wednesday','Thursday','Friday'], 'opens': '08:30', 'closes': '18:30' }
        ],
        'sameAs': ['https://www.facebook.com/colmedikal', 'https://www.instagram.com/colmedikal', 'https://www.linkedin.com/company/colmedikal']
      };

    } else if (currentPage === 'blog') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        '@id': 'https://colmedikal.com/blog',
        'name': 'Blog de Salud Colmedikal',
        'description': meta.description,
        'url': 'https://colmedikal.com/blog',
        'inLanguage': 'es-EC',
        'publisher': { '@type': 'Organization', 'name': 'Colmedikal', 'logo': { '@type': 'ImageObject', 'url': 'https://colmedikal.com/logo.png' } }
      };

    } else if (currentPage === 'agendamiento') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        'name': 'Colmedikal — Agendamiento de Citas',
        'url': 'https://colmedikal.com/agendamiento',
        'description': meta.description,
        'telephone': '+593-2-2567191',
        'address': addressBase
      };

    } else if (currentPage === 'tramites') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': meta.title,
        'description': meta.description,
        'url': 'https://colmedikal.com/tramites',
        'isPartOf': { '@type': 'WebSite', 'url': 'https://colmedikal.com', 'name': 'Colmedikal' }
      };

    } else if (meta.schemaType === 'MedicalBusiness') {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        '@id': 'https://colmedikal.com/#localbusiness',
        'name': 'Colmedikal Medicina Prepagada',
        'image': sedePrincipalBuilding,
        'telephone': '+593-2-2567191',
        'priceRange': '$$$',
        'address': addressBase,
        'geo': { '@type': 'GeoCoordinates', 'latitude': -0.180653, 'longitude': -78.467834 },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
          'opens': '00:00', 'closes': '23:59'
        },
        'areaServed': [
          { '@type': 'City', 'name': 'Quito' },
          { '@type': 'City', 'name': 'Guayaquil' },
          { '@type': 'City', 'name': 'Cuenca' },
          { '@type': 'City', 'name': 'Manta' },
          { '@type': 'City', 'name': 'Ambato' }
        ]
      };

    } else {
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': meta.title,
        'description': meta.description,
        'url': 'https://colmedikal.com',
        'publisher': { '@context': 'https://schema.org', ...orgBase }
      };
    }

    // Inject/replace schema script
    let scriptEl = document.getElementById('colmedikal-seo-schema');
    if (scriptEl) {
      scriptEl.textContent = JSON.stringify(schemaJson);
    } else {
      scriptEl = document.createElement('script');
      scriptEl.setAttribute('id', 'colmedikal-seo-schema');
      scriptEl.setAttribute('type', 'application/ld+json');
      scriptEl.textContent = JSON.stringify(schemaJson);
      document.head.appendChild(scriptEl);
    }

  }, [location.pathname, seoMetaOverrides]);

  return null;
}
