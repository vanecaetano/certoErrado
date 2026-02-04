import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { audioService } from '@/services/audio';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { LogOut } from 'lucide-react';

export function GamePage() {
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    score,
    selectedAnswerId,
    isAnswered,
    isCorrect,
    selectAnswer,
    nextQuestion,
    finishGame,
    resetGame,
  } = useGameStore();

  const [pulseClass, setPulseClass] = useState<string>('');

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/');
      return;
    }
  }, [questions.length, navigate]);

  useEffect(() => {
    if (isAnswered && isCorrect !== null) {
      if (isCorrect) {
        setPulseClass('animate-pulse-green');
        audioService.playCorrect();
        audioService.vibrate([100, 50, 100, 50, 100]);
      } else {
        setPulseClass('animate-pulse-red');
        audioService.playWrong();
        audioService.vibrate(200);
      }

      const timer = setTimeout(async () => {
        setPulseClass('');
        if (currentQuestionIndex < questions.length - 1) {
          nextQuestion();
        } else {
          await finishGame();
          navigate('/results');
        }
      }, isCorrect ? 2000 : 1500);

      return () => clearTimeout(timer);
    }
  }, [isAnswered, isCorrect, currentQuestionIndex, questions.length, nextQuestion, finishGame, navigate]);

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header com pontuação e progresso */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>
        <div className="text-right flex items-center gap-3">
          <div className="mr-4">
            <Button variant="secondary" size="sm" onClick={() => {
              if (confirm('Deseja realmente sair do jogo? Seu progresso atual será perdido.')) {
                resetGame();
                navigate('/');
              }
            }}>
              <LogOut className="w-4 h-4 mr-2 inline" />
              Sair
            </Button>
          </div>
          <div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {score}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pontos</div>
          </div>
        </div>
      </div>

      {/* Pergunta */}
      <Card className="mb-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {currentQuestion.question.text}
        </h2>

        {/* Respostas */}
        <div className="grid gap-3">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;
            const showCorrect = isAnswered && answer.isCorrect;
            const showWrong = isAnswered && isSelected && !answer.isCorrect;

            return (
              <button
                key={answer.id}
                onClick={() => !isAnswered && selectAnswer(answer.id)}
                disabled={isAnswered}
                className={`
                  p-4 text-left rounded-lg border-2 transition-all
                  ${isSelected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}
                  ${showCorrect ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : ''}
                  ${showWrong ? 'border-error-500 bg-error-50 dark:bg-error-900/20' : ''}
                  ${!isAnswered ? 'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : 'cursor-not-allowed'}
                  ${isSelected && pulseClass ? pulseClass : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{answer.text}</span>
                  {showCorrect && <CheckCircle2 className="w-6 h-6 text-success-600" />}
                  {showWrong && <XCircle className="w-6 h-6 text-error-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
