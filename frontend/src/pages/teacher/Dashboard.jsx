import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { classAPI, quizAPI } from '../../services/api.js';
import { BarChart3, Users, FileQuestion, TrendingUp, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ classes: 0, quizzes: 0, students: 0 });

  useEffect(() => {
    Promise.all([classAPI.list(), quizAPI.list()]).then(([c, q]) => {
      const students = c.data.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);
      setStats({ classes: c.data.length, quizzes: q.data.length, students });
    }).catch(() => {});
  }, []);

  const cards = [
    { icon: Users, label: 'Classes', value: stats.classes, color: 'from-primary to-purple-500', link: '/teacher/classes' },
    { icon: FileQuestion, label: 'Quizzes', value: stats.quizzes, color: 'from-secondary to-cyan-500', link: '/teacher/quizzes' },
    { icon: TrendingUp, label: 'Students', value: stats.students, color: 'from-green-500 to-emerald-500', link: '/teacher/groups' },
    { icon: BarChart3, label: 'Analytics', value: 'View', color: 'from-orange-500 to-red-500', link: '/teacher/analytics' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your classes, quizzes, and students</p>
        </div>
        <Link to="/teacher/ai-assistant" className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> AI Assistant
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Link key={i} to={c.link} className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 hover:shadow-lg transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-text-secondary">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Generate AI Quiz', desc: 'Create questions from any topic', link: '/teacher/quizzes/generate', color: 'bg-primary/10 text-primary' },
              { label: 'Create Class', desc: 'Add a new class and invite students', link: '/teacher/classes', color: 'bg-secondary/10 text-secondary' },
              { label: 'Auto-Generate Groups', desc: 'Group students by performance', link: '/teacher/groups', color: 'bg-green-500/10 text-green-600' },
            ].map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-white/5 hover:bg-surface-hover dark:hover:bg-white/5 transition-all">
                <div>
                  <p className="font-medium text-sm">{a.label}</p>
                  <p className="text-xs text-text-secondary">{a.desc}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${a.color}`}>Go</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <p className="text-text-secondary text-sm py-8 text-center">Your recent quiz attempts and class activity will appear here.</p>
        </div>
      </div>
    </div>
  );
}
