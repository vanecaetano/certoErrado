import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';
import { contentModerationService } from './contentModeration';
import type { 
  SharedQuiz, 
  ShareQuizRequest, 
  ShareQuizResponse 
} from '@/types';

/**
 * Serviço para compartilhamento de quizzes na nuvem
 */
export class SharedQuizService {
  private readonly COLLECTION_NAME = 'shared-quizzes';

  /**
   * Gera um ID único para o quiz (UUID v4 simplificado)
   */
  private generateQuizId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Compartilha um quiz na nuvem
   * Realiza moderação de conteúdo antes de salvar
   */
  async shareQuiz(request: ShareQuizRequest): Promise<ShareQuizResponse> {
    const db = getFirestoreInstance();
    
    if (!db) {
      return {
        id: '',
        success: false,
        error: 'Serviço de compartilhamento não disponível. Configure o Firebase.',
      };
    }

    try {
      // 1. Validar dados básicos
      if (!request.topics || request.topics.length === 0) {
        return {
          id: '',
          success: false,
          error: 'Quiz deve ter pelo menos um assunto',
        };
      }

      if (!request.questions || request.questions.length === 0) {
        return {
          id: '',
          success: false,
          error: 'Quiz deve ter pelo menos uma pergunta',
        };
      }

      // 2. Validação rápida local
      const quickCheck = contentModerationService.quickLocalCheck(
        request.topics,
        request.questions
      );

      if (!quickCheck.isAllowed) {
        return {
          id: '',
          success: false,
          error: quickCheck.reason || 'Este quiz não pode ser compartilhado por conter conteúdo não permitido.',
        };
      }

      // 3. Moderação completa via IA (opcional)
      try {
        const moderation = await contentModerationService.moderateQuiz(
          request.topics,
          request.questions
        );

        if (!moderation.isAllowed) {
          console.warn('❌ Quiz bloqueado pela moderação:', moderation.reason);
          return {
            id: '',
            success: false,
            error: moderation.reason || 'Este quiz não pode ser compartilhado por conter conteúdo não permitido.',
          };
        }
      } catch (moderationError) {
        // Se moderação falhar, continuar (validação local já passou)
        console.warn('⚠️ Moderação via IA falhou, continuando com validação local:', moderationError);
      }

      // 4. Gerar ID único
      const quizId = this.generateQuizId();

      // 5. Criar documento no Firestore
      const quizData: Omit<SharedQuiz, 'id' | 'createdAt'> & { createdAt: any } = {
        topics: request.topics,
        questions: request.questions,
        createdAt: serverTimestamp(),
        modelVersion: '1.0',
      };

      console.log('💾 Salvando quiz no Firestore...');
      console.log('📊 Total de perguntas:', request.questions.length);
      console.log('📝 Primeira pergunta:', request.questions[0]);

      const quizRef = doc(db, this.COLLECTION_NAME, quizId);
      await setDoc(quizRef, quizData);

      console.log('✅ Quiz compartilhado com sucesso! ID:', quizId);
      console.log('🔗 Link:', `${window.location.origin}/quiz/${quizId}`);

      return {
        id: quizId,
        success: true,
      };
    } catch (error: any) {
      console.error('❌ Erro ao compartilhar quiz:', error);
      
      // Mensagens de erro mais específicas
      let errorMessage = 'Erro ao salvar quiz. ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'Permissão negada. Verifique as regras de segurança do Firestore.';
      } else if (error?.code === 'unavailable') {
        errorMessage += 'Firebase temporariamente indisponível. Tente novamente.';
      } else if (error?.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Tente novamente em alguns instantes.';
      }
      
      return {
        id: '',
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Busca um quiz compartilhado pelo ID
   */
  async getSharedQuiz(quizId: string): Promise<SharedQuiz | null> {
    const db = getFirestoreInstance();
    
    if (!db) {
      console.error('Firebase não configurado');
      return null;
    }

    try {
      const quizRef = doc(db, this.COLLECTION_NAME, quizId);
      const quizSnap = await getDoc(quizRef);

      if (!quizSnap.exists()) {
        console.log('❌ Quiz não encontrado no Firestore:', quizId);
        return null;
      }

      const data = quizSnap.data();
      
      console.log('📦 Dados brutos do Firestore:', data);
      console.log('📝 Perguntas encontradas:', data.questions?.length || 0);
      
      // Converter Timestamp do Firebase para string
      let createdAt = new Date().toISOString();
      if (data.createdAt) {
        if (data.createdAt instanceof Timestamp) {
          createdAt = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAt = data.createdAt;
        }
      }

      const quizData = {
        id: quizSnap.id,
        topics: data.topics || [],
        questions: data.questions || [],
        createdAt,
        modelVersion: data.modelVersion,
      };
      
      console.log('✅ Quiz montado:', quizData);
      
      return quizData;
    } catch (error) {
      console.error('Erro ao buscar quiz compartilhado:', error);
      return null;
    }
  }

  /**
   * Gera URL compartilhável para o quiz
   */
  getShareableUrl(quizId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/quiz/${quizId}`;
  }
}

// Singleton instance
export const sharedQuizService = new SharedQuizService();
