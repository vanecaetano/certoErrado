import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { dbService } from '@/services/database';
import { aiService } from '@/services/aiService';
import type { Subject } from '@/types';
import { getConsent, clearConsent } from '@/services/consent';

export function SettingsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    const allSubjects = await dbService.getAllSubjectsAsync();
    setSubjects(allSubjects);
  };

  const navigate = useNavigate();

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      setError('Por favor, insira um nome para o assunto');
      return;
    }

    setError(null);
    setLoading(newSubject);

    try {
      // Gerar 50 perguntas usando IA
      await aiService.generateQuestionsForSubject(newSubject.trim(), 50);
      
      // Atualizar lista de assuntos
      await loadSubjects();
      setNewSubject('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar perguntas');
      console.error('Erro:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este assunto e todas as suas perguntas?')) {
      await dbService.deleteSubject(id);
      await loadSubjects();
    }
  };

  const [consentState, setConsentState] = useState<'granted'|'denied'|'unknown'>(() => getConsent());

  const handleRevokeConsent = () => {
    if (!confirm('Deseja revogar o consentimento para anúncios? Isso fará com que os anúncios parem de ser exibidos.')) return;
    clearConsent();
    setConsentState('unknown');
    // reload to ensure ad scripts stop / placeholders appear
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-3xl font-bold mb-6">Configurações de Assuntos</h2>

      <Card className="mb-6">
        <div className="mb-4">
          <Button variant="secondary" size="sm" onClick={() => navigate('/') }>
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Voltar
          </Button>
        </div>
        <h3 className="text-xl font-semibold mb-4">Adicionar Novo Assunto</h3>
        <div className="flex gap-4">
          <Input
            label="Nome do Assunto"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Ex: JavaScript, React, TypeScript..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
            disabled={!!loading}
          />
          <div className="flex items-end">
            <Button
              onClick={handleAddSubject}
              disabled={!!loading || !newSubject.trim()}
            >
              {loading === newSubject ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                  Gerando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded text-error-700 dark:text-error-400">
            {error}
          </div>
        )}
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Ao adicionar um assunto, serão geradas automaticamente 50 perguntas sobre o tema usando IA.
          Isso pode levar alguns minutos.
        </p>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold mb-2">Privacidade e anúncios</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Status do consentimento: <strong>{consentState}</strong></p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.open('/privacy', '_blank')}>Política de Privacidade</Button>
            <Button variant="danger" size="sm" onClick={handleRevokeConsent}>Revogar consentimento</Button>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Assuntos Cadastrados</h3>
        {subjects.length === 0 ? (
          <Card>
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              Nenhum assunto cadastrado. Adicione um assunto para começar!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{subject.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.questionCount} perguntas disponíveis
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Criado em: {new Date(subject.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="p-2 text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 rounded transition-colors"
                    aria-label="Excluir assunto"
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
