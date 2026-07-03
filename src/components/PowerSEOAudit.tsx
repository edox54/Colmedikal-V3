import React, { useState, useCallback } from 'react';
import { Search, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { auditPage } from '@power-seo/audit';
import type { PageAuditResult } from '@power-seo/audit';
import { analyzeContent } from '@power-seo/content-analysis';
import type { ContentAnalysisResult } from '@power-seo/content-analysis';
import { SEO_MATRIX } from '../seo/seoMatrix';

const BASE = 'https://colmedikal.com';
const ROUTES = [
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
const ROUTE_KEY: Record<string, string> = {
  '/': 'home', '/servicios': 'servicios', '/directorio': 'directorio',
  '/nosotros': 'nosotros', '/cotizador': 'cotizador', '/faqs': 'faqs',
  '/contacto': 'contacto', '/blog': 'blog',
};
const SEV_ORDER: Record<string, number> = { error: 0, warning: 1, info: 2 };

export default function PowerSEOAudit({ tab }: { tab: 'audit' | 'content' }) {
  const [route, setRoute] = useState('/');
  const [keyphrase, setKeyphrase] = useState('');
  const [content, setContent] = useState('');
  const [auditResult, setAuditResult] = useState<PageAuditResult | null>(null);
  const [contentResult, setContentResult] = useState<ContentAnalysisResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    const key = ROUTE_KEY[route];
    const matrix = key ? SEO_MATRIX[key] : null;
    const title = matrix?.title || '';
    const description = matrix?.description || '';
    const kp = keyphrase || matrix?.keywords?.split(',')[0]?.trim() || '';
    const contentHtml = content
      ? `<h1>${title}</h1><p>${content}</p>`
      : `<h1>${title}</h1><p>${description}</p>`;
    const wordCount = (content || description).split(/\s+/).filter(Boolean).length;
    const url = BASE + route;
    const links = ROUTES.filter(r => r.path !== route).map(r => r.path);

    try {
      setAuditResult(auditPage({
        url, title, metaDescription: description, canonical: url,
        robots: matrix?.robots || 'index, follow',
        openGraph: { title, description, image: `${BASE}/og-image.jpg` },
        content: contentHtml,
        headings: [`h1:${title}`],
        images: [],
        internalLinks: links,
        externalLinks: [],
        focusKeyphrase: kp,
        wordCount,
      }));
    } catch { setAuditResult(null); }

    try {
      setContentResult(analyzeContent({
        title, metaDescription: description, focusKeyphrase: kp,
        content: contentHtml, images: [], internalLinks: links, externalLinks: [],
      }));
    } catch { setContentResult(null); }

    setRunning(false);
  }, [route, keyphrase, content]);

  const reset = (newRoute: string) => {
    setRoute(newRoute);
    setAuditResult(null);
    setContentResult(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Config */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {tab === 'audit' ? 'Auditoría SEO de Página' : 'Análisis de Contenido'}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {tab === 'audit'
              ? 'Score 0–100 en meta tags, contenido, estructura y rendimiento. Sin APIs externas.'
              : 'Más de 100 checks automáticos: keyphrase, legibilidad, E-E-A-T, intención, headings y más.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Página a analizar</label>
            <select value={route} onChange={e => reset(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-400">
              {ROUTES.map(r => <option key={r.path} value={r.path}>{r.label} ({r.path})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Keyphrase foco <span className="font-normal text-slate-400">(opcional)</span></label>
            <input type="text" value={keyphrase} onChange={e => setKeyphrase(e.target.value)}
              placeholder="medicina prepagada ecuador"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-400" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">
            Contenido visible <span className="font-normal text-slate-400">(pega el texto de la página — mejora precisión)</span>
          </label>
          <textarea rows={4} value={content} onChange={e => setContent(e.target.value)}
            placeholder="Pega aquí el contenido principal de la página para analizar densidad de keyphrase, legibilidad y más..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-violet-400" />
          <p className="text-[10px] text-slate-400">Si se deja vacío, se usa la meta description como base.</p>
        </div>

        <button onClick={run} disabled={running}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
          <Search className="w-4 h-4" />
          {running ? 'Analizando...' : tab === 'audit' ? 'Ejecutar Auditoría' : 'Analizar Contenido'}
        </button>
      </div>

      {/* Audit results */}
      {tab === 'audit' && auditResult && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-6 flex-wrap">
              <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 shrink-0 ${
                auditResult.score >= 80 ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : auditResult.score >= 50 ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-rose-400 bg-rose-50 text-rose-700'
              }`}>
                <span className="text-3xl font-extrabold leading-none">{auditResult.score}</span>
                <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5">/ 100</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {auditResult.score >= 80 ? 'Excelente' : auditResult.score >= 60 ? 'Bueno' : auditResult.score >= 40 ? 'Regular' : 'Crítico'}
                </p>
                <p className="text-[11px] font-mono text-slate-500">{BASE}{route}</p>
                {keyphrase && <p className="text-[11px] font-bold text-violet-600">Keyphrase: {keyphrase}</p>}
                <p className="text-[10px] text-slate-400">
                  <span className="text-emerald-600 font-bold">{auditResult.rules.filter(r => r.severity === 'pass').length} ok</span>
                  {' · '}{auditResult.rules.filter(r => r.severity === 'error').length} errores
                  {' · '}{auditResult.rules.filter(r => r.severity === 'warning').length} avisos
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.entries(auditResult.categories) as [string, { score: number; passed: number; warnings: number; errors: number }][]).map(([cat, d]) => {
                const labels: Record<string, string> = { meta: 'Meta Tags', content: 'Contenido', structure: 'Estructura', performance: 'Rendimiento' };
                const bar = d.score >= 80 ? 'bg-emerald-500' : d.score >= 50 ? 'bg-amber-400' : 'bg-rose-500';
                return (
                  <div key={cat} className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{labels[cat] || cat}</span>
                      <span className="text-sm font-extrabold text-slate-900">{d.score}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${bar}`} style={{ width: `${d.score}%` }} />
                    </div>
                    <div className="flex gap-2 text-[9px]">
                      <span className="text-emerald-600 font-bold">{d.passed} ok</span>
                      {d.warnings > 0 && <span className="text-amber-600 font-bold">{d.warnings}⚠</span>}
                      {d.errors > 0 && <span className="text-rose-600 font-bold">{d.errors}✕</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h5 className="text-sm font-bold text-slate-900">Problemas detectados</h5>
            <div className="space-y-2">
              {auditResult.rules
                .filter(r => r.severity !== 'pass')
                .sort((a, b) => (SEV_ORDER[a.severity] ?? 3) - (SEV_ORDER[b.severity] ?? 3))
                .map((rule, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                    rule.severity === 'error' ? 'bg-rose-50 border-rose-100'
                    : rule.severity === 'warning' ? 'bg-amber-50 border-amber-100'
                    : 'bg-sky-50 border-sky-100'
                  }`}>
                    {rule.severity === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                    {rule.severity === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                    {rule.severity === 'info' && <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />}
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">{rule.title}</p>
                      <p className="text-slate-600 leading-relaxed">{rule.description}</p>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        rule.severity === 'error' ? 'bg-rose-100 text-rose-700'
                        : rule.severity === 'warning' ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                      }`}>{rule.severity} · {rule.category}</span>
                    </div>
                  </div>
                ))}
              {auditResult.rules.filter(r => r.severity !== 'pass').length === 0 && (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-emerald-700">Sin problemas detectados</p>
                </div>
              )}
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                <span className="text-emerald-600 font-bold">{auditResult.rules.filter(r => r.severity === 'pass').length} reglas aprobadas</span>
                {' '}de {auditResult.rules.length} totales
              </p>
            </div>
          </div>
        </>
      )}

      {/* Content analysis results */}
      {tab === 'content' && contentResult && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h5 className="text-sm font-bold text-slate-900">Análisis de Contenido</h5>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              contentResult.score / contentResult.maxScore >= 0.8 ? 'bg-emerald-100 text-emerald-700'
              : contentResult.score / contentResult.maxScore >= 0.5 ? 'bg-amber-100 text-amber-700'
              : 'bg-rose-100 text-rose-700'
            }`}>{contentResult.score} / {contentResult.maxScore} pts</span>
          </div>
          <div className="space-y-1">
            {contentResult.results.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-slate-50 last:border-0">
                <span className={`mt-0.5 shrink-0 w-3 h-3 rounded-full ${
                  r.status === 'good' ? 'bg-emerald-500' : r.status === 'ok' ? 'bg-amber-400' : 'bg-rose-500'
                }`} />
                <span className="text-slate-700 leading-relaxed">{r.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
