import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Page, BlogPost } from '../types';
import { SEO_MATRIX, PageSEOMetadata } from './seoMatrix';
import { BLOG_POSTS } from '../data/blogData';
import { useColmedikal } from '../context/ColmedikalContext';
import sedePrincipalBuilding from '../assets/images/sede_principal_building_1780025281820.png';

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

    // 7. Update AIO (AI search optimization) meta headers for web crawlers
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
            'name': '¿Cuál es la diferencia entre el seguro del IESS y la medicina prepagada Colmedikal?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'La medicina prepagada de Colmedikal es una cobertura privada e independiente del IESS que brinda acceso inmediato a especialidades sin cita con médico general, hospitalización en suites de clínicas premium de Ecuador, exámenes de tercer nivel sin trámites dilatados, y una amplia gama de terapias de rehabilitación ilimitadas.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Cómo funcionan los periodos de carencia?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Los periodos de carencia de Colmedikal definen desde cuándo gozas de ciertas prestaciones en tu plan en Ecuador. Por ejemplo, urgencias médicas se cubren al primer día de afiliación, procedimientos quirúrgicos programados a los 30 días, y eventos obstétricos o de parto a los 3 meses.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Cómo puedo radicar una solicitud de reembolso de facturas?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'La solicitud de reembolso se gestiona de manera 100% digital a través del Portal de Afiliados de Colmedikal. Solo debes adjuntar la factura formal del médico externo con el diagnóstico y en promedio 5 días hábiles transferimos los fondos de manera segura a tu cuenta bancaria.'
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
