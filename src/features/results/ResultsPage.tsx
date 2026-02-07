import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { dbService } from '@/services/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShareQuizButton } from '@/components/ui/ShareQuizButton';
import { Home, Trophy, Target, Users } from 'lucide-react';
import type { GameQuestion } from '@/types';

export function ResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { questions, score, questionResults, config, resetGame } = useGameStore();

  // Salvar dados localmente antes de resetar
  const [savedQuestions, setSavedQuestions] = useState<GameQuestion[]>([]);
  const [savedScore, setSavedScore] = useState(0);
  const [savedResults, setSavedResults] = useState<Map<number, boolean>>(new Map());
  const [subjectNames, setSubjectNames] = useState<string[]>([]);

  // Capturar dados no mount
  useEffect(() => {
    setSavedQuestions(questions);
    setSavedScore(score);
    setSavedResults(new Map(questionResults));
  }, []);

  const totalQuestions = savedQuestions.length;
  const correctAnswers = Array.from(savedResults.values()).filter(result => result).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  // Mensagem provocativa baseada no desempenho
  const getChallengeMessage = () => {
    if (accuracy >= 90) {
      return t('🔥 Você é um mestre! Seus amigos conseguem chegar perto?');
    } else if (accuracy >= 70) {
      return t('👏 Muito bem! Será que seus amigos superam isso?');
    } else if (accuracy >= 50) {
      return t('💪 Bom resultado! Desafie seus amigos a fazer melhor!');
    } else {
      return t('😅 Desafie seus amigos e vejam quem se sai melhor!');
    }
  };

  useEffect(() => {
    const loadSubjectNames = async () => {
      const names: string[] = [];
      for (const { subjectId } of config.subjects) {
        const subject = await dbService.getSubjectByIdAsync(subjectId);
        if (subject) names.push(subject.name);
      }
      setSubjectNames(names);
    };

    loadSubjectNames();
  }, [config]);

  useEffect(() => {
    // Resetar apenas ao desmontar o componente
    return () => {
      resetGame();
    };
  }, [resetGame]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        {/* Ícone de Troféu */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-6 shadow-xl">
            <Trophy className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-transparent bg-clip-text">
          {t('Resultado Final')}
        </h1>
      </div>

      {/* Card de Estatísticas */}
      <Card className="mb-6 p-6">
        <div className="flex justify-center mb-6">
          {/* Acertos */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 border-2 border-green-200 dark:border-green-800 text-center max-w-sm w-full">
            <Target className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <div className="text-green-700 dark:text-green-400 text-sm font-bold mb-2">{t('ACERTOS')}</div>
            <div className="text-6xl font-bold text-green-900 dark:text-green-300">
              {correctAnswers}/{totalQuestions}
            </div>
          </div>
        </div>
      </Card>

      {/* Card de Provocação */}
      <Card className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border-2 border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-4">
          <Users className="w-10 h-10 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('Desafio Lançado!')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{getChallengeMessage()}</p>
          </div>
        </div>
      </Card>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          size="lg" 
          onClick={() => navigate('/')}
          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg"
        >
          <Home className="w-5 h-5 mr-2" /> {t('Voltar ao Início')}
        </Button>
        
        {savedQuestions.length > 0 && (
          <div className="flex-1">
            <ShareQuizButton 
              questions={savedQuestions} 
              subjects={subjectNames}
              score={savedScore}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8">
        {t('Continue praticando e melhore seus resultados!')} 🚀
      </div>
    </div>
  );
}
