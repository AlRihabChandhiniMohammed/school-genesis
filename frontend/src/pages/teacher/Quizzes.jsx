import { useState, useEffect } from 'react';
import { quizAPI, classAPI } from '../../services/api.js';
import { Link } from 'react-router-dom';
import { FileQuestion, Plus, BarChart3, Clock, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    quizAPI.list().then(r => setQuizzes(r.data)).catch(() => {});
    classAPI.list().then(r => setClasses(r.data)).catch(() => {});
  }, []);

  const handleAssign = async (quizId, classId) => {
    try {
      await quizAPI.update(quizId, { classId });
      setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, classId: classes.find(c => c._id === classId) || q.classId } : q));
      toast.success('Quiz assigned!');
    } catch (err) { toast.error('Assign failed'); }
    setAssigning(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-3"><FileQuestion className="w-7 h-7 text-primary" />My Quizzes</h1>
          <p className="text-text-secondary text-sm">{quizzes.length} quizzes</p></div>
        <Link to="/teacher/quizzes/generate" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark">
          <Brain className="w-4 h-4" /> AI Generate
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map(q => (
          <div key={q._id} className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${q.difficulty === 'easy' ? 'bg-green-500/10 text-green-600' : q.difficulty === 'hard' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{q.difficulty}</span>
              <span className="text-xs text-text-secondary">{q.questions?.length || 0} Qs</span>
            </div>
            <h3 className="font-semibold mb-1">{q.title}</h3>
            {q.subject && <p className="text-sm text-text-secondary mb-3">{q.subject}</p>}
            <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.timer || 0} min</span>
              <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{q.questions?.reduce((s, qq) => s + (qq.marks || 1), 0) || 0} marks</span>
            </div>
            <p className="text-xs text-text-secondary mb-3">
              Class: <span className="font-medium">{q.classId?.name || 'Not assigned'}</span>
            </p>
            <div className="flex flex-col gap-2">
              {assigning === q._id ? (
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 rounded-xl border border-border dark:border-white/10 bg-transparent text-sm focus:outline-none focus:border-primary/50"
                    defaultValue="" onChange={e => { if (e.target.value) handleAssign(q._id, e.target.value); }}>
                    <option value="" disabled>Select class...</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setAssigning(null)} className="px-3 py-2 rounded-xl text-sm text-text-secondary border border-border dark:border-white/10">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setAssigning(q._id)} className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20">
                    {q.classId?.name ? 'Reassign' : 'Assign to Class'}
                  </button>
                  <Link to={`/teacher/quizzes`} className="flex-1 text-center py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-text-secondary text-sm font-medium">Results</Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-16 text-text-secondary">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No quizzes yet. Generate your first AI quiz!</p>
            <Link to="/teacher/quizzes/generate" className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-primary text-white font-medium">
              <Brain className="w-4 h-4" /> Generate Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
