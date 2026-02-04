import { create } from 'zustand';
import type { GameState, GameConfig, GameQuestion } from '@/types';
import { dbService } from '@/services/database';

interface GameStore extends GameState {
  initializeGame: (config: GameConfig) => Promise<void>;
  selectAnswer: (answerId: number) => void;
  nextQuestion: () => void;
  resetGame: () => void;
  finishGame: () => Promise<void>;
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
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initializeGame: async (config: GameConfig) => {
    const allQuestions: GameQuestion[] = [];

    // Coletar perguntas de cada assunto
    for (const { subjectId, questionCount } of config.subjects) {
      const questions = await dbService.getRandomQuestionsBySubject(subjectId, questionCount);
      
      for (const question of questions) {
        const answers = await dbService.getAnswersByQuestionId(question.id);
        // Embaralhar respostas
        const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5);
        
        allQuestions.push({
          question,
          answers: shuffledAnswers,
        });
      }
    }

    // Embaralhar todas as perguntas
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    set({
      ...initialState,
      questions: shuffledQuestions,
      config,
    });
  },

  selectAnswer: (answerId: number) => {
    const state = get();
    if (state.isAnswered) return;

    const currentQuestion = state.questions[state.currentQuestionIndex];
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);
    const isCorrect = selectedAnswer?.isCorrect || false;

    const newResults = new Map(state.questionResults);
    newResults.set(currentQuestion.question.id, isCorrect);

    set({
      selectedAnswerId: answerId,
      isAnswered: true,
      isCorrect,
      score: isCorrect ? state.score + 10 : state.score,
      questionResults: newResults,
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
      });
    }
  },

  resetGame: () => {
    set(initialState);
  },

  finishGame: async () => {
    const state = get();
    
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
}));
