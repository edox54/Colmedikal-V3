import React, { useState, useEffect } from 'react';
import { Save, Copy, CheckCircle, Globe, Code, Map, Bot, Upload } from 'lucide-react';
import { useColmedikal } from '../context/ColmedikalContext';
import { BLOG_POSTS } from '../data/blogData';
import { SEO_MATRIX } from '../seo/seoMatrix';

const ROUTES = [
  { path: '/', label: 'Inicio' },
  { path: '/servicios', label: 'Servicios' },
  { path: '/directorio', label: 'Directorio Médico' },
  { path: '/nosotros', label: 'Nosotros' },
  { path: '/cotizador', label: 'Cotizador' },
  { path: '/tramites', label: 'Trámites en línea' },
  { path: '/agendamiento', label: 'Agendamiento de Citas' },
  { path: '/faqs', label: 'Preguntas Frecuentes' },
  { path: '/contacto', label: 'Contacto' },
  { path: '/blog', label: 'Blog' },
];

type SeoTab = 'tracking' | 'meta' | 'sitemap' | 'robots';

const FIELD_LABELS: Record<string, { label: string; placeholder: string; hint: string }> = {
  ga4_id:           { label: 'Google Analytics 4 ID',       placeholder: 'G-XXXXXXXXXX',      hint: 'Measurement ID de GA4' },
  gtm_id:           { label: 'Google Tag Manager ID',        placeholder: 'GTM-XXXXXXX',       hint: 'Container ID de GTM' },
  gsc_verification: { label: 'Google Search Console',        placeholder: 'xxxxxxxxxxxxxxxxxxxx', hint: 'Valor del meta content de verificación' },
  fb_pixel_id:      { label: 'Facebook / Meta Pixel ID',     placeholder: '1234567890123456',  hint: 'ID numérico del Pixel' },
  google_ads_id:    { label: 'Google Ads Conversion ID',     placeholder: 'AW-XXXXXXXXXX',     hint: 'ID de conversión de Google Ads' },
};

const ROUTE_TO_KEY: Record<string, string> = {
  '/': 'home', '/servicios': 'servicios', '/directorio': 'directorio',
  '/nosotros': 'nosotros', '/cotizador': 'cotizador', '/faqs': 'faqs',
  '/contacto': 'contacto', '/blog': 'blog',
};

