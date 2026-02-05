import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, Brain, Trophy, Shield } from 'lucide-react';
import { dbService } from '@/services/database';
import startSound from '@/assets/start.mp3';

export function LandingPage() {
  const [hasSubjects, setHasSubjects] = useState(false);
  const navigate = useNavigate();
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

        {/* Cards de Destaque: Relâmpago, Personalizado e Iniciar Jogo */}
        <div className="mb-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
  {/* Modo Relâmpago Card */}
  <Card className="border-2 border-primary-600 p-8 flex flex-col justify-between items-stretch">
    <div className="flex justify-center mb-6">
      <Zap className="w-16 h-16 text-primary-600" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-primary-600 text-center">Modo Relâmpago</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
      Jogue agora com 30 perguntas gerais aleatórias! Rápido, desafiador e divertido.
    </p>
    <div className="mt-auto">
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl"
        onClick={async () => {
          // Tenta iniciar a música de fundo ao clicar
          const evt = new Event('click');
          window.dispatchEvent(evt);
          // Tocar som de início e aguardar terminar
          try {
            const audio = new Audio(startSound);
            await new Promise<void>((resolve) => {
              audio.play().catch(resolve);
              audio.onended = () => resolve();
              // fallback: se o som for muito curto ou falhar, segue após 1.5s
              setTimeout(resolve, 1500);
            });
          } catch {}
          // Buscar o assunto Relâmpago
          const subjects = await dbService.getAllSubjectsAsync();
          const relampago = subjects.find(s => s.name.trim().toLowerCase() === 'modo relâmpago');
          if (!relampago) {
            alert('O assunto Relâmpago não foi encontrado. Crie um assunto chamado "Modo Relâmpago" nas configurações.');
            return;
          }
          // Buscar perguntas do Relâmpago
          const questions = await dbService.getRandomQuestionsBySubject(relampago.id, 30);
          if (!questions.length) {
            alert('O assunto Relâmpago não possui perguntas.');
            return;
          }
          // Montar config e iniciar jogo
          const { useGameStore } = await import('@/store/gameStore');
          await useGameStore.getState().initializeGame({
            subjects: [{ subjectId: relampago.id, questionCount: 30 }],
            allQuestions: questions.map(q => ({ ...q, subjectId: relampago.id })),
          } as any);
          navigate('/game');
        }}
      >
        ⚡ Começar
      </Button>
    </div>
  </Card>

  {/* Personalizado Card */}
  <Card className="border-2 border-success-600 p-8 flex flex-col justify-between items-stretch">
    <div className="flex justify-center mb-6">
      <Brain className="w-16 h-16 text-success-600" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-success-600 text-center">Personalizado</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
      Crie seus próprios assuntos! Escolha os temas que você ama e desafie seu conhecimento.
    </p>
    <div className="mt-auto">
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl bg-success-600 hover:bg-success-700"
        onClick={() => navigate('/settings')}
      >
        <span className="block whitespace-nowrap">📚 Criar Assuntos</span>
      </Button>
    </div>
  </Card>

  {/* Iniciar Jogo Card */}
  <Card className="border-2 border-warning-600 p-8 flex flex-col justify-between items-stretch">
    <div className="flex justify-center mb-6">
      <Trophy className="w-16 h-16 text-warning-600" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-warning-600 text-center">Iniciar Jogo</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
      Selecione seus assuntos favoritos e comece a jogar agora mesmo!
    </p>
    <div className="mt-auto">
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white"
        onClick={() => navigate('/play')}
      >
        <span className="block whitespace-nowrap">🎮 Iniciar Jogo</span>
      </Button>
    </div>
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
              Pense em um assunto que você adora: Filmes, Culinária, História da arte, Estrela de cinema favorita... e em segundos a IA cria perguntas incríveis sobre isso!
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">2</div>
            <h4 className="text-xl font-semibold mb-2">Selecione & Jogue</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha seus assuntos e comece a jogar! Responda certo para ganhar pontos.
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">3</div>
            <h4 className="text-xl font-semibold mb-2">Divirta-se e Compartilhe</h4>
            <p className="text-gray-600 dark:text-gray-400">
              Jogue sozinho ou desafie amigos! Compare pontuações, descubra curiosidades e torne cada rodada uma experiência divertida e social.
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
