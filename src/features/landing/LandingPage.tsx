import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, Brain, Trophy, Shield } from 'lucide-react';
import { dbService } from '@/services/database';

export function LandingPage() {
  const navigate = useNavigate();
  const [hasSubjects, setHasSubjects] = useState(false);

  useEffect(() => {
    const checkSubjects = async () => {
      const subjects = await dbService.getAllSubjectsAsync();
      setHasSubjects(subjects.length > 0);
    };

    checkSubjects();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Certo ou <span className="text-primary-600">Errado?</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          O jogo inteligente que desafia seu conhecimento! 🎮
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Escolha entre qualquer assunto que desejar! Tecnologia, história, esportes, culinária, séries, ou tudo que você imaginar. Ganhe pontos respondendo corretamente e desbloqueie mais perguntas!
        </p>

        {/* Modo Relâmpago e Personalizado - Highlighted Cards */}
        <div className="mb-16 grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Modo Relâmpago Card */}
          <Card className="border-2 border-primary-600 p-8">
            <div className="flex justify-center mb-6">
              <Zap className="w-16 h-16 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-primary-600">Modo Relâmpago</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Jogue agora com 30 perguntas gerais aleatórias! Rápido, desafiador e divertido.
            </p>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/play')}
            >
              ⚡ Começar
            </Button>
          </Card>

          {/* Personalizado Card */}
          <Card className="border-2 border-success-600 p-8">
            <div className="flex justify-center mb-6">
              <Brain className="w-16 h-16 text-success-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-success-600">Personalizado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crie seus próprios assuntos! Escolha os temas que você ama e desafie seu conhecimento.
            </p>
            <Button 
              size="lg" 
              className="w-full bg-success-600 hover:bg-success-700"
              onClick={() => navigate('/settings')}
            >
              📚 Criar Assuntos
            </Button>
          </Card>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="flex items-start gap-4">
          <Brain className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Assuntos do Seu Jeito</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Crie perguntas sobre QUALQUER coisa que você quiser! Tecnologia, história, culinária, filmes, esportes... A IA gera 10 perguntas únicas e desafiadoras em segundos. Sem limites, sem restrições!
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Modo Relâmpago</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comece automaticamente com um assunto aleatório! Ideal para quando você quer jogar rápido sem escolher.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <Trophy className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Sistema de Pontos</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ganhe 10 pontos por acerto! Estude facilmente para provas ou apenas divirta-se com seus amigos!
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Gratuito & Seguro</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Totalmente gratuito! Mantido por anúncios discretos. Seus dados são protegidos e armazenados apenas no seu navegador.
            </p>
          </div>
        </Card>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Como Funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">1</div>
            <h4 className="text-xl font-semibold mb-2">Crie Qualquer Assunto</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Pense em um assunto que você adora: JS, culinária, história da arte, estrela de cinema favorita... Coloque o nome e em segundos a IA cria 10 perguntas incríveis sobre isso!
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">2</div>
            <h4 className="text-xl font-semibold mb-2">Selecione & Jogue</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha seus assuntos, defina a quantidade de perguntas e comece a jogar! Responda certo para ganhar pontos.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">3</div>
            <h4 className="text-xl font-semibold mb-2">Desbloqueie Mais</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Terminou as 10 primeiras? Assista um rápido anúncio para desbloquear mais 10 perguntas do mesmo assunto!
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {hasSubjects ? 'Comece a jogar ou crie novos assuntos!' : 'Crie seus primeiros assuntos!'}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {hasSubjects && (
            <Button size="lg" onClick={() => navigate('/play')}>
              🎮 Começar a Jogar
            </Button>
          )}
          <Button size="lg" variant="secondary" onClick={() => navigate('/settings')}>
            ⚙️ {hasSubjects ? 'Gerenciar' : 'Criar'} Assuntos
          </Button>
        </div>
      </div>
    </div>
  );
}
