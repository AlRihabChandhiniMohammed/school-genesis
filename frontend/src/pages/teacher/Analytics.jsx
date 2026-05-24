import { useState, useEffect } from 'react';
import { analyticsAPI, classAPI } from '../../services/api.js';
import { BarChart3, TrendingUp, Users, Brain, Award, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function TeacherAnalytics() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => { classAPI.list().then(r => setClasses(r.data)).catch(() => {}); }, []);

  const fetchAnalytics = async () => {
    if (!selectedClass) return;
    try {
      const res = await analyticsAPI.class(selectedClass);
      setData(res.data);
    } catch { toast.error('Failed to load analytics'); }
  };

  useEffect(() => { if (selectedClass) fetchAnalytics(); }, [selectedClass]);

  const pgData = data?.performanceGroups
    ? [{ name: 'High (>=80%)', value: data.performanceGroups.high },
       { name: 'Medium (50-79%)', value: data.performanceGroups.medium },
       { name: 'Low (<50%)', value: data.performanceGroups.low }]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><BarChart3 className="w-7 h-7 text-primary" />Class Analytics</h1></div>

      <div className="max-w-xs">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none">
          <option value="">Select a class...</option>
          {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.subject})</option>)}
        </select>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
              <p className="text-2xl font-bold">{data.avgScore?.toFixed(1)}%</p>
              <p className="text-xs text-text-secondary">Class Average</p></div>
            <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
              <p className="text-2xl font-bold">{data.totalAttempts || 0}</p>
              <p className="text-xs text-text-secondary">Total Attempts</p></div>
            <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
              <p className="text-2xl font-bold text-green-500">{data.totalStudents || 0}</p>
              <p className="text-xs text-text-secondary">Total Students</p></div>
            <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
              <p className="text-2xl font-bold">{data.scoreTrend?.length || 0}</p>
              <p className="text-xs text-text-secondary">Data Points</p></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
              <h2 className="font-semibold mb-4">Score Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.scoreTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="quiz" tick={false} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
              <h2 className="font-semibold mb-4">Score Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(data.distribution || {}).map(([range, count]) => ({ range, count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Performance Groups</h2>
              {pgData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pgData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pgData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="py-12 text-center text-text-secondary">No performance data yet</p>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Award className="w-4 h-4" /> Quiz Performance</h2>
              {(data.quizPerformance || []).length > 0 ? (
                <div className="space-y-3">
                  {data.quizPerformance.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface dark:bg-white/5 border border-border dark:border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{q.title}</p>
                        <p className="text-xs text-text-secondary">{q.subject} · {q.attempts} attempts</p>
                      </div>
                      <span className={`text-sm font-bold ml-3 ${q.avgScore >= 60 ? 'text-green-500' : 'text-red-500'}`}>{q.avgScore}%</span>
                    </div>
                  ))}
                </div>
              ) : <p className="py-12 text-center text-text-secondary">No quiz data yet</p>}
            </div>
          </div>

          {data.gemmaInsight && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-primary" />AI Insight</p>
              <p className="text-sm text-text-secondary">{data.gemmaInsight}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500" /> Top 5 Students</h2>
              {(data.top5 || []).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 dark:border-white/5 last:border-0">
                  <span className="text-sm">{i + 1}. {s.studentId?.name || 'Student'}</span>
                  <span className="text-sm font-medium text-green-500">{s.percentage}%</span>
                </div>
              ))}
              {(!data.top5 || data.top5.length === 0) && <p className="py-8 text-center text-text-secondary">No data</p>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Needs Improvement</h2>
              {(data.bottom5 || []).map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 dark:border-white/5 last:border-0">
                  <span className="text-sm">{i + 1}. {s.studentId?.name || 'Student'}</span>
                  <span className="text-sm font-medium text-red-500">{s.percentage}%</span>
                </div>
              ))}
              {(!data.bottom5 || data.bottom5.length === 0) && <p className="py-8 text-center text-text-secondary">No data</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
