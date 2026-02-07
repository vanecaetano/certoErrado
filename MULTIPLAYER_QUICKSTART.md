# 🚀 Quick Start - Código Exemplo Multiplayer

## Passo 1: Adicionar Database URL no .env

```env
# Adicione esta linha no seu .env
VITE_FIREBASE_DATABASE_URL=https://certo-errado-quiz-default-rtdb.firebaseio.com/
```

*(Substitua pela URL do SEU projeto - veja no Firebase Console)*

---

## Passo 2: Atualizar firebase.ts

```typescript
// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';  // ADICIONAR

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,  // ADICIONAR
};

const app = initializeApp(firebaseConfig);

// ADICIONAR
export const realtimeDatabase = getDatabase(app);

export function isFirebaseAvailable(): boolean {
  return Object.values(firebaseConfig).every(value => value && value !== 'your_');
}
```

---

## Passo 3: Criar serviço Realtime DB

**Arquivo: `src/services/multiplayerService.ts`**

```typescript
import { 
  ref, 
  set, 
  push, 
  onValue, 
  serverTimestamp,
  onDisconnect,
  update,
  get,
  increment
} from 'firebase/database';
import { realtimeDatabase } from './firebase';
import type { GameQuestion } from '@/types';

export interface MultiplayerRoom {
  host: string;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
  currentQuestion: number;
  maxPlayers: number;
  questions: GameQuestion[];
  players: Record<string, MultiplayerPlayer>;
}

export interface MultiplayerPlayer {
  name: string;
  isReady: boolean;
  score: number;
  currentQuestion: number;
  answers: Record<number, boolean>;
  lastSeen: number;
}

export const multiplayerService = {
  /**
   * Criar uma nova sala de jogo multiplayer
   */
  async createRoom(
    hostId: string,
    hostName: string,
    questions: GameQuestion[],
    maxPlayers: number = 10
  ): Promise<string> {
    const roomsRef = ref(realtimeDatabase, 'game-rooms');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const roomData: MultiplayerRoom = {
      host: hostId,
      hostName,
      status: 'waiting',
      createdAt: Date.now(),
      currentQuestion: 0,
      maxPlayers,
      questions,
      players: {
        [hostId]: {
          name: hostName,
          isReady: false,
          score: 0,
          currentQuestion: 0,
          answers: {},
          lastSeen: Date.now(),
        },
      },
    };

    await set(newRoomRef, roomData);
    
    // Configurar limpeza automática ao desconectar
    const playerRef = ref(realtimeDatabase, `game-rooms/${roomId}/players/${hostId}`);
    onDisconnect(playerRef).remove();

    return roomId;
  },

  /**
   * Entrar em uma sala existente
   */
  async joinRoom(roomId: string, playerId: string, playerName: string): Promise<boolean> {
    const roomRef = ref(realtimeDatabase, `game-rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error('Sala não encontrada');
    }

    const room = snapshot.val() as MultiplayerRoom;

    if (room.status !== 'waiting') {
      throw new Error('Sala já iniciou o jogo');
    }

    const playerCount = Object.keys(room.players || {}).length;
    if (playerCount >= room.maxPlayers) {
      throw new Error('Sala cheia');
    }

    const playerRef = ref(realtimeDatabase, `game-rooms/${roomId}/players/${playerId}`);
    
    await set(playerRef, {
      name: playerName,
      isReady: false,
      score: 0,
      currentQuestion: 0,
      answers: {},
      lastSeen: Date.now(),
    });

    // Configurar detector de desconexão
    onDisconnect(playerRef).remove();

    return true;
  },

  /**
   * Marcar jogador como pronto
   */
  async setPlayerReady(roomId: string, playerId: string, isReady: boolean): Promise<void> {
    const readyRef = ref(realtimeDatabase, `game-rooms/${roomId}/players/${playerId}/isReady`);
    await set(readyRef, isReady);
  },

  /**
   * Iniciar o jogo (só o host pode fazer)
   */
  async startGame(roomId: string): Promise<void> {
    const updates: Record<string, any> = {
      [`game-rooms/${roomId}/status`]: 'playing',
      [`game-rooms/${roomId}/startedAt`]: Date.now(),
    };
    
    await update(ref(realtimeDatabase), updates);
  },

  /**
   * Avançar para próxima pergunta
   */
  async nextQuestion(roomId: string): Promise<void> {
    const currentQuestionRef = ref(realtimeDatabase, `game-rooms/${roomId}/currentQuestion`);
    await set(currentQuestionRef, increment(1));
  },

  /**
   * Enviar resposta de um jogador
   */
  async submitAnswer(
    roomId: string,
    playerId: string,
    questionIndex: number,
    isCorrect: boolean
  ): Promise<void> {
    const updates: Record<string, any> = {
      [`game-rooms/${roomId}/players/${playerId}/answers/${questionIndex}`]: isCorrect,
    };

    if (isCorrect) {
      updates[`game-rooms/${roomId}/players/${playerId}/score`] = increment(10);
    }

    await update(ref(realtimeDatabase), updates);
  },

  /**
   * Finalizar o jogo
   */
  async finishGame(roomId: string): Promise<void> {
    const statusRef = ref(realtimeDatabase, `game-rooms/${roomId}/status`);
    await set(statusRef, 'finished');
  },

  /**
   * Listener para mudanças na sala em tempo real
   */
  onRoomChange(roomId: string, callback: (room: MultiplayerRoom | null) => void): () => void {
    const roomRef = ref(realtimeDatabase, `game-rooms/${roomId}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as MultiplayerRoom);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  },

  /**
   * Gerar ID único para jogador
   */
  generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Gerar link compartilhável
   */
  getShareableUrl(roomId: string): string {
    return `${window.location.origin}/multiplayer/${roomId}`;
  },

  /**
   * Obter ranking dos jogadores
   */
  getRanking(room: MultiplayerRoom): Array<{ id: string; player: MultiplayerPlayer }> {
    return Object.entries(room.players)
      .map(([id, player]) => ({ id, player }))
      .sort((a, b) => b.player.score - a.player.score);
  },
};
```

---

## Passo 4: Criar tipos TypeScript

**Arquivo: `src/types/multiplayer.ts`**

```typescript
export interface MultiplayerRoom {
  host: string;
  hostName: string;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
  currentQuestion: number;
  maxPlayers: number;
  questions: GameQuestion[];
  players: Record<string, MultiplayerPlayer>;
}

export interface MultiplayerPlayer {
  name: string;
  isReady: boolean;
  score: number;
  currentQuestion: number;
  answers: Record<number, boolean>;
  lastSeen: number;
}
```

---

## Passo 5: Componente PlayerList

**Arquivo: `src/features/multiplayer/components/PlayerList.tsx`**

```typescript
import { Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { MultiplayerPlayer } from '@/types/multiplayer';

interface PlayerListProps {
  players: Record<string, MultiplayerPlayer>;
  hostId: string;
  currentPlayerId?: string;
}

export function PlayerList({ players, hostId, currentPlayerId }: PlayerListProps) {
  const playerList = Object.entries(players);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary-600" />
        <h3 className="font-bold text-lg">
          Jogadores ({playerList.length})
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
                <p className="font-semibold text-gray-900 dark:text-white">
                  {player.name}
                  {id === hostId && (
                    <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                      HOST
                    </span>
                  )}
                  {id === currentPlayerId && (
                    <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                      VOCÊ
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {player.score} pontos
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              {player.isReady ? (
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                  ✓ Pronto
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Aguardando...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

---

## Passo 6: Regras de Segurança Firebase

**Firebase Console → Realtime Database → Rules**

```json
{
  "rules": {
    "game-rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth == null || auth != null",
        
        "players": {
          "$playerId": {
            ".write": "auth == null || auth != null"
          }
        },
        
        "status": {
          ".write": "data.parent().child('host').val() === $playerId"
        },
        
        "currentQuestion": {
          ".write": "data.parent().child('host').val() === $playerId"
        }
      }
    }
  }
}
```

---

## 🧪 Teste Rápido

No console do navegador:

```javascript
import { multiplayerService } from './services/multiplayerService';

// Criar sala de teste
const roomId = await multiplayerService.createRoom(
  'test_player_1',
  'João',
  [], // perguntas vazias por enquanto
  5
);

console.log('Sala criada:', roomId);
console.log('Link:', multiplayerService.getShareableUrl(roomId));

// Entrar na sala
await multiplayerService.joinRoom(roomId, 'test_player_2', 'Maria');

// Listener
const unsubscribe = multiplayerService.onRoomChange(roomId, (room) => {
  console.log('Room atualizada:', room);
});
```

---

## 📱 Próximo Passo

Implementar `CreateRoomPage.tsx` - veja MULTIPLAYER_PLAN.md seção "Passo 2"!

**Bom código! 🚀**
