import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { dbService } from '@/services/database';
import { audioService } from '@/services/audio';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Hourglass, LogOut } from 'lucide-react';
import clockMusic from '@/assets/clock.mp3';

export function GamePage() {
  const [clockAudio, setClockAudio] = useState<HTMLAudioElement | null>(null);
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
  const [showLoading, setShowLoading] = useState(false);
  const [motivational, setMotivational] = useState<string | null>(null);
  const [showAddMorePrompt, setShowAddMorePrompt] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15);

  useEffect(() => {
    const audio = new Audio(clockMusic);
    audio.loop = true;
    audio.volume = 0.15;
    let enabled = true;
    let started = false;
    const tryPlay = () => {
      if (!started) {
        started = true;
        audio?.play().catch(() => {});
      }
    };
    setClockAudio(audio);
    const toggle = (e: any) => {
      enabled = e.detail;
      if (enabled && !isAnswered) tryPlay();
      else audio?.pause();
    };
    window.addEventListener('music-toggle', toggle);
    const mouseHandler = () => {
      tryPlay();
      window.removeEventListener('mousemove', mouseHandler);
    };
    const clickHandler = () => {
      tryPlay();
      window.removeEventListener('click', clickHandler);
    };
    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('click', clickHandler);
    return () => {
      window.removeEventListener('music-toggle', toggle);
      window.removeEventListener('mousemove', mouseHandler);
      window.removeEventListener('click', clickHandler);
      audio?.pause();
      setClockAudio(null);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!clockAudio) return;
    if (isAnswered || timeRemaining > 5) {
      clockAudio.pause();
    } else if (timeRemaining <= 5) {
      clockAudio.play().catch(() => {});
    }
  }, [isAnswered, clockAudio, timeRemaining]);

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/');
      return;
    }
  }, [questions.length, navigate]);

  // Timer effect
  useEffect(() => {
    setTimeRemaining(15); // Reset timer quando muda a pergunta
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (isAnswered || questions.length === 0) {
      return; // Stop timer if already answered
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          audioService.playWrong(); // Play fail sound
          nextQuestion(); // Go to next question
          return 15; // Reset for next question
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, questions.length, nextQuestion]);

  useEffect(() => {
    if (isAnswered && isCorrect !== null) {
      if (isCorrect) {
        setPulseClass('animate-pulse-green');
        audioService.playCorrectVibrant();
        audioService.vibrate([120, 40, 120]);

        // dynamic motivational messages
        const messages = [
          'Excelente! Continue assim!',
          'Mandou bem — foco e vitória!',
          'Ótimo acerto! Você está afiado!',
          'Acertou! Mantenha o ritmo!',
          'Boaa! Mais uma vitória!',
        ];
        setMotivational(messages[Math.floor(Math.random() * messages.length)]);
      } else {
        setPulseClass('animate-pulse-red');
        audioService.playWrong();
        audioService.vibrate(200);
        setMotivational('Não desista — tente a próxima!');
      }

      // show result briefly then loading
      const resultTimeout = setTimeout(() => {
        setPulseClass('');
        setMotivational(null);
        // Se for a última pergunta, finalizar o jogo
        if (currentQuestionIndex >= questions.length - 1) {
          (async () => {
            try {
              const subjectId = currentQuestion.question.subjectId;
              const allForSubject = await dbService.getRandomQuestionsBySubject(subjectId, 1000);
              const existingIds = new Set(questions.map(q => q.question.id));
              const remaining = allForSubject.filter(q => !existingIds.has(q.id));
              if (remaining.length > 0) {
                setShowAddMorePrompt(true);
              } else {
                await finishGame();
                navigate('/results');
              }
            } catch (e) {
              await finishGame();
              navigate('/results');
            }
          })();
        } else {
          // show small loading to build expectation
          setShowLoading(true);
          setTimeout(async () => {
            setShowLoading(false);
            if (currentQuestionIndex < questions.length - 1) {
              nextQuestion();
            } else {
              await finishGame();
              navigate('/results');
            }
          }, 500);
        }
      }, 1200);

    return () => clearTimeout(resultTimeout);
  }
}, [isAnswered, isCorrect, currentQuestionIndex, questions.length, nextQuestion, finishGame, navigate]);

  if (questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-6 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              <Button variant="secondary" size="sm" onClick={() => {
                if (confirm('Deseja realmente sair do jogo? Seu progresso atual será perdido.')) {
                  resetGame();
                  navigate('/');
                }
              }}>
                <LogOut className="w-4 h-4 mr-2 inline" />
                Sair
              </Button>
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pontos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
          <div className="max-w-4xl w-full">
            {/* Timer - Responsive positioning */}
            <div className="hidden md:fixed md:top-32 md:right-4 md:z-40 md:flex md:flex-col md:items-center md:justify-center">
              <div className={`flex flex-col items-center justify-center p-8 rounded-lg border-3 bg-white dark:bg-gray-800 ${
                timeRemaining <= 5 
                  ? 'border-error-500 shadow-lg shadow-error-500/30' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                <Hourglass className={`w-16 h-16 mb-4 ${
                  timeRemaining <= 5 
                    ? 'text-error-500' 
                    : 'text-gray-600 dark:text-gray-400'
                }`} />
                <div className={`text-6xl font-bold tabular-nums ${
                  timeRemaining <= 5 
                    ? 'text-error-600 dark:text-error-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {timeRemaining}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">seg</div>
                {/* Pontuação abaixo do cronômetro */}
                <div className="mt-6 flex flex-col items-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pontos</div>
                </div>
              </div>
            </div>

            {/* Pergunta e Respostas */}
            <Card className="relative md:relative p-4 md:p-6">
              <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
                {currentQuestion.question.text}
              </h2>

              {/* Respostas */}
              <div className="grid gap-2 md:gap-3">
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
                        p-3 md:p-4 text-left rounded-lg border-2 text-sm md:text-base
                        ${isSelected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}
                        ${showCorrect ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : ''}
                        ${showWrong ? 'border-error-500 bg-error-50 dark:bg-error-900/20' : ''}
                        ${!isAnswered && !isSelected ? 'bg-white dark:bg-gray-700' : ''}
                        ${!isAnswered ? 'cursor-pointer' : 'cursor-not-allowed'}
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

              {/* Timer for Mobile - appears below answers on small screens - compact version */}
              <div className="md:hidden mt-6 flex justify-center">
                <div className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 bg-white dark:bg-gray-800 ${
                  timeRemaining <= 5 
                    ? 'border-error-500 shadow-lg shadow-error-500/30' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  <Hourglass className={`w-8 h-8 ${
                    timeRemaining <= 5 
                      ? 'text-error-500' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <div className={`text-4xl font-bold tabular-nums ${
                    timeRemaining <= 5 
                      ? 'text-error-600 dark:text-error-400' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {timeRemaining}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">seg</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {motivational && (
          <div className={`fixed top-96 right-4 z-40 px-6 py-4 rounded-xl border-2 font-bold text-center text-lg animate-bounce ${
            isCorrect
              ? 'bg-gradient-to-r from-success-500 to-success-600 text-white border-success-400 shadow-lg shadow-success-500/50'
              : 'bg-gradient-to-r from-error-500 to-error-600 text-white border-error-400 shadow-lg shadow-error-500/50'
          }`}>
            {motivational}
          </div>
        )}
      </div>

      {showLoading && <LoadingOverlay />}

      {/* Anúncios intersticiais removidos. */}
      {showAddMorePrompt && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-11/12 max-w-2xl">
          <div className="mb-3 text-center">
            <div className="font-semibold">Deseja continuar?</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Assista a um anúncio para desbloquear mais 10 perguntas deste assunto.</div>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={async () => {
              setShowAddMorePrompt(false);
              // Aqui você pode implementar outra ação, se desejar
              // Se não adicionar mais perguntas, finalizar o jogo corretamente
              await finishGame();
              navigate('/results');
            }}>
              Adicionar +10 perguntas
            </Button>
            <Button variant="secondary" onClick={async () => {
              setShowAddMorePrompt(false);
              await finishGame();
              navigate('/results');
            }}>
              Finalizar jogo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
