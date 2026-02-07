export interface Subject {
  id: number;
  name: string;
  createdAt: string;
  questionCount: number;
}

export interface Question {
  id: number;
  subjectId: number;
  text: string;
  correctAnswerId: number;
  createdAt: string;
}

export interface Answer {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
}

export interface GameSession {
  id: number;
  subjectId: number;
  questionsAnswered: number;
  questionsCorrect: number;
  score: number;
  startedAt: string;
  finishedAt: string;
}

export interface GameQuestion {
  question: Question;
  answers: Answer[];
}

export interface GameConfig {
  subjects: {
    subjectId: number;
    questionCount: number;
  }[];
  allQuestions?: any[];
}

export interface GameState {
  currentQuestionIndex: number;
  questions: GameQuestion[];
  score: number;
  selectedAnswerId: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  config: GameConfig;
  questionResults: Map<number, boolean>; // questionId -> isCorrect
}

export interface PerformanceData {
  subjectId: number;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageScore: number;
}

// Shared Quiz Types
export interface SharedQuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface SharedQuiz {
  id: string;
  topics: string[];
  questions: SharedQuizQuestion[];
  createdAt: string;
  modelVersion?: string;
}

export interface ShareQuizRequest {
  topics: string[];
  questions: SharedQuizQuestion[];
}

export interface ShareQuizResponse {
  id: string;
  success: boolean;
  error?: string;
}
