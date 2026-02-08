import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Clock, Home, Edit2, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { rankingService } from '@/services/rankingService';
import type { RankingEntry } from '@/types';

export function RankingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<RankingEntry | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Carregar ranking
  useEffect(() => {
    loadRanking();
    
    // Atualizar em tempo real
    const unsubscribe = rankingService.onRankingChange(() => {
      loadRanking();
    });

    return () => unsubscribe();
  }, []);

  const loadRanking = async () => {
    try {
      setIsLoading(true);
      const [top50, playerData] = await Promise.all([
        rankingService.getTop50(),
        rankingService.getCurrentPlayerPosition(),
      ]);
      
      setRanking(top50);
      setCurrentPlayer(playerData.entry);
      setTotalPlayers(playerData.totalPlayers);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditName = () => {
    setNewName(currentPlayer?.playerName || rankingService.getPlayerName());
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.length < 3) return;
    
    try {
      setIsSavingName(true);
      await rankingService.updatePlayerName(newName.trim());
      await loadRanking();
      setIsEditingName(false);
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
    } finally {
      setIsSavingName(false);
    }
  };

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('Carregando')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          {t('Voltar ao Início')}
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6 shadow-xl">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-transparent bg-clip-text">
          {t('Ranking Semanal')}
        </h1>
        
      </div>

      {/* Player Card (Sua posição) */}
      {currentPlayer && (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {t('Sua posição atual')}
            </h3>
            {!isEditingName && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditName}
                className="gap-2 text-xs"
              >
                <Edit2 className="w-3 h-3" />
                {t('Alterar nome')}
              </Button>
            )}
          </div>

          {isEditingName ? (
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
                placeholder={t('Digite seu nome')}
                className="flex-1"
                disabled={isSavingName}
                autoFocus
              />
              <Button
                onClick={handleSaveName}
                disabled={isSavingName || newName.trim().length < 3}
                size="sm"
                className="gap-2"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsEditingName(false)}
                disabled={isSavingName}
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-primary-600">
                  #{currentPlayer.position}
                </div>
                <div>
                  <div className="font-semibold text-lg">{currentPlayer.playerName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPlayer.gamesPlayed} {t('jogos')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">{currentPlayer.weeklyXP} XP</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPlayer.accuracy.toFixed(1)}% • {currentPlayer.averageSpeed.toFixed(1)}s
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Ranking List */}
      {ranking.length === 0 ? (
        <Card className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('Ranking vazio')}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('Seja o primeiro a jogar esta semana!')}
          </p>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t('Top 50')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalPlayers} {t('jogadores ativos esta semana')}
            </p>
          </div>

          <div className="space-y-2">
            {ranking.map((player) => {
              const isCurrentPlayer = player.userId === rankingService.getUserId();
              const medal = getMedalEmoji(player.position);

              return (
                <Card
                  key={player.userId}
                  className={`p-4 transition-all ${
                    isCurrentPlayer 
                      ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Position */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {player.position}
                        </span>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold truncate">
                          {player.playerName}
                        </h3>
                        {isCurrentPlayer && (
                          <span className="px-2 py-0.5 text-xs bg-primary-600 text-white rounded font-semibold flex-shrink-0">
                            {t('VOCÊ')}
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-600" />
                          {player.weeklyXP} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-green-600" />
                          {player.accuracy.toFixed(1)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          {player.averageSpeed.toFixed(1)}s
                        </span>
                        <span className="text-gray-500">
                          {player.gamesPlayed} {t('jogos')}
                        </span>
                      </div>
                    </div>

                    {/* XP Badge (mobile hidden) */}
                    <div className="hidden sm:block text-right">
                      <div className="text-xl font-bold text-yellow-600">
                        {player.weeklyXP}
                      </div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      {currentPlayer && currentPlayer.position > 50 && ranking.length > 0 && (
        <Card className="mt-6 p-4 text-center bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            💪 {t('Jogue mais e suba no ranking!')}
          </p>
        </Card>
      )}
    </div>
  );
}
