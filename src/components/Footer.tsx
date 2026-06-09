import React, { useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  commit: string;
  timestamp: string;
}

export default function Footer() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({
    version: 'V1.1',
    commit: 'unknown',
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });

  useEffect(() => {
    // Intentar obtener información de versión del servidor
    const fetchVersionInfo = async () => {
      try {
        const response = await fetch('/api/version');
        if (response.ok) {
          const data = await response.json();
          setVersionInfo(data);
        }
      } catch (error) {
        // Usar valores por defecto si el endpoint no existe
        console.log('Version endpoint not available, using defaults');
      }
    };

    fetchVersionInfo();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-6 mt-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          © 2026 Colmedikal S.A. Todos los derechos reservados. Hecho con cariño (y un ♥) por SeoEfectivo.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          {versionInfo.version} • {versionInfo.commit} • {versionInfo.timestamp}
        </p>
      </div>
    </footer>
  );
}
