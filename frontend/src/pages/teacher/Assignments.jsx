import { useState, useEffect } from 'react';
import { assignmentAPI, classAPI } from '../../services/api.js';
import { BookOpen, Plus, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', classId: '', deadline: '' });
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => { classAPI.list().then(r => setClasses(r.data)).catch(() => {}); }, []);

  const fetch = () => assignmentAPI.list().then(r => setAssignments(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const create = async () => {
    if (!form.title.trim() || !form.classId) return toast.error('Title and class required');
    await assignmentAPI.create(form);
    toast.success('Assignment created');
    setShowCreate(false);
    setForm({ title: '', description: '', classId: '', deadline: '' });
    fetch();
  };

  const viewSubmissions = async (a) => {
    setSelected(a);
    try {
      const res = await assignmentAPI.submissions(a._id);
      setSubmissions(res.data);
      const g = {};
      res.data.forEach(s => { g[s._id] = s.grade || ''; });
      setGrades(g);
    } catch { toast.error('Failed to load submissions'); }
  };

  const grade = async (subId) => {
    const grade = grades[subId];
    if (!grade && grade !== 0) return toast.error('Enter a grade');
    try {
      await assignmentAPI.grade(selected._id, subId, { grade: Number(grade) });
      toast.success('Graded!');
      viewSubmissions(selected);
    } catch { toast.error('Grade failed'); }
  };

  const isOverdue = (d) => d && new Date(d) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-3"><BookOpen className="w-7 h-7 text-primary" />Assignments</h1>
          <p className="text-text-secondary text-sm">Create and grade assignments</p></div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {showCreate && (
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 space-y-4">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Assignment title"
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50 resize-none" rows={3} />
          <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50">
            <option value="">Select class...</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.subject})</option>)}
          </select>
          <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
          <button onClick={create} className="px-6 py-3 rounded-xl bg-primary text-white font-medium">Create Assignment</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a._id}
              className={`p-4 rounded-xl bg-white dark:bg-bg-dark border cursor-pointer transition-all hover:shadow-lg ${selected?._id === a._id ? 'border-primary' : 'border-border dark:border-white/10'}`}
              onClick={() => viewSubmissions(a)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-1">{a.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{a.classId?.name || 'Class'}</span>
                    {a.deadline && <span className={`flex items-center gap-1 ${isOverdue(a.deadline) ? 'text-red-500' : ''}`}>
                      Due: {new Date(a.deadline).toLocaleDateString()}
                    </span>}
                  </div>
                </div>
                <Eye className="w-4 h-4 text-text-secondary shrink-0" />
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p className="py-12 text-center text-text-secondary">No assignments yet</p>}
        </div>

        {selected && (
          <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
            <h2 className="font-semibold mb-3">{selected.title} - Submissions</h2>
            {submissions.length === 0 ? <p className="py-8 text-center text-text-secondary">No submissions yet</p> : (
              <div className="space-y-4">
                {submissions.map(s => (
                  <div key={s._id} className="p-4 rounded-xl bg-surface dark:bg-white/5 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{s.studentId?.name || 'Student'}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'graded' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                        {s.status === 'graded' ? 'Graded' : 'Submitted'}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-3 whitespace-pre-wrap">{s.textAnswer}</p>
                    <div className="flex items-center gap-3">
                      <input type="number" value={grades[s._id] ?? ''} onChange={e => setGrades({ ...grades, [s._id]: e.target.value })}
                        className="w-20 px-3 py-1.5 rounded-lg border border-border dark:border-white/10 bg-transparent text-sm text-center" placeholder="Grade" />
                      <span className="text-xs text-text-secondary">/ 100</span>
                      <button onClick={() => grade(s._id)}
                        className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark">Grade</button>
                    </div>
                    {s.grade > 0 && <p className="text-xs text-green-600 mt-1">Score: {s.grade}/100</p>}
                    {s.gemmaFeedback && <p className="text-xs text-text-secondary mt-2 p-2 rounded-lg bg-secondary/5">AI: {s.gemmaFeedback}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
