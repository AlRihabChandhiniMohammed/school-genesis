import { useState, useEffect } from 'react';
import { quizAPI } from '../../services/api.js';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, Clock, BarChart3, Play } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { quizAPI.list().then(r => setQuizzes(r.data)).catch(() => {}); }, []);

  const startQuiz = async (quizId) => {
    try {
      const res = await quizAPI.submit(quizId, { answers: [], timeTaken: 0 });
      navigate(`/student/quizzes/${quizId}`);
    } catch (err) {
      toast.error('Cannot start quiz');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><FileQuestion className="w-7 h-7 text-primary" />Available Quizzes</h1>
        <p className="text-text-secondary text-sm">{quizzes.length} quizzes available</p></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map(q => (
          <div key={q._id} className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 hover:shadow-lg transition-all">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-3 ${q.difficulty === 'easy' ? 'bg-green-500/10 text-green-600' : q.difficulty === 'hard' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{q.difficulty}</span>
            <h3 className="font-semibold mb-1">{q.title}</h3>
            {q.subject && <p className="text-sm text-text-secondary mb-3">{q.subject}</p>}
            <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.timer || 0} min</span>
              <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{q.questions?.length || 0} questions</span>
            </div>
            <button onClick={() => startQuiz(q._id)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark">
              <Play className="w-4 h-4" /> Start Quiz
            </button>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="col-span-full text-center py-16 text-text-secondary">
            <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No quizzes assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
