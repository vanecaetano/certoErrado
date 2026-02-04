import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { dbService } from '@/services/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Home, Trophy } from 'lucide-react';
import type { PerformanceData } from '@/types';

const COLORS = ['#0ea5e9', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

export function ResultsPage() {
  const navigate = useNavigate();
  const { questions, score, config, resetGame } = useGameStore();

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    const loadPerformanceData = async () => {
      const data: PerformanceData[] = [];

      for (const { subjectId } of config.subjects) {
        const subject = await dbService.getSubjectByIdAsync(subjectId);
        if (!subject) continue;

        const stats = await dbService.getPerformanceBySubject(subjectId);
        data.push({
          subjectId,
          subjectName: subject.name,
          ...stats,
        });
      }

      setPerformanceData(data);
    };

    loadPerformanceData();
  }, [config]);

  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const chartData = performanceData.map((d) => ({
    name: d.subjectName,
    acertos: d.correctAnswers,
    erros: d.totalQuestions - d.correctAnswers,
    precisão: Number(d.accuracy.toFixed(1)),
  }));

  const pieData = performanceData.map((d) => ({
    name: d.subjectName,
    value: d.totalQuestions,
  }));

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-primary-600 dark:text-primary-400" />
        <h2 className="text-3xl font-bold mb-2">Resultados do Jogo</h2>
        <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
          {score} / {totalQuestions}
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Precisão: {accuracy.toFixed(1)}%
        </p>
      </div>

      {performanceData.length > 0 && (
        <>
          <Card className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Performance por Assunto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="acertos" fill="#22c55e" name="Acertos" />
                <Bar dataKey="erros" fill="#ef4444" name="Erros" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <h3 className="text-xl font-semibold mb-4">Precisão por Assunto</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="precisão" fill="#0ea5e9" name="Precisão (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold mb-4">Distribuição de Perguntas</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Estatísticas Detalhadas</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {performanceData.map((data) => (
                <div
                  key={data.subjectId}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <h4 className="font-semibold mb-2">{data.subjectName}</h4>
                  <div className="space-y-1 text-sm">
                    <p>Total de perguntas: {data.totalQuestions}</p>
                    <p>Acertos: {data.correctAnswers}</p>
                    <p>Precisão: {data.accuracy.toFixed(1)}%</p>
                    <p>Pontuação média: {data.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={() => navigate('/')}>
          <Home className="w-4 h-4 mr-2 inline" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
