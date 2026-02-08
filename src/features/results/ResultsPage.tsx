import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { dbService } from '@/services/database';
import { rankingService } from '@/services/rankingService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShareQuizButton } from '@/components/ui/ShareQuizButton';
import { Home, Trophy, Target, Users } from 'lucide-react';
import type { GameQuestion } from '@/types';

export function ResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { questions, score, questionResults, config, resetGame, totalResponseTime, speedBonus } = useGameStore();

  // Salvar dados localmente antes de resetar
  const [savedQuestions, setSavedQuestions] = useState<GameQuestion[]>([]);
  const [savedScore, setSavedScore] = useState(0);
  const [savedResults, setSavedResults] = useState<Map<number, boolean>>(new Map());
  const [savedTotalTime, setSavedTotalTime] = useState(0);
  const [savedSpeedBonus, setSavedSpeedBonus] = useState(0);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [rankingUpdated, setRankingUpdated] = useState(false);

  // Capturar dados no mount
  useEffect(() => {
    console.log('📋 ResultsPage carregando:', {
      totalResponseTime,
      speedBonus,
      questions: questions.length
    });
    
    setSavedQuestions(questions);
    setSavedScore(score);
    setSavedResults(new Map(questionResults));
    setSavedTotalTime(totalResponseTime);
    setSavedSpeedBonus(speedBonus);
  }, []);

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

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

  // Atualizar ranking apenas se o quiz foi completado
  useEffect(() => {
    if (rankingUpdated || savedQuestions.length === 0) return;

    const updateRanking = async () => {
      try {
        const totalQuestions = savedQuestions.length;
        const correctAnswers = Array.from(savedResults.values()).filter(result => result).length;
        
        // Calcular tempo das respostas corretas
        let correctAnswersTime = 0;
        savedQuestions.forEach((_, index) => {
          if (savedResults.get(index)) {
            // Estimativa: tempo médio por resposta correta
            const avgTimePerQuestion = savedTotalTime / totalQuestions;
            correctAnswersTime += avgTimePerQuestion;
          }
        });

        // XP = score + speed bonus
        const xpGained = savedScore;

        console.log('🏆 Atualizando ranking (solo):', {
          correctAnswers,
          totalQuestions,
          correctAnswersTime,
          xpGained
        });

        await rankingService.updateAfterGame(
          correctAnswers,
          totalQuestions,
          correctAnswersTime,
          xpGained
        );

        setRankingUpdated(true);
      } catch (error) {
        console.error('Erro ao atualizar ranking:', error);
      }
    };

    updateRanking();
  }, [savedQuestions, savedResults, savedTotalTime, savedScore, rankingUpdated]);

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
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
          {/* Acertos */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-8 border-2 border-green-200 dark:border-green-800 text-center flex-1 max-w-sm">
            <Target className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <div className="text-green-700 dark:text-green-400 text-sm font-bold mb-2">{t('ACERTOS')}</div>
            <div className="text-6xl font-bold text-green-900 dark:text-green-300">
              {correctAnswers}/{totalQuestions}
            </div>
          </div>

          {/* Tempo Total */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-8 border-2 border-blue-200 dark:border-blue-800 text-center flex-1 max-w-sm">
            <div className="text-4xl mb-3">⏱️</div>
            <div className="text-blue-700 dark:text-blue-400 text-sm font-bold mb-2">{t('TEMPO TOTAL')}</div>
            <div className="text-4xl font-bold text-blue-900 dark:text-blue-300">
              {formatTime(savedTotalTime)}
            </div>
          </div>
        </div>

        {/* Bônus de Velocidade */}
        {savedSpeedBonus > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">⚡</span>
              <div>
                <div className="text-yellow-700 dark:text-yellow-400 text-sm font-bold">{t('BÔNUS DE VELOCIDADE')}</div>
                <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-300">
                  +{savedSpeedBonus} {t('pontos')}
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
              {t('Você foi rápido nas respostas corretas!')}
            </p>
          </div>
        )}
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
