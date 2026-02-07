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
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              player.isReady
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
            } ${
              id === currentPlayerId ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                player.isReady ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                {player.name.charAt(0).toUpperCase()}
              </div>

              {/* Nome */}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                  {player.name}
                  {id === hostId && (
                    <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded font-bold">
                      {t('HOST')}
                    </span>
                  )}
                  {id === currentPlayerId && (
                    <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded font-bold">
                      {t('VOCÊ')}
                    </span>
                  )}
                  {!player.isOnline && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                      {t('Offline')}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {player.score} {t('Pontos').toLowerCase()}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {player.isReady ? (
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                  ✓ {t('Pronto')}
                </span>
              ) : (
                <span className="text-gray-500 text-sm">{t('Aguardando')}...</span>
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
                  className="p-1 h-7 w-7 bg-red-500 hover:bg-red-600 text-white"
                  title={t('Remover jogador')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
