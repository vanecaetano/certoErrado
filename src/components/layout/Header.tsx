import { useState, useEffect } from 'react';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import logoUrl from '@/assets/logo.svg';
import { Link } from 'react-router-dom';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const [musicOn, setMusicOn] = useState(true);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('music-toggle', { detail: musicOn }));
  }, [musicOn]);

  return (
    <header className="app-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div className="flex items-center justify-between md:justify-start md:gap-3">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Certo ou Errado logo" className="w-12 h-12 rounded-md shadow-sm" />
            <span className="site-title">
              Certo ou Errado?
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/play" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline" onClick={() => {
            // Tenta iniciar a música de fundo ao clicar em Jogar
            const evt = new Event('click');
            window.dispatchEvent(evt);
          }}>Jogar</Link>
          <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Privacidade</Link>
          <Link to="/settings" className="text-sm text-gray-600 dark:text-gray-300 hover:underline">Configurações</Link>
          <button
            onClick={() => setMusicOn((v) => !v)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={musicOn ? 'Desligar música' : 'Ligar música'}
          >
            {musicOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
