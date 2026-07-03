import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BlogPost, Page } from '../types';
import { BLOG_POSTS, AUTHORS } from '../data/blogData';
import { useColmedikal } from '../context/ColmedikalContext';
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  Calculator, 
  PhoneCall, 
  MessageSquare, 
  Award, 
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Search,
  BookOpen
} from 'lucide-react';

interface BlogProps {
  currentPage?: Page;
  setCurrentPage?: (page: Page) => void;
  activeBlogPost?: BlogPost | null;
  setActiveBlogPost?: (post: BlogPost | null) => void;
  setSelectedPlanId?: (id: string) => void;
}

export default function Blog({ 
  currentPage: propCurrentPage, 
  setCurrentPage: propSetCurrentPage, 
  activeBlogPost: propActiveBlogPost, 
  setActiveBlogPost: propSetActiveBlogPost,
  setSelectedPlanId 
}: BlogProps) {
  const { '*': slug } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { blogPostsCMS } = useColmedikal();

  // Adapt CMS DB posts to BlogPost shape
  const cmsPosts: BlogPost[] = useMemo(() => blogPostsCMS
    .filter((p: any) => p.published)
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || '',
      content: typeof p.content === 'string' ? p.content.split(/\n\n+/) : (p.content || []),
      publishDate: (p.publish_date || '').split('T')[0],
      readTime: p.read_time || '5 min',
      category: p.category || 'Salud',
      author: { id: 'cms', name: p.author_name || 'Equipo Colmedikal', role: 'Redacción', specialty: '', experience: '', avatar: 'https://colmedikal.com/logo.png', bio: '' },
      image: p.image_url || '',
      tags: (p.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    })), [blogPostsCMS]);

  const allPosts = useMemo(() => {
    const MONTH_ES: Record<string, string> = {
      'enero':'01','febrero':'02','marzo':'03','abril':'04','mayo':'05','junio':'06',
      'julio':'07','agosto':'08','septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12',
    };
    const toISO = (d: string) => {
      if (/^\d{4}-\d{2}/.test(d)) return d;
      const m = d.match(/^(\d{1,2}) de (\w+) de (\d{4})$/i);
      if (m) return `${m[3]}-${MONTH_ES[m[2].toLowerCase()] || '01'}-${m[1].padStart(2,'0')}`;
      return d;
    };
    return [...BLOG_POSTS, ...cmsPosts].sort((a, b) => toISO(b.publishDate).localeCompare(toISO(a.publishDate)));
  }, [cmsPosts]);

  // Determine active post from URL slug
  const activeBlogPost = slug ? allPosts.find(post => post.slug === slug || post.id === slug) : null;

  const categories = ['todos', 'Planes y Cobertura', 'Prevención y Bienestar', 'Salud Familiar'];

  // Handle CTA redirect to Cotizador with specific preset
  const handleCtaClick = (planType?: string) => {
    if (setSelectedPlanId) {
      if (planType === 'familiar') {
        setSelectedPlanId('vital'); // Default to robust Vital card for families
      } else {
        setSelectedPlanId('proteccion');
      }
    }
    if (propSetCurrentPage) {
      propSetCurrentPage('cotizador');
    } else {
      navigate('/cotizador');
    }
  };

  // Filter logic for Blog List
  const filteredPosts = allPosts.filter(post => {
    const matchesCategory = selectedCategory === 'todos' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Converts [text](url) markdown links to <Link> components
  const parseInlineLinks = (text: string): React.ReactNode => {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    if (parts.length === 1) return text;
    return <>{parts.map((part, i) => {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      return m ? <Link key={i} to={m[2]} className="text-[#4597CA] font-semibold hover:underline">{m[1]}</Link> : part;
    })}</>;
  };

  // Helper to render blog post paragraphs styled beautifully with inline headers
  const renderContentNode = (para: string, index: number) => {
    if (para.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl sm:text-2xl font-bold text-[#143b67] mt-8 mb-4 font-sans tracking-tight">
          {para.replace('### ', '')}
        </h3>
      );
    }
    if (para.startsWith('* **')) {
      // Bold list items style
      const cleaned = para.replace('* **', '');
      const parts = cleaned.split(':** ');
      return (
        <div key={index} className="flex gap-3 my-3">
          <div className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-[#4597CA]" />
          <p className="text-slate-700 leading-relaxed text-[15px] sm:text-[16px]">
            <strong className="text-[#143b67] font-semibold">{parts[0]}:</strong> {parseInlineLinks(parts[1] || '')}
          </p>
        </div>
      );
    }
    if (para.startsWith('* ')) {
      // Regular bullet items
      return (
        <div key={index} className="flex gap-3 my-2 pl-4">
          <div className="mt-2.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
          <p className="text-slate-600 leading-relaxed text-[14px]">
            {parseInlineLinks(para.replace('* ', ''))}
          </p>
        </div>
      );
    }
    if (para.startsWith('1. **') || para.match(/^\d+\.\s\*\*/)) {
      // Ordered list items
      const cleaned = para.replace(/^\d+\.\s\*\*/, '');
      const parts = cleaned.split(':** ');
      return (
        <div key={index} className="flex gap-3 my-4 bg-[#4597CA]/5 p-4 rounded-xl border-l-4 border-[#4597CA]">
          <span className="text-lg font-bold text-[#4597CA]">{index - 2}.</span>
          <p className="text-slate-700 leading-relaxed text-[15px]">
            <strong className="text-[#143b67] font-semibold">{parts[0]}:</strong> {parseInlineLinks(parts[1] || '')}
          </p>
        </div>
      );
    }
    // Normal paragraphs
    return (
      <p key={index} className="text-slate-600/95 leading-relaxed text-[15px] sm:text-[16px] mb-5 font-sans">
        {parseInlineLinks(para)}
      </p>
    );
  };

  // Rendering Individual Blog Article Detail
  if (activeBlogPost) {
    // Collect related blogs that aren't the current active one
    const relatedPosts = BLOG_POSTS.filter(post => post.id !== activeBlogPost.id).slice(0, 2);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="blog-detail-view">
        {/* Breadcrumbs and Back Navigation */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 font-medium">
          <button 
            onClick={() => {
              if (propSetActiveBlogPost) propSetActiveBlogPost(null);
              if (propSetCurrentPage) propSetCurrentPage('home');
              navigate('/');
            }} 
            className="hover:text-[#4597CA] transition-colors"
          >
            Inicio
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button 
            onClick={() => {
              if (propSetActiveBlogPost) propSetActiveBlogPost(null);
              if (propSetCurrentPage) propSetCurrentPage('blog');
              navigate('/blog');
            }} 
            className="hover:text-[#4597CA] transition-colors"
          >
            Blog de Salud
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">{activeBlogPost.title}</span>
        </div>

        {/* Back Arrow button */}
        <button
          onClick={() => {
            if (propSetActiveBlogPost) propSetActiveBlogPost(null);
            if (propSetCurrentPage) propSetCurrentPage('blog');
            navigate('/blog');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#4597CA] bg-white rounded-xl shadow-xs border border-slate-200 transition-all mb-8 hover:shadow-md cursor-pointer"
          id="btn-back-to-blogs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de blogs</span>
        </button>

        {/* Main Article Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ARTICLE CONTENT BODY (lg:col-span-8) */}
          <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-5 sm:p-8 shadow-sm">
            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-[#4597CA]/10 text-[#0C4169] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider font-sans">
                {activeBlogPost.category}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                <Clock className="w-3 h-3" /> {activeBlogPost.readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#143b67] tracking-tight leading-snug font-sans mb-6">
              {activeBlogPost.title}
            </h1>

            {/* Micro Author header metadata */}
            <div className="flex items-center gap-4 border-y border-slate-100 py-4 mb-8">
              <img 
                src={activeBlogPost.author.avatar} 
                alt={activeBlogPost.author.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#4597CA]/30"
              />
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">{activeBlogPost.author.name}</p>
                <p className="text-xs text-slate-500">{activeBlogPost.author.role} • {activeBlogPost.publishDate}</p>
              </div>
            </div>

            {/* Hero Banner Image */}
            <div className="relative rounded-xl overflow-hidden mb-8 shadow-sm border border-slate-100 max-h-[450px]">
              <img 
                src={activeBlogPost.image} 
                alt={activeBlogPost.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Paragraph Contents */}
            <div className="prose prose-slate max-w-none mb-12">
              {activeBlogPost.content.map((para, index) => renderContentNode(para, index))}
            </div>

            {/* Dynamic Interactive Tag Cloud */}
            <div className="border-t border-slate-100 pt-6 mb-8 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mr-2">Etiquetas:</span>
              {activeBlogPost.tags.map((tag, i) => (
                <span key={i} className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-150">
                  #{tag}
                </span>
              ))}
            </div>

            {/* DETAILED AUTHOR PROFILE BOX (EEAT compliance validation) */}
            <div className="bg-[#143b67]/5 rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <img 
                  src={activeBlogPost.author.avatar} 
                  alt={activeBlogPost.author.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md mx-auto"
                />
                <span className="absolute -bottom-1 -right-1 bg-teal-500 text-white rounded-full p-1 border-2 border-white shadow flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-lg font-bold text-[#143b67]">{activeBlogPost.author.name}</h4>
                  <span className="bg-[#4597CA]/10 text-[#0C4169] text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-mono">
                    <Award className="w-3 h-3" /> Especialista Sello Colmedikal
                  </span>
                </div>
                <p className="text-xs font-extrabold text-[#4597CA] uppercase tracking-wider font-mono">{activeBlogPost.author.specialty}</p>
                <p className="text-xs text-slate-400 italic font-medium">{activeBlogPost.author.experience}</p>
                <p className="text-sm text-slate-600 leading-relaxed font-sans mt-2">{activeBlogPost.author.bio}</p>
                
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-medium text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Miembro Médico Activo
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    ★ 4.9 Valoración Promedio
                  </span>
                </div>
              </div>
            </div>

          </article>


          {/* SIDEBAR NAVIGATION CTAs (lg:col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Primary Calculator CTA Card */}
            <div className="bg-gradient-to-br from-[#0C4169] to-[#143b67] text-white rounded-2xl p-6 shadow-lg relative overflow-hidden group border border-[#143b67]">
              {/* Subtle background graphic */}
              <div className="absolute -right-16 -bottom-16 w-44 h-44 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" />
              
              <div className="relative space-y-5">
                <span className="inline-flex bg-white/10 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase font-mono">
                  <TrendingUp className="w-3.5 h-3.5 inline mr-1" /> Inteligente y Al Instante
                </span>
                
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  Calcula tu tarifa personalizada hoy
                </h3>
                
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                  ¿Quieres saber cuánto costaría asegurar a tu familia? Cotiza en menos de 2 minutos de forma 100% online y transparente, sin papeleo molesto.
                </p>

                {/* Simulated quick links to the true Calculator states */}
                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => handleCtaClick('individual')}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl text-left text-xs font-semibold text-white transition-all cursor-pointer group"
                  >
                    <span>Cotizar para Mí Solo/a</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleCtaClick('familiar')}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl text-left text-xs font-semibold text-white transition-all cursor-pointer group"
                  >
                    <span>Cotizar para mi Familia completa</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <button
                  onClick={() => handleCtaClick()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-slate-100 text-[#0C4169] font-black text-sm rounded-xl shadow-md transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                  id="sidebar-cta-calculator-btn"
                >
                  <Calculator className="w-4 h-4 text-[#0C4169]" />
                  <span>Calcular Mi Tarifa Ahora</span>
                </button>

                <p className="text-[10px] text-center text-slate-300 font-medium font-mono">
                  ✓ Precios reales • ✓ Sin compromisos comerciales
                </p>
              </div>
            </div>

            {/* Quick Internal Navigation */}
            <div className="bg-white rounded-2xl p-5 border border-slate-150 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Explora Colmedikal</h4>
              <nav className="space-y-0.5">
                {[
                  { to: '/directorio',   label: 'Directorio de Médicos'   },
                  { to: '/agendamiento', label: 'Agendar una Cita Médica' },
                  { to: '/tramites',     label: 'Trámites y Reembolsos'   },
                  { to: '/servicios',    label: 'Servicios de Salud'       },
                  { to: '/faqs',         label: 'Preguntas Frecuentes'    },
                  { to: '/nosotros',     label: 'Sobre Colmedikal'        },
                ].map(link => (
                  <Link key={link.to} to={link.to}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#4597CA]/5 text-xs text-slate-600 hover:text-[#4597CA] font-medium transition-colors group">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4597CA] group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Secondary Direct Advisor Assistance */}
            <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-xs space-y-4">
              <h4 className="text-md font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#4597CA]" /> ¿Prefieres hablar con un experto?
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Nuestros agentes de Colmedikal Ecuador están listos para asesorarte de manera personalizada en la elección de tu plan de medicina prepagada.
              </p>

              <div className="space-y-2 pt-2">
                <a 
                  href="https://wa.me/593987028756?text=Hola%20Colmedikal%2C%20quisiera%20asesoria%2520sobre%2520los%2520planes%2520de%2520medicina%2520prepagada."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-extrabold text-xs sm:text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  id="sidebar-wa-advice"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Asesoría Directa por WhatsApp</span>
                </a>
              </div>
            </div>

          </aside>

        </div>


        {/* RELATED ARTICLES SECTION (at the bottom) */}
        <section className="mt-16 border-t border-slate-200 pt-12 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <span className="bg-[#4597CA]/10 text-[#0C4169] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                Sigue Cuidándote
              </span>
              <h2 className="text-2xl font-black text-[#143b67] tracking-tight font-sans mt-2">Artículos Recomendados Relacionados</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {relatedPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => {
                  if (propSetActiveBlogPost) propSetActiveBlogPost(post);
                  navigate(`/blog/${post.slug}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col md:flex-row gap-5 group"
                id={`related-card-${post.id}`}
              >
                <div className="w-full md:w-1/3 aspect-video md:aspect-square overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold font-mono text-[#4597CA] uppercase tracking-wider bg-[#4597CA]/5 px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <h3 className="font-bold text-[#143b67] text-md leading-snug group-hover:text-[#4597CA] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[#4597CA] text-xs font-bold font-mono">
                    <span>Leer Artículo Completo</span>
                    <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    );
  }

  // ELSE rendering Blog Index (List of 3 articles)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="blog-index-view">
      
      {/* Search and category filters Header Block */}
      <div className="text-center space-y-4 mb-10 max-w-2xl mx-auto">
        <span className="bg-[#4597CA]/10 text-[#0C4169] text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest font-mono">
          Salud, Ciencia y Prevención
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#143b67] tracking-tight leading-tight">
          Blog Médico y Guía de Bienestar
        </h1>
        <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
          Explicaciones claras y fidedignas con el respaldo de nuestros directores médicos de Colmedikal. Infórmate con base científica sobre tu bienestar.
        </p>

        {/* Dynamic Client-side Search Input */}
        <div className="relative max-w-md mx-auto pt-2">
          <input 
            type="text" 
            placeholder="Buscar artículos por tema o etiqueta..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 outline-none focus:border-[#4597CA] focus:ring-1 focus:ring-[#4597CA] text-slate-800 text-sm font-medium shadow-2xs transition-all"
          />
          <Search className="absolute left-4 top-5.5 w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Category filters pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50 max-w-lg mx-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-sans transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#143b67] text-white shadow-md shadow-[#143b67]/15'
                : 'text-slate-600 hover:text-[#4597CA] hover:bg-slate-50'
            }`}
          >
            {cat === 'todos' ? 'Ver Todos' : cat}
          </button>
        ))}
      </div>

      {/* Result Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => {
                if (propSetActiveBlogPost) propSetActiveBlogPost(post);
                if (propSetCurrentPage) propSetCurrentPage('blog-detalle');
                navigate(`/blog/${post.slug}`);
              }}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col group"
              id={`blog-card-${post.id}`}
            >
              {/* Card Image Cover */}
              <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                <img 
                  src={post.image} 
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-[#143b67] text-white text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md uppercase font-mono">
                  {post.category}
                </span>
              </div>

              {/* Card Summary Context */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  {/* Metadata Row */}
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-350" /> {post.publishDate}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5 text-slate-350" /> {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-md sm:text-lg font-extrabold text-[#143b67] leading-snug group-hover:text-[#4597CA] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-600/90 text-xs sm:text-sm leading-relaxed line-clamp-3 font-sans">
                    {post.excerpt}
                  </p>
                </div>

                {/* Author footer brief */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-100"
                    />
                    <span className="text-xs font-bold text-slate-700 leading-tight">{post.author.name.split(' ')[1] || post.author.name}</span>
                  </div>
                  <span className="text-[#4597CA] text-xs font-bold flex items-center gap-0.5 group-hover:gap-1.5 transition-all font-sans">
                    Ver más <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-800">No encontramos artículos</h3>
          <p className="text-slate-500 text-sm max-w-sm px-6">
            Intenta buscando con palabras clave diferentes o selecciona otra categoría de la guía.
          </p>
        </div>
      )}

      {/* Quick General Portal Banner to convert visitors */}
      <section className="mt-20 bg-[#4597CA]/5 rounded-3xl p-6 sm:p-10 border border-[#4597CA]/20 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#143b67] tracking-tight">
            ¿Quieres saber cuál es tu Plan Médico ideal?
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            Compara tarifas en línea basadas en la edad y el grupo familiar al instante.
          </p>
        </div>
        <button 
          onClick={() => handleCtaClick()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4597CA] to-[#0C4169] text-white font-bold text-sm sm:text-sm rounded-xl shadow-lg shadow-[#0C4169]/15 hover:shadow-[#0C4169]/30 hover:scale-102 transition-all cursor-pointer"
          id="btn-footer-blog-cta"
        >
          <Calculator className="w-4 h-4" />
          <span>Cotizar en Línea Ahora</span>
        </button>
      </section>

    </div>
  );
}
