import { useState, useEffect } from 'react';
import { classAPI, groupAPI } from '../../services/api.js';
import { Users, Brain, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherGroups() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState('');
  const [moveModal, setMoveModal] = useState(null);

  useEffect(() => { classAPI.list().then(r => setClasses(r.data)).catch(() => {}); }, []);

  const autoGenerate = async () => {
    if (!selectedClass) return toast.error('Select a class');
    setLoading(true);
    try {
      const cls = classes.find(c => c._id === selectedClass);
      const res = await groupAPI.autoGenerate(selectedClass, { className: cls?.name });
      setGroups(res.data.groups || []);
      setInsight(res.data.gemmaInsight || '');
      toast.success('Groups generated!');
    } catch { toast.error('Generation failed'); }
    setLoading(false);
  };

  const fetchGroups = async () => {
    if (!selectedClass) return;
    try {
      const res = await groupAPI.list(selectedClass);
      setGroups(res.data);
    } catch {}
  };

  useEffect(() => { if (selectedClass) fetchGroups(); }, [selectedClass]);

  const moveStudent = async (studentId, fromGroup, toGroup) => {
    try {
      const from = groups.find(g => g.groupType === fromGroup);
      const to = groups.find(g => g.groupType === toGroup);
      if (!from || !to) return;
      const newFromStudents = from.studentIds.filter(s => (s._id || s).toString() !== studentId);
      const studentToMove = from.studentIds.find(s => (s._id || s).toString() === studentId);
      const newToStudents = [...to.studentIds, studentToMove];

      await Promise.all([
        groupAPI.update(from._id, { studentIds: newFromStudents }),
        groupAPI.update(to._id, { studentIds: newToStudents }),
      ]);
      toast.success('Student moved');
      setMoveModal(null);
      fetchGroups();
    } catch { toast.error('Failed to move student'); }
  };

  const groupConfig = {
    advanced: { label: 'Advanced', color: 'bg-green-500/10 border-green-500/20 text-green-600' },
    average: { label: 'Average', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600' },
    slow: { label: 'Slow Learners', color: 'bg-red-500/10 border-red-500/20 text-red-600' },
  };
  const groupOrder = ['advanced', 'average', 'slow'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" />Student Groups</h1>
        <p className="text-text-secondary text-sm">AI-powered student grouping with manual editing</p></div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Select Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50">
            <option value="">Choose a class...</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.subject}</option>)}
          </select>
        </div>
        <button onClick={autoGenerate} disabled={loading || !selectedClass}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
          Auto-Generate
        </button>
      </div>

      {insight && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
          <p className="font-medium mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />AI Insight</p>
          <p className="text-text-secondary">{insight}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groupOrder.map(key => {
          const cfg = groupConfig[key];
          const group = Array.isArray(groups) ? groups.find(g => g.groupType === key) : null;
          const students = group?.studentIds || [];
          return (
            <div key={key} className={`p-6 rounded-2xl bg-white dark:bg-bg-dark border-2 ${cfg.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{cfg.label}</h3>
                <span className="text-2xl font-bold">{students.length}</span>
              </div>
              <div className="space-y-2">
                {students.map(s => {
                  const sid = s._id || s;
                  const sname = s.name || (typeof s === 'string' ? s : 'Student');
                  return (
                    <div key={sid} className="flex items-center justify-between p-2 rounded-lg bg-surface dark:bg-white/5 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{sname[0]}</div>
                        {sname}
                      </div>
                      <button onClick={() => setMoveModal({ studentId: sid, name: sname, fromGroup: key })}
                        className="p-1 rounded hover:bg-white/10 text-text-secondary">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
                {students.length === 0 && <p className="text-text-secondary text-sm py-4 text-center">No students</p>}
              </div>
            </div>
          );
        })}
      </div>

      {moveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setMoveModal(null)}>
          <div className="bg-white dark:bg-bg-dark rounded-2xl p-6 max-w-sm w-full border border-border dark:border-white/10 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold">Move {moveModal.name}</h3>
            <p className="text-sm text-text-secondary">Select destination group:</p>
            <div className="space-y-2">
              {groupOrder.filter(k => k !== moveModal.fromGroup).map(k => (
                <button key={k} onClick={() => moveStudent(moveModal.studentId, moveModal.fromGroup, k)}
                  className="w-full p-3 rounded-xl border border-border dark:border-white/10 text-sm font-medium hover:bg-surface-hover dark:hover:bg-white/5 text-left">
                  {groupConfig[k].label}
                </button>
              ))}
            </div>
            <button onClick={() => setMoveModal(null)} className="w-full p-3 rounded-xl border border-border dark:border-white/10 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
