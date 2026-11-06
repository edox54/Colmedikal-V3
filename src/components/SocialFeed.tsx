import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SOCIALS, SocialIcon } from './SocialLinks';

// Carga el embed solo cuando la tarjeta entra en pantalla (no frena el LCP del home).
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}

const FB_SRC = 'https://www.facebook.com/plugins/page.php?href=' + encodeURIComponent('https://www.facebook.com/colmedikal')
  + '&tabs=timeline&width=340&height=480&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false';

function TikTokEmbed() {
  useEffect(() => {
    // ponytail: embed.js oficial de TikTok; se vuelve a cargar para que procese el blockquote.
    const s = document.createElement('script');
    s.src = 'https://www.tiktok.com/embed.js';
    s.async = true;
    document.body.appendChild(s);
    return () => { s.remove(); };
  }, []);
  return (
    <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@colmedikal" data-unique-id="colmedikal" data-embed-type="creator" style={{ maxWidth: 780, minWidth: 288 }}>
      <section><a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@colmedikal?refer=creator_embed">@colmedikal</a></section>
    </blockquote>
  );
}

export default function SocialFeed() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const by = (id: string) => SOCIALS.find(s => s.id === id)!;

  const Header = ({ id }: { id: typeof SOCIALS[number]['id'] }) => (
    <a href={by(id).href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <span className="flex items-center gap-2 font-bold text-slate-800 text-sm"><SocialIcon id={id} className="w-5 h-5 text-[#4597CA]" />{by(id).label}</span>
      <span className="text-xs text-[#4597CA] font-semibold flex items-center gap-1">Seguir <ArrowUpRight className="w-3.5 h-3.5" /></span>
    </a>
  );
  const card = 'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10" id="redes-sociales">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Comunidad Colmedikal</span>
        <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">Síguenos en nuestras redes</h2>
        <p className="text-slate-600 text-sm sm:text-base">Consejos de salud, novedades y noticias de Colmedikal, al día.</p>
      </div>

      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        <div className={card}>
          <Header id="facebook" />
          {seen && <iframe title="Facebook de Colmedikal" src={FB_SRC} loading="lazy" className="w-full border-0" style={{ height: 480 }} allow="encrypted-media" />}
        </div>

        <div className={card}>
          <Header id="instagram" />
          {seen && <iframe title="Instagram de Colmedikal" src="https://www.instagram.com/colmedikal/embed" loading="lazy" className="w-full border-0" style={{ height: 480 }} />}
        </div>

        <div className={card}>
          <Header id="tiktok" />
          <div className="p-2 overflow-hidden" style={{ minHeight: 480 }}>{seen && <TikTokEmbed />}</div>
        </div>

        {/* LinkedIn no ofrece embed público del feed de una página de empresa */}
        <div className={card}>
          <Header id="linkedin" />
          <div className="p-6 space-y-4 text-center" style={{ minHeight: 200 }}>
            <p className="text-sm text-slate-600">Noticias corporativas, alianzas y oportunidades de Colmedikal Medicina Prepagada.</p>
            <a href={by('linkedin').href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0C4169] hover:bg-[#0C4169]/90 text-white text-xs font-bold transition-colors">
              <SocialIcon id="linkedin" className="w-4 h-4" /> Ver publicaciones
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
