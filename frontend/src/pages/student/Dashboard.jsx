import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { quizAPI, analyticsAPI } from '../../services/api.js';
import { Link } from 'react-router-dom';
import { FileQuestion, BarChart3, Youtube, Brain, TrendingUp, Award } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ attempts: 0, avgScore: 0, quizzes: 0 });

  useEffect(() => {
    Promise.all([
      quizAPI.list().catch(() => ({ data: [] })),
      analyticsAPI.student().catch(() => ({ data: { avgScore: 0, totalAttempts: 0 } })),
    ]).then(([q, a]) => {
      setStats({ quizzes: q.data.length, avgScore: a.data.avgScore || 0, attempts: a.data.totalAttempts || 0 });
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-text-secondary text-sm">Continue your learning journey</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-3"><FileQuestion className="w-5 h-5 text-white" /></div>
          <p className="text-2xl font-bold">{stats.quizzes}</p>
          <p className="text-sm text-text-secondary">Available Quizzes</p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-cyan-500 flex items-center justify-center mb-3"><BarChart3 className="w-5 h-5 text-white" /></div>
          <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)}%</p>
          <p className="text-sm text-text-secondary">Average Score</p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3"><Award className="w-5 h-5 text-white" /></div>
          <p className="text-2xl font-bold">{stats.attempts}</p>
          <p className="text-sm text-text-secondary">Quizzes Taken</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4">Quick Access</h2>
          <div className="space-y-3">
            {[
              { label: 'Available Quizzes', desc: 'Take new quizzes', link: '/student/quizzes', icon: FileQuestion, color: 'bg-primary/10 text-primary' },
              { label: 'Learning Videos', desc: 'Watch recommended videos', link: '/student/videos', icon: Youtube, color: 'bg-red-500/10 text-red-600' },
              { label: 'AI Tutor', desc: 'Chat with Gemma AI', link: '/student/ai-tutor', icon: Brain, color: 'bg-secondary/10 text-secondary' },
              { label: 'My Results', desc: 'View score history', link: '/student/results', icon: BarChart3, color: 'bg-green-500/10 text-green-600' },
            ].map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-white/5 hover:bg-surface-hover dark:hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center`}><a.icon className="w-4 h-4" /></div>
                  <div><p className="font-medium text-sm">{a.label}</p><p className="text-xs text-text-secondary">{a.desc}</p></div>
                </div>
                <span className="text-xs text-text-secondary">Go →</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4">Performance</h2>
          <p className="text-text-secondary text-sm py-8 text-center">Your recent quiz scores and progress charts will appear here.</p>
        </div>
      </div>
    </div>
  );
}
