import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api.js';
import { TrendingUp, UserPlus } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState({ recentAttempts: [], recentUsers: [] });

  useEffect(() => { adminAPI.logs().then(r => setLogs(r.data)).catch(() => {}); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><TrendingUp className="w-7 h-7 text-primary" />System Logs</h1>
        <p className="text-text-secondary text-sm">Recent activity across the platform</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recent Quiz Attempts</h2>
          <div className="space-y-3">
            {(logs.recentAttempts || []).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface dark:bg-white/5 text-sm">
                <div>
                  <p className="font-medium">{a.studentId?.name || 'Unknown'}</p>
                  <p className="text-xs text-text-secondary">{a.quizId?.title || 'Quiz'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.percentage >= 60 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                  {a.percentage}%
                </span>
              </div>
            ))}
            {(logs.recentAttempts || []).length === 0 && <p className="py-8 text-center text-text-secondary text-sm">No attempts yet</p>}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4" /> Recent Registrations</h2>
          <div className="space-y-3">
            {(logs.recentUsers || []).map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface dark:bg-white/5 text-sm">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-text-secondary">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${u.role === 'teacher' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>{u.role}</span>
                  <p className="text-xs text-text-secondary mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {(logs.recentUsers || []).length === 0 && <p className="py-8 text-center text-text-secondary text-sm">No users yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
