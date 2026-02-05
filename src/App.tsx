import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/features/home/HomePage';
import { LandingPage } from '@/features/landing/LandingPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { GamePage } from '@/features/game/GamePage';
import GameGuard from '@/components/layout/GameGuard';
import { ResultsPage } from '@/features/results/ResultsPage';
import { PrivacyPage } from '@/features/privacy/PrivacyPage';
import { useThemeStore } from '@/store/themeStore';
import { dbService } from '@/services/database';
import '@/styles/index.css';
import backgroundMusic from '@/assets/background.mp3';

const queryClient = new QueryClient();

function App() {
  const { theme } = useThemeStore();
  // Música de fundo global
  useEffect(() => {
    let audio: HTMLAudioElement | null = new Audio(backgroundMusic);
    audio.loop = true;
    audio.volume = 0.15;
    let enabled = true;
    let started = false;
    const tryPlay = () => {
      if (!started) {
        started = true;
        audio?.play().catch(() => {});
      }
    };
    const toggle = (e: any) => {
      enabled = e.detail;
      if (enabled) tryPlay();
      else audio?.pause();
    };
    window.addEventListener('music-toggle', toggle);
    const mouseHandler = () => {
      tryPlay();
      window.removeEventListener('mousemove', mouseHandler);
    };
    const clickHandler = () => {
      tryPlay();
      window.removeEventListener('click', clickHandler);
    };
    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('click', clickHandler);
    // Inicializar banco de dados, tema, etc
    dbService.initialize().catch(console.error);
    dbService.createDefaultSubject().catch(console.error);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.dispatchEvent(new CustomEvent('music-toggle', { detail: true }));
    return () => {
      window.removeEventListener('music-toggle', toggle);
      window.removeEventListener('mousemove', mouseHandler);
      window.removeEventListener('click', clickHandler);
      audio?.pause();
      audio = null;
    };
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:pb-24 pb-0">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/play" element={<HomePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/game" element={
                <GameGuard>
                  <GamePage />
                </GameGuard>
              } />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>
          {/* AdSpace removido. Anúncios agora são gerenciados pelo Google AdSense global. */}
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
