import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api.js';
import { BarChart3 } from 'lucide-react';

export default function StudentResults() {
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    analyticsAPI.student().then(r => setAttempts(r.data.attempts || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="w-7 h-7 text-primary" />My Results</h1>
        <p className="text-text-secondary text-sm">Your quiz performance history</p></div>

      <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border dark:border-white/10">
              <th className="text-left py-3 px-4 font-medium">Quiz</th>
              <th className="text-left py-3 px-4 font-medium">Score</th>
              <th className="text-left py-3 px-4 font-medium">Percentage</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {attempts.map((a, i) => (
                <tr key={i} className="border-b border-border/50 dark:border-white/5">
                  <td className="py-3 px-4">{a.quizId?.title || 'Quiz'}</td>
                  <td className="py-3 px-4">{a.score}/{a.totalMarks}</td>
                  <td className="py-3 px-4"><span className={`font-medium px-2 py-0.5 rounded-full text-xs ${a.percentage >= 60 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>{a.percentage}%</span></td>
                  <td className="py-3 px-4 text-text-secondary">{new Date(a.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {attempts.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-text-secondary">No results yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
