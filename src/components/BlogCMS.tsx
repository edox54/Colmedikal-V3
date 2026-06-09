import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { useColmedikal } from '../context/ColmedikalContext';

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
}

const empty: CMSPost = {
  title: '', slug: '', excerpt: '', content: '', category: 'Salud',
  tags: '', author_name: 'Equipo Colmedikal', image_url: '',
  publish_date: new Date().toISOString().split('T')[0], read_time: '5 min', published: 0,
};

const CATEGORIES = ['Salud', 'Planes y Cobertura', 'Prevención y Bienestar', 'Salud Familiar', 'Noticias'];

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
    });
    setView('editor');
  };

  const handleSave = async () => {
    if (!editing.title.trim()) { alert('El título es obligatorio.'); return; }
    setSaving(true);
    try {
      const payload = { ...editing, slug: editing.slug || slugify(editing.title) };
      if (editing.id) {
        await updateCMSBlogPost(editing.id, payload);
      } else {
        await createCMSBlogPost(payload);
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); setView('list'); }, 1200);
    } catch (e: any) {
      alert('Error al guardar: ' + (e?.message || 'desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    await deleteCMSBlogPost(id);
  };

  if (view === 'editor') {
    return (
      <div className="space-y-5 animate-in fade-in duration-200 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h4 className="text-sm font-bold text-slate-900">{editing.id ? 'Editar artículo' : 'Nuevo artículo'}</h4>
            <p className="text-[11px] text-slate-500">Los párrafos se separan con una línea en blanco.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Título <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={editing.title}
              onChange={e => setEditing(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))}
              placeholder="Título del artículo..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#4597CA]"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">URL Slug</label>
            <input
              type="text"
              value={editing.slug}
              onChange={e => setEditing(p => ({ ...p, slug: slugify(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#4597CA]"
            />
            <p className="text-[10px] text-slate-400">colmedikal.com/blog/<strong>{editing.slug || '...'}</strong></p>
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Extracto / Meta Description</label>
            <textarea
              rows={2}
              value={editing.excerpt}
              onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))}
              placeholder="Resumen del artículo (aparece en listados y buscadores)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-[#4597CA]"
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Contenido</label>
            <p className="text-[10px] text-slate-400">
              Usa <code className="bg-slate-100 px-1 rounded">### Título</code> para subtítulos,{' '}
              <code className="bg-slate-100 px-1 rounded">* **Clave:** texto</code> para listas, líneas en blanco para párrafos.
            </p>
            <textarea
              rows={16}
              value={editing.content}
              onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
              placeholder="Escribe el contenido del artículo aquí..."
              className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs font-mono resize-y outline-none focus:border-[#4597CA] leading-relaxed"
            />
          </div>

          {/* Row: category + tags + read_time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Categoría</label>
              <select
                value={editing.category}
                onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tags (comas)</label>
              <input type="text" value={editing.tags} onChange={e => setEditing(p => ({ ...p, tags: e.target.value }))}
                placeholder="salud, medicina, ecuador" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tiempo de lectura</label>
              <input type="text" value={editing.read_time} onChange={e => setEditing(p => ({ ...p, read_time: e.target.value }))}
                placeholder="5 min" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#4597CA]" />
            </div>
          </div>

          {/* Row: author + date + image */}
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

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEditing(p => ({ ...p, published: p.published ? 0 : 1 }))}
              className={`w-10 h-5.5 rounded-full transition-colors ${editing.published ? 'bg-emerald-500' : 'bg-slate-300'} relative`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${editing.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs font-bold text-slate-700">{editing.published ? 'Publicado' : 'Borrador'}</span>
          </label>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white text-xs font-bold rounded-xl cursor-pointer transition-all hover:shadow-md disabled:opacity-50"
          >
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
          <p className="text-xs text-slate-500 mt-1">{blogPostsCMS.length} artículo{blogPostsCMS.length !== 1 ? 's' : ''} en base de datos.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white text-xs font-bold rounded-xl cursor-pointer hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo artículo
        </button>
      </div>

      {blogPostsCMS.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No hay artículos en el CMS todavía.</p>
          <p className="text-xs text-slate-400 mt-1">Haz clic en "Nuevo artículo" para empezar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
