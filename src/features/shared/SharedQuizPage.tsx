import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { sharedQuizService } from '@/services/sharedQuizService';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { AlertCircle, Play, Home } from 'lucide-react';
import type { SharedQuiz } from '@/types';

/**
 * Página para acessar um quiz compartilhado via link
 * URL: /quiz/:id
 */
export function SharedQuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { initializeGame } = useGameStore();

  const [quiz, setQuiz] = useState<SharedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedQuiz = async () => {
      if (!id) {
        setError('ID do quiz não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const sharedQuiz = await sharedQuizService.getSharedQuiz(id);

        if (!sharedQuiz) {
          setError(t('Quiz não encontrado. O link pode estar inválido ou expirado.'));
          setLoading(false);
          return;
        }

        console.log('✅ Quiz carregado com sucesso:', sharedQuiz);
        console.log('📊 Total de perguntas:', sharedQuiz.questions.length);
        
        setQuiz(sharedQuiz);
        setError(null);
      } catch (err) {
        console.error('❌ Erro ao carregar quiz compartilhado:', err);
        setError(t('Erro ao carregar quiz'));
      } finally {
        setLoading(false);
      }
    };

    loadSharedQuiz();
  }, [id]);

  const handleStartQuiz = async () => {
    if (!quiz) return;

    try {
      console.log('🎮 Iniciando quiz compartilhado...');
      console.log('📊 Total de perguntas:', quiz.questions.length);
      
      // Converter SharedQuiz para formato do GameStore (GameQuestion[])
      const gameQuestions = quiz.questions.map((q, idx) => {
        const questionObj = {
          id: idx + 1,
          subjectId: 1,
          text: q.text,
          correctAnswerId: q.correctIndex + 1,
          createdAt: quiz.createdAt,
        };
        
        const answersArray = q.options.map((option, optIdx) => ({
          id: optIdx + 1,
          questionId: idx + 1,
          text: option,
          isCorrect: optIdx === q.correctIndex,
        }));
        
        return {
          question: questionObj,
          answers: answersArray,
        };
      });

      console.log('✅ Perguntas convertidas:', gameQuestions.length);
      console.log('📝 Primeira pergunta:', gameQuestions[0]);

      // Inicializar jogo com perguntas do quiz compartilhado
      await initializeGame({
        subjects: [],
        allQuestions: gameQuestions,
      });

      console.log('🚀 Navegando para /game');
      
      // Navegar para a página do jogo
      navigate('/game');
    } catch (error) {
      console.error('❌ Erro ao iniciar quiz:', error);
      setError(t('Erro ao carregar quiz'));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingOverlay message={t('Carregando quiz...')} />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="p-8 text-center bg-white dark:bg-gray-800">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('Oops! Algo deu errado')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || t('Quiz não encontrado')}
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700"
          >
            <Home className="w-5 h-5 mr-2" />
            {t('Voltar ao Início')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Card className="p-8 bg-white dark:bg-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            {t('Quiz Compartilhado')} 🎮
          </h1>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {quiz.topics.map((topic, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Total de Perguntas')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quiz.questions.length}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('Pontuação Máxima')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {quiz.questions.length * 10}
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {t('Um amigo compartilhou este quiz com você! Está pronto para testar seus conhecimentos?')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleStartQuiz}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-bold"
          >
            <Play className="w-6 h-6 mr-2" />
            {t('Começar Quiz')}
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/')}
            className="px-8 py-4 text-lg"
          >
            <Home className="w-6 h-6 mr-2" />
            {t('Voltar ao Início')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
