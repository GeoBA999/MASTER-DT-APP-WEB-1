import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running in standalone PWA mode
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0C1D16] border border-[#54C3BB]/30 text-[#54C3BB] text-xs font-mono">
        <Check className="w-3.5 h-3.5 text-[#C9F04D]" />
        <span>PWA Instalada</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9F04D] to-[#54C3BB] text-[#071410] text-xs font-bold shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
        title="Instalar Master DT como App nativa en tu dispositivo"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0F2319] border border-[#E6BE55]/40 text-[#E6BE55] text-xs font-semibold hover:bg-[#153023] transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#0C1D16] border border-[#E6BE55]/40 p-6 shadow-2xl text-left">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F2319] border border-[#E6BE55] flex items-center justify-center text-[#E6BE55] font-bold">
                    DT
                  </div>
                  <h3 className="font-display text-lg font-bold text-white tracking-wide">
                    Instalar en iPhone / iPad
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#071410] border border-gray-800">
                  <span className="w-6 h-6 rounded-full bg-[#E6BE55] text-[#071410] flex items-center justify-center font-bold text-xs shrink-0">1</span>
                  <p>Abre el menú de Safari tocando el botón <strong>Compartir</strong> (ícono con flecha hacia arriba).</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#071410] border border-gray-800">
                  <span className="w-6 h-6 rounded-full bg-[#E6BE55] text-[#071410] flex items-center justify-center font-bold text-xs shrink-0">2</span>
                  <p>Desplázate hacia abajo y selecciona <strong>«Agregar al inicio»</strong> (Add to Home Screen).</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#071410] border border-gray-800">
                  <span className="w-6 h-6 rounded-full bg-[#C9F04D] text-[#071410] flex items-center justify-center font-bold text-xs shrink-0">3</span>
                  <p>¡Listo! Master DT se abrirá en pantalla completa como una app nativa con acceso directo.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#E6BE55] text-[#071410] font-bold text-sm hover:brightness-105"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
