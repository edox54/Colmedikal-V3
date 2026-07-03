import React, { useState, useCallback } from 'react';
import { Search, AlertCircle, Info, CheckCircle, Copy, ExternalLink, Image as ImageIcon, Link2, Sparkles } from 'lucide-react';
import { auditPage } from '@power-seo/audit';
import type { PageAuditResult } from '@power-seo/audit';
import { analyzeContent } from '@power-seo/content-analysis';
import type { ContentAnalysisResult } from '@power-seo/content-analysis';
import { analyzeAltText } from '@power-seo/images';
import { buildLinkGraph, analyzeLinkEquity, findOrphanPages } from '@power-seo/links';
import { buildMetaDescriptionPrompt, buildTitlePrompt } from '@power-seo/ai';
import { SEO_MATRIX } from '../seo/seoMatrix';

const BASE_URL = 'https://colmedikal.com';

const ROUTES_MAP = [
  { path: '/', label: 'Inicio' },
  { path: '/servicios', label: 'Servicios' },
  { path: '/directorio', label: 'Directorio Médico' },
  { path: '/nosotros', label: 'Nosotros' },
  { path: '/cotizador', label: 'Cotizador' },
  { path: '/tramites', label: 'Trámites en línea' },
  { path: '/agendamiento', label: 'Agendamiento' },
  { path: '/faqs', label: 'FAQs' },
  { path: '/contacto', label: 'Contacto' },
  { path: '/blog', label: 'Blog' },
];

