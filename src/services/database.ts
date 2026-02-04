import Dexie, { Table } from 'dexie';
import type { Subject, Question, Answer, GameSession } from '@/types';

// Definir schema do banco de dados
class AppDatabase extends Dexie {
  subjects!: Table<Subject>;
  questions!: Table<Question>;
  answers!: Table<Answer>;
  gameSessions!: Table<GameSession>;

  constructor() {
    super('CertoOuErradoDB');
    this.version(1).stores({
      subjects: '++id, name, createdAt, questionCount',
      questions: '++id, subjectId, text, correctAnswerId, createdAt',
      answers: '++id, questionId, text, isCorrect',
      gameSessions: '++id, subjectId, questionsAnswered, questionsCorrect, score, startedAt, finishedAt',
    });
  }
}

const db = new AppDatabase();

class DatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    // Dexie já inicializa automaticamente
  }

  // Subjects
  getAllSubjects(): Subject[] {
    return [];
  }

  async getAllSubjectsAsync(): Promise<Subject[]> {
    await this.initialize();
    return await db.subjects.orderBy('name').toArray();
  }

  getSubjectById(_id: number): Subject | null {
    return null;
  }

  async getSubjectByIdAsync(id: number): Promise<Subject | null> {
    await this.initialize();
    return (await db.subjects.get(id)) || null;
  }

  async createSubject(name: string): Promise<Subject> {
    await this.initialize();
    const subjectNoId: Omit<Subject, 'id'> = {
      name,
      createdAt: new Date().toISOString(),
      questionCount: 0,
    };
    const id = await db.subjects.add(subjectNoId as any);
    return { ...(subjectNoId as Subject), id: id as number };
  }

  async updateSubjectQuestionCount(subjectId: number, count: number): Promise<void> {
    await this.initialize();
    await db.subjects.update(subjectId, { questionCount: count });
  }

  async deleteSubject(id: number): Promise<void> {
    await this.initialize();
    // Deletar em cascata
    const questions = await db.questions.where('subjectId').equals(id).toArray();
    for (const question of questions) {
      await db.answers.where('questionId').equals(question.id).delete();
    }
    await db.questions.where('subjectId').equals(id).delete();
    await db.subjects.delete(id);
  }

  // Questions
  async createQuestion(subjectId: number, text: string): Promise<Question> {
    await this.initialize();
    const questionNoId: Omit<Question, 'id'> = {
      subjectId,
      text,
      correctAnswerId: 0,
      createdAt: new Date().toISOString(),
    };
    const id = await db.questions.add(questionNoId as any);
    return { ...(questionNoId as Question), id: id as number };
  }

  async getQuestionById(id: number): Promise<Question | null> {
    await this.initialize();
    return (await db.questions.get(id)) || null;
  }

  async getRandomQuestionsBySubject(subjectId: number, count: number): Promise<Question[]> {
    await this.initialize();
    const allQuestions = await db.questions.where('subjectId').equals(subjectId).toArray();
    // Embaralhar e pegar os primeiros N
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Answers
  async createAnswer(questionId: number, text: string, isCorrect: boolean): Promise<Answer> {
    await this.initialize();
    const answerNoId: Omit<Answer, 'id'> = {
      questionId,
      text,
      isCorrect,
    };
    const id = await db.answers.add(answerNoId as any);
    return { ...(answerNoId as Answer), id: id as number };
  }

  async getAnswerById(id: number): Promise<Answer | null> {
    await this.initialize();
    return (await db.answers.get(id)) || null;
  }

  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    await this.initialize();
    return await db.answers.where('questionId').equals(questionId).toArray();
  }

  async updateQuestionCorrectAnswer(questionId: number, answerId: number): Promise<void> {
    await this.initialize();
    await db.questions.update(questionId, { correctAnswerId: answerId });
  }

  // Game Sessions
  async createGameSession(subjectId: number): Promise<GameSession> {
    await this.initialize();
    const sessionNoId: Omit<GameSession, 'id'> = {
      subjectId,
      questionsAnswered: 0,
      questionsCorrect: 0,
      score: 0,
      startedAt: new Date().toISOString(),
      finishedAt: '',
    };
    const id = await db.gameSessions.add(sessionNoId as any);
    return { ...(sessionNoId as GameSession), id: id as number };
  }

  async getGameSessionById(id: number): Promise<GameSession | null> {
    await this.initialize();
    return (await db.gameSessions.get(id)) || null;
  }

  async updateGameSession(
    id: number,
    questionsAnswered: number,
    questionsCorrect: number,
    score: number
  ): Promise<void> {
    await this.initialize();
    await db.gameSessions.update(id, {
      questionsAnswered,
      questionsCorrect,
      score,
      finishedAt: new Date().toISOString(),
    });
  }

  async getPerformanceBySubject(subjectId: number): Promise<{
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageScore: number;
  }> {
    await this.initialize();
    const sessions = await db.gameSessions.where('subjectId').equals(subjectId).toArray();
    
    if (sessions.length === 0) {
      return { totalQuestions: 0, correctAnswers: 0, accuracy: 0, averageScore: 0 };
    }

    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const correctAnswers = sessions.reduce((sum, s) => sum + s.questionsCorrect, 0);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;

    return {
      totalQuestions,
      correctAnswers,
      accuracy,
      averageScore,
    };
  }

  close(): void {
    // Dexie não precisa de close explícito
  }
}

export const dbService = new DatabaseService();
