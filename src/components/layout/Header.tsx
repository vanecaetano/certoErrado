import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import logoUrl from '@/assets/logo.svg';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="app-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 md:py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoUrl} alt="Certo ou Errado logo" className="w-12 h-12 rounded-md shadow-sm" />
            <span className="site-title">
              Certo ou Errado?
            </span>
          </div>
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
    </header>
  );
}
