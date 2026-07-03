import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Page, BlogPost } from '../types';
import { SEO_MATRIX, PageSEOMetadata } from './seoMatrix';
import { BLOG_POSTS } from '../data/blogData';
import { useColmedikal } from '../context/ColmedikalContext';
const sedePrincipalBuilding = '/og-image.jpg';

export default function SEOController() {
  const location = useLocation();
  const { seoMetaOverrides } = useColmedikal();

  useEffect(() => {
    // 1. Resolve correct metadata object
    let meta: PageSEOMetadata | null = null;
    let currentPage = 'home';
    let activeBlogPost: BlogPost | null = null;

    const path = location.pathname;
    if (path === '/' || path === '/home') currentPage = 'home';
    else if (path.startsWith('/servicios')) currentPage = 'servicios';
    else if (path.startsWith('/directorio')) currentPage = 'directorio';
    else if (path.startsWith('/nosotros')) currentPage = 'nosotros';
    else if (path.startsWith('/faqs')) currentPage = 'faqs';
    else if (path.startsWith('/contacto')) currentPage = 'contacto';
    else if (path.startsWith('/cotizador')) currentPage = 'cotizador';
    else if (path.startsWith('/portal') || path.startsWith('/tramites') || path.startsWith('/agendamiento')) currentPage = 'portal';
    else if (path.startsWith('/blog')) {
      const slug = path.replace('/blog/', '').replace('/blog', '');
      if (slug && slug !== '/') {
        currentPage = 'blog-detalle';
        activeBlogPost = BLOG_POSTS.find(post => post.slug === slug || post.id === slug) || null;
      } else {
        currentPage = 'blog';
      }
    }

    if (currentPage === 'blog-detalle' && activeBlogPost) {
      // Dynamic SEO for individual blog detail view
      meta = {
        title: `${activeBlogPost.title} | Blog Colmedikal`,
        description: activeBlogPost.excerpt,
        keywords: activeBlogPost.tags.join(', '),
        robots: 'index, follow', // Changed to index, follow for blog posts!
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
      // Standard static pages
      meta = SEO_MATRIX[currentPage] || SEO_MATRIX['home'];
    }

    if (!meta) return;

    // 1b. DB override from the SEO panel wins over seoMatrix (matches the
    // server-side SSR injection so the browser tab title stays consistent).
    const ovKey = location.pathname.replace(/\/$/, '') || '/';
    const ov = seoMetaOverrides?.[ovKey];
    if (ov) {
      meta = {
        ...meta,
        title: ov.title || meta.title,
        description: ov.description || meta.description,
        keywords: ov.keywords || meta.keywords,
      };
    }

    // 2. Head Title Tag
    document.title = meta.title;

    // 3. Helper to upsert meta elements
    const updateMetaTag = (attributeName: string, attributeValue: string, contentValue: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // 4. Update core meta elements
    updateMetaTag('name', 'description', meta.description);
    updateMetaTag('name', 'keywords', meta.keywords);
    updateMetaTag('name', 'robots', meta.robots || 'index, follow');

    // 5. Update GEO-targeting tags (for GEO SEO Google search intent)
    updateMetaTag('name', 'geo.region', meta.geoRegion);
    updateMetaTag('name', 'geo.placename', meta.geoPlacename);
    updateMetaTag('name', 'geo.position', meta.geoPosition);
    updateMetaTag('name', 'ICBM', meta.icbm);

    // 5b. Self-referencing canonical + og:url (must match current page, not homepage)
    const canonicalUrl = 'https://colmedikal.com' + (location.pathname === '/' ? '' : location.pathname.replace(/\/$/, ''));
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. Update OpenGraph Social tags
    updateMetaTag('property', 'og:title', meta.title);
    updateMetaTag('property', 'og:description', meta.description);
    updateMetaTag('property', 'og:type', meta.ogType);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:site_name', 'Colmedikal Prepagada');
    if (currentPage === 'blog-detalle' && activeBlogPost) {
      updateMetaTag('property', 'og:image', activeBlogPost.image);
    } else {
      updateMetaTag('property', 'og:image', sedePrincipalBuilding);
    }

    // 7. Twitter Card tags
    const ogImage = (currentPage === 'blog-detalle' && activeBlogPost)
      ? activeBlogPost.image
      : sedePrincipalBuilding;
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', meta.title);
    updateMetaTag('name', 'twitter:description', meta.description);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 8. Update AIO (AI search optimization) meta headers for web crawlers
    updateMetaTag('name', 'aio-target-query', meta.aioQueryAnswer.targetQuery);
    updateMetaTag('name', 'aio-answer-summary', meta.aioQueryAnswer.conciseAnswer);

    // 8. Dynamic Schema JSON-LD Injection
    let schemaJson: Record<string, any> | null = null;

    const baseCompanySchema = {
      '@context': 'https://schema.org',
      '@id': 'https://colmedikal.com/#organization',
      'name': 'Colmedikal',
      'url': 'https://colmedikal.com',
      'logo': 'https://colmedikal.com/logo.png',
      'sameAs': [
        'https://www.facebook.com/colmedikal',
        'https://www.instagram.com/colmedikal',
        'https://www.linkedin.com/company/colmedikal'
      ]
    };

    if (currentPage === 'blog-detalle' && activeBlogPost) {
      // BlogPosting Schema (E-E-A-T friendly)
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://colmedikal.com/blog/${activeBlogPost.slug}`
        },
        'headline': activeBlogPost.title,
        'description': activeBlogPost.excerpt,
        'image': activeBlogPost.image,
        'datePublished': activeBlogPost.publishDate,
        'author': {
          '@type': 'Person',
          'name': activeBlogPost.author.name,
          'jobTitle': activeBlogPost.author.role,
          'description': activeBlogPost.author.bio,
          'knowsAbout': [
            activeBlogPost.author.specialty || 'Medicina Prepagada'
          ]
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Colmedikal',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://colmedikal.com/logo.png'
          }
        }
      };
    } else if (currentPage === 'faqs') {
      // FAQPage Schema for direct SERP accordion integration
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '¿Quiénes somos y qué ofrecemos para ti y tu familia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Colmedikal S.A. es una empresa ecuatoriana de medicina prepagada que brinda soluciones integrales de salud. Nuestros planes ofrecen acceso a una amplia red de médicos, especialistas, clínicas y hospitales, con el respaldo de una atención oportuna, cercana y de calidad, orientada a proteger el bienestar y la tranquilidad de nuestros afiliados. Más de 15 años nos respaldan.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Cómo puedo contratar un plan de medicina prepagada con Colmedikal?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Da el primer paso para cuidar tu salud y la de tu familia: ingresa al cotizador en nuestra página web, completa tus datos personales, selecciona el tipo de plan (individual, pareja o familiar), revisa tu cotización personalizada y elige el plan ideal. Contáctanos a través de nuestro equipo de asesores o completa el formulario disponible en nuestra página web.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Es posible incluir a mi familia en un solo plan de medicina prepagada?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí. En Colmedikal S.A. ofrecemos planes familiares que permiten proteger a tus seres queridos con una sola afiliación, brindándoles acceso a atención médica de calidad, beneficios integrales y el respaldo de una amplia red de prestadores de salud.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Qué debo hacer para reservar una cita médica?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Puedes agendar tu cita médica comunicándote con nuestro equipo de Atención al Cliente o ingresando a la sección "Trámites en Línea" de nuestra página web, donde encontrarás la opción "Agendar Cita" para programar tu atención de forma rápida, segura y conveniente.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿En qué clínicas y centros médicos puedo utilizar mi plan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Nuestra red de prestadores está conformada por clínicas, hospitales y centros médicos de reconocida trayectoria. Consulta el listado completo y actualizado en la sección "Red de Prestadores" de nuestra página web.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Cómo puedo comunicarme con un asesor de Colmedikal?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Puedes escribirnos mediante el botón de WhatsApp de nuestra página web o comunicarte con nuestras líneas de atención. Nuestro equipo estará encantado de atenderte.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Qué es el período de carencia y a partir de qué momento puedo hacer uso efectivo de mi plan?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'El período de carencia es el lapso de tiempo obligatorio desde la firma del contrato durante el cual no se activan las coberturas programadas. Los plazos son: Emergencia Médica y Accidentes: 24 horas; Atención Ambulatoria y Dental: 30 días; Maternidad: 60 a 90 días; Hospitalización y Cirugía: 90 días; Enfermedades Preexistentes Declaradas: 730 días (24 meses).'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Tienen cobertura las enfermedades preexistentes?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Sí. Las preexistencias declaradas tendrán cobertura obligatoria a partir del mes 25 de vigencia consecutiva del plan, hasta el límite anual contratado, de conformidad con la Ley ecuatoriana vigente. Las condiciones no declaradas quedan excluidas permanentemente.'
            }
          }
        ]
      };
    } else if (meta.schemaType === 'MedicalBusiness') {
      // MedicalBusiness LocalBusiness Schema for local/GEO positioning in search engines
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'MedicalBusiness',
        '@id': 'https://colmedikal.com/#localbusiness',
        'name': 'Colmedikal Medicina Prepagada',
        'image': sedePrincipalBuilding,
        'telePhone': '+593 (2) 390-1200',
        'priceRange': '$$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Av. Republica E6-447 y Eloy Alfaro, Ed. Castillo Sanchez',
          'addressLocality': 'Quito',
          'addressRegion': 'Pichincha',
          'postalCode': '170150',
          'addressCountry': 'EC'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': -0.180653,
          'longitude': -78.467834
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ],
          'opens': '00:00',
          'closes': '23:59'
        },
        'areaServed': [
          { '@type': 'AdministrativeArea', 'name': 'Quito' },
          { '@type': 'AdministrativeArea', 'name': 'Guayaquil' },
          { '@type': 'AdministrativeArea', 'name': 'Cuenca' },
          { '@type': 'AdministrativeArea', 'name': 'Manta' },
          { '@type': 'AdministrativeArea', 'name': 'Ambato' }
        ]
      };
    } else {
      // Base Website/About Schema markup
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': meta.title,
        'description': meta.description,
        'url': 'https://colmedikal.com',
        'publisher': baseCompanySchema
      };
    }

    // Replace or insert schema block inside the DOM head
    let scriptElement = document.getElementById('colmedikal-seo-schema');
    if (scriptElement) {
      scriptElement.textContent = JSON.stringify(schemaJson);
    } else {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('id', 'colmedikal-seo-schema');
      scriptElement.setAttribute('type', 'application/ld+json');
      scriptElement.textContent = JSON.stringify(schemaJson);
      document.head.appendChild(scriptElement);
    }

  }, [location.pathname, seoMetaOverrides]);

  // This controller doesn't render visual aspects, it just orchestrates SEO header tags.
  return null;
}
