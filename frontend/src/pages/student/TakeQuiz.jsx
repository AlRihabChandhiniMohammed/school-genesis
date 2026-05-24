import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../../services/api.js';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    quizAPI.get(id).then(r => {
      setQuiz(r.data);
      setTimeLeft((r.data.timer || 30) * 60);
    }).catch(() => toast.error('Quiz not found'));
  }, [id]);

  useEffect(() => {
    if (!timeLeft || submitted) return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { handleSubmit(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft, submitted]);

  const handleSubmit = async () => {
    if (submitted) return;
    try {
      const formatted = Object.entries(answers).map(([questionId, answer]) => ({ questionId: parseInt(questionId), answer }));
      const res = await quizAPI.submit(id, { answers: formatted, timeTaken: ((quiz?.timer || 30) * 60) - timeLeft });
      setResult(res.data);
      setSubmitted(true);
      toast.success('Quiz submitted!');
    } catch (err) { toast.error('Submission failed'); }
  };

  const formatTime = s => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!quiz) return <div className="shimmer h-96 rounded-2xl" />;

  if (submitted && result) {
    const score = result.score || result.percentage || 0;
    const correct = result.answers?.filter(a => a.isCorrect).length || 0;
    const total = result.answers?.length || quiz.questions?.length || 0;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="p-8 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4"><Award className="w-8 h-8 text-white" /></div>
          <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
          <div className="grid grid-cols-3 gap-4 my-8">
            <div className="p-4 rounded-xl bg-surface dark:bg-white/5"><p className="text-3xl font-bold gradient-text">{score}%</p><p className="text-xs text-text-secondary">Score</p></div>
            <div className="p-4 rounded-xl bg-surface dark:bg-white/5"><p className="text-3xl font-bold text-green-500">{correct}</p><p className="text-xs text-text-secondary">Correct</p></div>
            <div className="p-4 rounded-xl bg-surface dark:bg-white/5"><p className="text-3xl font-bold text-red-500">{total - correct}</p><p className="text-xs text-text-secondary">Wrong</p></div>
          </div>
          <button onClick={() => navigate('/student/results')} className="px-8 py-3 rounded-xl bg-primary text-white font-medium">View All Results</button>
        </div>
      </div>
    );
  }

  const q = quiz.questions?.[currentQ];
  const progress = ((currentQ + 1) / (quiz.questions?.length || 1)) * 100;
  const isLowTime = timeLeft < 60;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">{quiz.title}</h1><p className="text-text-secondary text-sm">Question {currentQ + 1} of {quiz.questions?.length}</p></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${isLowTime ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-surface dark:bg-white/5'}`}>
          <Clock className="w-5 h-5" />{formatTime(timeLeft)}
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-border dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${progress}%` }} /></div>

      {q && (
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">{currentQ + 1}</span>
            <h2 className="text-lg font-medium">{q.question}</h2>
          </div>
          <div className="space-y-3">
            {(q.options || []).map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const selected = answers[q.id || currentQ + 1] === letter;
              return (
                <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id || currentQ + 1]: letter }))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selected ? 'border-primary bg-primary/10' : 'border-border dark:border-white/10 hover:border-primary/30 bg-surface dark:bg-white/5'}`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${selected ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-white/10'}`}>{letter}</span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border dark:border-white/10 text-text-secondary hover:text-text disabled:opacity-30"><ChevronLeft className="w-4 h-4" /> Previous</button>
        <div className="flex gap-1">
          {(quiz.questions || []).map((_, i) => (
            <button key={i} onClick={() => setCurrentQ(i)} className={`w-8 h-8 rounded-lg text-xs font-bold ${i === currentQ ? 'bg-primary text-white' : answers[i + 1] ? 'bg-green-500/20 text-green-600' : 'bg-surface dark:bg-white/10'}`}>{i + 1}</button>
          ))}
        </div>
        {currentQ < (quiz.questions?.length || 1) - 1 ? (
          <button onClick={() => setCurrentQ(Math.min(quiz.questions.length - 1, currentQ + 1))} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary"><ChevronRight className="w-4 h-4" /> Next</button>
        ) : (
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium">Submit Quiz</button>
        )}
      </div>
    </div>
  );
}
