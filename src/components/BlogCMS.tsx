import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, ArrowLeft, BookOpen, CheckCircle, Lock, ChevronDown, ChevronUp, Eye, Code2 } from 'lucide-react';
import { useColmedikal } from '../context/ColmedikalContext';
import { BLOG_POSTS } from '../data/blogData';

interface CMSPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  author_name: string;
  image_url: string;
  publish_date: string;
  read_time: string;
  published: number;
  schema_json: string;
  meta_title: string;
  meta_description: string;
}

const empty: CMSPost = {
  title: '', slug: '', excerpt: '', content: '', category: 'Salud',
  tags: '', author_name: 'Equipo Colmedikal', image_url: '',
  publish_date: new Date().toISOString().split('T')[0], read_time: '5 min',
  published: 0, schema_json: '', meta_title: '', meta_description: '',
};

const CATEGORIES = ['Salud', 'Planes y Cobertura', 'Prevención y Bienestar', 'Salud Familiar', 'Noticias'];

const SCHEMA_TYPES = [
  { value: 'Article', label: 'Article — artículo de blog' },
  { value: 'MedicalWebPage', label: 'MedicalWebPage — contenido médico' },
  { value: 'FAQPage', label: 'FAQPage — preguntas y respuestas' },
  { value: 'HowTo', label: 'HowTo — guía paso a paso' },
  { value: 'MedicalOrganization', label: 'MedicalOrganization — organización de salud' },
];

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generateSchemaTemplate(type: string, post: CMSPost): string {
  const url = `https://colmedikal.com/blog/${post.slug || 'slug'}`;
  const headline = post.meta_title || post.title || 'Título del artículo';
  const description = post.meta_description || post.excerpt || 'Descripción del artículo';
  const base = { '@context': 'https://schema.org', '@type': type };

  if (type === 'Article') return JSON.stringify({ ...base, headline, description,
    datePublished: post.publish_date || new Date().toISOString().split('T')[0],
    dateModified: post.publish_date || new Date().toISOString().split('T')[0],
    author: { '@type': 'Person', name: post.author_name || 'Equipo Colmedikal' },
    publisher: { '@type': 'Organization', name: 'Colmedikal', url: 'https://colmedikal.com',
      logo: { '@type': 'ImageObject', url: 'https://colmedikal.com/logo.png' } },
    url, image: post.image_url || 'https://colmedikal.com/og-image.png', keywords: post.tags || '',
  }, null, 2);
  if (type === 'MedicalWebPage') return JSON.stringify({ ...base, name: headline, description, url,
    specialty: 'Medicina General', lastReviewed: post.publish_date || new Date().toISOString().split('T')[0],
    reviewedBy: { '@type': 'Organization', name: 'Colmedikal', url: 'https://colmedikal.com' },
  }, null, 2);
  if (type === 'FAQPage') return JSON.stringify({ ...base, mainEntity: [
    { '@type': 'Question', name: '¿Pregunta 1?', acceptedAnswer: { '@type': 'Answer', text: 'Respuesta 1.' } },
    { '@type': 'Question', name: '¿Pregunta 2?', acceptedAnswer: { '@type': 'Answer', text: 'Respuesta 2.' } },
  ]}, null, 2);
  if (type === 'HowTo') return JSON.stringify({ ...base, name: headline, description,
    step: [
      { '@type': 'HowToStep', name: 'Paso 1', text: 'Descripción del paso 1.' },
      { '@type': 'HowToStep', name: 'Paso 2', text: 'Descripción del paso 2.' },
    ],
  }, null, 2);
  if (type === 'MedicalOrganization') return JSON.stringify({ ...base, name: 'Colmedikal',
    url: 'https://colmedikal.com', logo: 'https://colmedikal.com/logo.png',
    address: { '@type': 'PostalAddress', addressLocality: 'Quito', addressCountry: 'EC' },
    telephone: '+593-2-XXXXXX', medicalSpecialty: 'Medicina Prepagada',
  }, null, 2);
  return JSON.stringify(base, null, 2);
}

