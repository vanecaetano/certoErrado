import { useState, useEffect } from 'react';
import { Moon, Sun, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useGameStore } from '@/store/gameStore';
import { ShareQuizButton } from '@/components/ui/ShareQuizButton';
import { dbService } from '@/services/database';
import logoUrl from '@/assets/logo.svg';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t, i18n } = useTranslation();
  const { questions, config, score, pauseGame, resumeGame } = useGameStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [showShareButton, setShowShareButton] = useState(false);
  
  // Detectar idioma do navegador
  const getBrowserLanguage = () => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('de')) return 'de';
    return 'en'; // padrão inglês
  };
  
  const [lang, setLang] = useState(localStorage.getItem('lang') || getBrowserLanguage());
  
  useEffect(() => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  }, [lang, i18n]);
  const { theme, toggleTheme } = useThemeStore();
  const [musicOn, setMusicOn] = useState(true);
  
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('music-toggle', { detail: musicOn }));
  }, [musicOn]);

  // Carregar nomes dos assuntos quando houver quiz ativo
  useEffect(() => {
    const loadSubjects = async () => {
      if (questions.length > 0 && config.subjects.length > 0) {
        const names: string[] = [];
        for (const { subjectId } of config.subjects) {
          const subject = await dbService.getSubjectByIdAsync(subjectId);
          if (subject) names.push(subject.name);
        }
        setSubjectNames(names);
        setShowShareButton(true);
      } else {
        setShowShareButton(false);
      }
    };
    loadSubjects();
  }, [questions.length, config.subjects]);

  // Função para garantir play direto no clique
  function handleMusicToggle() {
    const audio = (window as any).backgroundAudio as HTMLAudioElement | undefined;
    if (!musicOn) {
      // Ativa e tenta tocar imediatamente, sincronicamente
      if (audio) audio.play().catch(() => {});
      window.dispatchEvent(new CustomEvent('music-toggle', { detail: true }));
      setMusicOn(true);
    } else {
      if (audio) audio.pause();
      window.dispatchEvent(new CustomEvent('music-toggle', { detail: false }));
      setMusicOn(false);
    }
  }

  return (
    <header className="app-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo e Título */}
        <Link to="/" className="flex items-center gap-3 min-w-0 flex-shrink hover:opacity-80 transition-opacity">
          <img 
            src={logoUrl} 
            alt="Certo ou Errado logo" 
            className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 object-contain" 
          />
          <span className="site-title text-base md:text-xl truncate">
            {t('Certo ou Errado?')}
          </span>
        </Link>

        {/* Navigation e Controles - Desktop */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          {/* Seletor de Idioma */}
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="px-3 py-1.5 rounded-lg border-2 border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-medium hover:border-primary-500 dark:hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
            aria-label="Selecionar idioma"
          >
            <option value="pt">🇧🇷</option>
            <option value="en">🇬🇧</option>
            <option value="es">🇪🇸</option>
            <option value="fr">🇫🇷</option>
            <option value="de">🇩🇪</option>
          </select>

          {/* Botão Compartilhar (se quiz ativo) */}
          {showShareButton && (
            <div className="flex-shrink-0">
              <ShareQuizButton 
                questions={questions} 
                subjects={subjectNames} 
                score={score} 
                variant="compact" 
                onOpen={pauseGame}
                onClose={resumeGame}
              />
            </div>
          )}

          {/* Links de Navegação */}
          <Link 
            to="/" 
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:underline whitespace-nowrap" 
            onClick={() => {
              const evt = new Event('click');
              window.dispatchEvent(evt);
            }}
          >
            {t('Início')}
          </Link>
          <Link 
            to="/play" 
            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline whitespace-nowrap" 
            onClick={() => {
              const evt = new Event('click');
              window.dispatchEvent(evt);
            }}
          >
            {t('Jogar')}
          </Link>
          <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:underline whitespace-nowrap">
            {t('Privacidade')}
          </Link>
          <Link to="/settings" className="text-sm text-gray-600 dark:text-gray-300 hover:underline whitespace-nowrap">
            {t('Configurações')}
          </Link>

          {/* Controles de Música e Tema */}
          <button
            onClick={handleMusicToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label={musicOn ? 'Desligar música' : 'Ligar música'}
          >
            {musicOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Seletor de Idioma Compacto - Mobile */}
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="px-2 py-1.5 rounded-lg border-2 border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium hover:border-primary-500 dark:hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors cursor-pointer"
            aria-label="Selecionar idioma"
          >
            <option value="pt">🇧🇷</option>
            <option value="en">🇬🇧</option>
            <option value="es">🇪🇸</option>
            <option value="fr">🇫🇷</option>
            <option value="de">🇩🇪</option>
          </select>
          
          {/* Botão Menu Hambúrguer */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-fade-in">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
            {/* Botão Compartilhar Mobile */}
            {showShareButton && (
              <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                <ShareQuizButton 
                  questions={questions} 
                  subjects={subjectNames} 
                  score={score} 
                  variant="compact" 
                  onOpen={pauseGame}
                  onClose={resumeGame}
                />
              </div>
            )}
            <Link 
              to="/" 
              className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 hover:underline py-2" 
              onClick={() => {
                setMobileMenuOpen(false);
                const evt = new Event('click');
                window.dispatchEvent(evt);
              }}
            >
              {t('Início')}
            </Link>
            <Link 
              to="/play" 
              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline py-2" 
              onClick={() => {
                setMobileMenuOpen(false);
                const evt = new Event('click');
                window.dispatchEvent(evt);
              }}
            >
              {t('Jogar')}
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('Privacidade')}
            </Link>
            <Link 
              to="/settings" 
              className="text-sm text-gray-600 dark:text-gray-300 hover:underline py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('Configurações')}
            </Link>
            
            {/* Controles no Mobile Menu */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleMusicToggle}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 py-2"
                aria-label={musicOn ? 'Desligar música' : 'Ligar música'}
              >
                {musicOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span>{musicOn ? t('Música On') : t('Música Off')}</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 py-2"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-5 h-5" />
                    <span>{t('Modo Claro')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5" />
                    <span>{t('Modo Escuro')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
