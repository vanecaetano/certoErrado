import { GoogleGenerativeAI } from '@google/generative-ai';
import type { SharedQuizQuestion } from '@/types';

export interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
}

/**
 * Serviço de moderação de conteúdo para quizzes compartilhados
 * Bloqueia conteúdo impróprio antes de salvar na nuvem
 */
export class ContentModerationService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  /**
   * Valida se o conteúdo do quiz pode ser compartilhado
   * Bloqueia: conteúdo sexual, violência, ódio, terrorismo, ilegal
   */
  async moderateQuiz(
    topics: string[],
    questions: SharedQuizQuestion[]
  ): Promise<ModerationResult> {
    // Sempre fazer validação local primeiro
    const localCheck = this.quickLocalCheck(topics, questions);
    if (!localCheck.isAllowed) {
      return localCheck;
    }

    // Se não tiver API key, usar apenas validação local
    if (!this.genAI || !this.apiKey) {
      console.log('✅ Moderação: Validação local aprovada (IA opcional desabilitada)');
      return { isAllowed: true };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      // Criar texto completo do quiz para análise
      const quizContent = this.formatQuizForModeration(topics, questions);

      const prompt = `You are a content moderation AI. Analyze the following quiz content and determine if it violates any of these policies:

PROHIBITED CONTENT:
- Sexual or adult content (18+)
- Violence, gore, or cruelty
- Hate speech or discrimination
- Terrorism or extremism
- Illegal activities or promotion of crimes
- Harassment or bullying

QUIZ CONTENT TO ANALYZE:
${quizContent}

Respond in JSON format:
{
  "isAllowed": true/false,
  "reason": "brief explanation if not allowed"
}

Only mark as not allowed if there's clear policy violation. Educational or historical context is acceptable.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ Moderação via IA falhou (formato inválido). Usando validação local.');
        return { isAllowed: true }; // Fallback para validação local
      }

      const moderation = JSON.parse(jsonMatch[0]);
      
      console.log('✅ Moderação via IA concluída:', moderation.isAllowed ? 'Aprovado' : 'Bloqueado');
      
      return {
        isAllowed: moderation.isAllowed === true,
        reason: moderation.reason || undefined,
      };
    } catch (error) {
      console.warn('⚠️ Erro na moderação via IA:', error);
      // Em caso de erro, usar validação local (já aprovada)
      console.log('✅ Fallback: Usando validação local (aprovado)');
      return { isAllowed: true };
    }
  }

  /**
   * Formata o quiz para análise de moderação
   */
  private formatQuizForModeration(
    topics: string[],
    questions: SharedQuizQuestion[]
  ): string {
    let content = `Topics: ${topics.join(', ')}\n\n`;
    
    questions.forEach((q, idx) => {
      content += `Question ${idx + 1}: ${q.text}\n`;
      q.options.forEach((opt, optIdx) => {
        content += `  ${String.fromCharCode(65 + optIdx)}) ${opt}\n`;
      });
      content += `  Correct: ${String.fromCharCode(65 + q.correctIndex)}\n\n`;
    });

    return content;
  }

  /**
   * Validação local rápida usando palavras-chave (opcional)
   * Útil para bloquear conteúdo óbvio sem chamar a API
   */
  quickLocalCheck(topics: string[], questions: SharedQuizQuestion[]): ModerationResult {
    const prohibitedKeywords = [
      // Sexual
      'porn', 'sex', 'nude', 'xxx', 'adult',
      // Violence
      'kill', 'murder', 'torture', 'blood', 'gore',
      // Hate speech (exemplos genéricos)
      'racist', 'nazi', 'terrorist',
    ];

    const allText = [
      ...topics,
      ...questions.flatMap(q => [q.text, ...q.options]),
    ].join(' ').toLowerCase();

    for (const keyword of prohibitedKeywords) {
      if (allText.includes(keyword)) {
        return {
          isAllowed: false,
          reason: 'Conteúdo potencialmente inadequado detectado',
        };
      }
    }

    return { isAllowed: true };
  }
}

// Singleton instance
export const contentModerationService = new ContentModerationService();
