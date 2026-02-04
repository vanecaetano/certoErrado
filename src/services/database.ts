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

  async createDefaultSubject(): Promise<void> {
    await this.initialize();
    
    // Remover assunto antigo "Conhecimentos Gerais" se existir
    const oldSubject = await db.subjects.where('name').equals('Conhecimentos Gerais').first();
    if (oldSubject) {
      await this.deleteSubject(oldSubject.id);
    }
    
    // Verificar se já existe
    const existing = await db.subjects.where('name').equals('Modo Relâmpago').first();
    if (existing) return;

    // Criar subject
    const subject = await this.createSubject('Modo Relâmpago');

    // 30 perguntas gerais aleatórias
    const defaultQuestions = [
      { text: 'Qual é a capital da França?', answers: [{ text: 'Paris', isCorrect: true }, { text: 'Lyon', isCorrect: false }, { text: 'Marselha', isCorrect: false }, { text: 'Nice', isCorrect: false }] },
      { text: 'Qual planeta é o maior do Sistema Solar?', answers: [{ text: 'Saturno', isCorrect: false }, { text: 'Júpiter', isCorrect: true }, { text: 'Netuno', isCorrect: false }, { text: 'Urano', isCorrect: false }] },
      { text: 'Em que ano terminou a Segunda Guerra Mundial?', answers: [{ text: '1943', isCorrect: false }, { text: '1944', isCorrect: false }, { text: '1945', isCorrect: true }, { text: '1946', isCorrect: false }] },
      { text: 'Qual é o maior oceano do mundo?', answers: [{ text: 'Oceano Atlântico', isCorrect: false }, { text: 'Oceano Índico', isCorrect: false }, { text: 'Oceano Pacífico', isCorrect: true }, { text: 'Oceano Ártico', isCorrect: false }] },
      { text: 'Quantos continentes existem?', answers: [{ text: '5', isCorrect: false }, { text: '6', isCorrect: false }, { text: '7', isCorrect: true }, { text: '8', isCorrect: false }] },
      { text: 'Qual é o elemento químico com símbolo Au?', answers: [{ text: 'Prata', isCorrect: false }, { text: 'Ouro', isCorrect: true }, { text: 'Cobre', isCorrect: false }, { text: 'Alumínio', isCorrect: false }] },
      { text: 'Qual é a montanha mais alta do mundo?', answers: [{ text: 'K2', isCorrect: false }, { text: 'Monte Everest', isCorrect: true }, { text: 'Aconcágua', isCorrect: false }, { text: 'Kilimanjaro', isCorrect: false }] },
      { text: 'Em que país fica a Torre de Pisa?', answers: [{ text: 'França', isCorrect: false }, { text: 'Espanha', isCorrect: false }, { text: 'Itália', isCorrect: true }, { text: 'Portugal', isCorrect: false }] },
      { text: 'Qual é o planeta mais próximo do Sol?', answers: [{ text: 'Vênus', isCorrect: false }, { text: 'Mercúrio', isCorrect: true }, { text: 'Terra', isCorrect: false }, { text: 'Marte', isCorrect: false }] },
      { text: 'Quantos lados tem um hexágono?', answers: [{ text: '4', isCorrect: false }, { text: '5', isCorrect: false }, { text: '6', isCorrect: true }, { text: '7', isCorrect: false }] },
      { text: 'Qual é a maior democracia do mundo?', answers: [{ text: 'EUA', isCorrect: false }, { text: 'Índia', isCorrect: true }, { text: 'Brasil', isCorrect: false }, { text: 'Indonésia', isCorrect: false }] },
      { text: 'Em que ano o homem pisou na Lua?', answers: [{ text: '1967', isCorrect: false }, { text: '1968', isCorrect: false }, { text: '1969', isCorrect: true }, { text: '1970', isCorrect: false }] },
      { text: 'Qual é o rio mais longo da América do Sul?', answers: [{ text: 'Rio de la Plata', isCorrect: false }, { text: 'Orinoco', isCorrect: false }, { text: 'Amazonas', isCorrect: true }, { text: 'Paraná', isCorrect: false }] },
      { text: 'Quantos dias tem um ano bissexto?', answers: [{ text: '365', isCorrect: false }, { text: '366', isCorrect: true }, { text: '367', isCorrect: false }, { text: '364', isCorrect: false }] },
      { text: 'Qual é o menor país do mundo?', answers: [{ text: 'Mônaco', isCorrect: false }, { text: 'Liechtenstein', isCorrect: false }, { text: 'Cidade do Vaticano', isCorrect: true }, { text: 'San Marino', isCorrect: false }] },
      { text: 'Quantas cores tem o arco-íris?', answers: [{ text: '6', isCorrect: false }, { text: '7', isCorrect: true }, { text: '8', isCorrect: false }, { text: '5', isCorrect: false }] },
      { text: 'Qual é o maior animal terrestre?', answers: [{ text: 'Rinoceronte', isCorrect: false }, { text: 'Hipopótamo', isCorrect: false }, { text: 'Elefante', isCorrect: true }, { text: 'Girafa', isCorrect: false }] },
      { text: 'Em que século foi inventada a imprensa por Gutenberg?', answers: [{ text: 'XIII', isCorrect: false }, { text: 'XIV', isCorrect: false }, { text: 'XV', isCorrect: true }, { text: 'XVI', isCorrect: false }] },
      { text: 'Qual é a velocidade da luz?', answers: [{ text: '200.000 km/s', isCorrect: false }, { text: '300.000 km/s', isCorrect: true }, { text: '400.000 km/s', isCorrect: false }, { text: '100.000 km/s', isCorrect: false }] },
      { text: 'Que elemento químico tem símbolo Fe?', answers: [{ text: 'Flúor', isCorrect: false }, { text: 'Ferro', isCorrect: true }, { text: 'Fósforo', isCorrect: false }, { text: 'Francio', isCorrect: false }] },
      { text: 'Qual é o país com mais fusos horários?', answers: [{ text: 'China', isCorrect: false }, { text: 'Rússia', isCorrect: false }, { text: 'França', isCorrect: true }, { text: 'EUA', isCorrect: false }] },
      { text: 'Quantas cordas tem um violão?', answers: [{ text: '5', isCorrect: false }, { text: '6', isCorrect: true }, { text: '7', isCorrect: false }, { text: '8', isCorrect: false }] },
      { text: 'Qual é o pintor da Mona Lisa?', answers: [{ text: 'Michelangelo', isCorrect: false }, { text: 'Claude Monet', isCorrect: false }, { text: 'Leonardo da Vinci', isCorrect: true }, { text: 'Raphael', isCorrect: false }] },
      { text: 'Quantos jogadores tem um time de futebol em campo?', answers: [{ text: '9', isCorrect: false }, { text: '10', isCorrect: false }, { text: '11', isCorrect: true }, { text: '12', isCorrect: false }] },
      { text: 'Qual é o maior deserto do mundo?', answers: [{ text: 'Deserto do Kalahari', isCorrect: false }, { text: 'Deserto de Gobi', isCorrect: false }, { text: 'Deserto do Saara', isCorrect: true }, { text: 'Deserto de Atacama', isCorrect: false }] },
      { text: 'Em que país foi inventado o chop suey?', answers: [{ text: 'China', isCorrect: false }, { text: 'Vietnã', isCorrect: false }, { text: 'EUA', isCorrect: true }, { text: 'Tailândia', isCorrect: false }] },
      { text: 'Qual é a pontuação máxima em boliche?', answers: [{ text: '200', isCorrect: false }, { text: '250', isCorrect: false }, { text: '300', isCorrect: true }, { text: '350', isCorrect: false }] },
      { text: 'Quantos ossos tem o corpo humano adulto?', answers: [{ text: '186', isCorrect: false }, { text: '206', isCorrect: true }, { text: '226', isCorrect: false }, { text: '186', isCorrect: false }] },
      { text: 'Qual é o maior lago de água doce do mundo?', answers: [{ text: 'Lago Superior', isCorrect: true }, { text: 'Lago Vitória', isCorrect: false }, { text: 'Lago Baikal', isCorrect: false }, { text: 'Lago Michigan', isCorrect: false }] },
      { text: 'Em que país nasceu Albert Einstein?', answers: [{ text: 'Áustria', isCorrect: false }, { text: 'Alemanha', isCorrect: true }, { text: 'Suíça', isCorrect: false }, { text: 'Dinamarca', isCorrect: false }] },
    ];

    let totalAnswers = 0;
    for (const questionData of defaultQuestions) {
      const question = await this.createQuestion(subject.id, questionData.text);
      
      // Criar respostas
      let correctAnswerId = 0;
      for (const answerData of questionData.answers) {
        const answer = await this.createAnswer(question.id, answerData.text, answerData.isCorrect);
        if (answerData.isCorrect) {
          correctAnswerId = answer.id;
        }
      }
      
      // Atualizar question com correctAnswerId
      await db.questions.update(question.id, { correctAnswerId });
      totalAnswers++;
    }

    // Atualizar count no subject
    await this.updateSubjectQuestionCount(subject.id, totalAnswers);
  }

  close(): void {
    // Dexie não precisa de close explícito
  }
}

export const dbService = new DatabaseService();
