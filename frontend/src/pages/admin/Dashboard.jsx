import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminAPI } from '../../services/api.js';
import { BarChart3, Users, FileQuestion, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.stats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const roleMap = { teacher: 'Teachers', student: 'Students', admin: 'Admins' };
  const roleColors = ['#6366f1', '#8b5cf6', '#22c55e'];

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.users, color: 'from-primary to-purple-500', link: '/admin/users' },
    { icon: GraduationCap, label: 'Classes', value: stats.classes, color: 'from-secondary to-cyan-500', link: '/admin/classes' },
    { icon: FileQuestion, label: 'Quizzes', value: stats.quizzes, color: 'from-green-500 to-emerald-500', link: '/admin/quizzes' },
    { icon: BookOpen, label: 'Assignments', value: stats.assignments, color: 'from-orange-500 to-red-500', link: '/admin/assignments' },
    { icon: BarChart3, label: 'Quiz Attempts', value: stats.attempts, color: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-text-secondary text-sm mt-1">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <Link key={i} to={c.link || '#'} className="p-5 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 hover:shadow-lg transition-all">
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
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Users by Role</h2>
          {(stats.roleCounts || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.roleCounts.map(r => ({ name: roleMap[r._id] || r._id, count: r.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="py-12 text-center text-text-secondary">No data</p>}
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Manage Users', desc: 'View, filter, and manage all users', link: '/admin/users', icon: Users },
              { label: 'System Logs', desc: 'Recent quiz attempts and activity', link: '/admin/logs', icon: TrendingUp },
            ].map((a, i) => (
              <Link key={i} to={a.link} className="flex items-center justify-between p-4 rounded-xl border border-border dark:border-white/5 hover:bg-surface-hover dark:hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <a.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{a.label}</p>
                    <p className="text-xs text-text-secondary">{a.desc}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">Go</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
