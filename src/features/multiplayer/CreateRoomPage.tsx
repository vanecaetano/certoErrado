import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, User, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { multiplayerService } from '@/services/multiplayerService';
import { dbService } from '@/services/database';
import type { GameQuestion, Subject } from '@/types';

export function CreateRoomPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [roomName, setRoomName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [questionsCount, setQuestionsCount] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Carregar assuntos disponíveis
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setIsLoading(true);
        const subjects = await dbService.getAllSubjectsAsync();
        // Filtrar modo relâmpago
        const filteredSubjects = subjects.filter(s => s.name !== 'Modo Relâmpago');
        setAvailableSubjects(filteredSubjects);
        
        // Selecionar apenas o primeiro desafio por padrão
        if (filteredSubjects.length > 0) {
          setSelectedSubjects([filteredSubjects[0].id]);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Toggle seleção de assunto
  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Paginação
  const totalPages = Math.ceil(availableSubjects.length / itemsPerPage);
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return availableSubjects.slice(startIndex, endIndex);
  }, [availableSubjects, currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError(t('Digite o nome da sala'));
      return;
    }
    if (!playerName.trim()) {
      setError(t('Digite seu nome para entrar'));
      return;
    }
    if (selectedSubjects.length === 0) {
      setError(t('Selecione pelo menos um desafio'));
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Gerar ID único do jogador
      const playerId = multiplayerService.generatePlayerId();
      
      // Sair de qualquer sala anterior
      const oldPlayerId = localStorage.getItem('multiplayerPlayerId');
      if (oldPlayerId) {
        await multiplayerService.leaveCurrentRoom(oldPlayerId);
      }
      
      // Armazenar no localStorage
      localStorage.setItem('multiplayerPlayerId', playerId);
      localStorage.setItem('multiplayerPlayerName', playerName.trim());

      // Carregar perguntas dos assuntos selecionados
      const allQuestions: GameQuestion[] = [];
      const subjectNames: string[] = [];
      
      for (const subjectId of selectedSubjects) {
        const subject = availableSubjects.find(s => s.id === subjectId);
        if (subject) {
          subjectNames.push(subject.name);
        }
        
        const questions = await dbService.getRandomQuestionsBySubject(subjectId, 50);
        
        for (const question of questions) {
          const answers = await dbService.getAnswersByQuestionId(question.id);
          
          // Embaralhar as respostas para cada pergunta
          const shuffledAnswers = answers.sort(() => Math.random() - 0.5);
          
          allQuestions.push({
            question,
            answers: shuffledAnswers
          });
        }
      }

      if (allQuestions.length === 0) {
        setError('Nenhuma pergunta disponível nos assuntos selecionados.');
        setIsCreating(false);
        return;
      }

      // Embaralhar e selecionar perguntas
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      const roomQuestions = shuffled.slice(0, Math.min(questionsCount, shuffled.length));

      // Criar a sala
      const roomId = await multiplayerService.createRoom(
        playerId,
        playerName.trim(),
        roomQuestions,
        maxPlayers,
        roomName.trim(),
        subjectNames
      );

      // Salvar roomId no localStorage
      localStorage.setItem('multiplayerCurrentRoomId', roomId);

      // Navegar para o lobby
      navigate(`/multiplayer/${roomId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(t('Erro ao entrar na sala'));
    } finally {
      setIsCreating(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('Preparando o jogo...')}</p>
        </div>
      </div>
    );
  }

  // No subjects available (excluding lightning mode)
  if (availableSubjects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('Cadastre Desafios personalizados')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('O multiplayer usa Desafios personalizados. Crie pelo menos um assunto nas Configurações para continuar.')}
          </p>
          <Button onClick={() => navigate('/settings')} className="w-full">
            {t('Ir para Desafios')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('Criar Nova Sala')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('Desafie seus amigos e vejam quem é o melhor!')}
          </p>
        </div>

        {/* Form */}
        <Card className="p-6 space-y-6">
          {/* Nome da Sala */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Nome da Sala')}
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, ''))}
                placeholder={t('Ex: Desafio dos Amigos')}
                className="pl-10"
                maxLength={50}
              />
            </div>
          </div>

          {/* Seu Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Seu Nome')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.replace(/[^a-zA-Z0-9\u00C0-\u017F\s]/g, ''))}
                placeholder={t('Ex: João')}
                className="pl-10"
                maxLength={30}
              />
            </div>
          </div>

          {/* Número de Jogadores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Número Máximo de Jogadores')}
            </label>
            <Input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Math.min(20, Math.max(2, parseInt(e.target.value) || 2)))}
              min={2}
              max={20}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              2-20 {t('jogadores')}
            </p>
          </div>

          {/* Seleção de Assuntos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <BookOpen className="inline-block w-4 h-4 mr-1" />
              {t('Selecione os Desafios')} ({selectedSubjects.length} {t('selecionados')})
            </label>
            <div className="space-y-3">
              {paginatedSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                return (
                  <Card
                    key={subject.id}
                    className={
                      `transition-all duration-150 cursor-pointer p-4 ` +
                      (isSelected
                        ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 '
                        : 'hover:ring-2 hover:ring-primary-300 hover:bg-primary-100/40 dark:hover:bg-primary-900/10')
                    }
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {t('perguntas disponíveis', { count: subject.questionCount })}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('Anterior')}
                </button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('Página')} {currentPage}/{totalPages}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('Próxima')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Número de Perguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('Quantas Perguntas?')}
            </label>
            <Input
              type="number"
              value={questionsCount}
              onChange={(e) => setQuestionsCount(Math.min(30, Math.max(5, parseInt(e.target.value) || 10)))}
              min={5}
              max={30}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              5-30 {t('perguntas')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              className="w-full sm:flex-1"
            >
              {t('Voltar')}
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full sm:flex-1 text-sm sm:text-base"
            >
              {isCreating ? t('Criando sala...') : (
                <>
                  <span className="hidden sm:inline">{t('Criar e Compartilhar')}</span>
                  <span className="sm:hidden">{t('Criar Sala')}</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
