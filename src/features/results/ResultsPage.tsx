import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useGameStore } from '@/store/gameStore';
import { dbService } from '@/services/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Home, Trophy } from 'lucide-react';
import type { PerformanceData } from '@/types';



export function ResultsPage() {
  const navigate = useNavigate();
  const { questions, score, config, resetGame } = useGameStore();

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  // Se houver dados da sessão atual, use-os para o gráfico e placar
  let totalQuestions = questions.length;
  let sessionScore = score;
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

  let sessionAccuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  // Se não houver dados da sessão atual, use o agregado do banco
  if (totalQuestions === 0 && performanceData.length > 0) {
    totalQuestions = performanceData.reduce((sum, d) => sum + d.totalQuestions, 0);
    sessionScore = performanceData.reduce((sum, d) => sum + d.averageScore, 0);
    sessionAccuracy = totalQuestions > 0 ? (sessionScore / totalQuestions) * 100 : 0;
  }

  const chartData = performanceData.map((d) => ({
    name: d.subjectName,
    Acertos: d.correctAnswers,
    Erros: d.totalQuestions - d.correctAnswers,
    Total: d.totalQuestions,
    Precisao: Number(d.accuracy.toFixed(1)),
  }));

  // Paleta moderna e vibrante
  const MODERN_COLORS = [
    '#0ea5e9', // azul
    '#22c55e', // verde
    '#f43f5e', // rosa
    '#f59e42', // laranja
    '#a21caf', // roxo
    '#fbbf24', // amarelo
  ];

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex justify-center mb-8">
        <Button size="lg" onClick={() => navigate('/')}
          className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl border-0">
          <Home className="w-5 h-5 mr-2 inline" /> Voltar ao Início
        </Button>
      </div>
      <Card className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border-0">
        <h3 className="text-xl font-semibold mb-4 text-center">Desempenho por Assunto</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 24, right: 24, left: 0, bottom: 8 }}
            barCategoryGap={32}
          >
            <XAxis dataKey="name" tick={{ fontSize: 16, fontWeight: 700, fill: '#334155' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 16, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#18181b', borderRadius: 12, color: '#fff', border: 'none' }}
              labelStyle={{ color: '#fff', fontWeight: 700 }}
              itemStyle={{ fontWeight: 600 }}
              cursor={{ fill: '#6366f1', opacity: 0.08 }}
            />
            <Legend wrapperStyle={{ fontWeight: 700, fontSize: 16 }} />
            <Bar dataKey="Acertos" radius={[8,8,0,0]}>
              {chartData.map((_, idx) => (
                <Cell key={`cell-acertos-${idx}`} fill={MODERN_COLORS[idx % MODERN_COLORS.length]} />
              ))}
            </Bar>
            <Bar dataKey="Erros" radius={[8,8,0,0]} fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
