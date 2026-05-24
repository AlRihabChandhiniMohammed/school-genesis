import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { classAPI, quizAPI } from '../../services/api.js';
import { Users, FileQuestion, BarChart3, Plus, ExternalLink, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherClassDetail() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [perfGroups, setPerfGroups] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [showGroups, setShowGroups] = useState(false);

  useEffect(() => {
    classAPI.get(id).then(r => setCls(r.data)).catch(() => {});
    quizAPI.list().then(r => {
      setQuizzes(r.data.filter(q => q.classId?._id === id || q.classId === id));
    }).catch(() => {});
    classAPI.performanceGroups(id).then(r => setPerfGroups(r.data)).catch(() => {});
  }, [id]);

  const addStudent = async () => {
    if (!studentEmail.trim()) return toast.error('Enter email');
    await classAPI.addStudents(id, { studentIds: [studentEmail] });
    toast.success('Student added');
    classAPI.get(id).then(r => setCls(r.data));
    classAPI.performanceGroups(id).then(r => setPerfGroups(r.data)).catch(() => {});
    setStudentEmail('');
  };

  if (!cls) return <div className="shimmer h-64 rounded-2xl" />;

  const totalStudents = perfGroups
    ? perfGroups.groups.high.length + perfGroups.groups.medium.length + perfGroups.groups.low.length
    : cls.studentIds?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold">{cls.name}</h1>
        <p className="text-text-secondary">{cls.subject} · {cls.section} · {cls.academicYear}</p></div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-2xl font-bold">{totalStudents}</p>
          <p className="text-xs text-text-secondary">Students</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-2xl font-bold">{quizzes.length}</p>
          <p className="text-xs text-text-secondary">Quizzes</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-text-secondary">Avg Score</p></div>
        <div className="p-4 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-text-secondary">Avg Attendance</p></div>
      </div>

      {perfGroups && (
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <button onClick={() => setShowGroups(!showGroups)} className="w-full flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Performance Groups</h2>
            {showGroups ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {showGroups && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {['high', 'medium', 'low'].map(group => {
                const students = perfGroups.groups[group] || [];
                const colors = { high: 'green', medium: 'yellow', low: 'red' };
                const labels = { high: 'High (>=80%)', medium: 'Medium (50-79%)', low: 'Low (<50%)' };
                const c = colors[group];
                return (
                  <div key={group} className={`p-4 rounded-xl border border-${c}-500/20 bg-${c}-50/30 dark:bg-${c}-500/5`}>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-${c}-500`} />
                      {labels[group]}
                      <span className="text-text-secondary text-xs">({students.length})</span>
                    </h3>
                    <div className="space-y-1.5">
                      {students.map(s => (
                        <div key={s._id} className="flex items-center justify-between text-sm">
                          <span>{s.name}</span>
                          <span className={`text-xs font-medium ${s.avgScore >= 80 ? 'text-green-600' : s.avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {s.attemptsCount > 0 ? `${s.avgScore}%` : 'N/A'}
                          </span>
                        </div>
                      ))}
                      {students.length === 0 && <p className="text-xs text-text-secondary">No students in this group</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><FileQuestion className="w-5 h-5" /> Quizzes</h2>
          <div className="flex gap-2">
            <Link to={`/teacher/quizzes/generate?classId=${id}`} className="text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">+ Standard Quiz</Link>
            <Link to={`/teacher/quizzes/generate?classId=${id}&grouped=true`} className="text-sm px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 flex items-center gap-1"><Brain className="w-3 h-3" /> Group Quiz</Link>
          </div>
        </div>
        {quizzes.length > 0 ? (
          <div className="space-y-2">
            {quizzes.map(q => (
              <div key={q._id} className="flex items-center justify-between p-3 rounded-xl bg-surface dark:bg-white/5 border border-border dark:border-white/5">
                <div>
                  <p className="text-sm font-medium">{q.title}</p>
                  <p className="text-xs text-text-secondary">
                    {q.questions?.length || 0} questions · {q.difficulty} · {q.timer || 0} min
                    {q.useGroupQuestions && <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 text-xs">Group-based</span>}
                  </p>
                </div>
                <Link to={`/teacher/quizzes`} className="text-primary text-sm flex items-center gap-1 hover:underline">
                  Results <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-sm py-8 text-center">No quizzes assigned yet</p>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Students</h2>
        <div className="flex gap-3 mb-4">
          <input value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="Enter student email to add..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
          <button onClick={addStudent} className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
        </div>
        <div className="space-y-2">
          {cls.studentIds?.map(s => (
            <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-surface dark:bg-white/5 border border-border dark:border-white/5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{s.name?.[0]}</div>
              <div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-text-secondary">{s.email}</p></div>
            </div>
          ))}
          {(!cls.studentIds || cls.studentIds.length === 0) && <p className="text-text-secondary text-sm py-8 text-center">No students yet</p>}
        </div>
      </div>
    </div>
  );
}
