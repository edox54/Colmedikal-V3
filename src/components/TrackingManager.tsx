import { useEffect, useCallback } from 'react';
import { useColmedikal } from '../context/ColmedikalContext';
import { getStoredConsent } from './CookieConsent';

export default function TrackingManager() {
  const { seoSettings } = useColmedikal();

  const loadScripts = useCallback(() => {
    if (!seoSettings || Object.keys(seoSettings).length === 0) return;

    const consent = getStoredConsent();
    if (!consent) return; // Waiting for user decision

    const { statistics, marketing } = consent;

    // These IDs get interpolated into inline <script> bodies, so validate their
    // format strictly — reject anything with quotes/parens/semicolons/spaces to
    // prevent script injection if the settings source is ever tampered with.
    const validId = (v?: string) =>
      (typeof v === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(v)) ? v : '';
    const ga4_id = validId(seoSettings.ga4_id);
    const gtm_id = validId(seoSettings.gtm_id);
    const fb_pixel_id = validId(seoSettings.fb_pixel_id);
    const google_ads_id = validId(seoSettings.google_ads_id);
    const gsc_verification =
      (typeof seoSettings.gsc_verification === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(seoSettings.gsc_verification))
        ? seoSettings.gsc_verification : '';

    // GSC verification meta tag — functional, no consent needed
    if (gsc_verification) {
      let m = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement | null;
      if (!m) { m = document.createElement('meta'); m.name = 'google-site-verification'; document.head.appendChild(m); }
      m.content = gsc_verification;
    }

    // Statistics: Google Analytics 4
    if (statistics && ga4_id && !document.getElementById('ga4-script')) {
      const s1 = document.createElement('script');
      s1.id = 'ga4-script'; s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4_id}`;
      document.head.appendChild(s1);
      const s2 = document.createElement('script');
      s2.id = 'ga4-init';
      s2.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4_id}');`;
      document.head.appendChild(s2);
    }

    // Statistics or Marketing: Google Tag Manager
    if ((statistics || marketing) && gtm_id && !document.getElementById('gtm-script')) {
      const s = document.createElement('script');
      s.id = 'gtm-script';
      s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm_id}');`;
      document.head.appendChild(s);
      if (!document.getElementById('gtm-noscript')) {
        const ns = document.createElement('noscript');
        ns.id = 'gtm-noscript';
        ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtm_id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
        document.body.insertBefore(ns, document.body.firstChild);
      }
    }

    // Marketing: Facebook Pixel
    if (marketing && fb_pixel_id && !document.getElementById('fb-pixel')) {
      const s = document.createElement('script');
      s.id = 'fb-pixel';
      s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb_pixel_id}');fbq('track','PageView');`;
      document.head.appendChild(s);
    }

    // Marketing: Google Ads
    if (marketing && google_ads_id && !document.getElementById('gads-script')) {
      const s = document.createElement('script');
      s.id = 'gads-script'; s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${google_ads_id}`;
      document.head.appendChild(s);
      const s2 = document.createElement('script');
      s2.id = 'gads-init';
      s2.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${google_ads_id}');`;
      document.head.appendChild(s2);
    }
  }, [seoSettings]);

  useEffect(() => {
    loadScripts();
    window.addEventListener('colmedikal:consent-updated', loadScripts);
    return () => window.removeEventListener('colmedikal:consent-updated', loadScripts);
  }, [loadScripts]);

  return null;
}
