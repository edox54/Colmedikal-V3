import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Scale, ArrowRight, Trophy, ChevronDown } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  basePrice: number;
  cobertura: string;
  dedHosp: string;
  maternidad: string;
  muerteAccidente: string;
  sepelio: string;
  ambulancia: string;
  evacuacion: string;
  laboratorio: string;
  imagen: string;
  especialidades: Record<string, boolean>;
}

const plans: Plan[] = [
  {
    id: 'plan1',
    name: 'Plan 1',
    basePrice: 8,
    cobertura: '$2.000,00 USD Anual',
    dedHosp: '$40,00 USD Anual',
    maternidad: '$250,00 USD',
    muerteAccidente: '$1.500,00 USD',
    sepelio: '$500,00 USD',
    ambulancia: '$200,00 USD',
    evacuacion: '$200,00 USD',
    laboratorio: '$100,00 USD/Año',
    imagen: '$100,00 USD/Año',
    especialidades: {
      'Medicina General': true,
      'Medicina Familiar': true,
      'Ginecología': true,
      'Gastroenterología': true,
      'Urología': false,
      'Traumatología': false,
      'Medicina Interna': false,
      'Cardiología': false,
      'Odontología (6 proced./año)': true,
    },
  },
  {
    id: 'plan2',
    name: 'Plan 2',
    basePrice: 12,
    cobertura: '$3.000,00 USD Anual',
    dedHosp: '$40,00 USD Anual',
    maternidad: '$500,00 USD',
    muerteAccidente: '$2.500,00 USD',
    sepelio: '$500,00 USD',
    ambulancia: '$200,00 USD',
    evacuacion: '$200,00 USD',
    laboratorio: '$100,00 USD/Año',
    imagen: '$100,00 USD/Año',
    especialidades: {
      'Medicina General': true,
      'Medicina Familiar': true,
      'Ginecología': true,
      'Gastroenterología': true,
      'Urología': true,
      'Traumatología': true,
      'Medicina Interna': false,
      'Cardiología': false,
      'Odontología (6 proced./año)': true,
    },
  },
  {
    id: 'plan3',
    name: 'Plan 3 Platinum',
    basePrice: 22,
    cobertura: '$5.000,00 USD Anual',
    dedHosp: '$40,00 USD Anual',
    maternidad: '$700,00 USD',
    muerteAccidente: '$3.500,00 USD',
    sepelio: '$800,00 USD',
    ambulancia: '$200,00 USD',
    evacuacion: '$200,00 USD',
    laboratorio: '$100,00/Año',
    imagen: '$100,00/Año',
    especialidades: {
      'Medicina General': true,
      'Medicina Familiar': true,
      'Ginecología': true,
      'Gastroenterología': true,
      'Urología': true,
      'Traumatología': true,
      'Medicina Interna': true,
      'Cardiología': true,
      'Odontología (6 proced./año)': true,
    },
  },
];

function parseUSD(val: string): number {
  const match = val.replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(match) || 0;
}

type BenefitRow = { label: string; key: keyof Plan; higherIsBetter: boolean };

const benefitRows: BenefitRow[] = [
  { label: 'Precio Base (USD/mes)', key: 'basePrice', higherIsBetter: false },
  { label: 'Límite Anual de Cobertura', key: 'cobertura', higherIsBetter: true },
  { label: 'Deducible Hospitalario', key: 'dedHosp', higherIsBetter: false },
  { label: 'Bono Maternidad', key: 'maternidad', higherIsBetter: true },
  { label: 'Muerte por Accidente', key: 'muerteAccidente', higherIsBetter: true },
  { label: 'Sepelio por Accidente', key: 'sepelio', higherIsBetter: true },
  { label: 'Ambulancia', key: 'ambulancia', higherIsBetter: true },
  { label: 'Evacuación', key: 'evacuacion', higherIsBetter: true },
  { label: 'Laboratorio', key: 'laboratorio', higherIsBetter: true },
  { label: 'Imágenes Diagnósticas', key: 'imagen', higherIsBetter: true },
];

function getVal(plan: Plan, key: keyof Plan): string {
  const v = plan[key];
  if (key === 'basePrice') return `$${v},00 USD`;
  return String(v);
}

function getNumeric(plan: Plan, key: keyof Plan): number {
  if (key === 'basePrice') return plan.basePrice;
  return parseUSD(String(plan[key]));
}

