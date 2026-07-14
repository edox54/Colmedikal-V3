import type { LeadSource } from '../types';

const STORAGE_KEY = 'colmedikal_attribution';

const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'ads', 'display'];
const SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'l.instagram.com', 'lm.facebook.com', 'tiktok.com', 'twitter.com', 'x.com', 'linkedin.com', 't.co', 'wa.me'];
const SEARCH_HOSTS = ['google.', 'bing.com', 'yahoo.com', 'duckduckgo.com'];

function classify(params: URLSearchParams, referrer: string): LeadSource {
  const utmSource = params.get('utm_source') || undefined;
  const utmMedium = params.get('utm_medium') || undefined;
  const utmCampaign = params.get('utm_campaign') || undefined;
  const gclid = params.get('gclid');
  const fbclid = params.get('fbclid');
  const ref = params.get('ref') || undefined;

  let referrerHost = '';
  try { referrerHost = referrer ? new URL(referrer).hostname.replace(/^www\./, '') : ''; } catch { /* malformed referrer — treat as direct */ }

  if (ref) {
    return { channel: 'Referido', detail: ref, utmSource, utmMedium, utmCampaign, referrer: referrerHost || undefined };
  }
  if (gclid || fbclid || (utmMedium && PAID_MEDIUMS.includes(utmMedium.toLowerCase()))) {
    const detail = utmSource || (gclid ? 'Google Ads' : fbclid ? 'Meta Ads' : undefined);
    return { channel: 'Pago', detail, utmSource, utmMedium, utmCampaign, referrer: referrerHost || undefined };
  }
  if (utmSource) {
    return { channel: 'Campaña', detail: utmSource, utmSource, utmMedium, utmCampaign, referrer: referrerHost || undefined };
  }
  if (referrerHost && SOCIAL_HOSTS.some(h => referrerHost.includes(h))) {
    return { channel: 'Redes sociales', detail: referrerHost, referrer: referrerHost };
  }
  if (referrerHost && SEARCH_HOSTS.some(h => referrerHost.includes(h))) {
    return { channel: 'Orgánico', detail: referrerHost, referrer: referrerHost };
  }
  if (referrerHost) {
    return { channel: 'Otro sitio', detail: referrerHost, referrer: referrerHost };
  }
  return { channel: 'Directo' };
}

// First-touch attribution: the first visit "wins" and stays in localStorage
// indefinitely, UNLESS a later visit carries an explicit tracking signal
// (utm_*, gclid, fbclid, ref) — that always overrides, since it means the
// person clicked a specific tracked link again.
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const hasExplicitSignal = !!(params.get('utm_source') || params.get('gclid') || params.get('fbclid') || params.get('ref'));
    if (localStorage.getItem(STORAGE_KEY) && !hasExplicitSignal) return;

    const source = classify(params, document.referrer);
    source.landingPage = window.location.pathname;
    source.capturedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  } catch { /* localStorage unavailable — attribution is best-effort */ }
}

export function getStoredAttribution(): LeadSource | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch { return undefined; }
}
