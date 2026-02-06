import { useState, useEffect } from 'react';
import { Play, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { dbService } from '@/services/database';
import { useGameStore } from '@/store/gameStore';
import type { Subject } from '@/types';
import startSound from '@/assets/start.mp3';

export function HomePage() {

    // Ativa música de fundo ao dar scroll na lista de assuntos
    useEffect(() => {
      const handleScroll = () => {
        const audio = (window as any).backgroundAudio as HTMLAudioElement | undefined;
        if (audio && audio.paused) {
          audio.play().catch(() => {});
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    const loadSubjects = async () => {
      const allSubjects = await dbService.getAllSubjectsAsync();
      // Filtrar para não exibir o assunto "Modo Relâmpago"
      const filtered = allSubjects.filter(s => s.name.trim().toLowerCase() !== 'modo relâmpago');
      setSubjects(filtered);

      if (filtered.length === 0) {
        navigate('/settings');
      }
    };
    loadSubjects();
  }, [navigate]);

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleStartGame = async () => {
    if (selectedSubjects.length === 0) {
      alert('Selecione pelo menos um assunto para começar!');
      return;
    }
    // Tocar som de início
    const audio = new Audio(startSound);
    audio.play().catch(() => {});

    // Buscar todas as perguntas de todos os assuntos selecionados
    let allQuestions: any[] = [];
    for (const subjectId of selectedSubjects) {
      const questions = await dbService.getRandomQuestionsBySubject(subjectId, 1000); // 1000 = todas
      allQuestions = allQuestions.concat(questions.map(q => ({ ...q, subjectId })));
    }
    // Embaralhar todas as perguntas
    allQuestions = allQuestions.sort(() => Math.random() - 0.5);

    // Montar config para o gameStore
    const config = {
      subjects: selectedSubjects.map((subjectId) => ({ subjectId, questionCount: 0 })),
      allQuestions,
    };

    await initializeGame(config);
    navigate('/game');
  };

  if (subjects.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Card>
          <p className="text-lg mb-4">Nenhum assunto cadastrado ainda.</p>
          <Button onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4 mr-2 inline" />
            Ir para Configurações
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-3xl font-bold mb-6 text-center">Selecione os Assuntos</h2>

        <div className="grid gap-4 mb-6">
          {subjects.map((subject) => {
            const isSelected = selectedSubjects.includes(subject.id);
            return (
              <Card
                key={subject.id}
                className={
                  `transition-all duration-150 cursor-pointer ` +
                  (isSelected
                    ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 '
                    : 'hover:ring-2 hover:ring-primary-300 hover:bg-primary-100/40 dark:hover:bg-primary-900/10')
                }
                onClick={() => handleSubjectToggle(subject.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.questionCount} perguntas disponíveis
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="w-5 h-5 accent-primary-600 ml-2 pointer-events-none"
                    aria-label={`Selecionar assunto ${subject.name}`}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="secondary" onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4 mr-2 inline" />
            Configurações
          </Button>
          <Button onClick={handleStartGame} disabled={selectedSubjects.length === 0}>
            <Play className="w-4 h-4 mr-2 inline" />
            Iniciar Jogo
          </Button>
        </div>
      </div>
    </>
  );
}
