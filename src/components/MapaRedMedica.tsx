import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Search, MapPin, Stethoscope, Hospital, ChevronLeft, ChevronRight, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '../types';
import { useColmedikal } from '../context/ColmedikalContext';

// Fix leaflet default icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CITY_COORDS: Record<string, [number, number]> = {
  'quito': [-0.1807, -78.4678],
  'guayaquil': [-2.1894, -79.8891],
  'cuenca': [-2.9001, -79.0059],
  'ambato': [-1.2491, -78.6167],
  'manta': [-0.9500, -80.7333],
  'loja': [-3.9931, -79.2042],
  'riobamba': [-1.6635, -78.6546],
  'ibarra': [0.3392, -78.1222],
  'santo domingo': [-0.2532, -79.1719],
  'portoviejo': [-1.0546, -80.4545],
  'machala': [-3.2581, -79.9554],
  'esmeraldas': [0.9592, -79.6539],
  'latacunga': [-0.9346, -78.6155],
  'tulcan': [0.8117, -77.7172],
  'quevedo': [-1.0225, -79.4614],
  'otavalo': [0.2342, -78.2618],
  'samborondon': [-1.9613, -79.7298],
  'daule': [-1.8675, -79.9783],
  'la concordia': [0.0073, -79.3928],
  'el carmen': [-0.2667, -79.4522],
  'atuntaqui': [0.3325, -78.2175],
};

function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
}

function getCityCoords(city: string): [number, number] | null {
  const key = normalizeCityKey(city);
  for (const [coordKey, coords] of Object.entries(CITY_COORDS)) {
    if (key.includes(coordKey) || coordKey.includes(key)) {
      return coords;
    }
  }
  return null;
}

