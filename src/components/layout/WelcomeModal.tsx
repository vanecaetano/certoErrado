import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface WelcomeModalProps {
  onComplete: (name: string) => void;
}

export function WelcomeModal({ onComplete }: WelcomeModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Verificar se já mostrou o modal de boas-vindas
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const savedName = localStorage.getItem('playerName');
    
    // Se nunca viu o modal OU não tem nome salvo, mostrar
    if (!hasSeenWelcome || !savedName) {
      setTimeout(() => setShow(true), 500); // Delay para animação
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || `Player${Math.floor(1000 + Math.random() * 9000)}`;
    
    localStorage.setItem('playerName', finalName);
    localStorage.setItem('hasSeenWelcome', 'true');
    
    setShow(false);
    onComplete(finalName);
  };

  const handleSkip = () => {
    const defaultName = `Player${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('playerName', defaultName);
    localStorage.setItem('hasSeenWelcome', 'true');
    setShow(false);
    onComplete(defaultName);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-scaleIn">
        {/* Ícone de Boas-vindas */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full p-4">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-transparent bg-clip-text">
          {t('Bem-vindo!')}
        </h2>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {t('Como você gostaria de ser chamado no ranking?')}
        </p>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('Digite seu nome') + ' (opcional)'}
              maxLength={20}
              className="text-center text-lg"
              autoFocus
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
              {t('Você pode mudar depois no ranking')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSkip}
              className="flex-1"
            >
              {t('Pular')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              {t('Começar')} 🎮
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
