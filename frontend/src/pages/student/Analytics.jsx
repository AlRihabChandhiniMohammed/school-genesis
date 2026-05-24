import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api.js';
import { BarChart3, TrendingUp, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function StudentAnalytics() {
  const [data, setData] = useState({
    scoreTrend: [], radarData: [], avgScore: 0, bestScore: 0, worstScore: 0, streak: 0,
    totalAttempts: 0, attempts: [],
  });

  useEffect(() => {
    analyticsAPI.student().then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="w-7 h-7 text-primary" />My Analytics</h1>
        <p className="text-text-secondary text-sm">Track your learning progress</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-3xl font-bold gradient-text">{data.avgScore.toFixed(1)}%</p>
          <p className="text-xs text-text-secondary">Average Score</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-3xl font-bold text-green-500">{data.bestScore}%</p>
          <p className="text-xs text-text-secondary">Best Score</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-3xl font-bold text-red-500">{data.worstScore}%</p>
          <p className="text-xs text-text-secondary">Worst Score</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-3xl font-bold text-secondary">{data.streak}</p>
          <p className="text-xs text-text-secondary">Pass Streak (≥60%)</p></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-xl font-bold">{data.totalAttempts}</p>
          <p className="text-xs text-text-secondary">Quizzes Taken</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-xl font-bold">{data.scoreTrend?.filter(s => s.score >= 60).length || 0}</p>
          <p className="text-xs text-text-secondary">Passed</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-xl font-bold">{data.scoreTrend?.filter(s => s.score < 60).length || 0}</p>
          <p className="text-xs text-text-secondary">Failed</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-xl font-bold">{data.radarData?.length || 0}</p>
          <p className="text-xs text-text-secondary">Subjects</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Score Trend</h2>
          {data.scoreTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="quiz" tick={false} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="py-12 text-center text-text-secondary">No data yet — take your first quiz!</p>}
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Target className="w-4 h-4" /> Subject Performance</h2>
          {data.radarData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.radarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="py-12 text-center text-text-secondary">No data yet</p>}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
        <h2 className="font-semibold mb-4">Quiz History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border dark:border-white/10">
              <th className="text-left py-3 px-4 font-medium">Quiz</th>
              <th className="text-left py-3 px-4 font-medium">Score</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {(data.attempts || []).map((a, i) => (
                <tr key={i} className="border-b border-border/50 dark:border-white/5">
                  <td className="py-3 px-4">{a.quizId?.title || 'Quiz'}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${a.percentage >= 60 ? 'text-green-500' : 'text-red-500'}`}>
                      {a.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-secondary">{new Date(a.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!data.attempts || data.attempts.length === 0) && <tr><td colSpan={3} className="py-8 text-center text-text-secondary">No quiz history</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