const ROUTE_TO_KEY: Record<string, string> = {
  '/': 'home', '/servicios': 'servicios', '/directorio': 'directorio',
  '/nosotros': 'nosotros', '/cotizador': 'cotizador', '/faqs': 'faqs',
  '/contacto': 'contacto', '/blog': 'blog',
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
    : score >= 50 ? 'border-amber-400 bg-amber-50 text-amber-700'
    : 'border-rose-400 bg-rose-50 text-rose-700';
  const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : score >= 40 ? 'Regular' : 'Crítico';
  return (
    <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shrink-0 ${color}`}>
      <span className="text-3xl font-extrabold leading-none">{score}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );
}

function CatBar({ label, score, passed, warnings, errors }: { label: string; score: number; passed: number; warnings: number; errors: number }) {
  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-rose-500';
  return (
    <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-extrabold text-slate-900">{score}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex gap-2 text-[9px]">
        <span className="text-emerald-600 font-bold">{passed} ok</span>
        {warnings > 0 && <span className="text-amber-600 font-bold">{warnings} avisos</span>}
        {errors > 0 && <span className="text-rose-600 font-bold">{errors} errores</span>}
      </div>
    </div>
  );
}

function IssueItem({ rule }: { rule: { severity: string; title: string; description: string; category: string } }) {
  const styles = {
    error:   { wrap: 'bg-rose-50 border-rose-100',   badge: 'bg-rose-100 text-rose-700'   },
    warning: { wrap: 'bg-amber-50 border-amber-100', badge: 'bg-amber-100 text-amber-700' },
    info:    { wrap: 'bg-sky-50 border-sky-100',     badge: 'bg-sky-100 text-sky-700'     },
  }[rule.severity] ?? { wrap: 'bg-slate-50 border-slate-100', badge: 'bg-slate-100 text-slate-600' };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${styles.wrap}`}>
      {rule.severity === 'error'   && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
      {rule.severity === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
      {rule.severity === 'info'    && <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
      <div className="space-y-0.5">
        <p className="font-bold text-slate-800">{rule.title}</p>
        <p className="text-slate-600 leading-relaxed">{rule.description}</p>
        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${styles.badge}`}>
          {rule.severity} · {rule.category}
        </span>
      </div>
    </div>
  );
}

interface Props {
  seoMetaOverrides?: Record<string, { title?: string; description?: string; keywords?: string }>;
}

export default function SEOAuditPanel({ seoMetaOverrides }: Props) {
  const [auditRoute, setAuditRoute] = useState('/');
  const [auditKeyphrase, setAuditKeyphrase] = useState('');
  const [auditContent, setAuditContent] = useState('');
  const [imageInputs, setImageInputs] = useState('');
  const [auditResult, setAuditResult] = useState<PageAuditResult | null>(null);
  const [contentResult, setContentResult] = useState<ContentAnalysisResult | null>(null);
  const [imageResult, setImageResult] = useState<ReturnType<typeof analyzeAltText> | null>(null);
  const [linkEquity, setLinkEquity] = useState<{ url: string; score: number; inboundCount: number }[] | null>(null);
  const [orphans, setOrphans] = useState<string[]>([]);
  const [aiPrompts, setAiPrompts] = useState<{ title: { system: string; user: string } | null; desc: { system: string; user: string } | null }>({ title: null, desc: null });
  const [copied, setCopied] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const getPageMeta = useCallback((route: string) => {
    const override = seoMetaOverrides?.[route];
    const key = ROUTE_TO_KEY[route];
    const matrix = key ? SEO_MATRIX[key] : null;
    return {
      title:       override?.title       || matrix?.title       || '',
      description: override?.description || matrix?.description || '',
      keywords:    override?.keywords    || matrix?.keywords    || '',
      robots:      matrix?.robots || 'index, follow',
    };
  }, [seoMetaOverrides]);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const runAudit = useCallback(() => {
    setRunning(true);
    const { title, description, keywords, robots } = getPageMeta(auditRoute);
    const url = BASE_URL + auditRoute;
    const keyphrase = auditKeyphrase || keywords.split(',')[0]?.trim() || '';
    const contentHtml = auditContent
      ? `<h1>${title}</h1><p>${auditContent}</p>`
      : `<h1>${title}</h1><p>${description}</p>`;
    const wordCount = (auditContent || description).split(/\s+/).filter(Boolean).length;

    // 1. Full audit
    const pageR = auditPage({
      url, title, metaDescription: description, canonical: url, robots,
      openGraph: { title, description, image: `${BASE_URL}/og-image.jpg` },
      content: contentHtml,
      headings: [`h1:${title}`],
      images: [],
      internalLinks: ROUTES_MAP.filter(r => r.path !== auditRoute).map(r => r.path),
      externalLinks: [],
      focusKeyphrase: keyphrase,
      wordCount,
    });
    setAuditResult(pageR);

    // 2. Content analysis
    const contentR = analyzeContent({
      title, metaDescription: description, focusKeyphrase: keyphrase,
      content: contentHtml, images: [], internalLinks: ROUTES_MAP.filter(r => r.path !== auditRoute).map(r => r.path), externalLinks: [],
    });
    setContentResult(contentR);

    // 3. Image alt analysis (from user input or empty)
    const imageList = imageInputs.trim()
      ? imageInputs.split('\n').map(line => {
          const [src, ...rest] = line.split('|');
          return { src: src.trim(), alt: rest.join('|').trim() };
        }).filter(i => i.src)
      : [];
    if (imageList.length > 0) setImageResult(analyzeAltText(imageList));
    else setImageResult(null);

    // 4. Link equity for all pages
    const linkPages = ROUTES_MAP.map(r => ({
      url: BASE_URL + r.path,
      links: ROUTES_MAP.filter(x => x.path !== r.path).slice(0, 3).map(x => BASE_URL + x.path),
    }));
    try {
      const graph = buildLinkGraph(linkPages);
      const equity = analyzeLinkEquity(graph);
      setLinkEquity(equity.slice(0, 8));
      setOrphans(findOrphanPages(graph).slice(0, 5));
    } catch { setLinkEquity(null); }

    // 5. AI prompts
    try {
      const titlePrompt = buildTitlePrompt({ title, focusKeyphrase: keyphrase, content: contentHtml, url });
      const descPrompt = buildMetaDescriptionPrompt({ title, focusKeyphrase: keyphrase, content: contentHtml, url });
      setAiPrompts({
        title: titlePrompt as { system: string; user: string },
        desc: descPrompt as { system: string; user: string },
      });
    } catch { setAiPrompts({ title: null, desc: null }); }

    setRunning(false);
  }, [auditRoute, auditKeyphrase, auditContent, imageInputs, getPageMeta]);

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Config */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Auditoría SEO Completa</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Powered by @power-seo — análisis local, sin API externa. Incluye scoring, legibilidad, imágenes, links y prompts IA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Página a auditar</label>
            <select
              value={auditRoute}
              onChange={e => { setAuditRoute(e.target.value); setAuditResult(null); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
            >
              {ROUTES_MAP.map(r => <option key={r.path} value={r.path}>{r.label} ({r.path})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Palabra clave foco</label>
            <input
              type="text"
              value={auditKeyphrase}
              onChange={e => setAuditKeyphrase(e.target.value)}
              placeholder="medicina prepagada ecuador"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">Contenido de la página <span className="font-normal text-slate-400">(texto visible — mejora precisión)</span></label>
          <textarea rows={3} value={auditContent} onChange={e => setAuditContent(e.target.value)}
            placeholder="Pega aquí el contenido principal de la página..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-[#4597CA]" />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
            Imágenes para analizar <span className="font-normal text-slate-400">(una por línea: src|alt text)</span>
          </label>
          <textarea rows={3} value={imageInputs} onChange={e => setImageInputs(e.target.value)}
            placeholder={`/hero.jpg|Médicos colmedikal atendiendo pacientes\n/equipo.jpg|Equipo médico colmedikal quito`}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono resize-none outline-none focus:border-[#4597CA]" />
        </div>

        <button onClick={runAudit} disabled={running}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0C4169] hover:bg-[#0a3558] disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
          <Search className="w-4 h-4" />
          {running ? 'Analizando...' : 'Ejecutar Auditoría Completa'}
        </button>
      </div>

      {/* Results */}
      {auditResult && (
        <>
          {/* Overall score + categories */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-6 flex-wrap">
              <ScoreRing score={auditResult.score} />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {auditResult.score >= 80 ? 'Página bien optimizada'
                    : auditResult.score >= 60 ? 'Hay mejoras por hacer'
                    : auditResult.score >= 40 ? 'Requiere atención SEO'
                    : 'Optimización urgente'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">{BASE_URL}{auditRoute}</p>
                {auditKeyphrase && <p className="text-[11px] text-[#0C4169] font-bold">Keyphrase: {auditKeyphrase}</p>}
                <p className="text-[10px] text-slate-400">
                  {auditResult.rules.filter(r => r.severity === 'pass').length} reglas aprobadas ·{' '}
                  {auditResult.rules.filter(r => r.severity === 'error').length} errores ·{' '}
                  {auditResult.rules.filter(r => r.severity === 'warning').length} advertencias
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(auditResult.categories) as [string, { score: number; passed: number; warnings: number; errors: number }][]).map(([cat, data]) => {
                const labels: Record<string, string> = { meta: 'Meta Tags', content: 'Contenido', structure: 'Estructura', performance: 'Rendimiento' };
                return <CatBar key={cat} label={labels[cat] || cat} {...data} />;
              })}
            </div>
          </div>

          {/* Issues */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h5 className="text-sm font-bold text-slate-900">Problemas detectados</h5>
            <div className="space-y-2">
              {auditResult.rules
                .filter(r => r.severity !== 'pass')
                .sort((a, b) => ({ error: 0, warning: 1, info: 2 } as Record<string, number>)[a.severity] - ({ error: 0, warning: 1, info: 2 } as Record<string, number>)[b.severity])
                .map((rule, i) => <IssueItem key={i} rule={rule} />)
              }
              {auditResult.rules.filter(r => r.severity !== 'pass').length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-700">Sin problemas detectados</p>
                </div>
              )}
            </div>
          </div>

          {/* Content analysis */}
          {contentResult && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h5 className="text-sm font-bold text-slate-900">Análisis de Contenido <span className="font-normal text-slate-400 text-[11px]">— estilo Yoast</span></h5>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  contentResult.score / contentResult.maxScore >= 0.8 ? 'bg-emerald-100 text-emerald-700'
                  : contentResult.score / contentResult.maxScore >= 0.5 ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
                }`}>{contentResult.score} / {contentResult.maxScore} pts</span>
              </div>
              <div className="space-y-1.5">
                {contentResult.results.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <span className={`mt-0.5 shrink-0 w-3 h-3 rounded-full ${r.status === 'good' ? 'bg-emerald-500' : r.status === 'ok' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                    <span className="text-slate-700 leading-relaxed">{r.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image SEO */}
          {imageResult && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Análisis de Imágenes
                </h5>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${imageResult.score === imageResult.maxScore ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {imageResult.score} / {imageResult.maxScore} pts · {imageResult.totalImages} imágenes
                </span>
              </div>
              <div className="space-y-2">
                {imageResult.issues.filter(i => i.severity !== 'pass').map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl border border-amber-100 bg-amber-50 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">{issue.title}</p>
                      <p className="text-slate-600">{issue.description}</p>
                    </div>
                  </div>
                ))}
                {imageResult.issues.filter(i => i.severity !== 'pass').length === 0 && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Todas las imágenes tienen alt text correcto
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Link equity */}
          {linkEquity && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-slate-400" /> Equidad de Links Internos
              </h5>
              {orphans.length > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs">
                  <p className="font-bold text-rose-700 mb-1">Páginas huérfanas (sin links entrantes):</p>
                  {orphans.map(u => <p key={u} className="font-mono text-rose-600">{u.replace(BASE_URL, '')}</p>)}
                </div>
              )}
              <div className="space-y-1.5">
                {linkEquity.map(page => {
                  const pct = Math.round(page.score * 100);
                  return (
                    <div key={page.url} className="flex items-center gap-3 text-xs">
                      <span className="font-mono text-slate-600 w-36 shrink-0 truncate">{page.url.replace(BASE_URL, '') || '/'}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-[#4597CA]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-slate-500 w-16 text-right shrink-0">{page.inboundCount} links · {pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI prompts */}
          {(aiPrompts.title || aiPrompts.desc) && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Prompts IA para mejora SEO
                <span className="text-[10px] font-normal text-slate-400 ml-1">— copia y pega en ChatGPT, Claude o cualquier LLM</span>
              </h5>
              {[
                { id: 'title', label: 'Prompt para título SEO', data: aiPrompts.title },
                { id: 'desc',  label: 'Prompt para meta description', data: aiPrompts.desc },
              ].map(({ id, label, data }) => data && (
                <div key={id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-700">{label}</p>
                    <button
                      onClick={() => copyText(`${data.system}\n\n${data.user}`, id)}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-all"
                    >
                      {copied === id ? <><CheckCircle className="w-3 h-3 text-emerald-500" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar prompt</>}
                    </button>
                  </div>
                  <div className="bg-slate-950 text-teal-300 text-[10px] font-mono p-3 rounded-xl leading-relaxed max-h-28 overflow-y-auto">
                    <span className="text-slate-500">{'// Sistema: '}</span>{data.system.slice(0, 100)}...<br/>
                    <span className="text-slate-500">{'// Usuario: '}</span>{data.user.slice(0, 200)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
