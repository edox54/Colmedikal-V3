// Per-kind document upload list (checklist from the official forms).
import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Loader2, Paperclip, Trash2, Upload } from 'lucide-react';
import { FILE_KINDS, type Claim } from '../../data/claims';
import { ACCEPT, MAX_UPLOAD_MB, claimFileUrl, openFile, removeFile, uploadFile } from './claimsApi';

export default function ClaimDocuments({ claim, onChange, canUpload, canRemove }: { claim: Claim; onChange: (c: Claim) => void; canUpload: boolean; canRemove: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const add = async (kind: string, files: FileList | null) => {
    if (!files?.length) return;
    setErr(''); setBusy(kind);
    let next = claim;
    for (const f of Array.from(files)) {
      if (f.size > MAX_UPLOAD_MB * 1024 * 1024) { setErr(`"${f.name}" supera ${MAX_UPLOAD_MB} MB.`); continue; }
      try { const saved = await uploadFile(claim.id, kind, f); next = { ...next, files: [...next.files, saved] }; onChange(next); }
      catch (e) { setErr(`"${f.name}": ${e instanceof Error ? e.message : 'no se pudo subir'}`); }
    }
    setBusy(null);
    if (inputs.current[kind]) inputs.current[kind]!.value = '';
  };
  const del = async (fileId: string) => {
    try { await removeFile(claim.id, fileId); onChange({ ...claim, files: claim.files.filter(f => f.id !== fileId) }); }
    catch (e) { setErr(e instanceof Error ? e.message : 'No se pudo quitar'); }
  };

  return (
    <div className="space-y-2.5">
      {FILE_KINDS[claim.type].map(k => {
        const files = claim.files.filter(f => f.kind === k.kind);
        return (
          <div key={k.kind} className={`rounded-2xl border p-3.5 ${files.length ? 'border-teal-200 bg-teal-50/40' : k.required ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {files.length ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> : <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />}
                <div>
                  <p className="text-xs font-bold text-slate-800">{k.label}{k.required && <span className="text-rose-500"> *</span>}</p>
                  {k.hint && <p className="text-[10px] text-slate-500">{k.hint}</p>}
                </div>
              </div>
              {canUpload && (
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0C4169] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-900">
                  {busy === k.kind ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {busy === k.kind ? 'Subiendo…' : 'Subir'}
                  <input ref={el => { inputs.current[k.kind] = el; }} type="file" accept={ACCEPT} multiple className="sr-only" disabled={!!busy} onChange={e => add(k.kind, e.target.files)} />
                </label>
              )}
            </div>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map(f => (
                  <li key={f.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 text-[11px]">
                    <button type="button" onClick={() => openFile(claimFileUrl(claim.id, f.id))} className="flex min-w-0 items-center gap-1.5 text-left text-slate-700 hover:text-teal-700 hover:underline cursor-pointer">
                      <FileText className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{f.name}</span><span className="shrink-0 text-slate-400">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </button>
                    {canRemove && <button type="button" onClick={() => del(f.id)} className="rounded p-1 text-slate-400 hover:text-rose-600 cursor-pointer" aria-label={`Quitar ${f.name}`}><Trash2 className="h-3.5 w-3.5" /></button>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      {err && <p className="text-[11px] font-bold text-rose-600">{err}</p>}
      <p className="text-[10px] text-slate-400">Formatos: PDF, JPG, PNG, WEBP o HEIC · máximo {MAX_UPLOAD_MB} MB por archivo. Una foto nítida del documento es suficiente.</p>
    </div>
  );
}