export default function SEODashboard({ initialTab }: { initialTab?: SeoTab }) {
  const { seoSettings, saveSEOSettings, seoMetaOverrides, saveSeoMetaOverride, blogPostsCMS, publishSitemap, publishRobots } = useColmedikal();
  const [activeTab, setActiveTab] = useState<SeoTab>(initialTab || 'tracking');

  // Fix: sync when sidebar nav changes tab
  useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [savedTracking, setSavedTracking] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState('/');
  const [metaForm, setMetaForm] = useState({ title: '', description: '', keywords: '' });
  const [savedMeta, setSavedMeta] = useState(false);
  const [copied, setCopied] = useState(false);
  const [robotsText, setRobotsText] = useState('');
  const [savedRobots, setSavedRobots] = useState(false);
  const [publishingSitemap, setPublishingSitemap] = useState(false);
  const [publishedSitemap, setPublishedSitemap] = useState(false);
  const [publishingRobots, setPublishingRobots] = useState(false);
  const [publishedRobots, setPublishedRobots] = useState(false);
  const [metaSource, setMetaSource] = useState<'matrix' | 'override'>('matrix');

  // Initialize tracking from seoSettings
  useEffect(() => {
    const t: Record<string, string> = {};
    Object.keys(FIELD_LABELS).forEach(k => { t[k] = seoSettings[k] || ''; });
    setTracking(t);
  }, [seoSettings]);

  // Initialize meta form when route changes — prefer saved override, fall back to seoMatrix
  useEffect(() => {
    const override = seoMetaOverrides?.[selectedRoute];
    const matrixKey = ROUTE_TO_KEY[selectedRoute];
    const matrix = matrixKey ? SEO_MATRIX[matrixKey] : null;
    const hasOverride = !!(override?.title || override?.description);
    setMetaSource(hasOverride ? 'override' : 'matrix');
    setMetaForm({
      title: override?.title || matrix?.title || '',
      description: override?.description || matrix?.description || '',
      keywords: override?.keywords || matrix?.keywords || '',
    });
  }, [selectedRoute, seoMetaOverrides]);

  // Initialize robots.txt
  useEffect(() => {
    setRobotsText(seoSettings['robots_txt'] || `User-agent: *\nAllow: /\n\nDisallow: /admin\nDisallow: /admin/\nDisallow: /cotizador\n\nSitemap: https://colmedikal.com/sitemap.xml`);
  }, [seoSettings]);

  const handleSaveTracking = async () => {
    await saveSEOSettings(tracking);
    setSavedTracking(true);
    setTimeout(() => setSavedTracking(false), 2500);
  };

  const handleSaveMeta = async () => {
    await saveSeoMetaOverride(selectedRoute, metaForm);
    setSavedMeta(true);
    setTimeout(() => setSavedMeta(false), 2500);
  };

  const handleSaveRobots = async () => {
    await saveSEOSettings({ robots_txt: robotsText });
    setSavedRobots(true);
    setTimeout(() => setSavedRobots(false), 2500);
  };

  // Normalize any date to ISO 8601 (YYYY-MM-DD) — sitemap <lastmod> requires it.
  // Handles Spanish format ("28 de Mayo de 2026"), ISO datetime, and falls back to today.
  const toISODate = (d?: string): string => {
    const today = new Date().toISOString().split('T')[0];
    if (!d) return today;
    const iso = d.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
    const MONTH_ES: Record<string, string> = {
      enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
      julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12',
    };
    const m = d.match(/^(\d{1,2}) de (\w+) de (\d{4})$/i);
    if (m) return `${m[3]}-${MONTH_ES[m[2].toLowerCase()] || '01'}-${m[1].padStart(2, '0')}`;
    return today;
  };

  // Generate sitemap XML
  const staticRoutes = ROUTES.map(r => `  <url>\n    <loc>https://colmedikal.com${r.path}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${r.path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`);
  const blogRoutes = [
    ...BLOG_POSTS.map(p => `  <url>\n    <loc>https://colmedikal.com/blog/${p.slug}</loc>\n    <lastmod>${toISODate(p.publishDate)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`),
    ...blogPostsCMS.filter(p => p.published).map(p => `  <url>\n    <loc>https://colmedikal.com/blog/${p.slug}</loc>\n    <lastmod>${toISODate(p.publish_date || p.created_at)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticRoutes, ...blogRoutes].join('\n')}\n</urlset>`;

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(sitemap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishSitemap = async () => {
    setPublishingSitemap(true);
    try { await publishSitemap(sitemap); setPublishedSitemap(true); setTimeout(() => setPublishedSitemap(false), 3000); }
    catch (e: any) { alert('Error al publicar sitemap: ' + (e?.message || 'desconocido')); }
    finally { setPublishingSitemap(false); }
  };

  const handlePublishRobots = async () => {
    setPublishingRobots(true);
    try { await publishRobots(robotsText); setPublishedRobots(true); setTimeout(() => setPublishedRobots(false), 3000); }
    catch (e: any) { alert('Error al publicar robots.txt: ' + (e?.message || 'desconocido')); }
    finally { setPublishingRobots(false); }
  };

  const tabs: { id: SeoTab; label: string; icon: React.ReactNode }[] = [
    { id: 'tracking', label: 'Tracking & Códigos', icon: <Code className="w-3.5 h-3.5" /> },
    { id: 'meta',     label: 'Meta SEO por URL',   icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'sitemap',  label: 'Sitemap',             icon: <Map className="w-3.5 h-3.5" /> },
    { id: 'robots',   label: 'Robots.txt',          icon: <Bot className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-xl font-bold text-slate-950">Panel SEO & Marketing</h3>
        <p className="text-xs text-slate-500 mt-1">Gestiona tracking, metadatos, sitemap y robots.txt desde un solo lugar.</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === t.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* TRACKING */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Códigos de Rastreo y Verificación</h4>
            <p className="text-[11px] text-slate-500">Los códigos se inyectan automáticamente en el &lt;head&gt; cuando se guarden.</p>
          </div>

          <div className="space-y-4">
            {Object.entries(FIELD_LABELS).map(([key, meta]) => (
              <div key={key} className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{meta.label}</label>
                <input
                  type="text"
                  value={tracking[key] || ''}
                  placeholder={meta.placeholder}
                  onChange={e => setTracking(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#4597CA]"
                />
                <p className="text-[10px] text-slate-400">{meta.hint}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveTracking}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            {savedTracking ? <><CheckCircle className="w-4 h-4 text-emerald-400" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar Códigos</>}
          </button>
        </div>
      )}

      {/* META SEO */}
      {activeTab === 'meta' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-2xl">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Metadatos por Página</h4>
            <p className="text-[11px] text-slate-500">Sobreescribe el título, descripción y keywords de cada URL.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Seleccionar Página</label>
            <select
              value={selectedRoute}
              onChange={e => setSelectedRoute(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
            >
              {ROUTES.map(r => <option key={r.path} value={r.path}>{r.label} ({r.path})</option>)}
            </select>
            <p className="text-[10px] mt-1">
              {metaSource === 'override'
                ? <span className="text-emerald-600 font-bold">✓ Override guardado en BD — sobreescribe el código</span>
                : <span className="text-amber-600 font-bold">⚠ Usando valores del código (seoMatrix.ts) — guarda para crear override</span>
              }
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Title Tag <span className="text-slate-400 font-normal">— máx. 60 caracteres</span></label>
              <input
                type="text"
                maxLength={70}
                value={metaForm.title}
                onChange={e => setMetaForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Título SEO de la página..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
              />
              <p className="text-[10px] text-slate-400">{metaForm.title.length}/70 caracteres</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Meta Description <span className="text-slate-400 font-normal">— máx. 160 caracteres</span></label>
              <textarea
                rows={3}
                maxLength={170}
                value={metaForm.description}
                onChange={e => setMetaForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Descripción de la página para motores de búsqueda..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-[#4597CA]"
              />
              <p className="text-[10px] text-slate-400">{metaForm.description.length}/170 caracteres</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Keywords <span className="text-slate-400 font-normal">— separadas por comas</span></label>
              <input
                type="text"
                value={metaForm.keywords}
                onChange={e => setMetaForm(p => ({ ...p, keywords: e.target.value }))}
                placeholder="medicina prepagada, colmedikal, seguros de salud..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
              />
            </div>
          </div>

          <button
            onClick={handleSaveMeta}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all"
          >
            {savedMeta ? <><CheckCircle className="w-4 h-4 text-emerald-400" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar Meta</>}
          </button>
        </div>
      )}

      {/* SITEMAP */}
      {activeTab === 'sitemap' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Sitemap XML</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{ROUTES.length + BLOG_POSTS.length + blogPostsCMS.filter(p=>p.published).length} URLs — se regenera automáticamente al publicar artículos.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleCopySitemap}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all">
                {copied ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
              </button>
              <button onClick={handlePublishSitemap} disabled={publishingSitemap}
                className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
                {publishedSitemap ? <><CheckCircle className="w-3.5 h-3.5" /> Publicado</> : publishingSitemap ? 'Publicando...' : <><Upload className="w-3.5 h-3.5" /> Publicar en servidor</>}
              </button>
            </div>
          </div>

          <pre className="bg-slate-950 text-teal-300 text-[10px] font-mono p-4 rounded-2xl overflow-auto max-h-80 leading-relaxed">
            {sitemap}
          </pre>
        </div>
      )}

      {/* ROBOTS.TXT */}
      {activeTab === 'robots' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 max-w-2xl">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Robots.txt</h4>
            <p className="text-[11px] text-slate-500">Controla qué páginas rastrean los motores de búsqueda. Guarda y luego reemplaza el archivo en cPanel.</p>
          </div>

          <textarea
            rows={14}
            value={robotsText}
            onChange={e => setRobotsText(e.target.value)}
            className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs font-mono resize-none outline-none focus:border-[#4597CA] bg-slate-950 text-teal-300 leading-relaxed"
          />

          <div className="flex gap-3 flex-wrap">
            <button onClick={handleSaveRobots}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
              {savedRobots ? <><CheckCircle className="w-4 h-4 text-emerald-400" /> Guardado en BD</> : <><Save className="w-4 h-4" /> Guardar en BD</>}
            </button>
            <button onClick={handlePublishRobots} disabled={publishingRobots}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
              {publishedRobots ? <><CheckCircle className="w-4 h-4" /> Publicado</> : publishingRobots ? 'Publicando...' : <><Upload className="w-4 h-4" /> Publicar en servidor</>}
            </button>
            <button onClick={() => navigator.clipboard.writeText(robotsText)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
              <Copy className="w-3.5 h-3.5" /> Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
