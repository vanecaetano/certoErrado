import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, Home, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { dbService } from '@/services/database';
import { aiService } from '@/services/aiService';
import type { Subject } from '@/types';

export function SettingsPage() {
    const { t, i18n } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const allSubjects = await dbService.getAllSubjectsAsync();
    // Filtrar para não exibir o assunto "Relâmpago"
    const filtered = allSubjects.filter(s => s.name.toLowerCase() !== 'relâmpago' && s.name.toLowerCase() !== 'relampago');
    setSubjects(filtered);
  };

  const navigate = useNavigate();

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      setError(t('Por favor, insira um nome para o desafio'));
      return;
    }

    setError(null);
    setLoading(newSubject);

    try {
      // Gerar 10 perguntas usando IA
      await aiService.generateQuestionsForSubject(newSubject.trim(), 10);
      // Atualizar lista de assuntos
      await loadSubjects();
      setNewSubject('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Erro ao gerar perguntas'));
      console.error('Erro:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (confirm(t('Tem certeza que deseja excluir este desafio e todas as suas perguntas?'))) {
      await dbService.deleteSubject(id);
      await loadSubjects();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-3xl font-bold mb-6">{t('Configurações de Desafios')}</h2>
      {/* Botão Iniciar Jogo acima do card de adicionar assunto */}
      {subjects.length > 0 && (
        <div className="mb-6 flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/play')}
          >
            <Play className="w-5 h-5 mr-2 inline" />
            {t('Iniciar Jogo')}
          </Button>
        </div>
      )}
      
      {/* Botão Voltar */}
      <div className="mb-6">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          {t('Voltar ao Início')}
        </Button>
      </div>

      <Card className="mb-6">
        <h3 className="text-xl font-semibold mb-4">{t('Adicionar Novo Desafio')}</h3>
        <div className="flex gap-4 items-end">
          <Input
            label={t('Nome do Desafio')}
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder={t('Ex: Filmes, Ciências, Esportes...')}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            disabled={!!loading}
          />
          <Button
            onClick={handleAddSubject}
            disabled={!!loading || !newSubject.trim()}
          >
            {loading === newSubject ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                {t('Gerando...')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2 inline" />
                {t('Adicionar')}
              </>
            )}
          </Button>
        </div>
        {error && (
          <div className="text-red-600 mt-2 text-sm">{error}</div>
        )}
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {t('Ao adicionar um desafio, serão geradas automaticamente 10 perguntas sobre o tema usando IA. Isso pode levar alguns minutos.')}
        </p>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">{t('Desafios Cadastrados')}</h3>
        {subjects.length === 0 ? (
          <Card>
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              {t('Nenhum desafio cadastrado. Adicione um desafio para começar!')}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjects
              .filter(subject => subject.name.trim().toLowerCase() !== 'modo relâmpago')
              .map((subject) => (
                <Card key={subject.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">{subject.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('perguntas disponíveis', { count: subject.questionCount })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {t('Criado em')}: {new Date(subject.createdAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : i18n.language === 'de' ? 'de-DE' : 'pt-BR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="p-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded transition-colors"
                      aria-label={t('Excluir desafio')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
