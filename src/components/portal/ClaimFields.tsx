// Renders the official-form sections (src/data/claims.ts) as inputs, or read-only.
import type { FieldDef, SectionDef } from '../../data/claims';

const input = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20';
const visible = (f: FieldDef, form: Record<string, string>) => !f.showIf || form[f.showIf.key] === f.showIf.equals;

export function SectionInputs({ section, form, onChange }: { section: SectionDef; form: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-black text-[#0C4169]">{section.title}</legend>
      {section.hint && <p className="-mt-1 text-[11px] text-slate-500">{section.hint}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {section.fields.filter(f => visible(f, form)).map(f => {
          const id = `cf-${section.id}-${f.key}`;
          const v = form[f.key] || '';
          const common = { id, value: v, required: f.required, onChange: (e: { target: { value: string } }) => onChange(f.key, e.target.value) };
          return (
            <div key={f.key} className={f.half ? '' : 'sm:col-span-2'}>
              <label htmlFor={id} className="mb-1 block text-[11px] font-bold text-slate-600">{f.label}{f.required && <span className="text-rose-500"> *</span>}</label>
              {f.type === 'textarea' ? <textarea {...common} rows={2} maxLength={3000} className={input} />
                : f.type === 'select' ? (
                  <select {...common} className={input}>
                    <option value="">Selecciona…</option>{f.options!.map(o => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input {...common} maxLength={300} className={input}
                    type={f.type === 'money' || f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : f.type || 'text'}
                    {...(f.type === 'money' ? { min: 0, step: '0.01', inputMode: 'decimal' as const } : f.type === 'number' ? { min: 0, max: 120 } : {})} />
                )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SectionView({ section, form, dark }: { section: SectionDef; form: Record<string, string>; dark?: boolean }) {
  const fields = section.fields.filter(f => visible(f, form) && form[f.key]);
  if (!fields.length) return null;
  return (
    <div>
      <h4 className={`mb-2 text-xs font-black ${dark ? 'text-slate-800 dark:text-slate-100' : 'text-[#0C4169]'}`}>{section.title}</h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
        {fields.map(f => (
          <div key={f.key} className={f.half ? 'min-w-0' : 'min-w-0 sm:col-span-2'}>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.label}</dt>
            <dd className={`whitespace-pre-wrap break-words text-xs ${dark ? 'text-slate-800 dark:text-slate-100' : 'text-slate-800'}`}>{f.type === 'money' ? `$${Number(form[f.key]).toFixed(2)}` : form[f.key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
