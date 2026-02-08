import { ref, set, get, update, onValue } from 'firebase/database';
import { getRealtimeDatabaseInstance } from './firebase';
import type { WeeklyRankingPlayer, RankingEntry, GameRecord } from '@/types';

/**
 * Serviço para gerenciar ranking com sistema rolling de 7 dias (estilo Duolingo)
 * XP é calculado dinamicamente dos últimos 7 dias - sem reset brusco
 */

// Constantes
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

// Gerar ou recuperar userId único do localStorage
const getUserId = (): string => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// Gerar ou recuperar playerName do localStorage
const getPlayerName = (): string => {
  let playerName = localStorage.getItem('playerName');
  if (!playerName) {
    // Nome padrão: Player + 4 dígitos aleatórios
    playerName = `Player${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('playerName', playerName);
  }
  return playerName;
};

/**
 * Calcular estatísticas dos últimos 7 dias a partir do histórico de jogos
 */
const calculateLast7DaysStats = (games: GameRecord[]): {
  weeklyXP: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalQuestions: number;
  totalResponseTime: number;
} => {
  const now = Date.now();
  const sevenDaysAgo = now - SEVEN_DAYS_MS;
  
  const recentGames = games.filter(game => game.timestamp >= sevenDaysAgo);
  
  return {
    weeklyXP: recentGames.reduce((sum, g) => sum + g.xpGained, 0),
    gamesPlayed: recentGames.length,
    totalCorrect: recentGames.reduce((sum, g) => sum + g.correctAnswers, 0),
    totalQuestions: recentGames.reduce((sum, g) => sum + g.totalQuestions, 0),
    totalResponseTime: recentGames.reduce((sum, g) => sum + g.correctResponseTime, 0),
  };
};

/**
 * Limpar jogos com mais de 14 dias (manter apenas histórico recente)
 */
const cleanupOldGames = (games: GameRecord[]): GameRecord[] => {
  const now = Date.now();
  const fourteenDaysAgo = now - FOURTEEN_DAYS_MS;
  return games.filter(game => game.timestamp >= fourteenDaysAgo);
};

export const rankingService = {
  /**
   * Obter ou criar o perfil do jogador no ranking
   */
  async getOrCreatePlayerProfile(): Promise<WeeklyRankingPlayer> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const userId = getUserId();
    const playerName = getPlayerName();
    
    const playerRef = ref(db, `weekly-ranking/${userId}`);
    const snapshot = await get(playerRef);

    if (snapshot.exists()) {
      const data = snapshot.val() as WeeklyRankingPlayer;
      
      // Migração: se tem estrutura antiga (weekStartDate), criar nova estrutura
      if ('weekStartDate' in data) {
        console.log('Migrando usuário para novo sistema rolling...');
        const newProfile: WeeklyRankingPlayer = {
          userId,
          playerName: data.playerName || playerName,
          games: [], // Começar do zero na migração
          lastUpdated: Date.now(),
        };
        await set(playerRef, newProfile);
        return newProfile;
      }
      
      // Garantir que games existe (retrocompatibilidade)
      if (!data.games) {
        data.games = [];
      }
      
      // Cleanup automático de jogos antigos
      const cleanedGames = cleanupOldGames(data.games);
      if (cleanedGames.length !== data.games.length) {
        await update(playerRef, { games: cleanedGames });
        data.games = cleanedGames;
      }
      
      return data;
    } else {
      // Criar novo perfil
      const newProfile: WeeklyRankingPlayer = {
        userId,
        playerName,
        games: [],
        lastUpdated: Date.now(),
      };
      await set(playerRef, newProfile);
      return newProfile;
    }
  },

  /**
   * Atualizar estatísticas após um jogo
   */
  async updateAfterGame(
    correctAnswers: number,
    totalQuestions: number,
    correctResponseTime: number, // tempo total das respostas corretas
    xpGained: number
  ): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const userId = getUserId();
    const profile = await this.getOrCreatePlayerProfile();
    
    // Criar novo registro de jogo
    const newGame: GameRecord = {
      timestamp: Date.now(),
      xpGained,
      correctAnswers,
      totalQuestions,
      correctResponseTime,
    };
    
    // Adicionar ao histórico e fazer cleanup
    const updatedGames = cleanupOldGames([...profile.games, newGame]);
    
    const updates = {
      games: updatedGames,
      lastUpdated: Date.now(),
    };

    const playerRef = ref(db, `weekly-ranking/${userId}`);
    await update(playerRef, updates);
  },

  /**
   * Obter top 50 jogadores baseado no XP dos últimos 7 dias
   */
  async getTop50(): Promise<RankingEntry[]> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const rankingRef = ref(db, 'weekly-ranking');
    
    const snapshot = await get(rankingRef);
    if (!snapshot.exists()) return [];

    const playersWithStats: RankingEntry[] = [];
    
    snapshot.forEach((child) => {
      const player = child.val() as WeeklyRankingPlayer;
      
      // Garantir retrocompatibilidade
      const games = player.games || [];
      
      // Calcular stats dos últimos 7 dias
      const stats = calculateLast7DaysStats(games);
      
      // Só incluir jogadores com XP > 0 nos últimos 7 dias
      if (stats.weeklyXP > 0) {
        const accuracy = stats.totalQuestions > 0 
          ? (stats.totalCorrect / stats.totalQuestions) * 100 
          : 0;
        
        const averageSpeed = stats.totalCorrect > 0
          ? stats.totalResponseTime / stats.totalCorrect
          : 0;

        playersWithStats.push({
          ...player,
          ...stats,
          position: 0, // Será preenchido após ordenação
          accuracy: Math.round(accuracy * 10) / 10,
          averageSpeed: Math.round(averageSpeed * 10) / 10,
        });
      }
    });

    // Ordenar por XP dos últimos 7 dias (decrescente)
    playersWithStats.sort((a, b) => b.weeklyXP! - a.weeklyXP!);
    
    // Pegar top 50 e adicionar posições
    const top50 = playersWithStats.slice(0, 50).map((player, index) => ({
      ...player,
      position: index + 1,
    }));

    return top50;
  },

  /**
   * Obter posição do jogador atual no ranking
   */
  async getCurrentPlayerPosition(): Promise<{ entry: RankingEntry | null; totalPlayers: number }> {
    const userId = getUserId();
    const top50 = await this.getTop50();
    
    const entry = top50.find(player => player.userId === userId) || null;
    
    // Se não está no top 50, calcular posição real
    if (!entry) {
      const db = getRealtimeDatabaseInstance();
      if (!db) return { entry: null, totalPlayers: top50.length };

      const rankingRef = ref(db, 'weekly-ranking');
      const snapshot = await get(rankingRef);
      
      if (!snapshot.exists()) return { entry: null, totalPlayers: 0 };

      const allPlayersWithStats: RankingEntry[] = [];
      
      snapshot.forEach((child) => {
        const player = child.val() as WeeklyRankingPlayer;
        const games = player.games || [];
        const stats = calculateLast7DaysStats(games);
        
        if (stats.weeklyXP > 0) {
          const accuracy = stats.totalQuestions > 0 
            ? (stats.totalCorrect / stats.totalQuestions) * 100 
            : 0;
          
          const averageSpeed = stats.totalCorrect > 0
            ? stats.totalResponseTime / stats.totalCorrect
            : 0;

          allPlayersWithStats.push({
            ...player,
            ...stats,
            position: 0,
            accuracy: Math.round(accuracy * 10) / 10,
            averageSpeed: Math.round(averageSpeed * 10) / 10,
          });
        }
      });

      allPlayersWithStats.sort((a, b) => b.weeklyXP! - a.weeklyXP!);
      
      const playerIndex = allPlayersWithStats.findIndex(p => p.userId === userId);
      
      if (playerIndex === -1) {
        // Jogador não tem XP nos últimos 7 dias - criar entry vazio
        const profile = await this.getOrCreatePlayerProfile();
        return {
          entry: {
            ...profile,
            weeklyXP: 0,
            gamesPlayed: 0,
            totalCorrect: 0,
            totalQuestions: 0,
            totalResponseTime: 0,
            position: allPlayersWithStats.length + 1,
            accuracy: 0,
            averageSpeed: 0,
          },
          totalPlayers: allPlayersWithStats.length,
        };
      }

      return {
        entry: {
          ...allPlayersWithStats[playerIndex],
          position: playerIndex + 1,
        },
        totalPlayers: allPlayersWithStats.length,
      };
    }

    return { entry, totalPlayers: top50.length };
  },

  /**
   * Atualizar nome do jogador
   */
  async updatePlayerName(newName: string): Promise<void> {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const userId = getUserId();
    localStorage.setItem('playerName', newName);
    
    const playerRef = ref(db, `weekly-ranking/${userId}/playerName`);
    await set(playerRef, newName);
  },

  /**
   * Escutar mudanças no ranking em tempo real
   */
  onRankingChange(callback: (ranking: RankingEntry[]) => void): () => void {
    const db = getRealtimeDatabaseInstance();
    if (!db) throw new Error('Firebase Realtime Database not initialized');

    const rankingRef = ref(db, 'weekly-ranking');
    
    const unsubscribe = onValue(rankingRef, async () => {
      const ranking = await this.getTop50();
      callback(ranking);
    });

    return unsubscribe;
  },

  // Helpers
  getUserId,
  getPlayerName,
};

