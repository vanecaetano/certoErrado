import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copy, Check, ArrowLeft, Play, UserPlus, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlayerList } from './components/PlayerList';
import { multiplayerService } from '@/services/multiplayerService';
import type { MultiplayerRoom } from '@/types';

export function LobbyPage() {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = roomId ? multiplayerService.getShareableUrl(roomId) : '';
  const isHost = !!(room && playerId === room.host);
  const allPlayersReady = room ? multiplayerService.areAllPlayersReady(room) : false;
  const canStart = isHost && allPlayersReady;

  // Carregar nome do jogador do localStorage
  useEffect(() => {
    const storedPlayerName = localStorage.getItem('multiplayerPlayerName');
    if (storedPlayerName) {
      setPlayerName(storedPlayerName);
    }
  }, []);

  // Listener para mudanças na sala
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = multiplayerService.onRoomChange(roomId, (updatedRoom) => {
      if (!updatedRoom) {
        setError(t('Esta sala não existe ou foi excluída.'));
        setRoom(null);
        return;
      }

      // Verificar se o jogador já está na sala (criador ou entrou anteriormente)
      const storedPlayerId = localStorage.getItem('multiplayerPlayerId');
      if (storedPlayerId && updatedRoom.players[storedPlayerId]) {
        // Atualizar playerId e hasJoined se necessário
        if (!hasJoined) {
          setPlayerId(storedPlayerId);
          setHasJoined(true);
        }
        // Sempre atualizar playerId se ainda existe na sala
        if (playerId !== storedPlayerId) {
          setPlayerId(storedPlayerId);
        }
      }

      // Verificar se o jogador foi removido (só se já tinha entrado)
      if (hasJoined && playerId && !updatedRoom.players[playerId]) {
        localStorage.removeItem('multiplayerCurrentRoomId');
        alert(t('Você foi removido da sala pelo anfitrião.'));
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      setRoom(updatedRoom);

      // Se o jogo iniciou, navegar para página do jogo
      if (updatedRoom.status === 'playing' && hasJoined) {
        navigate(`/multiplayer/${roomId}/play`);
      }
    });

    return () => unsubscribe();
  }, [roomId, hasJoined, playerId, navigate, t]);

  // Atualizar presença a cada 30 segundos
  useEffect(() => {
    if (!roomId || !playerId || !hasJoined) return;

    const interval = setInterval(() => {
      multiplayerService.updatePresence(roomId, playerId);
    }, 30000);

    return () => clearInterval(interval);
  }, [roomId, playerId, hasJoined]);

  // Cleanup ao sair da página
  useEffect(() => {
    if (!roomId || !playerId || !hasJoined) return;

    const handleBeforeUnload = () => {
      // Remover jogador ao fechar navegador/aba
      multiplayerService.removePlayer(roomId, playerId);
      localStorage.removeItem('multiplayerCurrentRoomId');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, playerId, hasJoined]);

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !roomId) {
      setError(t('Digite seu nome para entrar'));
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Sair de qualquer sala anterior
      const oldPlayerId = localStorage.getItem('multiplayerPlayerId');
      if (oldPlayerId) {
        await multiplayerService.leaveCurrentRoom(oldPlayerId);
      }

      const newPlayerId = multiplayerService.generatePlayerId();
      
      await multiplayerService.joinRoom(roomId, newPlayerId, playerName.trim());
      
      setPlayerId(newPlayerId);
      setHasJoined(true);
      
      localStorage.setItem('multiplayerPlayerId', newPlayerId);
      localStorage.setItem('multiplayerPlayerName', playerName.trim());
      localStorage.setItem('multiplayerCurrentRoomId', roomId);
    } catch (err: any) {
      console.error('Error joining room:', err);
      if (err.message.includes('não encontrada')) {
        setError(t('Esta sala não existe ou foi excluída.'));
      } else if (err.message.includes('já iniciou')) {
        setError(t('Esta sala já começou o jogo.'));
      } else if (err.message.includes('cheia')) {
        setError(t('Esta sala já está com o número máximo de jogadores.'));
      } else {
        setError(t('Erro ao entrar na sala'));
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleToggleReady = async () => {
    if (!roomId || !playerId || !room) {
      console.error('Missing required data:', { roomId, playerId, room: !!room });
      return;
    }

    const currentPlayer = room.players[playerId];
    if (!currentPlayer) {
      console.error('Player not found in room:', playerId);
      return;
    }

    try {
      const newReadyState = !currentPlayer.isReady;
      console.log('Toggling ready state:', { playerId, currentState: currentPlayer.isReady, newState: newReadyState });
      await multiplayerService.setPlayerReady(roomId, playerId, newReadyState);
    } catch (err) {
      console.error('Error toggling ready:', err);
      setError(t('Erro ao atualizar status'));
    }
  };

  const handleStartGame = async () => {
    if (!roomId || !canStart) return;

    try {
      await multiplayerService.startGame(roomId);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Erro ao iniciar o jogo');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleLeave = () => {
    localStorage.removeItem('multiplayerPlayerId');
    localStorage.removeItem('multiplayerPlayerName');
    navigate('/');
  };

  const handleRemovePlayer = async (playerIdToRemove: string) => {
    if (!roomId || !isHost) return;

    try {
      await multiplayerService.removePlayer(roomId, playerIdToRemove);
    } catch (err) {
      console.error('Error removing player:', err);
      setError(t('Erro ao remover jogador'));
    }
  };

  // Tela de entrada - quando ainda não entrou na sala
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-6">
            <UserPlus className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('Entrar na Sala')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Digite seu nome para entrar')}
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, ''))}
              placeholder={t('Ex: João')}
              maxLength={30}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate('/')} className="flex-1">
                {t('Voltar')}
              </Button>
              <Button onClick={handleJoinRoom} disabled={isJoining} className="flex-1">
                {isJoining ? t('Aguardando') + '...' : t('Entrar')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Tela de erro - sala não encontrada
  if (error && !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {t('Sala não encontrada')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="w-full">
            {t('Voltar ao Início')}
          </Button>
        </Card>
      </div>
    );
  }

  // Lobby - sala ativa
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={handleLeave} className="gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Sair da Sala')}</span>
            <span className="sm:hidden">{t('Sair')}</span>
          </Button>
        </div>

        {/* Informações da Sala */}
        <Card className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {room?.roomName || t('Sala Multiplayer')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {t('Anfitrião')}: {room?.hostName}
          </p>
          
          {room && (
            <div className="space-y-4">
              {/* Desafios da Sala */}
              {room.subjects && room.subjects.length > 0 && (
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-primary-900 dark:text-primary-100 mb-2">
                    📚 {t('Desafios do Quiz')}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.subjects.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100 rounded-full text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>🎯 {room.questions.length} {t('perguntas')}</span>
                <span>👥 {t('Máx')}: {room.maxPlayers} {t('jogadores')}</span>
              </div>

              {/* Link de Compartilhamento - Destaque */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 dark:bg-yellow-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-yellow-900 dark:text-yellow-100" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                      👉 {t('Convide seus amigos!')}
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t('Compartilhe este link para outras pessoas entrarem na sala')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 font-mono text-sm bg-white dark:bg-gray-800"
                  />
                  <Button onClick={handleCopyLink} variant="secondary" className="gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900">
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('Copiado!')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('Copiar')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Lista de Jogadores */}
        {room && (
          <PlayerList
            players={room.players}
            hostId={room.host}
            currentPlayerId={playerId}
            isHost={isHost}
            onRemovePlayer={handleRemovePlayer}
          />
        )}

        {/* Botões de Ação */}
        {room && playerId && room.players[playerId] && (
          <Card className="p-4 md:p-6">
            <div className="space-y-3 md:space-y-4">
              {/* Botão Ready para jogadores */}
              {!isHost && (
                <Button
                  onClick={handleToggleReady}
                  variant={room.players[playerId]?.isReady ? 'secondary' : 'primary'}
                  className="w-full text-sm md:text-base"
                >
                  {room.players[playerId]?.isReady ? (
                    <>
                      <span className="hidden sm:inline">{t('Aguardar Mais Jogadores')}</span>
                      <span className="sm:hidden">{t('Aguardando')}...</span>
                    </>
                  ) : t('Estou Pronto!')}
                </Button>
              )}

              {/* Botão Iniciar para host */}
              {isHost && (
                <>
                  <Button
                    onClick={handleToggleReady}
                    variant={room.players[playerId]?.isReady ? 'secondary' : 'primary'}
                    className="w-full text-sm md:text-base"
                  >
                    {room.players[playerId]?.isReady ? (
                      <>
                        <span className="hidden sm:inline">{t('Aguardar Mais Jogadores')}</span>
                        <span className="sm:hidden">{t('Aguardando')}...</span>
                      </>
                    ) : t('Estou Pronto!')}
                  </Button>
                  
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className="w-full gap-2 text-sm md:text-base"
                  >
                    <Play className="w-4 h-4 md:w-5 md:h-5" />
                    {t('Iniciar Jogo')}
                  </Button>

                  {!allPlayersReady && (
                    <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                      {Object.keys(room.players).length < 2
                        ? t('Pelo menos 2 jogadores necessários')
                        : t('Todos os jogadores devem estar prontos')}
                    </p>
                  )}
                </>
              )}

              {/* Mensagem para não-host */}
              {!isHost && (
                <p className="text-xs md:text-sm text-center text-gray-600 dark:text-gray-400">
                  {t('Aguarde o host iniciar o jogo...')}
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
