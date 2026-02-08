import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, TrendingUp } from 'lucide-react';
import { rankingService } from '@/services/rankingService';
import type { RankingEntry } from '@/types';

export function RankingWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<RankingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlayerData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadPlayerData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPlayerData = async () => {
    try {
      const { entry } = await rankingService.getCurrentPlayerPosition();
      setPlayerData(entry);
    } catch (error) {
      console.error('Erro ao carregar dados do ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !playerData) return null;

  return (
    <button
      onClick={() => navigate('/ranking')}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 border border-gray-300/20 dark:border-gray-600/30 transition-all hover:scale-[1.01] backdrop-blur-sm group lg:w-auto whitespace-nowrap"
      title={t('Ver ranking completo')}
    >
      {/* Icon */}
      <div className="relative flex-shrink-0">
        <Trophy className="w-4 h-4 text-primary-600 dark:text-primary-400 group-hover:text-primary-500 transition-colors" />
        {playerData.position <= 3 && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {/* Stats - Versão Mobile (apenas posição e pontos) */}
      <div className="flex md:hidden items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
            #{playerData.position}
          </span>
        </div>
        
        <div className="h-3 w-px bg-gray-300/30 dark:bg-gray-600/30"></div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
            {playerData.weeklyXP}
          </span>
        </div>
      </div>

      {/* Stats - Versão Desktop (com todos os dados) */}
      <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('Posição')}:
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            #{playerData.position}
          </span>
        </div>
        
        <div className="h-4 w-px bg-gray-300/30 dark:bg-gray-600/30"></div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('Pontos')}:
          </span>
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
            {playerData.weeklyXP}
          </span>
        </div>

        <div className="h-4 w-px bg-gray-300/30 dark:bg-gray-600/30"></div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {t('Precisão')}:
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {playerData.accuracy.toFixed(0)}%
          </span>
        </div>
      </div>
    </button>
  );
}
