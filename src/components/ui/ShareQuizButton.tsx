import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Share2, Copy, Check, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { sharedQuizService } from '@/services/sharedQuizService';
import { isFirebaseAvailable } from '@/services/firebase';
import type { GameQuestion } from '@/types';
import type { ShareQuizRequest } from '@/types';

interface ShareQuizButtonProps {
  questions: GameQuestion[];
  subjects?: string[];
  score?: number;
  variant?: 'default' | 'compact';
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Componente para compartilhar quiz com amigos
 * Converte o quiz atual para formato compartilhável e envia para nuvem
 */
export function ShareQuizButton({ questions, subjects = [], score, variant = 'default', onOpen, onClose }: ShareQuizButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedQuizId, setSharedQuizId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Verificar se Firebase está disponível
  const firebaseAvailable = isFirebaseAvailable();

  const handleShare = async () => {
    if (!firebaseAvailable) {
      setError(
        'Firebase não configurado. Configure uma vez seguindo SETUP_FIREBASE.md (5 minutos)'
      );
      return;
    }

    try {
      setIsSharing(true);
      setError(null);

      // Converter GameQuestion[] para SharedQuizQuestion[]
      const sharedQuestions = questions.map((q) => ({
        text: q.question.text,
        options: q.answers.map((a) => a.text),
        correctIndex: q.answers.findIndex((a) => a.isCorrect),
      }));

      console.log('🎮 Convertendo perguntas do jogo para compartilhamento...');
      console.log('📊 Total:', sharedQuestions.length);
      console.log('📝 Exemplo de pergunta convertida:', sharedQuestions[0]);

      // Obter nomes dos assuntos (se disponível)
      const topics = subjects.length > 0 ? subjects : ['Quiz Personalizado'];

      const request: ShareQuizRequest = {
        topics,
        questions: sharedQuestions,
      };

      // Enviar para a nuvem
      const response = await sharedQuizService.shareQuiz(request);

      if (!response.success) {
        setError(response.error || 'Erro ao compartilhar quiz');
        return;
      }

      // Sucesso!
      setSharedQuizId(response.id);
    } catch (err) {
      console.error('Erro ao compartilhar quiz:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!sharedQuizId) return;

    // Construir mensagem traduzida
    const url = sharedQuizService.getShareableUrl(sharedQuizId);
    let message = url;
    
    if (score !== undefined && questions.length > 0) {
      const scoreText = t('Consegui {{score}} pontos neste quiz!', { score });
      const challengeText = t('Consegue fazer melhor? Vamos ver!');
      message = `${scoreText}\n${challengeText}\n\n${url}`;
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar para área de transferência:', error);
    }
  };

  const handleWhatsApp = () => {
    if (!sharedQuizId) return;
    
    // Construir mensagem traduzida
    const url = sharedQuizService.getShareableUrl(sharedQuizId);
    let message = t('Vamos jogar este quiz?');
    
    if (score !== undefined && questions.length > 0) {
      const scoreText = t('Consegui {{score}} pontos neste quiz!', { score });
      const challengeText = t('Consegue fazer melhor? Vamos ver!');
      message = `${scoreText}\n${challengeText}`;
    }
    
    const text = encodeURIComponent(`${message}\n\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  // Se não houver perguntas, não mostrar botão
  if (!questions || questions.length === 0) {
    return null;
  }

  // Modal de compartilhamento
  if (isOpen) {
    return createPortal(
      <div className="fixed inset-0 flex items-start justify-center p-4 pt-24 overflow-y-auto" style={{ margin: 0, zIndex: 99999 }}>
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          style={{ zIndex: 1 }}
          onClick={() => {
            setIsOpen(false);
            onClose?.();
          }}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-md my-auto" style={{ zIndex: 2 }}>
          <div className="w-full max-h-[80vh] overflow-y-auto">
            <Card className="bg-white dark:bg-gray-800 relative shadow-2xl">
              {/* Botão de fechar fixo no topo */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-20 bg-white dark:bg-gray-800 shadow-sm"
                aria-label="Fechar"
              >
                ✕
              </button>
              
              <div className="p-6 pt-4 pr-14">
                {!sharedQuizId ? (
                  // Estado inicial: compartilhar
                  <>
                    <div className="text-center mb-6">
                      <Share2 className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                        {t('Compartilhar Quiz')}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {t('Compartilhe este quiz com seus amigos!')}
                      </p>
                    </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <strong>{t('Total de perguntas')}:</strong> {questions.length}
                  </p>
                  {subjects.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <strong>{t('Assuntos')}:</strong> {subjects.join(', ')}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleShare}
                  disabled={isSharing || !firebaseAvailable}
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-4 min-h-[3.5rem] h-auto"
                  size="lg"
                >
                  {isSharing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                      <span className="text-sm sm:text-base leading-tight">{t('Compartilhando...')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base leading-tight">{t('Gerar Link')}</span>
                    </div>
                  )}
                </Button>

                {!firebaseAvailable && (
                  <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Configure Firebase uma vez (5 min) para habilitar esta feature.<br/>
                    Veja: <span className="font-bold">SETUP_FIREBASE.md</span>
                  </p>
                )}
              </>
            ) : (
              // Estado de sucesso: exibir opções
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {t('Quiz Compartilhado!')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t('Escolha como deseja compartilhar')}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {t('Link de compartilhamento')}
                    </p>
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-200 truncate">
                      {sharedQuizService.getShareableUrl(sharedQuizId)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleCopyLink}
                    className="w-full py-4 min-h-[3.5rem] h-auto"
                    variant="secondary"
                    size="lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-sm sm:text-base leading-tight">{t('Link copiado!')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm sm:text-base leading-tight">{t('Copiar Link')}</span>
                        </>
                      )}
                    </div>
                  </Button>

                  <Button
                    onClick={handleWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 min-h-[3rem]"
                    size="lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm sm:text-base font-semibold">{t('WhatsApp')}</span>
                    </div>
                  </Button>
                </div>
              </>
            )}
              </div>
            </Card>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Botão para abrir modal
  if (variant === 'compact') {
    return (
      <Button
        onClick={() => {
          setIsOpen(true);
          onOpen?.();
        }}
        size="sm"
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow whitespace-nowrap flex items-center"
      >
        <Share2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
        <span className="truncate">{t('Compartilhar')}</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        setIsOpen(true);
        onOpen?.();
      }}
      size="lg"
      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-4 rounded-xl font-bold shadow-lg min-h-[3.5rem] h-auto"
    >
      <div className="flex items-center justify-center gap-2">
        <Share2 className="w-5 h-5 flex-shrink-0" />
        <span className="text-base sm:text-lg leading-tight">{t('Compartilhar Quiz')}</span>
      </div>
    </Button>
  );
}
