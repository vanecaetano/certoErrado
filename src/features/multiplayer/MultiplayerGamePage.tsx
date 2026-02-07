import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Users, Hourglass } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { multiplayerService } from '@/services/multiplayerService';
import { audioService } from '@/services/audio';
import type { MultiplayerRoom, GameQuestion } from '@/types';
import clockMusic from '@/assets/clock.mp3';

export function MultiplayerGamePage() {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [pulseClass, setPulseClass] = useState<string>('');
  const [clockAudio, setClockAudio] = useState<HTMLAudioElement | null>(null);
  const audioStartedRef = useRef(false);

  // Carregar ID do jogador
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('multiplayerPlayerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Clock audio setup - apenas uma vez
  useEffect(() => {
    const audio = new Audio(clockMusic);
    audio.loop = true;
    audio.volume = 0.15;
    let enabled = true;
    
    const tryPlay = () => {
      if (!audioStartedRef.current) {
        audioStartedRef.current = true;
        audio?.play().catch(() => {});
      }
    };
    
    setClockAudio(audio);
    
    const toggle = (e: any) => {
      enabled = e.detail;
      if (enabled) tryPlay();
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
  }, []); // Apenas montar/desmontar

  // Control clock audio
  useEffect(() => {
    if (!clockAudio) return;
    if (hasAnswered || timeRemaining > 5) {
      clockAudio.pause();
    } else if (timeRemaining <= 5) {
      clockAudio.play().catch(() => {});
    }
  }, [hasAnswered, clockAudio, timeRemaining]);

  // Listener para mudanças na sala
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = multiplayerService.onRoomChange(roomId, (updatedRoom) => {
      if (!updatedRoom) {
        navigate('/');
        return;
      }

      // Verificar se o jogador foi removido
      if (playerId && !updatedRoom.players[playerId]) {
        localStorage.removeItem('multiplayerCurrentRoomId');
        alert(t('Você foi removido da sala pelo anfitrião.'));
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }

      setRoom(updatedRoom);

      // Se jogo terminou, navegar para resultados
      if (updatedRoom.status === 'finished') {
        navigate(`/multiplayer/${roomId}/results`);
        return;
      }

      // Atualizar pergunta atual
      if (updatedRoom.currentQuestion < updatedRoom.questions.length) {
        // Se a pergunta mudou, resetar o estado
        if (updatedRoom.currentQuestion !== currentQuestionIndex) {
          setCurrentQuestionIndex(updatedRoom.currentQuestion);
          setCurrentQuestion(updatedRoom.questions[updatedRoom.currentQuestion]);
          setHasAnswered(false);
          setSelectedAnswerId(null);
          setIsCorrect(null);
          setFeedbackMessage('');
          setTimeRemaining(15);
          setPulseClass('');
          audioStartedRef.current = false; // Resetar ref do áudio para nova pergunta
        }
      } else {
        // Todas as perguntas respondidas
        if (updatedRoom.host === playerId) {
          // Host finaliza o jogo
          multiplayerService.finishGame(roomId);
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId, navigate, t, currentQuestionIndex]);

  // Timer de 15 segundos por pergunta
  useEffect(() => {
    if (!room || !roomId) return;

    const questionStartTime = room.questionStartTime || Date.now();
    const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
    const remaining = Math.max(0, 15 - elapsed);
    setTimeRemaining(remaining);

    const timer = setInterval(() => {
      const newElapsed = Math.floor((Date.now() - questionStartTime) / 1000);
      const newRemaining = Math.max(0, 15 - newElapsed);
      setTimeRemaining(newRemaining);

      // Quando o tempo acabar, avançar para próxima pergunta (apenas host)
      if (newRemaining === 0 && room.host === playerId) {
        audioService.playWrong(); // Som quando tempo acaba
        clearInterval(timer);
        setTimeout(() => {
          if (room.currentQuestion + 1 < room.questions.length) {
            multiplayerService.nextQuestion(roomId);
          } else {
            multiplayerService.finishGame(roomId);
          }
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.currentQuestion, room?.questionStartTime, roomId, playerId]);

  // Limpar pulseClass após a animação
  useEffect(() => {
    if (pulseClass) {
      const timeout = setTimeout(() => {
        setPulseClass('');
        setFeedbackMessage('');
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [pulseClass]);

  const handleAnswerSelect = (answerId: number) => {
    if (hasAnswered || !room || !currentQuestion || !roomId) return;

    // Calcular tempo de resposta
    const questionStartTime = room.questionStartTime || Date.now();
    const responseTime = Math.floor((Date.now() - questionStartTime) / 1000); // em segundos

    // Verificar se está correto
    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);
    const correct = answerId === correctAnswer?.id;

    // Mensagens motivacionais
    const successMessages = [
      t('Excelente! Continue assim!'),
      t('Mandou bem — foco e vitória!'),
      t('Ótimo acerto! Você está afiado!'),
      t('Acertou! Mantenha o ritmo!'),
      t('Boaa! Mais uma vitória!')
    ];
    
    const feedbackMsg = correct 
      ? successMessages[Math.floor(Math.random() * successMessages.length)]
      : t('Não desista — tente a próxima!');
    
    const pulse = correct ? 'animate-pulse-green' : 'animate-pulse-red';

    // Atualizar TODOS os estados de forma síncrona e atômica
    // Isso garante que hasAnswered seja true IMEDIATAMENTE, bloqueando novos cliques
    setSelectedAnswerId(answerId);
    setIsCorrect(correct);
    setPulseClass(pulse);
    setFeedbackMessage(feedbackMsg);
    setHasAnswered(true); // O useEffect vai pausar o clock audio automaticamente

    // Feedback sonoro e tátil
    if (correct) {
      audioService.playCorrectVibrant();
      audioService.vibrate([120, 40, 120]);
    } else {
      audioService.playWrong();
      audioService.vibrate(200);
    }

    // Submeter resposta de forma assíncrona (sem bloquear a UI)
    multiplayerService.submitAnswer(
      roomId,
      playerId,
      room.currentQuestion,
      correct,
      responseTime // passar tempo de resposta
    ).catch((err) => {
      console.error('Error submitting answer:', err);
    });
  };

  if (!room || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('Preparando o jogo...')}</p>
        </div>
      </div>
    );
  }

  const questionNumber = room.currentQuestion + 1;
  const totalQuestions = room.questions.length;
  const progress = (questionNumber / totalQuestions) * 100;
  const currentPlayer = room.players[playerId];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      {/* Timer Float Box - Desktop Only */}
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
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{t('seg')}</div>
          {/* Pontuação abaixo do cronômetro */}
          <div className="mt-6 flex flex-col items-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{currentPlayer?.score || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('Pontos')}</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('Pergunta')} {questionNumber} {t('de')} {totalQuestions}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className={`flex items-center gap-1 font-bold ${
                timeRemaining <= 5 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-gray-600 dark:text-gray-400'
              }`}>
                ⏱️ {timeRemaining}s
              </span>
              <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-bold">
                <Trophy className="w-4 h-4" />
                {currentPlayer?.score || 0}
              </span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                {Object.keys(room.players).length}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8">
          {/* Mobile Timer */}
          <div className="md:hidden mb-6">
            <div className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 bg-white dark:bg-gray-800 ${
              timeRemaining <= 5 
                ? 'border-error-500 shadow-lg shadow-error-500/20' 
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
              <div className="text-xs text-gray-600 dark:text-gray-400">{t('seg')}</div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center leading-relaxed">
            {currentQuestion.question.text}
          </h2>

          {/* Answers */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => {
              const isSelected = selectedAnswerId === answer.id;
              const showCorrect = hasAnswered && answer.isCorrect;
              const showWrong = hasAnswered && isSelected && !answer.isCorrect;
              const isPulsing = isSelected && pulseClass;

              return (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={hasAnswered}
                  className={`
                    w-full p-4 text-left rounded-lg border-2 text-lg transition-all
                    ${isPulsing ? pulseClass : ''}
                    ${!hasAnswered ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer' : ''}
                    ${isSelected && !hasAnswered ? 'border-primary-500' : ''}
                    ${showCorrect ? 'border-success-500 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300' : ''}
                    ${showWrong ? 'border-error-500 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300' : ''}
                    ${hasAnswered ? 'cursor-not-allowed' : ''}
                  `}
                >
                  {answer.text}
                  {showCorrect && (
                    <span className="ml-2 text-success-600 dark:text-success-400">✓</span>
                  )}
                  {showWrong && (
                    <span className="ml-2 text-error-600 dark:text-error-400">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Message - Mobile */}
          {feedbackMessage && (
            <div className={`md:hidden mt-6 p-4 rounded-lg text-center font-semibold ${
              isCorrect
                ? 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300'
                : 'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300'
            }`}>
              {feedbackMessage}
            </div>
          )}

          {/* Waiting Message */}
          {hasAnswered && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {t('Aguarde os outros jogadores responderem...')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {t('Próxima pergunta em')} {timeRemaining} {t('segundos')}
              </p>
            </div>
          )}
        </Card>

        {/* Players Mini List */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {t('Jogadores na sala')}:
            </span>
            <div className="flex gap-2">
              {Object.entries(room.players).map(([id, player]) => (
                <div
                  key={id}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    player.currentQuestion > room.currentQuestion
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  title={player.name}
                >
                  {player.name.charAt(0).toUpperCase()} - {player.score}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Motivational Message */}
      {feedbackMessage && (
        <div className={`hidden md:block fixed top-96 right-4 z-40 px-6 py-4 rounded-xl border-2 font-bold text-center text-lg animate-bounce ${
          isCorrect
            ? 'bg-gradient-to-r from-success-500 to-success-600 text-white border-success-400 shadow-lg shadow-success-500/50'
            : 'bg-gradient-to-r from-error-500 to-error-600 text-white border-error-400 shadow-lg shadow-error-500/50'
        }`}>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
}
