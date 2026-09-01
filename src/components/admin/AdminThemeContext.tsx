import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const AdminThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | undefined>(undefined);

const STORAGE_KEY = 'colmedikal_admin_theme';

/**
 * Tema del admin, aislado del resto del sitio: la clase `dark` se aplica al
 * wrapper del admin (ver AdminPanel.tsx), nunca a <html>, así el toggle no
 * afecta el portal de clientes ni la landing pública.
 */
export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as Theme | null) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error('useAdminTheme must be used within AdminThemeProvider');
  return ctx;
};