export default function ComparadorPlanes(_props: { setCurrentPage?: (page: string) => void }) {
  const navigate = useNavigate();
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(2);

  const planA = plans[leftIdx];
  const planB = plans[rightIdx];

  const allSpecs = useMemo(() => {
    const keys = new Set<string>();
    plans.forEach((p) => Object.keys(p.especialidades).forEach((k) => keys.add(k)));
    return Array.from(keys);
  }, []);

  const { scoreA, scoreB } = useMemo(() => {
    let sA = 0;
    let sB = 0;
    benefitRows.forEach((row) => {
      const nA = getNumeric(planA, row.key);
      const nB = getNumeric(planB, row.key);
      if (nA === nB) return;
      if (row.higherIsBetter) {
        if (nA > nB) sA++;
        else sB++;
      } else {
        if (nA < nB) sA++;
        else sB++;
      }
    });
    allSpecs.forEach((spec) => {
      const a = planA.especialidades[spec] ?? false;
      const b = planB.especialidades[spec] ?? false;
      if (a && !b) sA++;
      if (b && !a) sB++;
    });
    return { scoreA: sA, scoreB: sB };
  }, [planA, planB, allSpecs]);

  const winner = scoreA > scoreB ? planA : scoreB > scoreA ? planB : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Scale className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Comparador de Planes
            </h1>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Plan Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <PlanSelector
            label="Plan A"
            selectedIdx={leftIdx}
            onChange={setLeftIdx}
            otherIdx={rightIdx}
          />
          <PlanSelector
            label="Plan B"
            selectedIdx={rightIdx}
            onChange={setRightIdx}
            otherIdx={leftIdx}
          />
        </div>

        {leftIdx === rightIdx ? (
          <div className="text-center py-12 text-slate-500">
            <Scale className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg">Selecciona dos planes diferentes para comparar</p>
          </div>
        ) : (
          <>
            {/* Score Badge */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-700">Resultado</h2>
              </div>
              <div className="flex items-center justify-center gap-6 text-2xl font-bold">
                <span className={scoreA >= scoreB ? 'text-green-600' : 'text-slate-400'}>
                  {planA.name}: {scoreA}
                </span>
                <span className="text-slate-300">vs</span>
                <span className={scoreB >= scoreA ? 'text-green-600' : 'text-slate-400'}>
                  {planB.name}: {scoreB}
                </span>
              </div>
              {winner && (
                <p className="mt-2 text-sm text-green-700 bg-green-50 inline-block px-4 py-1 rounded-full">
                  {winner.name} gana en más categorías
                </p>
              )}
              {!winner && (
                <p className="mt-2 text-sm text-blue-700 bg-blue-50 inline-block px-4 py-1 rounded-full">
                  Empate &mdash; ambos planes son equivalentes
                </p>
              )}
            </div>

            {/* Benefits Comparison Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold text-slate-700">Beneficios y Coberturas</h3>
              </div>
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-3 text-sm font-medium text-slate-500 border-b border-slate-100 px-4 py-2">
                <div>Beneficio</div>
                <div className="text-center">{planA.name}</div>
                <div className="text-center">{planB.name}</div>
              </div>
              {benefitRows.map((row, i) => {
                const nA = getNumeric(planA, row.key);
                const nB = getNumeric(planB, row.key);
                const equal = nA === nB;
                let aWins = false;
                let bWins = false;
                if (!equal) {
                  aWins = row.higherIsBetter ? nA > nB : nA < nB;
                  bWins = !aWins;
                }
                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-1 sm:grid-cols-3 px-4 py-3 text-sm ${
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } border-b border-slate-100 last:border-0`}
                  >
                    <div className="font-medium text-slate-700 mb-1 sm:mb-0">{row.label}</div>
                    <div
                      className={`text-center rounded px-2 py-0.5 ${
                        aWins
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : bWins
                          ? 'bg-red-50 text-red-500'
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="sm:hidden text-xs text-slate-400 mr-1">{planA.name}:</span>
                      {getVal(planA, row.key)}
                    </div>
                    <div
                      className={`text-center rounded px-2 py-0.5 ${
                        bWins
                          ? 'bg-green-50 text-green-700 font-semibold'
                          : aWins
                          ? 'bg-red-50 text-red-500'
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="sm:hidden text-xs text-slate-400 mr-1">{planB.name}:</span>
                      {getVal(planB, row.key)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Especialidades Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                <h3 className="font-semibold text-slate-700">Especialidades Médicas</h3>
              </div>
              <div className="hidden sm:grid grid-cols-3 text-sm font-medium text-slate-500 border-b border-slate-100 px-4 py-2">
                <div>Especialidad</div>
                <div className="text-center">{planA.name}</div>
                <div className="text-center">{planB.name}</div>
              </div>
              {allSpecs.map((spec, i) => {
                const hasA = planA.especialidades[spec] ?? false;
                const hasB = planB.especialidades[spec] ?? false;
                const diff = hasA !== hasB;
                return (
                  <div
                    key={spec}
                    className={`grid grid-cols-1 sm:grid-cols-3 px-4 py-3 text-sm ${
                      i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } border-b border-slate-100 last:border-0`}
                  >
                    <div className="font-medium text-slate-700 mb-1 sm:mb-0">{spec}</div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="sm:hidden text-xs text-slate-400 mr-1">{planA.name}:</span>
                      {hasA ? (
                        <span
                          className={`flex items-center gap-1 ${
                            diff ? 'text-green-600 font-semibold' : 'text-green-600'
                          }`}
                        >
                          <Check className="w-4 h-4" /> Incluida
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <X className="w-4 h-4" /> No incluida
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className="sm:hidden text-xs text-slate-400 mr-1">{planB.name}:</span>
                      {hasB ? (
                        <span
                          className={`flex items-center gap-1 ${
                            diff ? 'text-green-600 font-semibold' : 'text-green-600'
                          }`}
                        >
                          <Check className="w-4 h-4" /> Incluida
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400">
                          <X className="w-4 h-4" /> No incluida
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="text-center">
              <button
                onClick={() => navigate('/cotizador')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Cotizar un plan
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PlanSelector({
  label,
  selectedIdx,
  onChange,
  otherIdx,
}: {
  label: string;
  selectedIdx: number;
  onChange: (idx: number) => void;
  otherIdx: number;
}) {
  const plan = plans[selectedIdx];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <div className="relative">
        <select
          value={selectedIdx}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-10 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          {plans.map((p, i) => (
            <option key={p.id} value={i}>
              {p.name} — ${p.basePrice}/mes
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <div className="mt-3 text-sm text-slate-500">
        <span className="font-medium text-slate-700">Cobertura:</span> {plan.cobertura}
      </div>
      {selectedIdx === otherIdx && (
        <p className="mt-2 text-xs text-amber-600">Elige un plan diferente al otro selector</p>
      )}
    </div>
  );
}