function renderPara(para: string, i: number) {
  if (para.startsWith('### ')) return (
    <h3 key={i} className="text-base font-bold text-[#143b67] mt-4 mb-2">{para.slice(4)}</h3>
  );
  if (para.startsWith('* **')) {
    const clean = para.slice(4);
    const [key, ...rest] = clean.split(':** ');
    return (
      <div key={i} className="flex gap-2 my-2">
        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#4597CA] flex-shrink-0" />
        <p className="text-xs text-slate-700"><strong className="text-[#143b67]">{key}:</strong> {rest.join('')}</p>
      </div>
    );
  }
  if (para.startsWith('* ')) return (
    <div key={i} className="flex gap-2 my-1.5 pl-2">
      <div className="mt-2 w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
      <p className="text-xs text-slate-600">{para.slice(2)}</p>
    </div>
  );
  return <p key={i} className="text-xs text-slate-600 leading-relaxed my-2">{para}</p>;
}

function ContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  const paragraphs = value.split(/\n\n+/);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button type="button" onClick={() => setPreview(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${!preview ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
          <Code2 className="w-3.5 h-3.5" /> Código
        </button>
        <button type="button" onClick={() => setPreview(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${preview ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
          <Eye className="w-3.5 h-3.5" /> Vista previa
        </button>
      </div>
      {preview ? (
        <div className="min-h-[240px] border border-slate-200 rounded-xl p-4 bg-white overflow-y-auto">
          {value.trim() ? paragraphs.map((p, i) => renderPara(p, i)) : (
            <p className="text-xs text-slate-400 italic">Sin contenido todavía...</p>
          )}
        </div>
      ) : (
        <textarea rows={16} value={value} onChange={e => onChange(e.target.value)}
          placeholder={'### Título de sección\n\nEscribe tu párrafo aquí...\n\n* **Clave:** descripción del punto\n\n* Otro elemento de lista'}
          className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs font-mono resize-y outline-none focus:border-[#4597CA] leading-relaxed bg-slate-950 text-green-300" />
      )}
      <p className="text-[10px] text-slate-400">
        <code className="bg-slate-100 px-1 rounded text-slate-600">### Título</code> subtítulos •{' '}
        <code className="bg-slate-100 px-1 rounded text-slate-600">* **Clave:** texto</code> listas • línea en blanco entre párrafos
      </p>
    </div>
  );
}

function SchemaEditor({ schema_json, onChange, post }: { schema_json: string; onChange: (v: string) => void; post: CMSPost }) {
  const [open, setOpen] = useState(false);
  const [schemaType, setSchemaType] = useState('Article');
  const [jsonError, setJsonError] = useState('');

  const validateJson = (v: string) => {
    onChange(v);
    if (!v.trim()) { setJsonError(''); return; }
    try { JSON.parse(v); setJsonError(''); } catch (e: any) { setJsonError(e.message); }
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-indigo-600">{'{ }'}</span> Schema JSON-LD
          {schema_json.trim() && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold">Configurado</span>}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-3 bg-white">
          <p className="text-[10px] text-slate-500">El Schema JSON-LD se inyecta en el <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code>. Los campos Meta Título y Meta Descripción se usan automáticamente en la plantilla.</p>
          <div className="flex gap-2">
            <select value={schemaType} onChange={e => setSchemaType(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400">
              {SCHEMA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button type="button" onClick={() => { onChange(generateSchemaTemplate(schemaType, post)); setJsonError(''); }}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all whitespace-nowrap">
              Generar plantilla
            </button>
          </div>
          <div className="space-y-1">
            <textarea rows={12} value={schema_json} onChange={e => validateJson(e.target.value)}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  ...\n}'}
              className={`w-full px-3 py-3 border rounded-xl text-[10px] font-mono resize-y outline-none bg-slate-950 text-teal-300 leading-relaxed ${jsonError ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {jsonError && <p className="text-[10px] text-rose-500 font-mono">{jsonError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogCMS() {
  const { blogPostsCMS, createCMSBlogPost, updateCMSBlogPost, deleteCMSBlogPost } = useColmedikal();
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editing, setEditing] = useState<CMSPost>(empty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const openNew = () => { setEditing(empty); setView('editor'); };
  const openEdit = (p: any) => {
    setEditing({
      id: p.id, title: p.title || '', slug: p.slug || '', excerpt: p.excerpt || '',
      content: Array.isArray(p.content) ? p.content.join('\n\n') : (p.content || ''),
      category: p.category || 'Salud', tags: p.tags || '',
      author_name: p.author_name || 'Equipo Colmedikal',
      image_url: p.image_url || '', publish_date: (p.publish_date || '').split('T')[0],
      read_time: p.read_time || '5 min', published: Number(p.published || 0),
      schema_json: p.schema_json || '',
      meta_title: p.meta_title || '', meta_description: p.meta_description || '',
    });
    setView('editor');
  };

  const handleSave = async () => {
    if (!editing.title.trim()) { alert('El título es obligatorio.'); return; }
    if (editing.schema_json.trim()) {
      try { JSON.parse(editing.schema_json); } catch { alert('El JSON del Schema no es válido.'); return; }
    }
    setSaving(true);
    try {
      const payload = { ...editing, slug: editing.slug || slugify(editing.title) };
      if (editing.id) { await updateCMSBlogPost(editing.id, payload); }
      else { await createCMSBlogPost(payload); }
      setSaved(true);
      setTimeout(() => { setSaved(false); setView('list'); }, 1200);
    } catch (e: any) {
      alert('Error al guardar: ' + (e?.message || 'desconocido'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    await deleteCMSBlogPost(id);
  };

  if (view === 'editor') {
    return (
      <div className="space-y-5 animate-in fade-in duration-200 max-w-3xl" data-schema-post>
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{editing.id ? 'Editar artículo' : 'Nuevo artículo'}</h4>
            <p className="text-[11px] text-slate-500">Usa el tab "Vista previa" para ver cómo se renderizará el contenido.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Título y slug */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Título <span className="text-rose-500">*</span></label>
            <input type="text" value={editing.title}
              onChange={e => setEditing(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))}
              placeholder="Título del artículo..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#4597CA]" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL Slug</label>
            <input type="text" value={editing.slug}
              onChange={e => setEditing(p => ({ ...p, slug: slugify(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#4597CA]" />
            <p className="text-[10px] text-slate-400">colmedikal.com/blog/<strong>{editing.slug || '...'}</strong></p>
          </div>

          {/* Meta SEO */}
          <div className="bg-indigo-50 rounded-2xl p-4 space-y-3 border border-indigo-100">
            <p className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <span className="w-4 h-4 bg-indigo-600 rounded text-white text-[9px] flex items-center justify-center font-black">G</span>
              Meta SEO — se reflejan en el Schema JSON-LD automáticamente
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Meta Título</label>
              <input type="text" value={editing.meta_title}
                onChange={e => setEditing(p => ({ ...p, meta_title: e.target.value }))}
                placeholder={editing.title || 'Ej: Guía de medicina prepagada | Colmedikal Ecuador'}
                className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-xs outline-none focus:border-indigo-400 bg-white" />
              <p className={`text-[10px] ${editing.meta_title.length > 60 ? 'text-rose-500' : 'text-slate-400'}`}>
                {editing.meta_title.length}/60 caracteres recomendados
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Meta Descripción</label>
              <textarea rows={2} value={editing.meta_description}
                onChange={e => setEditing(p => ({ ...p, meta_description: e.target.value }))}
                placeholder={editing.excerpt || 'Descripción breve para resultados de búsqueda (max 160 caracteres)'}
                className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-xs resize-none outline-none focus:border-indigo-400 bg-white" />
              <p className={`text-[10px] ${editing.meta_description.length > 160 ? 'text-rose-500' : 'text-slate-400'}`}>
                {editing.meta_description.length}/160 caracteres recomendados
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Extracto</label>
            <textarea rows={2} value={editing.excerpt}
              onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))}
              placeholder="Resumen del artículo (aparece en la tarjeta del blog)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-[#4597CA]" />
          </div>

          {/* Content editor con tabs */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Contenido</label>
            <ContentEditor value={editing.content} onChange={v => setEditing(p => ({ ...p, content: v }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Categoría</label>
              <select value={editing.category} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tags (comas)</label>
              <input type="text" value={editing.tags} onChange={e => setEditing(p => ({ ...p, tags: e.target.value }))}
                placeholder="salud, medicina, ecuador"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tiempo de lectura</label>
              <input type="text" value={editing.read_time} onChange={e => setEditing(p => ({ ...p, read_time: e.target.value }))}
                placeholder="5 min" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Autor</label>
              <input type="text" value={editing.author_name} onChange={e => setEditing(p => ({ ...p, author_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Fecha de publicación</label>
              <input type="date" value={editing.publish_date} onChange={e => setEditing(p => ({ ...p, publish_date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL de imagen destacada</label>
            <input type="url" value={editing.image_url} onChange={e => setEditing(p => ({ ...p, image_url: e.target.value }))}
              placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
          </div>

          <SchemaEditor
            schema_json={editing.schema_json}
            onChange={v => setEditing(p => ({ ...p, schema_json: v }))}
            post={editing}
          />

          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setEditing(p => ({ ...p, published: p.published ? 0 : 1 }))}
              className={`w-10 h-5.5 rounded-full transition-colors ${editing.published ? 'bg-emerald-500' : 'bg-slate-300'} relative`}>
              <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${editing.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs font-bold text-slate-700">{editing.published ? 'Publicado' : 'Borrador'}</span>
          </label>

          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:shadow-md disabled:opacity-50">
            {saved ? <><CheckCircle className="w-4 h-4" /> Guardado</> : saving ? 'Guardando...' : <><Save className="w-4 h-4" /> {editing.id ? 'Actualizar' : 'Publicar'}</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-950">Blog CMS</h3>
          <p className="text-xs text-slate-500 mt-1">{blogPostsCMS.length} en BD · {BLOG_POSTS.length} estáticos en código.</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white text-xs font-bold rounded-xl cursor-pointer hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Nuevo artículo
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Artículos estáticos (en código)</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-full font-bold">{BLOG_POSTS.length}</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <tbody className="divide-y divide-slate-100">
            {BLOG_POSTS.map(post => (
              <tr key={post.id} className="opacity-70">
                <td className="p-4">
                  <p className="font-semibold text-slate-700 line-clamp-1">{post.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono">/blog/{post.slug}</p>
                </td>
                <td className="p-4 hidden sm:table-cell text-slate-500">{post.category}</td>
                <td className="p-4 hidden md:table-cell text-slate-400 font-mono text-[10px]">{post.publishDate}</td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border text-slate-500 bg-slate-100 border-slate-200">Estático</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-[10px] text-slate-400 italic">Solo editable en código</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Artículos CMS (base de datos)</span>
          <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-bold">{blogPostsCMS.length}</span>
        </div>
        {blogPostsCMS.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm font-bold text-slate-700">No hay artículos en el CMS todavía.</p>
            <p className="text-xs text-slate-400 mt-1">Haz clic en "Nuevo artículo" para empezar.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Título</th>
                <th className="p-4 hidden sm:table-cell">Categoría</th>
                <th className="p-4 hidden md:table-cell">Fecha</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogPostsCMS.map((post: any) => (
                <tr key={post.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900 line-clamp-1">{post.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono">/blog/{post.slug}</p>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-600">{post.category}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500 font-mono">{(post.publish_date || '').split('T')[0]}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      post.published ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}>
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer" title="Editar">
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 cursor-pointer" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
