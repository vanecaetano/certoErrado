import { 
  ref, 
  set, 
  push, 
  onValue, 
  update,
  get,
  increment,
  onDisconnect,
  remove
} from 'firebase/database';
import { getRealtimeDatabaseInstance } from './firebase';
import type { GameQuestion } from '@/types';

export interface MultiplayerRoom {
  host: string;
  hostName: string;
  roomName?: string;
  subjects?: string[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  startedAt?: number;
  currentQuestion: number;
  questionStartTime?: number;
  maxPlayers: number;
  questions: GameQuestion[];
  players: Record<string, MultiplayerPlayer>;
}

export interface MultiplayerPlayer {
  name: string;
  isReady: boolean;
  score: number;
  currentQuestion: number;
  answers?: Record<number, boolean>;
  lastSeen: number;
  isOnline: boolean;
}

export const multiplayerService = {
  /**
   * Criar uma nova sala de jogo multiplayer
   */
  async createRoom(
    hostId: string,
    hostName: string,
    questions: GameQuestion[],
    maxPlayers: number = 10,
    roomName?: string,
    subjects?: string[]
  ): Promise<string> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const roomsRef = ref(db, 'game-rooms');
    const newRoomRef = push(roomsRef);
    const roomId = newRoomRef.key!;

    const roomData: MultiplayerRoom = {
      host: hostId,
      hostName,
      roomName,
      subjects,
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
          isOnline: true,
        },
      },
    };

    await set(newRoomRef, roomData);
    
    // Configurar limpeza automática ao desconectar
    const playerPresenceRef = ref(db, `game-rooms/${roomId}/players/${hostId}/isOnline`);
    onDisconnect(playerPresenceRef).set(false);

    return roomId;
  },

  /**
   * Entrar em uma sala existente
   */
  async joinRoom(roomId: string, playerId: string, playerName: string): Promise<boolean> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const roomRef = ref(db, `game-rooms/${roomId}`);
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

    const playerRef = ref(db, `game-rooms/${roomId}/players/${playerId}`);
    
    await set(playerRef, {
      name: playerName,
      isReady: false,
      score: 0,
      currentQuestion: 0,
      answers: {},
      lastSeen: Date.now(),
      isOnline: true,
    });

    // Configurar detector de desconexão
    const playerPresenceRef = ref(db, `game-rooms/${roomId}/players/${playerId}/isOnline`);
    onDisconnect(playerPresenceRef).set(false);

    return true;
  },

  /**
   * Marcar jogador como pronto
   */
  async setPlayerReady(roomId: string, playerId: string, isReady: boolean): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const readyRef = ref(db, `game-rooms/${roomId}/players/${playerId}/isReady`);
    await set(readyRef, isReady);
  },

  /**
   * Iniciar o jogo (só o host pode fazer)
   */
  async startGame(roomId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const now = Date.now();
    const updates: Record<string, any> = {
      [`game-rooms/${roomId}/status`]: 'playing',
      [`game-rooms/${roomId}/startedAt`]: now,
      [`game-rooms/${roomId}/questionStartTime`]: now,
    };
    
    await update(ref(db), updates);
  },

  /**
   * Avançar para próxima pergunta
   */
  async nextQuestion(roomId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const updates: Record<string, any> = {
      [`game-rooms/${roomId}/currentQuestion`]: increment(1),
      [`game-rooms/${roomId}/questionStartTime`]: Date.now(),
    };
    
    await update(ref(db), updates);
  },

  /**
   * Enviar resposta de um jogador
   */
  async submitAnswer(
    roomId: string,
    playerId: string,
    questionIndex: number,
    isCorrect: boolean,
    responseTime?: number // tempo de resposta em segundos
  ): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const updates: Record<string, any> = {
      [`game-rooms/${roomId}/players/${playerId}/answers/${questionIndex}`]: isCorrect,
      [`game-rooms/${roomId}/players/${playerId}/currentQuestion`]: questionIndex + 1,
    };

    if (isCorrect) {
      updates[`game-rooms/${roomId}/players/${playerId}/score`] = increment(10);
    }

    // Armazenar tempo de resposta se fornecido
    if (responseTime !== undefined) {
      updates[`game-rooms/${roomId}/players/${playerId}/responseTimes/${questionIndex}`] = responseTime;
      updates[`game-rooms/${roomId}/players/${playerId}/totalResponseTime`] = increment(responseTime);
    }

    await update(ref(db), updates);
  },

  /**
   * Finalizar o jogo
   */
  async finishGame(roomId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const statusRef = ref(db, `game-rooms/${roomId}/status`);
    await set(statusRef, 'finished');
  },

  /**
   * Remover jogador da sala (apenas host)
   */
  async removePlayer(roomId: string, playerId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const playerRef = ref(db, `game-rooms/${roomId}/players/${playerId}`);
    await remove(playerRef);
  },

  /**
   * Sair da sala atual (limpar antes de entrar em outra)
   */
  async leaveCurrentRoom(playerId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) return;

    // Obter roomId do localStorage
    const currentRoomId = localStorage.getItem('multiplayerCurrentRoomId');
    if (!currentRoomId) return;

    try {
      // Remover jogador da sala atual
      await this.removePlayer(currentRoomId, playerId);
      // Limpar localStorage
      localStorage.removeItem('multiplayerCurrentRoomId');
    } catch (err) {
      console.error('Error leaving current room:', err);
      // Limpar mesmo se houver erro
      localStorage.removeItem('multiplayerCurrentRoomId');
    }
  },

  /**
   * Deletar sala
   */
  async deleteRoom(roomId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const roomRef = ref(db, `game-rooms/${roomId}`);
    await remove(roomRef);
  },

  /**
   * Listener para mudanças na sala em tempo real
   */
  onRoomChange(roomId: string, callback: (room: MultiplayerRoom | null) => void): () => void {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const roomRef = ref(db, `game-rooms/${roomId}`);
    
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
   * Atualizar timestamp de presença
   */
  async updatePresence(roomId: string, playerId: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) return;

    const lastSeenRef = ref(db, `game-rooms/${roomId}/players/${playerId}/lastSeen`);
    await set(lastSeenRef, Date.now());
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
  getRanking(room: MultiplayerRoom): Array<{ id: string; player: MultiplayerPlayer; position: number }> {
    const ranked = Object.entries(room.players)
      .map(([id, player]) => ({ id, player }))
      .sort((a, b) => b.player.score - a.player.score);
    
    return ranked.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  },

  /**
   * Verificar se todos os jogadores estão prontos
   */
  areAllPlayersReady(room: MultiplayerRoom): boolean {
    const players = Object.values(room.players);
    return players.length > 1 && players.every(p => p.isReady);
  },

  /**
   * Contar jogadores online
   */
  getOnlinePlayerCount(room: MultiplayerRoom): number {
    return Object.values(room.players).filter(p => p.isOnline).length;
  },
};
