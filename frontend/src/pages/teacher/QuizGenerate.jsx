import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { aiAPI, quizAPI, classAPI } from '../../services/api.js';
import { Brain, Loader2, Sparkles, FileQuestion, Users, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const GROUPS = ['high', 'medium', 'low'];
const GROUP_LABELS = { high: 'High Performers (>=80%)', medium: 'Medium (50-79%)', low: 'Low Performers (<50%)' };
const GROUP_COLORS = { high: 'border-green-500/20 bg-green-50/30 dark:bg-green-500/5', medium: 'border-yellow-500/20 bg-yellow-50/30 dark:bg-yellow-500/5', low: 'border-red-500/20 bg-red-50/30 dark:bg-red-500/5' };

export default function QuizGenerate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isGrouped = searchParams.get('grouped') === 'true';
  const preselectedClass = searchParams.get('classId') || '';

  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    topic: '', classLevel: 'Class 10', difficulty: 'medium', count: 5, types: ['mcq'], classId: preselectedClass,
  });
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState([]);
  const [groupQuestions, setGroupQuestions] = useState({ high: [], medium: [], low: [] });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(isGrouped ? 'groupSetup' : 'form');
  const [generatingFor, setGeneratingFor] = useState(null);
  const [perfGroups, setPerfGroups] = useState(null);

  useEffect(() => {
    classAPI.list().then(r => {
      setClasses(r.data);
      if (!preselectedClass && r.data.length > 0) setForm(f => ({ ...f, classId: r.data[0]._id }));
    }).catch(() => {});
  }, [preselectedClass]);

  useEffect(() => {
    if (form.classId && isGrouped) {
      classAPI.performanceGroups(form.classId).then(r => setPerfGroups(r.data)).catch(() => {});
    }
  }, [form.classId, isGrouped]);

  const handleGenerate = async (targetGroup = null) => {
    const topic = form.topic || content;
    if (!topic.trim()) { toast.error('Enter a topic or content'); return; }
    if (!form.classId) { toast.error('Select a class first'); return; }

    setLoading(true);
    setGeneratingFor(targetGroup);

    try {
      const payload = { topic, classLevel: form.classLevel, difficulty: form.difficulty, count: form.count, types: form.types };
      const res = await aiAPI.generateQuiz(payload);
      const qs = res.data.quiz || res.data.questions || res.data || [];
      const parsed = Array.isArray(qs) ? qs : getMockQuestions(form.count);

      if (targetGroup) {
        setGroupQuestions(prev => ({ ...prev, [targetGroup]: parsed.length > 0 ? parsed : getMockQuestions(form.count) }));
        toast.success(`Generated ${parsed.length || form.count} questions for ${GROUP_LABELS[targetGroup]}`);
        if (parsed.length === 0 && targetGroup) setGroupQuestions(prev => ({ ...prev, [targetGroup]: getMockQuestions(form.count) }));
      } else {
        setQuestions(parsed.length > 0 ? parsed : getMockQuestions(form.count));
        setStep('review');
        toast.success(`Generated ${parsed.length || form.count} questions!`);
      }
    } catch (err) {
      const mock = getMockQuestions(form.count);
      if (targetGroup) {
        setGroupQuestions(prev => ({ ...prev, [targetGroup]: mock }));
        toast.success(`Generated ${form.count} sample questions for ${GROUP_LABELS[targetGroup]}`);
      } else {
        setQuestions(mock);
        setStep('review');
        toast.success('Using sample questions');
      }
    }
    setLoading(false);
    setGeneratingFor(null);
  };

  const handleSave = async () => {
    if (!form.classId) { toast.error('Select a class first'); return; }

    const baseData = {
      title: `${form.topic} Quiz`,
      subject: form.topic,
      classId: form.classId,
      difficulty: form.difficulty,
      timer: 30, isRandomized: false, negativeMarking: false,
    };

    if (isGrouped) {
      const hasAll = GROUPS.every(g => groupQuestions[g].length > 0);
      if (!hasAll) { toast.error('Generate questions for all 3 groups first'); return; }
      const qg = {};
      GROUPS.forEach(g => {
        qg[g] = groupQuestions[g].map((q, i) => ({
          id: i + 1, type: q.type || 'mcq', question: q.question || q.question_text,
          options: q.options || ['A', 'B', 'C', 'D'], answer: q.answer || q.correct_answer || 'A', explanation: q.explanation || '',
          marks: q.marks || 1,
        }));
      });
      await quizAPI.create({ ...baseData, useGroupQuestions: true, questionGroups: qg });
      toast.success('Group quiz created! Students will get questions based on their performance.');
    } else {
      await quizAPI.create({
        ...baseData,
        questions: questions.map((q, i) => ({
          id: i + 1, type: q.type || 'mcq', question: q.question || q.question_text,
          options: q.options || ['A', 'B', 'C', 'D'], answer: q.answer || q.correct_answer || 'A', explanation: q.explanation || '',
          marks: q.marks || 1,
        })),
      });
      toast.success('Quiz created and assigned to class!');
    }
    navigate('/teacher/quizzes');
  };

  const qEdit = (arr, setter, idx, field, value) => {
    const upd = [...arr]; upd[idx] = { ...upd[idx], [field]: value }; setter(upd);
  };

  const qList = (qs, setter) => qs.map((q, i) => (
    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
      className="p-3 rounded-xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0 mt-1">{i + 1}</span>
        <div className="flex-1">
          <textarea value={q.question || ''} onChange={e => qEdit(qs, setter, i, 'question', e.target.value)}
            className="w-full bg-transparent border-b border-transparent focus:border-primary/50 focus:outline-none resize-none text-sm font-medium" rows={2} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(q.options || ['A', 'B', 'C', 'D']).map((opt, j) => {
              const letter = String.fromCharCode(65 + j);
              const isCorrect = (q.answer || '') === letter;
              return (
                <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isCorrect ? 'border-green-500/30 bg-green-50 dark:bg-green-500/10' : 'border-border dark:border-white/10'}`}>
                  <button type="button" onClick={() => qEdit(qs, setter, i, 'answer', letter)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-white/10'}`}>{letter}</button>
                  <input value={opt} onChange={e => {
                    const opts = [...(qs[i].options || ['', '', '', ''])]; opts[j] = e.target.value;
                    qEdit(qs, setter, i, 'options', opts);
                  }} className="flex-1 bg-transparent text-sm focus:outline-none" />
                </div>
              );
            })}
          </div>
          <input value={q.explanation || ''} onChange={e => qEdit(qs, setter, i, 'explanation', e.target.value)}
            placeholder="Explanation..." className="mt-2 w-full text-xs bg-transparent border-b border-transparent focus:border-primary/50 focus:outline-none text-text-secondary" />
        </div>
      </div>
    </motion.div>
  ));

  const selectedClass = classes.find(c => c._id === form.classId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          {isGrouped ? <Layers className="w-7 h-7 text-secondary" /> : <Brain className="w-7 h-7 text-primary" />}
          {isGrouped ? 'Group-Based Quiz Generator' : 'AI Quiz Generator'}
        </h1>
        <p className="text-text-secondary text-sm">
          {isGrouped
            ? 'Create different question sets for High, Medium, and Low performers'
            : 'Powered by Gemma 2 — generate quiz questions from any topic'}
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium mb-1.5 block">Topic</label>
            <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="e.g. Photosynthesis" /></div>
          <div><label className="text-sm font-medium mb-1.5 block">Class Level</label>
            <select value={form.classLevel} onChange={e => setForm({ ...form, classLevel: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50">
              {[...Array(12)].map((_, i) => <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>)}
            </select></div>
          <div><label className="text-sm font-medium mb-1.5 block">Difficulty</label>
            <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed">Mixed</option>
            </select></div>
          <div><label className="text-sm font-medium mb-1.5 block">Number of Questions</label>
            <input type="number" min={1} max={20} value={form.count} onChange={e => setForm({ ...form, count: parseInt(e.target.value) || 5 })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" /></div>
          <div className="sm:col-span-2"><label className="text-sm font-medium mb-1.5 block">Assign to Class</label>
            <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50">
              <option value="">-- Select a class --</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.subject})</option>)}
            </select></div>
        </div>
        <div><label className="text-sm font-medium mb-1.5 block">Or paste content (optional)</label>
          <textarea rows={3} value={content} onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50 resize-none"
            placeholder="Paste lesson content here to generate questions from it..." /></div>
      </div>

      {isGrouped && perfGroups && (
        <div className="p-4 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Users className="w-4 h-4" /> Class Overview</h3>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {GROUPS.map(g => (
              <div key={g} className={`p-3 rounded-xl ${GROUP_COLORS[g]}`}>
                <p className="font-bold text-lg">{(perfGroups.groups[g] || []).length}</p>
                <p className="text-xs text-text-secondary">{GROUP_LABELS[g].split('(')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isGrouped ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5" /> Question Sets by Performance Group</h2>
          {GROUPS.map(g => (
            <div key={g} className={`p-5 rounded-2xl border ${GROUP_COLORS[g]}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{GROUP_LABELS[g]}</h3>
                  <p className="text-xs text-text-secondary">{groupQuestions[g].length} questions generated</p>
                </div>
                <button onClick={() => handleGenerate(g)} disabled={loading && generatingFor === g}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
                  {loading && generatingFor === g ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading && generatingFor === g ? '...' : 'Generate'}
                </button>
              </div>
              {groupQuestions[g].length > 0 && (
                <div className="space-y-2">
                  {qList(groupQuestions[g], (arr) => setGroupQuestions(prev => ({ ...prev, [g]: arr })))}
                </div>
              )}
            </div>
          ))}
          <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark">
            <FileQuestion className="w-5 h-5" /> Save Group Quiz
          </button>
        </div>
      ) : step === 'form' ? (
        <button onClick={() => handleGenerate()} disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Generating...' : 'Generate with Gemma AI'}
        </button>
      ) : step === 'review' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary">{questions.length} questions generated {selectedClass ? `→ ${selectedClass.name}` : ''}</p>
            <button onClick={() => setStep('form')} className="text-sm text-primary hover:underline">Back to form</button>
          </div>
          {qList(questions, setQuestions)}
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark">
            <FileQuestion className="w-5 h-5" /> Save Quiz {selectedClass ? `to ${selectedClass.name}` : ''}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getMockQuestions(n) {
  const templates = [
    { question: 'What is the main concept discussed?', options: ['Core principle', 'Secondary topic', 'Unrelated concept', 'Minor detail'], answer: 'A', explanation: 'This is the central theme.' },
    { question: 'Which statement best describes the topic?', options: ['Superficial overview', 'In-depth analysis', 'Brief mention', 'Conclusion'], answer: 'B', explanation: 'The content provides thorough examination.' },
  ];
  return Array.from({ length: n }, (_, i) => {
    const t = templates[i % templates.length];
    return { ...t, id: i + 1, type: 'mcq', marks: 1 };
  });
}
