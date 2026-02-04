import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { AdSpace } from '@/components/layout/AdSpace';
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

const queryClient = new QueryClient();

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Inicializar banco de dados
    dbService.initialize().catch(console.error);
    
    // Criar subject padrão se não existir
    dbService.createDefaultSubject().catch(console.error);

    // Aplicar tema inicial
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
          <AdSpace position="bottom" />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
