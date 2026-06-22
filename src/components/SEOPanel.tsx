import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code, Globe, Map, Bot, BookOpen, LogOut, Lock, Eye, EyeOff, ChevronRight, ArrowRightLeft
} from 'lucide-react';
import { useColmedikal } from '../context/ColmedikalContext';
import SEODashboard from './SEODashboard';
import BlogCMS from './BlogCMS';
import Logo from './Logo';

type PanelTab = 'blog' | 'tracking' | 'meta' | 'sitemap' | 'robots' | 'redirects';

const NAV: { id: PanelTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'blog',     label: 'Blog CMS',         icon: <BookOpen className="w-4 h-4" />, desc: 'Redactar y publicar artículos' },
  { id: 'tracking', label: 'Tracking',          icon: <Code className="w-4 h-4" />,    desc: 'GA4, GTM, Pixel, Ads' },
  { id: 'meta',     label: 'Meta SEO',          icon: <Globe className="w-4 h-4" />,   desc: 'Títulos y descripciones por URL' },
  { id: 'sitemap',  label: 'Sitemap',           icon: <Map className="w-4 h-4" />,     desc: 'XML para motores de búsqueda' },
  { id: 'robots',   label: 'Robots.txt',        icon: <Bot className="w-4 h-4" />,     desc: 'Control de rastreo' },
  { id: 'redirects', label: 'Redirecciones',    icon: <ArrowRightLeft className="w-4 h-4" />, desc: 'Redirecciones 301 y 302' },
];

function LoginForm({ onLogin }: { onLogin: (email: string, pass: string) => Promise<void> }) {
  const { error } = useColmedikal();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, pass);
    } catch {
      /* error shown via context */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <Logo className="h-9 w-auto mx-auto brightness-0 invert opacity-90" />
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Panel SEO</p>
            <h1 className="text-xl font-black text-white mt-1">Acceso restringido</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Correo electrónico</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400"
              placeholder="admin@colmedikal.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} required value={pass} onChange={e => setPass(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar al Panel SEO'}
          </button>
        </form>
      </div>
    </div>
  );
}

const SEO_SESSION_KEY = 'seo_panel_session';

export default function SEOPanel() {
  const navigate = useNavigate();
  const { login: ctxLogin, logout: ctxLogout } = useColmedikal();
  const [activeTab, setActiveTab] = useState<PanelTab>('blog');
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(SEO_SESSION_KEY));

  const handleLogin = async (email: string, pass: string) => {
    await ctxLogin(email, pass);
    sessionStorage.setItem(SEO_SESSION_KEY, '1');
    setAuthed(true);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem(SEO_SESSION_KEY);
    setAuthed(false);
  };

  // Inject noindex while on this page
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
    return () => { if (meta) meta.content = 'index, follow'; };
  }, []);

  if (!authed) return <LoginForm onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <Logo className="h-7 w-auto brightness-0 invert opacity-80" />
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2">Panel SEO</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="mt-0.5 shrink-0">{item.icon}</span>
              <div>
                <p className="text-xs font-bold leading-none">{item.label}</p>
                <p className={`text-[10px] mt-0.5 leading-none ${activeTab === item.id ? 'text-indigo-200' : 'text-slate-600 group-hover:text-slate-500'}`}>{item.desc}</p>
              </div>
              {activeTab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto mt-0.5 shrink-0" />}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-xs cursor-pointer transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Panel Admin
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        {activeTab === 'blog' && <BlogCMS />}
        {(activeTab === 'tracking' || activeTab === 'meta' || activeTab === 'sitemap' || activeTab === 'robots' || activeTab === 'redirects') && (
          <SEODashboard initialTab={activeTab} />
        )}
      </main>
    </div>
  );
}
