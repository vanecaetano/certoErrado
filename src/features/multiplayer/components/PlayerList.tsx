import { Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MultiplayerPlayer } from '@/types';

interface PlayerListProps {
  players: Record<string, MultiplayerPlayer>;
  hostId: string;
  currentPlayerId?: string;
  isHost?: boolean;
  onRemovePlayer?: (playerId: string) => void;
}

export function PlayerList({ players, hostId, currentPlayerId, isHost, onRemovePlayer }: PlayerListProps) {
  const { t } = useTranslation();
  const playerList = Object.entries(players);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
          {t('Jogadores na sala')} ({playerList.length})
        </h3>
      </div>

      <div className="space-y-2">
        {playerList.map(([id, player]) => (
          <div
            key={id}
            className={`flex items-center justify-between gap-2 p-3 rounded-lg border-2 transition-all ${
              player.isReady
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
            } ${
              id === currentPlayerId ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              {/* Avatar */}
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                player.isReady ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              {/* Nome e Badges */}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm md:text-base text-gray-900 dark:text-white truncate">
                  {player.name}
                </p>
                <div className="flex items-center gap-1 flex-wrap mt-0.5">
                  {id === hostId && (
                    <span className="text-xs bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold">
                      {t('HOST')}
                    </span>
                  )}
                  {id === currentPlayerId && (
                    <span className="text-xs bg-primary-500 text-white px-1.5 py-0.5 rounded font-bold">
                      {t('VOCÊ')}
                    </span>
                  )}
                  {!player.isOnline && (
                    <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                      {t('Offline')}
                    </span>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {player.score} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {player.isReady ? (
                <span className="text-green-600 dark:text-green-400 font-semibold text-xs md:text-sm whitespace-nowrap">
                  ✓ {t('Pronto')}
                </span>
              ) : (
                <span className="text-gray-500 text-xs md:text-sm whitespace-nowrap">{t('Aguardando')}...</span>
              )}
              
              {/* Botão de remover (apenas para host, não pode remover a si mesmo) */}
              {isHost && id !== hostId && onRemovePlayer && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`${t('Remover')} ${player.name}?`)) {
                      onRemovePlayer(id);
                    }
                  }}
                  className="p-1 h-6 w-6 md:h-7 md:w-7 bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
                  title={t('Remover jogador')}
                >
                  <X className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
