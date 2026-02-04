import { useState, useEffect } from 'react';
import { Play, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { dbService } from '@/services/database';
import { useGameStore } from '@/store/gameStore';
import type { Subject } from '@/types';

export function HomePage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Map<number, number>>(new Map());
  const initializeGame = useGameStore((state) => state.initializeGame);

  useEffect(() => {
    const loadSubjects = async () => {
      const allSubjects = await dbService.getAllSubjectsAsync();
      setSubjects(allSubjects);

      if (allSubjects.length === 0) {
        // Redirecionar para configurações se não houver assuntos
        navigate('/settings');
      }
    };
    loadSubjects();
  }, [navigate]);

  const handleSubjectToggle = (subjectId: number) => {
    const newSelection = new Map(selectedSubjects);
    if (newSelection.has(subjectId)) {
      newSelection.delete(subjectId);
    } else {
      newSelection.set(subjectId, 50); // Default: 50 perguntas
    }
    setSelectedSubjects(newSelection);
  };

  const handleQuestionCountChange = (subjectId: number, count: number) => {
    const newSelection = new Map(selectedSubjects);
    newSelection.set(subjectId, Math.max(1, Math.min(count, 50)));
    setSelectedSubjects(newSelection);
  };

  const handleStartGame = async () => {
    if (selectedSubjects.size === 0) {
      alert('Selecione pelo menos um assunto para começar!');
      return;
    }

    const config = {
      subjects: Array.from(selectedSubjects.entries()).map(([subjectId, questionCount]) => ({
        subjectId,
        questionCount,
      })),
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Selecione os Assuntos</h2>

      <div className="grid gap-4 mb-6">
        {subjects.map((subject) => {
          const isSelected = selectedSubjects.has(subject.id);
          const questionCount = selectedSubjects.get(subject.id) || 50;

          return (
            <Card
              key={subject.id}
              onClick={() => handleSubjectToggle(subject.id)}
              className={isSelected ? 'ring-2 ring-primary-500' : ''}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{subject.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {subject.questionCount} perguntas disponíveis
                  </p>
                </div>
                {isSelected && (
                  <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <label className="text-sm">Quantidade:</label>
                    <input
                      type="number"
                      min="1"
                      max={Math.min(subject.questionCount, 50)}
                      value={questionCount}
                      onChange={(e) =>
                        handleQuestionCountChange(subject.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
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
        <Button onClick={handleStartGame} disabled={selectedSubjects.size === 0}>
          <Play className="w-4 h-4 mr-2 inline" />
          Iniciar Jogo
        </Button>
      </div>
    </div>
  );
}
