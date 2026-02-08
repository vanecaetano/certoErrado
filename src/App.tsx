import { useEffect } from 'react';
import './i18n';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { WelcomeModal } from '@/components/layout/WelcomeModal';
import { HomePage } from '@/features/home/HomePage';
import { LandingPage } from '@/features/landing/LandingPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { GamePage } from '@/features/game/GamePage';
import GameGuard from '@/components/layout/GameGuard';
import { ResultsPage } from '@/features/results/ResultsPage';
import { PrivacyPage } from '@/features/privacy/PrivacyPage';
import { SharedQuizPage } from '@/features/shared/SharedQuizPage';
import { RankingPage } from '@/features/ranking/RankingPage';
import { CreateRoomPage } from '@/features/multiplayer/CreateRoomPage';
import { LobbyPage } from '@/features/multiplayer/LobbyPage';
import { MultiplayerGamePage } from '@/features/multiplayer/MultiplayerGamePage';
import { MultiplayerResultsPage } from '@/features/multiplayer/MultiplayerResultsPage';
import { useThemeStore } from '@/store/themeStore';
import { dbService } from '@/services/database';
import { initializeFirebase } from '@/services/firebase';
import '@/styles/index.css';
import backgroundMusic from '@/assets/background.mp3';

const queryClient = new QueryClient();

function App() {
  const { theme } = useThemeStore();

  const handlePlayerNameComplete = (name: string) => {
    console.log('✅ Nome do jogador definido:', name);
  };
  
  // Música de fundo global
  useEffect(() => {
    let audio: HTMLAudioElement | null = (window as any).backgroundAudio;
    if (!audio) {
      audio = new Audio(backgroundMusic);
      audio.loop = true;
      audio.volume = 0.15;
      (window as any).backgroundAudio = audio;
    }
    let enabled = true;
    const tryPlay = () => {
      audio?.play().catch(() => {});
    };
    const toggle = (e: any) => {
      enabled = e.detail;
      if (enabled) tryPlay();
      else audio?.pause();
    };
    const scrollHandler = () => {
      if (audio && audio.paused && enabled) {
        audio.play().catch(() => {});
      }
    };
    window.addEventListener('music-toggle', toggle);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    // Inicializar banco de dados, tema, etc
    dbService.initialize().catch(console.error);
    dbService.createDefaultSubject().catch(console.error);
    // Inicializar Firebase para compartilhamento de quizzes
    initializeFirebase();
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.dispatchEvent(new CustomEvent('music-toggle', { detail: true }));
    return () => {
      window.removeEventListener('music-toggle', toggle);
      window.removeEventListener('scroll', scrollHandler);
      audio?.pause();
    };
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <WelcomeModal onComplete={handlePlayerNameComplete} />
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
              <Route path="/quiz/:id" element={<SharedQuizPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              
              {/* Multiplayer Routes */}
              <Route path="/multiplayer/create" element={<CreateRoomPage />} />
              <Route path="/multiplayer/:roomId" element={<LobbyPage />} />
              <Route path="/multiplayer/:roomId/play" element={<MultiplayerGamePage />} />
              <Route path="/multiplayer/:roomId/results" element={<MultiplayerResultsPage />} />
            </Routes>
          </main>
          <SpeedInsights />
          {/* AdSpace removido. Anúncios agora são gerenciados pelo Google AdSense global. */}
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
