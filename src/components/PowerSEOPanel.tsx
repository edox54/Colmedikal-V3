import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, FileText, Eye, Image as ImgIcon, Link2, Bot, Layers, Code2,
  LogOut, Lock, Eye as EyeIcon, EyeOff, ChevronRight,
} from 'lucide-react';
import { useColmedikal } from '../context/ColmedikalContext';
import Logo from './Logo';
import PowerSEOAudit from './PowerSEOAudit';
import PowerSEOTools from './PowerSEOTools';

export type PowerTab = 'audit' | 'content' | 'preview' | 'images' | 'links' | 'ai' | 'schema' | 'tracking';

const NAV: { id: PowerTab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'audit',    label: 'Auditoría',      icon: <Search className="w-4 h-4" />,    desc: 'Score SEO 0–100 por página'        },
  { id: 'content',  label: 'Contenido',      icon: <FileText className="w-4 h-4" />,  desc: '100+ checks estilo Yoast'          },
  { id: 'preview',  label: 'Vista Previa',   icon: <Eye className="w-4 h-4" />,       desc: 'SERP, Open Graph, Twitter'         },
  { id: 'images',   label: 'Imágenes',       icon: <ImgIcon className="w-4 h-4" />,   desc: 'Alt text y formatos'               },
  { id: 'links',    label: 'Links Internos', icon: <Link2 className="w-4 h-4" />,     desc: 'Equidad y páginas huérfanas'       },
  { id: 'ai',       label: 'Prompts IA',     icon: <Bot className="w-4 h-4" />,       desc: 'Prompts para título, desc y más'   },
  { id: 'schema',   label: 'Schema JSON-LD', icon: <Layers className="w-4 h-4" />,    desc: 'Generador de datos estructurados'  },
  { id: 'tracking', label: 'Scripts',        icon: <Code2 className="w-4 h-4" />,     desc: 'GA4, GTM y otros scripts'          },
];

const SESSION_KEY = 'power_seo_session';

function LoginForm({ onLogin }: { onLogin: (e: string, p: string) => Promise<void> }) {
  const { error } = useColmedikal();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onLogin(email, pass); } catch { /* error via context */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <Logo className="h-9 w-auto mx-auto brightness-0 invert opacity-90" />
          <div>
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Power SEO</p>
            <h1 className="text-xl font-black text-white mt-1">Acceso restringido</h1>
          </div>
        </div>
        <form onSubmit={submit} className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Correo electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-violet-400"
              placeholder="admin@colmedikal.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={pass} onChange={e => setPass(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-violet-400"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                {showPass ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50">
            {loading ? 'Ingresando...' : 'Ingresar al Power SEO'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PowerSEOPanel() {
  const navigate = useNavigate();
  const { login: ctxLogin } = useColmedikal();
  const [tab, setTab] = useState<PowerTab>('audit');
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem(SESSION_KEY));

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement('meta'); meta.name = 'robots'; document.head.appendChild(meta); }
    meta.content = 'noindex, nofollow';
    return () => { if (meta) meta.content = 'index, follow'; };
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    await ctxLogin(email, pass);
    sessionStorage.setItem(SESSION_KEY, '1');
    setAuthed(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <LoginForm onLogin={handleLogin} />;

  const isAuditGroup = tab === 'audit' || tab === 'content';

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-56 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col">
        <div className="px-5 py-5 border-b border-white/5">
          <Logo className="h-7 w-auto brightness-0 invert opacity-80" />
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mt-2">Power SEO</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                tab === item.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
              <span className="mt-0.5 shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-none">{item.label}</p>
                <p className={`text-[10px] mt-0.5 leading-none truncate ${
                  tab === item.id ? 'text-violet-200' : 'text-slate-600 group-hover:text-slate-500'
                }`}>{item.desc}</p>
              </div>
              {tab === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto mt-0.5 shrink-0" />}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button onClick={() => navigate('/seo-panel')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-xs cursor-pointer transition-all">
            <Lock className="w-3.5 h-3.5" /> Panel SEO
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs cursor-pointer transition-all">
            <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        {isAuditGroup
          ? <PowerSEOAudit tab={tab as 'audit' | 'content'} />
          : <PowerSEOTools tab={tab as any} />
        }
      </main>
    </div>
  );
}
