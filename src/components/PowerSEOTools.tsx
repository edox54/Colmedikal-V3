import React, { useState, useMemo, useCallback } from 'react';
import { Copy, CheckCircle, AlertCircle, Image as ImgIcon, Link2 } from 'lucide-react';
import { generateSerpPreview, generateOgPreview, generateTwitterPreview } from '@power-seo/preview';
import { analyzeAltText } from '@power-seo/images';
import { buildLinkGraph, analyzeLinkEquity, findOrphanPages } from '@power-seo/links';
import { buildTitlePrompt, buildMetaDescriptionPrompt, buildContentSuggestionsPrompt } from '@power-seo/ai';
import { faqPage, localBusiness, organization, webSite, article, breadcrumbList, toJsonLdString, validateSchema } from '@power-seo/schema';
import { buildGA4Script } from '@power-seo/tracking';
import type { PowerTab } from './PowerSEOPanel';

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

type SchemaType = 'webSite' | 'organization' | 'localBusiness' | 'article' | 'faqPage' | 'breadcrumbList';

function CopyBtn({ text, id, copied, onCopy }: { text: string; id: string; copied: string | null; onCopy: (t: string, i: string) => void }) {
  return (
    <button onClick={() => onCopy(text, id)}
      className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 rounded-lg cursor-pointer transition-all">
      {copied === id ? <><CheckCircle className="w-3 h-3 text-emerald-500" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
    </button>
  );
}

export default function PowerSEOTools({ tab }: { tab: Exclude<PowerTab, 'audit' | 'content'> }) {
  const [copied, setCopied] = useState<string | null>(null);

  // Preview
  const [prevTitle, setPrevTitle] = useState('');
  const [prevUrl, setPrevUrl] = useState(BASE);
  const [prevDesc, setPrevDesc] = useState('');
  const [prevImage, setPrevImage] = useState(`${BASE}/og-image.jpg`);

  // Images
  const [imageInputs, setImageInputs] = useState('');
  const [imageResult, setImageResult] = useState<ReturnType<typeof analyzeAltText> | null>(null);

  // AI
  const [aiTitle, setAiTitle] = useState('');
  const [aiKeyphrase, setAiKeyphrase] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiUrl, setAiUrl] = useState(BASE);
  const [aiPrompts, setAiPrompts] = useState<{ title: any; desc: any; content: any } | null>(null);

  // Schema
  const [schemaType, setSchemaType] = useState<SchemaType>('webSite');
  const [schemaName, setSchemaName] = useState('Colmedikal');
  const [schemaUrl, setSchemaUrl] = useState(BASE);
  const [schemaHeadline, setSchemaHeadline] = useState('');
  const [schemaAuthor, setSchemaAuthor] = useState('');
  const [schemaDate, setSchemaDate] = useState('');
  const [schemaFaqs, setSchemaFaqs] = useState('¿Qué es Colmedikal?|Somos una empresa de medicina prepagada en Ecuador.');
  const [schemaJson, setSchemaJson] = useState('');
  const [schemaValid, setSchemaValid] = useState<{ valid: boolean; issues: any[] } | null>(null);

  // Tracking
  const [ga4Id, setGa4Id] = useState('');
  const [ga4Script, setGa4Script] = useState('');

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Live previews
  const serpPreview = useMemo(() => {
    if (!prevTitle && !prevDesc) return null;
    try { return generateSerpPreview({ title: prevTitle, url: prevUrl, description: prevDesc }); } catch { return null; }
  }, [prevTitle, prevUrl, prevDesc]);

  const ogPreview = useMemo(() => {
    if (!prevTitle) return null;
    try { return generateOgPreview({ title: prevTitle, url: prevUrl, description: prevDesc, image: prevImage }); } catch { return null; }
  }, [prevTitle, prevUrl, prevDesc, prevImage]);

  const twPreview = useMemo(() => {
    if (!prevTitle) return null;
    try { return generateTwitterPreview({ title: prevTitle, description: prevDesc, image: prevImage, card: 'summary_large_image' }); } catch { return null; }
  }, [prevTitle, prevDesc, prevImage]);

  // Link equity (computed once from ROUTES)
  const { linkEquity, orphans } = useMemo(() => {
    try {
      const pages = ROUTES.map(r => ({
        url: BASE + r.path,
        links: ROUTES.filter(x => x.path !== r.path).slice(0, 4).map(x => BASE + x.path),
      }));
      const graph = buildLinkGraph(pages);
      return { linkEquity: analyzeLinkEquity(graph), orphans: findOrphanPages(graph) };
    } catch { return { linkEquity: [], orphans: [] }; }
  }, []);

  const runImages = useCallback(() => {
    if (!imageInputs.trim()) return;
    try {
      const list = imageInputs.split('\n').map(line => {
        const [src, ...rest] = line.split('|');
        return { src: src.trim(), alt: rest.join('|').trim() };
      }).filter(i => i.src);
      setImageResult(analyzeAltText(list));
    } catch { setImageResult(null); }
  }, [imageInputs]);

  const runAI = useCallback(() => {
    const params = { title: aiTitle, focusKeyphrase: aiKeyphrase, content: aiContent || `<p>${aiTitle}</p>`, url: aiUrl };
    try {
      setAiPrompts({
        title: buildTitlePrompt(params),
        desc: buildMetaDescriptionPrompt(params),
        content: buildContentSuggestionsPrompt(params),
      });
    } catch { setAiPrompts(null); }
  }, [aiTitle, aiKeyphrase, aiContent, aiUrl]);

  const generateSchemaJson = useCallback(() => {
    try {
      let schema: any;
      if (schemaType === 'webSite') schema = webSite({ name: schemaName, url: schemaUrl });
      else if (schemaType === 'organization') schema = organization({ name: schemaName, url: schemaUrl });
      else if (schemaType === 'localBusiness') schema = localBusiness({ name: schemaName, url: schemaUrl });
      else if (schemaType === 'article') schema = article({ headline: schemaHeadline, author: schemaAuthor, datePublished: schemaDate });
      else if (schemaType === 'faqPage') {
        const faqs = schemaFaqs.split('\n').map(l => {
          const [q, ...a] = l.split('|');
          return { question: q.trim(), answer: a.join('|').trim() };
        }).filter(f => f.question && f.answer);
        schema = faqPage(faqs);
      } else if (schemaType === 'breadcrumbList') {
        schema = breadcrumbList(ROUTES.slice(0, 6).map(r => ({ name: r.label, url: BASE + r.path })));
      }
      setSchemaJson(toJsonLdString(schema));
      setSchemaValid(validateSchema(schema));
    } catch (e: any) { setSchemaJson('Error: ' + e.message); setSchemaValid(null); }
  }, [schemaType, schemaName, schemaUrl, schemaHeadline, schemaAuthor, schemaDate, schemaFaqs]);

  const buildGA4 = useCallback(() => {
    if (!ga4Id.trim()) return;
    try {
      const scripts = buildGA4Script({ measurementId: ga4Id.trim() }) as any[];
      const output = scripts.map(s =>
        s.src
          ? `<script async src="${s.src}"></script>`
          : `<script id="${s.id}">\n${s.innerHTML}\n</script>`
      ).join('\n\n');
      setGa4Script(output);
    } catch { setGa4Script(''); }
  }, [ga4Id]);

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-400';
  const btnCls = 'flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all';

  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── PREVIEW ── */}
      {tab === 'preview' && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Previsualización SERP y Social</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Cómo se verá la página en Google, Facebook y Twitter en tiempo real.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Título <span className="font-normal text-slate-400">— máx. 60 chars</span></label>
              <input value={prevTitle} onChange={e => setPrevTitle(e.target.value)} placeholder="Colmedikal — Medicina Prepagada Ecuador" className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">URL</label>
              <input value={prevUrl} onChange={e => setPrevUrl(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Meta Description <span className="font-normal text-slate-400">— máx. 160 chars</span></label>
              <textarea rows={2} value={prevDesc} onChange={e => setPrevDesc(e.target.value)} placeholder="Planes de salud para tu familia..." className={`${inputCls} resize-none`} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Imagen OG / Twitter</label>
              <input value={prevImage} onChange={e => setPrevImage(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
          </div>

          {serpPreview && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Google SERP</p>
              <div className="border border-slate-100 rounded-2xl p-4 space-y-1">
                <p className="text-[11px] text-emerald-700 font-mono">{serpPreview.displayUrl}</p>
                <p className={`text-base font-medium leading-snug ${serpPreview.titleTruncated ? 'text-rose-600' : 'text-blue-700'}`}>{serpPreview.title || '(sin título)'}</p>
                <p className={`text-xs leading-relaxed ${serpPreview.descriptionTruncated ? 'text-amber-600' : 'text-slate-600'}`}>{serpPreview.description || '(sin descripción)'}</p>
              </div>
              <div className="text-[10px] space-y-1">
                <p className={serpPreview.titleValidation.valid ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {serpPreview.titleValidation.valid ? '✓' : '!'} Título {serpPreview.titleValidation.charCount}ch — {serpPreview.titleValidation.message}
                </p>
                <p className={serpPreview.descriptionValidation.valid ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                  {serpPreview.descriptionValidation.valid ? '✓' : '!'} Desc {serpPreview.descriptionValidation.charCount}ch — {serpPreview.descriptionValidation.message}
                </p>
              </div>
            </div>
          )}

          {ogPreview && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Graph (Facebook / LinkedIn)</p>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-w-sm">
                <div className="h-32 bg-slate-100 overflow-hidden">
                  <img src={ogPreview.image} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="p-3 border-t border-slate-100 space-y-0.5">
                  <p className="text-[10px] text-slate-400 uppercase font-mono">{ogPreview.siteName}</p>
                  <p className="text-sm font-bold text-slate-900 leading-tight">{ogPreview.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{ogPreview.description}</p>
                </div>
              </div>
            </div>
          )}

          {twPreview && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Twitter / X Card</p>
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-w-sm">
                <div className="h-32 bg-slate-100 overflow-hidden">
                  <img src={twPreview.image} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="p-3 border-t border-slate-100 space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{twPreview.title}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{twPreview.description}</p>
                  <p className="text-[10px] text-slate-400">{twPreview.domain}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── IMAGES ── */}
      {tab === 'images' && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Análisis de Imágenes SEO</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Detecta imágenes sin alt text, alts genéricos y oportunidades de mejora.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                <ImgIcon className="w-3.5 h-3.5 inline mr-1" />
                Imágenes <span className="font-normal text-slate-400">(una por línea: /ruta.jpg|alt text)</span>
              </label>
              <textarea rows={6} value={imageInputs} onChange={e => setImageInputs(e.target.value)}
                placeholder={`/hero.jpg|Médicos Colmedikal atendiendo pacientes en Quito\n/equipo.jpg|Equipo médico Colmedikal Ecuador\n/plan.jpg|`}
                className={`${inputCls} font-mono resize-none`} />
              <p className="text-[10px] text-slate-400">Si el alt text está vacío después del |, se detectará como imagen sin alt.</p>
            </div>
            <button onClick={runImages} className={btnCls}>
              <ImgIcon className="w-4 h-4" /> Analizar Imágenes
            </button>
          </div>

          {imageResult && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h5 className="text-sm font-bold text-slate-900">Resultados</h5>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${imageResult.score === imageResult.maxScore ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {imageResult.score}/{imageResult.maxScore} pts · {imageResult.totalImages} imágenes
                </span>
              </div>
              {imageResult.issues.filter((i: any) => i.severity !== 'pass').length === 0 ? (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Todas las imágenes tienen alt text adecuado</p>
              ) : (
                <div className="space-y-2">
                  {imageResult.issues.filter((i: any) => i.severity !== 'pass').map((issue: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-800">{issue.title}</p>
                        <p className="text-slate-600">{issue.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {imageResult.recommendations?.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Recomendaciones</p>
                  {imageResult.recommendations.map((r: string, i: number) => (
                    <p key={i} className="text-[11px] text-slate-600 py-1 border-b border-slate-50 last:border-0">→ {r}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── LINKS ── */}
      {tab === 'links' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Link2 className="w-4 h-4 text-violet-500" /> Equidad de Links Internos</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">PageRank interno basado en la estructura de links entre las páginas del sitio.</p>
          </div>
          {orphans.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-rose-700">⚠ Páginas huérfanas (sin links entrantes)</p>
              {orphans.map(u => <p key={u} className="text-[11px] font-mono text-rose-600">{u.replace(BASE, '') || '/'}</p>)}
            </div>
          )}
          <div className="space-y-2.5">
            {linkEquity.map((page: any) => {
              const pct = Math.round(page.score * 100);
              return (
                <div key={page.url} className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-slate-600 w-36 shrink-0 truncate">{page.url.replace(BASE, '') || '/'}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-slate-500 w-24 text-right shrink-0 font-mono">{page.inboundCount} links · {pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI PROMPTS ── */}
      {tab === 'ai' && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Prompts de IA para SEO</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Genera prompts optimizados para mejorar título, descripción y contenido con ChatGPT, Claude o cualquier LLM.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Título actual</label>
                <input value={aiTitle} onChange={e => setAiTitle(e.target.value)} placeholder="Colmedikal medicina prepagada" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Keyphrase foco</label>
                <input value={aiKeyphrase} onChange={e => setAiKeyphrase(e.target.value)} placeholder="medicina prepagada ecuador" className={inputCls} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">URL de la página</label>
              <input value={aiUrl} onChange={e => setAiUrl(e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Contenido <span className="font-normal text-slate-400">(opcional — más contexto = mejor prompt)</span></label>
              <textarea rows={3} value={aiContent} onChange={e => setAiContent(e.target.value)}
                placeholder="Pega el contenido principal de la página..."
                className={`${inputCls} resize-none`} />
            </div>
            <button onClick={runAI} className={btnCls}>Generar Prompts IA</button>
          </div>

          {aiPrompts && (
            <div className="space-y-4">
              {([
                { id: 'title',   label: 'Prompt: Optimizar Título SEO',           data: aiPrompts.title   },
                { id: 'desc',    label: 'Prompt: Mejorar Meta Description',        data: aiPrompts.desc    },
                { id: 'content', label: 'Prompt: Sugerencias de Contenido',        data: aiPrompts.content },
              ] as const).map(({ id, label, data }) => data && (
                <div key={id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-700">{label}</h5>
                    <CopyBtn text={`${data.system}\n\n${data.user}`} id={id} copied={copied} onCopy={copy} />
                  </div>
                  <div className="bg-slate-950 text-teal-300 text-[10px] font-mono p-3 rounded-xl leading-relaxed max-h-36 overflow-y-auto space-y-2">
                    <p><span className="text-slate-500">// Sistema: </span>{data.system?.slice(0, 150)}{(data.system?.length ?? 0) > 150 ? '…' : ''}</p>
                    <p><span className="text-slate-500">// Prompt: </span>{data.user?.slice(0, 300)}{(data.user?.length ?? 0) > 300 ? '…' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── SCHEMA ── */}
      {tab === 'schema' && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Generador de Schema JSON-LD</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Genera datos estructurados Schema.org validados para rich snippets en Google.</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tipo de Schema</label>
              <select value={schemaType} onChange={e => { setSchemaType(e.target.value as SchemaType); setSchemaJson(''); setSchemaValid(null); }}
                className={inputCls}>
                <option value="webSite">WebSite</option>
                <option value="organization">Organization</option>
                <option value="localBusiness">LocalBusiness</option>
                <option value="article">Article</option>
                <option value="faqPage">FAQPage</option>
                <option value="breadcrumbList">BreadcrumbList (auto desde rutas)</option>
              </select>
            </div>
            {(schemaType === 'webSite' || schemaType === 'organization' || schemaType === 'localBusiness') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nombre</label>
                  <input value={schemaName} onChange={e => setSchemaName(e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">URL</label>
                  <input value={schemaUrl} onChange={e => setSchemaUrl(e.target.value)} className={`${inputCls} font-mono`} />
                </div>
              </div>
            )}
            {schemaType === 'article' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Titular</label>
                  <input value={schemaHeadline} onChange={e => setSchemaHeadline(e.target.value)} placeholder="Título del artículo" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Autor</label>
                    <input value={schemaAuthor} onChange={e => setSchemaAuthor(e.target.value)} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Fecha publicación</label>
                    <input type="date" value={schemaDate} onChange={e => setSchemaDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>
            )}
            {schemaType === 'faqPage' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preguntas <span className="font-normal text-slate-400">(una por línea: Pregunta|Respuesta)</span></label>
                <textarea rows={5} value={schemaFaqs} onChange={e => setSchemaFaqs(e.target.value)}
                  className={`${inputCls} font-mono resize-none`} />
              </div>
            )}
            <button onClick={generateSchemaJson} className={btnCls}>Generar JSON-LD</button>
          </div>
          {schemaJson && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-bold text-slate-900">Schema generado</h5>
                  {schemaValid && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schemaValid.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {schemaValid.valid ? '✓ Válido' : '✕ Inválido'}
                    </span>
                  )}
                </div>
                <CopyBtn text={schemaJson} id="schema" copied={copied} onCopy={copy} />
              </div>
              <pre className="bg-slate-950 text-teal-300 text-[10px] font-mono p-4 rounded-2xl overflow-auto max-h-72 leading-relaxed">{schemaJson}</pre>
              <p className="text-[10px] text-slate-400">Inserta como <code>&lt;script type="application/ld+json"&gt;…&lt;/script&gt;</code> en el <code>&lt;head&gt;</code>.</p>
            </div>
          )}
        </>
      )}

      {/* ── TRACKING ── */}
      {tab === 'tracking' && (
        <>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Generador de Scripts de Tracking</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Genera scripts de rastreo con consent mode v2 listos para insertar en tu sitio.</p>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-slate-700">Google Analytics 4 Measurement ID</label>
                <input value={ga4Id} onChange={e => setGa4Id(e.target.value)} placeholder="G-XXXXXXXXXX"
                  className={`${inputCls} font-mono`} />
              </div>
              <button onClick={buildGA4}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shrink-0">
                Generar
              </button>
            </div>
          </div>
          {ga4Script && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-bold text-slate-900">Script GA4 generado</h5>
                <CopyBtn text={ga4Script} id="ga4" copied={copied} onCopy={copy} />
              </div>
              <pre className="bg-slate-950 text-teal-300 text-[10px] font-mono p-4 rounded-2xl overflow-auto max-h-72 leading-relaxed whitespace-pre-wrap">{ga4Script}</pre>
              <p className="text-[10px] text-slate-400">Incluye consent mode v2. Inserta antes del cierre de <code>&lt;/head&gt;</code>.</p>
            </div>
          )}
        </>
      )}

    </div>
  );
}
