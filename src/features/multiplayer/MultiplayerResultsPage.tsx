import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Home } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { multiplayerService } from '@/services/multiplayerService';
import { rankingService } from '@/services/rankingService';
import type { MultiplayerRoom, MultiplayerPlayer } from '@/types';

export function MultiplayerResultsPage() {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState('');
  const [ranking, setRanking] = useState<Array<{ id: string; player: MultiplayerPlayer; position: number }>>([]);
  const [rankingUpdated, setRankingUpdated] = useState(false);

  // Carregar ID do jogador
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('multiplayerPlayerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  // Atualizar ranking semanal quando sala carrega
  useEffect(() => {
    if (!room || !playerId || rankingUpdated) return;

    const updateRanking = async () => {
      try {
        const currentPlayer = room.players[playerId];
        if (!currentPlayer) return;

        const correctAnswers = currentPlayer.answers 
          ? Object.values(currentPlayer.answers).filter(Boolean).length 
          : 0;
        const totalQuestions = room.questions.length;
        
        // Calcular tempo das respostas corretas
        let correctAnswersTime = 0;
        if (currentPlayer.answers && currentPlayer.responseTimes) {
          Object.entries(currentPlayer.answers).forEach(([index, isCorrect]) => {
            if (isCorrect) {
              correctAnswersTime += currentPlayer.responseTimes?.[Number(index)] || 0;
            }
          });
        }

        // Calcular XP (score + bônus)
        const maxTimeForCorrect = correctAnswers * 15;
        const timeSaved = Math.max(0, maxTimeForCorrect - correctAnswersTime);
        const speedBonus = Math.floor(timeSaved);
        const xpGained = currentPlayer.score + speedBonus;

        console.log('🏆 Atualizando ranking multiplayer:', {
          correctAnswers,
          totalQuestions,
          correctAnswersTime,
          xpGained
        });

        await rankingService.updateAfterGame(
          correctAnswers,
          totalQuestions,
          correctAnswersTime,
          xpGained
        );

        setRankingUpdated(true);
      } catch (error) {
        console.error('Erro ao atualizar ranking multiplayer:', error);
      }
    };

    updateRanking();
  }, [room, playerId, rankingUpdated]);

  // Carregar ID do jogador
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('multiplayerPlayerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  // Carregar sala e calcular ranking
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = multiplayerService.onRoomChange(roomId, (updatedRoom) => {
      if (!updatedRoom) {
        navigate('/');
        return;
      }

      setRoom(updatedRoom);
      setRanking(multiplayerService.getRanking(updatedRoom));
    });

    return () => unsubscribe();
  }, [roomId, navigate]);

  const handleGoHome = () => {
    localStorage.removeItem('multiplayerPlayerId');
    localStorage.removeItem('multiplayerPlayerName');
    localStorage.removeItem('multiplayerCurrentRoomId');
    navigate('/');
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('Carregando')}...</p>
        </div>
      </div>
    );
  }

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position + 'º';
  };

  const getMedalColor = (position: number) => {
    if (position === 1) return 'from-yellow-400 to-yellow-600';
    if (position === 2) return 'from-gray-300 to-gray-500';
    if (position === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-200 to-gray-400';
  };

  // Calcular bônus de velocidade APENAS para respostas corretas
  const calculateSpeedBonus = (player: MultiplayerPlayer) => {
    if (!room || !player.answers || !player.responseTimes) return 0;
    
    // Contar respostas corretas e seu tempo total
    let correctAnswersTime = 0;
    let correctCount = 0;
    
    Object.entries(player.answers).forEach(([questionIndex, isCorrect]) => {
      if (isCorrect) {
        const time = player.responseTimes?.[Number(questionIndex)] || 0;
        correctAnswersTime += time;
        correctCount++;
      }
    });
    
    // Bônus: 1 ponto por segundo economizado nas respostas CORRETAS
    const maxTimeForCorrect = correctCount * 15; // 15 segundos por questão correta
    const timeSaved = Math.max(0, maxTimeForCorrect - correctAnswersTime);
    return Math.floor(timeSaved);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Ranking Final')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('Jogue simultaneamente com seus amigos e veja quem sabe mais!')}
          </p>
        </div>

        {/* Ranking */}
        <div className="space-y-3">
          {ranking.map(({ id, player, position }) => {
            const isCurrentPlayer = id === playerId;
            const correctAnswers = player.answers ? Object.values(player.answers).filter(Boolean).length : 0;
            const totalQuestions = room.questions.length;
            const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const speedBonus = calculateSpeedBonus(player);
            const totalTime = player.totalResponseTime || 0;

            return (
              <Card
                key={id}
                className={`p-4 md:p-6 transition-all ${
                  isCurrentPlayer ? 'ring-4 ring-primary-500 scale-105' : ''
                } ${position <= 3 ? 'border-2' : ''} ${
                  position === 1 ? 'border-yellow-400' : ''
                } ${
                  position === 2 ? 'border-gray-400' : ''
                } ${
                  position === 3 ? 'border-orange-400' : ''
                }`}
              >
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  {/* Position Badge */}
                  <div
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-white bg-gradient-to-br ${getMedalColor(position)} flex-shrink-0`}
                  >
                    {position <= 3 ? getMedalEmoji(position) : position + 'º'}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    {/* Nome e badges - stacked em mobile */}
                    <div className="mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {player.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {isCurrentPlayer && (
                          <span className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded font-bold">
                            {t('VOCÊ')}
                          </span>
                        )}
                        {id === room.host && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-500 text-white rounded font-bold">
                            {t('HOST')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats - wrappable em mobile */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                        <strong className="text-primary-600 dark:text-primary-400">
                          {player.score}
                        </strong>{' '}
                        pts
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Medal className="w-3 h-3 md:w-4 md:h-4" />
                        <strong className="text-green-600 dark:text-green-400">
                          {correctAnswers}
                        </strong>{' '}
                        {t('Acertos').toLowerCase()}
                      </span>
                      <span className="whitespace-nowrap">
                        <strong>{accuracy}%</strong> precisão
                      </span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        ⏱️
                        <strong className="text-blue-600 dark:text-blue-400">
                          {formatTime(totalTime)}
                        </strong>
                      </span>
                      {speedBonus > 0 && (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          ⚡
                          <strong className="text-yellow-600 dark:text-yellow-400">
                            +{speedBonus}
                          </strong>{' '}
                          bônus
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Display - hide em mobile muito pequeno */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {player.score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t('Pontos')}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <Card className="p-6">
          <Button onClick={handleGoHome} className="w-full gap-2">
            <Home className="w-5 h-5" />
            {t('Voltar ao Início')}
          </Button>
        </Card>

        {/* Stats Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {t('Resultado Final')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {room.players ? Object.keys(room.players).length : 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('jogadores')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {room.questions?.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('perguntas')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {ranking[0]?.player.score || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('Pontos')} máx.
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {ranking[0]?.player.name || '-'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Vencedor
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