function createCityIcon(count: number): L.DivIcon {
  const size = Math.min(44 + count * 2, 60);
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:linear-gradient(135deg,#0d9488,#0f766e);
      border:3px solid white;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${count > 99 ? 12 : 14}px;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      cursor:pointer;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface CityGroup {
  city: string;
  coords: [number, number];
  doctors: Doctor[];
  specialties: string[];
}

export default function MapaRedMedica({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { seoSettings } = useColmedikal();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [rawDoctors, setRawDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch doctors
  useEffect(() => {
    fetch('https://api.colmedikal.com/api/doctors?limit=500')
      .then(r => r.json())
      .then(d => { setRawDoctors(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Filter deactivated
  const doctors = useMemo(() => {
    const deactivatedIds: string[] = (() => {
      try { return JSON.parse(seoSettings.deactivated_doctors || '[]'); } catch { return []; }
    })();
    return rawDoctors
      .map(d => ({ ...d, active: deactivatedIds.includes(d.id) ? false : (d.active !== false) }))
      .filter(d => d.active !== false);
  }, [rawDoctors, seoSettings.deactivated_doctors]);

  // Group by city with coordinates
  const cityGroups = useMemo<CityGroup[]>(() => {
    const map = new Map<string, Doctor[]>();
    doctors.forEach(d => {
      const key = normalizeCityKey(d.city || 'sin ciudad');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    const groups: CityGroup[] = [];
    map.forEach((docs, key) => {
      const coords = getCityCoords(key);
      if (coords) {
        const specialties = [...new Set(docs.map(d => d.specialty).filter(Boolean))];
        groups.push({ city: docs[0].city, coords, doctors: docs, specialties });
      }
    });
    return groups.sort((a, b) => b.doctors.length - a.doctors.length);
  }, [doctors]);

  // Filter
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return cityGroups;
    const q = searchTerm.toLowerCase();
    return cityGroups
      .map(g => {
        const matchDocs = g.doctors.filter(d =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.clinic.toLowerCase().includes(q)
        );
        if (matchDocs.length === 0) return null;
        return { ...g, doctors: matchDocs, specialties: [...new Set(matchDocs.map(d => d.specialty))] };
      })
      .filter(Boolean) as CityGroup[];
  }, [cityGroups, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const totalDoctors = doctors.length;
    const totalCities = cityGroups.length;
    const specMap = new Map<string, number>();
    doctors.forEach(d => {
      const s = d.specialty || 'Sin especialidad';
      specMap.set(s, (specMap.get(s) || 0) + 1);
    });
    const topSpecialties = [...specMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    return { totalDoctors, totalCities, topSpecialties };
  }, [doctors, cityGroups]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: [-1.8312, -78.1834],
      zoom: 7,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Update markers when filtered data changes
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    markersRef.current.clearLayers();

    filtered.forEach(group => {
      const icon = createCityIcon(group.doctors.length);
      const popupContent = `
        <div style="min-width:220px;max-width:300px;">
          <h3 style="margin:0 0 6px;font-size:15px;font-weight:700;color:#0f766e;">
            📍 ${group.city}
          </h3>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
            ${group.doctors.length} profesional${group.doctors.length > 1 ? 'es' : ''} de salud
          </p>
          <div style="max-height:200px;overflow-y:auto;border-top:1px solid #e2e8f0;padding-top:6px;">
            ${group.doctors.slice(0, 15).map(d => `
              <div style="padding:4px 0;border-bottom:1px solid #f1f5f9;font-size:12px;">
                <strong style="color:#1e293b;">${d.name}</strong><br/>
                <span style="color:#0d9488;">${d.specialty}</span>
                ${d.clinic ? `<br/><span style="color:#94a3b8;">${d.clinic}</span>` : ''}
              </div>
            `).join('')}
            ${group.doctors.length > 15 ? `<p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">...y ${group.doctors.length - 15} más</p>` : ''}
          </div>
        </div>
      `;
      const marker = L.marker(group.coords, { icon })
        .bindPopup(popupContent, { maxWidth: 320 });
      markersRef.current!.addLayer(marker);
    });
  }, [filtered]);

  const panToCity = (coords: [number, number], city: string) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(coords, 12, { duration: 1.2 });
    // Open the popup of the matching marker
    markersRef.current?.eachLayer((layer: any) => {
      if (layer.getLatLng) {
        const ll = layer.getLatLng();
        if (Math.abs(ll.lat - coords[0]) < 0.01 && Math.abs(ll.lng - coords[1]) < 0.01) {
          setTimeout(() => layer.openPopup(), 600);
        }
      }
    });
  };

  if (embedded) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '500px' }}>
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg text-xs text-slate-600 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <span>{filtered.reduce((sum, g) => sum + g.doctors.length, 0)} profesionales en {filtered.length} ciudades</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
      {/* Sidebar toggle (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3 left-3 z-[1000] lg:hidden bg-white rounded-lg shadow-lg p-2 hover:bg-slate-50 transition-colors"
        aria-label={sidebarOpen ? 'Cerrar panel' : 'Abrir panel'}
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5 text-slate-600" /> : <ChevronRight className="w-5 h-5 text-slate-600" />}
      </button>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'w-80 lg:w-96' : 'w-0'}
          transition-all duration-300 overflow-hidden bg-white border-r border-slate-200 z-[999]
          absolute lg:relative h-full
        `}>
          <div className="w-80 lg:w-96 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-teal-600 to-teal-700">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Red Médica Ecuador
                </h2>
                <button
                  onClick={() => navigate('/')}
                  className="text-teal-100 hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Inicio
                </button>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300" />
                <input
                  type="text"
                  placeholder="Buscar médico, especialidad, ciudad..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-teal-800/40 text-white placeholder-teal-300 text-sm border border-teal-500/30 focus:outline-none focus:ring-2 focus:ring-teal-300/50"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/80">
              <div className="grid grid-cols-2 gap-2">
                <StatCard icon={<Users className="w-4 h-4 text-teal-600" />} label="Profesionales" value={stats.totalDoctors} />
                <StatCard icon={<MapPin className="w-4 h-4 text-indigo-600" />} label="Ciudades" value={stats.totalCities} />
              </div>
            </div>

            {/* Specialties summary */}
            {stats.topSpecialties.length > 0 && (
              <div className="p-3 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3" />
                  Especialidades principales
                </h3>
                <div className="flex flex-wrap gap-1">
                  {stats.topSpecialties.map(([name, count]) => (
                    <button
                      key={name}
                      onClick={() => setSearchTerm(name)}
                      className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                    >
                      {name} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* City list */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide p-3 pb-1 flex items-center gap-1">
                <Hospital className="w-3 h-3" />
                {searchTerm ? `Resultados (${filtered.length} ciudades)` : `Ciudades (${cityGroups.length})`}
              </h3>
              {loading ? (
                <div className="p-4 text-center text-slate-400 text-sm">Cargando red médica...</div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm">No se encontraron resultados</div>
              ) : (
                filtered.map(group => (
                  <button
                    key={group.city}
                    onClick={() => panToCity(group.coords, group.city)}
                    className="w-full text-left px-3 py-2.5 hover:bg-teal-50 transition-colors border-b border-slate-50 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                          {group.doctors.length}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate group-hover:text-teal-700 transition-colors">
                            {group.city}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {group.specialties.slice(0, 3).join(' · ')}
                            {group.specialties.length > 3 && ` +${group.specialties.length - 3}`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="w-full h-full" />
          {/* Map overlay info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg text-xs text-slate-600 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{filtered.reduce((sum, g) => sum + g.doctors.length, 0)} profesionales en {filtered.length} ciudades</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg p-2.5 border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className="text-lg font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
