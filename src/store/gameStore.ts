import { create } from 'zustand';
import type { GameState, GameConfig, GameQuestion } from '@/types';
import { dbService } from '@/services/database';
import { rankingService } from '@/services/rankingService';

interface GameStore extends GameState {
  isPaused: boolean;
  questionStartTime: number; // timestamp do início da pergunta atual
  initializeGame: (config: GameConfig) => Promise<void>;
  selectAnswer: (answerId: number) => void;
  nextQuestion: () => void;
  resetGame: () => void;
  finishGame: () => Promise<void>;
  pauseGame: () => void;
  resumeGame: () => void;
}

const initialState: GameState = {
  currentQuestionIndex: 0,
  questions: [],
  score: 0,
  selectedAnswerId: null,
  isAnswered: false,
  isCorrect: null,
  config: { subjects: [] },
  questionResults: new Map(),
  responseTimes: [],
  totalResponseTime: 0,
  speedBonus: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  isPaused: false,
  questionStartTime: Date.now(),

  initializeGame: async (config: any) => {
    let questions: GameQuestion[] = [];
    if (config.allQuestions) {
      // Recebeu todas as perguntas já preparadas
      for (const q of config.allQuestions) {
        // Verificar se já vem no formato GameQuestion (com question e answers)
        if (q.question && q.answers) {
          // Já está no formato correto, apenas embaralhar respostas
          const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
          questions.push({ question: q.question, answers: shuffledAnswers });
        } else {
          // Formato antigo: buscar respostas no banco local
          const answers = await dbService.getAnswersByQuestionId(q.id);
          const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
          questions.push({ question: q, answers: shuffledAnswers });
        }
      }
    } else {
      // Modo antigo: buscar por assunto
      for (const { subjectId, questionCount } of config.subjects) {
        const qs = await dbService.getRandomQuestionsBySubject(subjectId, questionCount);
        for (const question of qs) {
          const answers = await dbService.getAnswersByQuestionId(question.id);
          const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
          questions.push({ question, answers: shuffledAnswers });
        }
      }
      // Embaralhar todas as perguntas
      questions = questions.sort(() => Math.random() - 0.5);
    }
    set({
      ...initialState,
      questions,
      config,
      questionStartTime: Date.now(),
    });
  },

  addMoreQuestions: async (subjectId: number, count: number) => {
    const state = get();
    // collect existing question ids to avoid duplicates
    const existingIds = new Set(state.questions.map(q => q.question.id));

    // Request up to all questions for subject then filter
    const candidates = await dbService.getRandomQuestionsBySubject(subjectId, 1000);
    const filtered = candidates.filter(q => !existingIds.has(q.id)).slice(0, count);

    const newQuestions = [] as any[];
    for (const question of filtered) {
      const answers = await dbService.getAnswersByQuestionId(question.id);
      const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
      newQuestions.push({ question, answers: shuffledAnswers });
    }

    if (newQuestions.length === 0) return;

    set({
      questions: [...state.questions, ...newQuestions],
    });
  },

  selectAnswer: (answerId: number) => {
    const state = get();
    if (state.isAnswered) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);
    const isCorrect = selectedAnswer?.isCorrect || false;

    // Calcular tempo de resposta em segundos
    const responseTime = Math.floor((Date.now() - (get() as GameStore).questionStartTime) / 1000);
    const newResponseTimes = [...state.responseTimes, responseTime];
    const newTotalResponseTime = state.totalResponseTime + responseTime;

    console.log('📊 Tempo de resposta:', {
      responseTime,
      questionStartTime: (get() as GameStore).questionStartTime,
      now: Date.now(),
      totalResponseTime: newTotalResponseTime
    });

    const newResults = new Map(state.questionResults);
    newResults.set(currentQuestion.question.id, isCorrect);

    set({
      selectedAnswerId: answerId,
      isAnswered: true,
      isCorrect,
      score: isCorrect ? state.score + 10 : state.score,
      questionResults: newResults,
      responseTimes: newResponseTimes,
      totalResponseTime: newTotalResponseTime,
    });
  },

  nextQuestion: () => {
    const state = get();
    if (state.currentQuestionIndex < state.questions.length - 1) {
      set({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswerId: null,
        isAnswered: false,
        isCorrect: null,
        questionStartTime: Date.now(), // Redefinir timestamp para nova pergunta
      });
    }
  },

  resetGame: () => {
    set({ ...initialState, questionStartTime: Date.now() });
  },

  finishGame: async () => {
    const state = get();
    
    console.log('🏁 Finalizando jogo:', {
      totalQuestions: state.questions.length,
      totalResponseTime: state.totalResponseTime,
      responseTimes: state.responseTimes
    });
    
    // Calcular bônus de velocidade APENAS para respostas corretas
    let correctAnswersTime = 0;
    let correctCount = 0;

    for (let i = 0; i < state.questions.length && i < state.responseTimes.length; i++) {
      const question = state.questions[i];
      const wasCorrect = state.questionResults.get(question.question.id);
      
      if (wasCorrect) {
        correctAnswersTime += state.responseTimes[i];
        correctCount++;
      }
    }

    // Bônus: 1 ponto por segundo economizado nas respostas CORRETAS
    const maxTimeForCorrect = correctCount * 15; // 15 segundos por questão correta
    const timeSaved = Math.max(0, maxTimeForCorrect - correctAnswersTime);
    const speedBonus = Math.floor(timeSaved);

    console.log('⚡ Bônus calculado:', {
      correctCount,
      maxTimeForCorrect,
      correctAnswersTime,
      timeSaved,
      speedBonus
    });

    set({ speedBonus });
    
    // Atualizar ranking semanal
    try {
      const totalCorrect = Array.from(state.questionResults.values()).filter(Boolean).length;
      const totalQuestions = state.questions.length;
      const xpGained = state.score + speedBonus;
      
      console.log('🏆 Atualizando ranking:', {
        correctAnswers: totalCorrect,
        totalQuestions,
        correctAnswersTime,
        xpGained
      });

      await rankingService.updateAfterGame(
        totalCorrect,
        totalQuestions,
        correctAnswersTime,
        xpGained
      );
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error);
      // Não bloquear o fluxo se houver erro no ranking
    }
    
    // Salvar sessões de jogo por assunto
    const subjectStats = new Map<number, { answered: number; correct: number; score: number }>();
    
    // Agrupar estatísticas por assunto usando os resultados reais
    for (let i = 0; i <= state.currentQuestionIndex && i < state.questions.length; i++) {
      const { question } = state.questions[i];
      const stats = subjectStats.get(question.subjectId) || { answered: 0, correct: 0, score: 0 };
      stats.answered++;
      
      // Verificar se foi acertada usando o mapa de resultados
      const wasCorrect = state.questionResults.get(question.id) || false;
      if (wasCorrect) {
        stats.correct++;
        stats.score += 10;
      }
      
      subjectStats.set(question.subjectId, stats);
    }

    // Criar sessões de jogo
    for (const [subjectId, stats] of subjectStats.entries()) {
      const session = await dbService.createGameSession(subjectId);
      await dbService.updateGameSession(
        session.id,
        stats.answered,
        stats.correct,
        stats.score
      );
    }
  },

  pauseGame: () => {
    set({ isPaused: true });
  },

  resumeGame: () => {
    set({ isPaused: false });
  },
}));
