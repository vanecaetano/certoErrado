import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, Brain, Trophy, Shield, Users } from 'lucide-react';
import { dbService } from '@/services/database';
import startSound from '@/assets/start.mp3';

export function LandingPage() {
    const { t } = useTranslation();
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
          {t('Certo ou Errado?')}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          {t('O jogo inteligente que desafia seu conhecimento! 🎮')}
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          {t('Escolha entre qualquer assunto que desejar! Tecnologia, história, esportes, culinária, séries, ou tudo que você imaginar. Ganhe pontos respondendo corretamente e desbloqueie mais perguntas!')}
        </p>

        {/* Cards de Destaque: Relâmpago, Personalizado e Multiplayer */}
        <div className="mb-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
  {/* Modo Relâmpago Card */}
  <Card className="border-2 border-primary-600 p-8 flex flex-col justify-between items-stretch">
    <div className="flex justify-center mb-6">
      <Zap className="w-16 h-16 text-primary-600" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-primary-600 text-center">{t('Modo Relâmpago')}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
      {t('Jogue agora com 30 perguntas gerais aleatórias! Rápido, desafiador e divertido.')}
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
            alert(t('O assunto Relâmpago não foi encontrado. Crie um assunto chamado "Modo Relâmpago" nas configurações.'));
            return;
          }
          // Buscar perguntas do Relâmpago
          const questions = await dbService.getRandomQuestionsBySubject(relampago.id, 30);
          if (!questions.length) {
            alert(t('O assunto Relâmpago não possui perguntas.'));
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
        {t('⚡ Começar')}
      </Button>
    </div>
  </Card>

  {/* Personalizado Card */}
  <Card className="border-2 border-success-600 p-8 flex flex-col justify-between items-stretch">
    <div className="flex justify-center mb-6">
      <Brain className="w-16 h-16 text-success-600" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-success-600 text-center">{t('Personalizado')}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
      {t('Crie seus próprios assuntos! Escolha os temas que você ama e desafie seu conhecimento.')}
    </p>
    <div className="mt-auto">
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl bg-success-600 hover:bg-success-700"
        onClick={() => navigate('/settings')}
      >
        {t('📚 Criar Assuntos')}
      </Button>
    </div>
  </Card>

  {/* Multiplayer Card */}
  <Card className="border-2 border-purple-600 p-8 flex flex-col justify-between items-stretch">
    <div className="flex justify-center mb-6">
      <Users className="w-16 h-16 text-purple-600" />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-purple-600 text-center">{t('Jogar com Amigos')}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
      {t('Jogue simultaneamente com seus amigos e veja quem sabe mais!')}
    </p>
    <div className="mt-auto">
      <Button
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-xl bg-purple-600 hover:bg-purple-700"
        onClick={() => navigate('/multiplayer/create')}
      >
        {t('Jogar Online')}
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
            <h3 className="text-xl font-semibold mb-2">{t('Assuntos do Seu Jeito')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Crie perguntas sobre QUALQUER coisa que você quiser! Tecnologia, história, culinária, filmes, esportes... A IA gera 10 perguntas únicas e desafiadoras em segundos!')}
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('Modo Relâmpago')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Comece automaticamente com um assunto aleatório! Ideal para quando você quer jogar rápido sem escolher.')}
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <Trophy className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('Sistema de Pontos')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Ganhe 10 pontos por acerto! Estude facilmente para provas ou apenas divirta-se com seus amigos!')}
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-xl font-semibold mb-2">{t('Gratuito & Seguro')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Totalmente gratuito! Seus dados são protegidos e armazenados apenas no seu navegador.')}
            </p>
          </div>
        </Card>
      </div>

      {/* How It Works */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">{t('Como Funciona')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">1</div>
            <h4 className="text-xl font-semibold mb-2">{t('Crie Qualquer Assunto')}</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Pense em um assunto que você adora: Filmes, Culinária, História da arte, Estrela de cinema favorita... e em segundos a IA cria perguntas incríveis sobre isso!')}
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">2</div>
            <h4 className="text-xl font-semibold mb-2">{t('Selecione & Jogue')}</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Escolha seus assuntos e comece a jogar! Responda certo para ganhar pontos.')}
            </p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-3">3</div>
            <h4 className="text-xl font-semibold mb-2">{t('Divirta-se e Compartilhe')}</h4>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Jogue sozinho ou desafie amigos! Compare pontuações, descubra curiosidades e torne cada rodada uma experiência divertida e social.')}
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">{t('Pronto para Começar?')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          {hasSubjects ? t('Comece a jogar ou crie novos assuntos!') : t('Crie seus primeiros assuntos!')}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {hasSubjects && (
            <Button size="lg" onClick={() => navigate('/play')}>
              {t('🎮 Começar a Jogar')}
            </Button>
          )}
          <Button size="lg" variant="secondary" onClick={() => navigate('/settings')}>
            {hasSubjects ? t('⚙️ Gerenciar Assuntos') : t('⚙️ Criar Assuntos')}
          </Button>
        </div>
      </div>
    </div>
  );
}
