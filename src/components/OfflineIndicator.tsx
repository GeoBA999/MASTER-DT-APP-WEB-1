import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-[#0F2319] border border-[#FF7A59] p-3 text-xs font-medium text-white shadow-2xl animate-pulse">
      <div className="w-7 h-7 rounded-lg bg-[#FF7A59]/20 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4 text-[#FF7A59]" />
      </div>
      <div>
        <span className="font-bold text-[#FF7A59] block">Modo Offline Activo</span>
        <span className="text-gray-300">Tus alineaciones y datos en caché siguen disponibles sin conexión.</span>
      </div>
    </div>
  );
};
