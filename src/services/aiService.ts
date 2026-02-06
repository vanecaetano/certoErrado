import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Answer } from '@/types';
import { dbService } from './database';

interface GeneratedQuestion {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  async generateQuestionsForSubject(subject: string, count: number = 50): Promise<void> {
    if (!this.apiKey) {
      throw new Error(
        'API key não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env\n' +
        'Obtenha sua chave gratuita em: https://aistudio.google.com/app/apikey'
      );
    }

    // Criar ou obter assunto
    const allSubjects = await dbService.getAllSubjectsAsync();
    let subjectRecord = allSubjects.find(s => s.name.toLowerCase() === subject.toLowerCase());
    if (!subjectRecord) {
      subjectRecord = await dbService.createSubject(subject);
    }

    // Obter idioma selecionado
    const lang = window.localStorage.getItem('lang') || 'pt';

    const batchSize = 50; // Gerar em lotes para não sobrecarregar a API
    const batches = Math.ceil(count / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const currentBatchSize = Math.min(batchSize, count - (batch * batchSize));
      try {
        const questions = await this.generateBatch(subject, currentBatchSize, lang);
        
        // Salvar no banco de dados
        for (const q of questions) {
          const question = await dbService.createQuestion(subjectRecord.id, q.question);
          
          // Criar respostas
          const answers: Answer[] = [];
          
          // Resposta correta
          const correctAnswer = await dbService.createAnswer(question.id, q.correctAnswer, true);
          answers.push(correctAnswer);
          
          // Respostas erradas
          for (const wrongAnswer of q.wrongAnswers) {
            const answer = await dbService.createAnswer(question.id, wrongAnswer, false);
            answers.push(answer);
          }
          
          // Atualizar questão com ID da resposta correta
          await dbService.updateQuestionCorrectAnswer(question.id, correctAnswer.id);
        }
        
        // Atualizar contador de perguntas do assunto
        const allQuestions = await dbService.getRandomQuestionsBySubject(subjectRecord.id, 10000);
        await dbService.updateSubjectQuestionCount(subjectRecord.id, allQuestions.length);
        
        // Pequeno delay entre lotes para respeitar rate limits
        if (batch < batches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Erro ao gerar lote ${batch + 1}:`, error);
        throw error;
      }
    }
  }

  private async generateBatch(subject: string, count: number, lang: string = 'pt'): Promise<GeneratedQuestion[]> {
    if (!this.genAI) {
      throw new Error('Google Generative AI não inicializado');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    let prompt = '';
    
    switch (lang) {
      case 'en':
        prompt = `You are an expert in creating educational and objective multiple-choice questions.

Create exactly ${count} questions about the topic: "${subject}"

REQUIREMENTS:
- Each question must be short, clear, and objective (max 100 characters)
- Each question must have 1 correct answer and 4 incorrect answers
- Answers must be short (max 80 characters each)
- Incorrect answers must be plausible but clearly wrong
- Questions should vary in difficulty (easy, medium, hard)
- Focus on important and practical concepts about ${subject}

RESPONSE FORMAT (JSON array):
[
  {
    "question": "Question text",
    "correctAnswer": "Correct answer",
    "wrongAnswers": ["Wrong answer 1", "Wrong answer 2", "Wrong answer 3", "Wrong answer 4"]
  }
]

Return ONLY the JSON array, no extra text before or after. No markdown, no code blocks, just pure JSON.`;
        break;
        
      case 'es':
        prompt = `Eres un experto en crear preguntas educativas y objetivas de opción múltiple.

Crea exactamente ${count} preguntas sobre el tema: "${subject}"

REQUISITOS:
- Cada pregunta debe ser corta, clara y objetiva (máximo 100 caracteres)
- Cada pregunta debe tener 1 respuesta correcta y 4 respuestas incorrectas
- Las respuestas deben ser cortas (máximo 80 caracteres cada una)
- Las respuestas incorrectas deben ser plausibles pero claramente incorrectas
- Las preguntas deben variar en dificultad (fácil, medio, difícil)
- Enfócate en conceptos importantes y prácticos sobre ${subject}

FORMATO DE RESPUESTA (array JSON):
[
  {
    "question": "Texto de la pregunta",
    "correctAnswer": "Respuesta correcta",
    "wrongAnswers": ["Respuesta incorrecta 1", "Respuesta incorrecta 2", "Respuesta incorrecta 3", "Respuesta incorrecta 4"]
  }
]

Devuelve SOLO el array JSON, sin texto adicional antes o después. Sin markdown, sin bloques de código, solo JSON puro.`;
        break;
        
      case 'fr':
        prompt = `Vous êtes un expert dans la création de questions éducatives et objectives à choix multiples.

Créez exactement ${count} questions sur le sujet: "${subject}"

EXIGENCES:
- Chaque question doit être courte, claire et objective (maximum 100 caractères)
- Chaque question doit avoir 1 bonne réponse et 4 mauvaises réponses
- Les réponses doivent être courtes (maximum 80 caractères chacune)
- Les mauvaises réponses doivent être plausibles mais clairement fausses
- Les questions doivent varier en difficulté (facile, moyen, difficile)
- Concentrez-vous sur les concepts importants et pratiques concernant ${subject}

FORMAT DE RÉPONSE (tableau JSON):
[
  {
    "question": "Texte de la question",
    "correctAnswer": "Bonne réponse",
    "wrongAnswers": ["Mauvaise réponse 1", "Mauvaise réponse 2", "Mauvaise réponse 3", "Mauvaise réponse 4"]
  }
]

Retournez UNIQUEMENT le tableau JSON, sans texte supplémentaire avant ou après. Pas de markdown, pas de blocs de code, juste du JSON pur.`;
        break;
        
      case 'de':
        prompt = `Sie sind ein Experte für die Erstellung pädagogischer und objektiver Multiple-Choice-Fragen.

Erstellen Sie genau ${count} Fragen zum Thema: "${subject}"

ANFORDERUNGEN:
- Jede Frage muss kurz, klar und objektiv sein (maximal 100 Zeichen)
- Jede Frage muss 1 richtige Antwort und 4 falsche Antworten haben
- Die Antworten müssen kurz sein (maximal 80 Zeichen pro Antwort)
- Falsche Antworten müssen plausibel, aber eindeutig falsch sein
- Die Fragen sollten unterschiedliche Schwierigkeitsgrade haben (einfach, mittel, schwer)
- Konzentrieren Sie sich auf wichtige und praktische Konzepte zu ${subject}

ANTWORTFORMAT (JSON-Array):
[
  {
    "question": "Fragetext",
    "correctAnswer": "Richtige Antwort",
    "wrongAnswers": ["Falsche Antwort 1", "Falsche Antwort 2", "Falsche Antwort 3", "Falsche Antwort 4"]
  }
]

Geben Sie NUR das JSON-Array zurück, ohne zusätzlichen Text davor oder danach. Kein Markdown, keine Codeblöcke, nur reines JSON.`;
        break;
        
      default: // 'pt'
        prompt = `Você é um especialista em criar perguntas de múltipla escolha educacionais e objetivas.

Crie exatamente ${count} perguntas sobre o assunto: "${subject}"

REQUISITOS:
- Cada pergunta deve ser curta, clara e objetiva (máximo 100 caracteres)
- Cada pergunta deve ter 1 resposta correta e 4 respostas incorretas
- As respostas devem ser curtas (máximo 80 caracteres cada)
- As respostas incorretas devem ser plausíveis mas claramente erradas
- As perguntas devem variar em dificuldade (fácil, médio, difícil)
- Foque em conceitos importantes e práticos sobre ${subject}

FORMATO DE RESPOSTA (JSON array):
[
  {
    "question": "Texto da pergunta",
    "correctAnswer": "Resposta correta",
    "wrongAnswers": ["Resposta errada 1", "Resposta errada 2", "Resposta errada 3", "Resposta errada 4"]
  }
]

Retorne APENAS o JSON array, sem texto adicional antes ou depois. Sem markdown, sem código blocks, apenas o JSON puro.`;
    }

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Limpar o texto e extrair JSON
      let jsonText = text.trim();
      
      // Remover markdown code blocks se existirem
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      jsonText = jsonText.trim();
      
      // Tentar encontrar o array JSON
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair JSON da resposta');
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);
      
      // Validar que temos pelo menos algumas perguntas
      if (questions.length === 0) {
        throw new Error('Nenhuma pergunta foi gerada');
      }

      // Validar estrutura
      const validQuestions = questions.filter(q => 
        q.question && 
        q.correctAnswer && 
        Array.isArray(q.wrongAnswers) && 
        q.wrongAnswers.length === 4
      );

      if (validQuestions.length === 0) {
        throw new Error('Nenhuma pergunta válida foi gerada');
      }

      return validQuestions;
    } catch (error: any) {
      console.error('Erro ao gerar perguntas:', error);
      
      // Verificar diferentes tipos de erros da API
      if (error?.message?.includes('API key') || error?.message?.includes('API_KEY_INVALID')) {
        throw new Error(
          'Chave da API inválida ou não configurada.\n\n' +
          'Para resolver:\n' +
          '1. Obtenha uma chave gratuita em: https://aistudio.google.com/app/apikey\n' +
          '2. Edite o arquivo .env na pasta do projeto\n' +
          '3. Substitua "your_gemini_api_key_here" pela sua chave real\n' +
          '4. Reinicie o servidor (Ctrl+C e depois npm run dev)\n\n' +
          'Veja o arquivo COMO_OBTER_CHAVE_GEMINI.md para instruções detalhadas.'
        );
      }
      
      if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        throw new Error(
          'Limite de requisições excedido. O limite gratuito é 1,500 requests/dia.\n' +
          'Aguarde algumas horas ou tente novamente amanhã.'
        );
      }
      
      throw error;
    }
  }
}

export const aiService = new AIService();
