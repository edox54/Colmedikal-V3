import { createPortal } from 'react-dom';
import { FileText, X, CheckCircle, Download } from 'lucide-react';
import { AdminSharedProps } from './adminTypes';

type Props = Pick<AdminSharedProps, 'selectedDocument' | 'setSelectedDocument'>;

export default function DocumentPreviewModal(props: Props) {
  const { selectedDocument, setSelectedDocument } = props;
  return (
    selectedDocument && createPortal(
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full flex flex-col md:flex-row h-auto md:h-[620px] divide-y md:divide-y-0 md:divide-x divide-slate-800 animate-in zoom-in-95 duration-200">
          
          {/* Metadata Audit & Actions Column */}
          <div className="p-6 md:w-5/12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Verificación Física</span>
                <button 
                  onClick={() => setSelectedDocument(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">ID de Trámite Interno:</span>
                  <span className="font-mono text-xs font-bold text-white block">{selectedDocument.id}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Asegurado Solicitante:</span>
                  <span className="text-sm font-bold text-white block leading-tight">{selectedDocument.fullName}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold block uppercase">Celular:</span>
                    <span className="text-[11px] font-medium text-slate-300 block font-mono">{selectedDocument.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-505 font-bold block uppercase">Correo:</span>
                    <span className="text-[11px] font-medium text-slate-300 block truncate" title={selectedDocument.email}>{selectedDocument.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-505 font-bold block uppercase">Archivo Adjunto Recibido:</span>
                  <div className="flex items-center gap-2 mt-1 p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-300 font-mono truncate">{selectedDocument.fileName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 text-[11px] leading-relaxed text-slate-400">
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Firma Digital Colmedikal</span>
                </span>
                <p>Este documento es una copia viva recibida en nuestros servidores y pre-analizada con reconocimiento clínico automático.</p>
              </div>
            </div>

            <div className="pt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  if (selectedDocument?.fileData) {
                    const link = document.createElement('a');
                    link.href = selectedDocument.fileData;
                    link.download = selectedDocument.fileName || 'documento_colmedikal';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert('No hay datos de archivo disponibles para este registro cargado.');
                  }
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                id="download-doc-btn"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Archivo Adjunto</span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl text-center transition cursor-pointer"
              >
                Cerrar Visor
              </button>
            </div>
          </div>

          {/* Document Sheet Paper Visualizer Simulator Section */}
          <div className="p-4 md:p-6 md:w-7/12 bg-slate-950 flex flex-col justify-center items-center overflow-hidden">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mb-2 block">VISUALIZACIÓN DE DOCUMENTO ADJUNTO POR CLIENTE</span>
            
            <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
              {selectedDocument.fileData ? (
                <>
                  {selectedDocument.fileData.startsWith('data:image/') ? (
                    <img 
                      src={selectedDocument.fileData} 
                      alt="Vista previa del documento" 
                      className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-500" 
                    />
                  ) : selectedDocument.fileData.startsWith('data:application/pdf') ? (
                    <iframe 
                      src={selectedDocument.fileData} 
                      className="w-full h-full border-none bg-white animate-in fade-in duration-500" 
                      title="PDF Preview" 
                    />
                  ) : (
                    <div className="text-center p-8 space-y-4">
                      <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-slate-400 text-xs font-medium">Contenido del archivo no previsualizable.</p>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedDocument.fileData!;
                          link.download = selectedDocument.fileName;
                          link.click();
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-white text-[10px] font-bold rounded-lg border border-slate-701"
                      >
                        Abrir / Descargar para Revisión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Falling back to paper simulation if legacy record has no data */
                <div className="bg-amber-50/5 border border-amber-500/20 w-full rounded-2xl p-6 text-slate-800 space-y-4 shadow-xl select-none relative font-mono text-[10px] leading-relaxed overflow-hidden max-w-[340px] scale-90 sm:scale-100">
                  <div className="absolute inset-0 bg-white opacity-[0.96] pointer-events-none z-0"></div>
                  <div className="relative z-10 space-y-3">
                    <div className="text-center font-bold border-b border-slate-300 pb-2.5 tracking-tight">
                      <h5 className="text-[11px] uppercase tracking-wider text-slate-950">REPÚBLICA DEL ECUADOR</h5>
                      <p className="text-[8px] text-slate-500 mt-0.5 whitespace-nowrap">DOCUMENTO DE RESPALDO (SIN DATA BINARIA)</p>
                    </div>
                    <div className="p-8 text-center text-slate-400 italic">
                      Este registro fue creado antes de la implementación de carga directa de archivos.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  );
}
