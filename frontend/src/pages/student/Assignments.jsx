import { useState, useEffect } from 'react';
import { assignmentAPI } from '../../services/api.js';
import { BookOpen, Send, Clock, Paperclip, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [file, setFile] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    assignmentAPI.list().then(r => setAssignments(r.data)).catch(() => {});
  }, []);

  const openAssignment = async (a) => {
    setSelected(a);
    setAnswer('');
    setFile(null);
    try {
      const res = await assignmentAPI.submissions(a._id);
      const sub = res.data[0];
      setMySubmission(sub || null);
      if (sub) setAnswer(sub.textAnswer || '');
    } catch { setMySubmission(null); }
  };

  const submit = async () => {
    if (!answer.trim() && !file) return toast.error('Write an answer or attach a file');
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (answer.trim()) formData.append('textAnswer', answer);
      if (file) formData.append('file', file);
      await api.post(`/api/assignments/${selected._id}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Submitted!');
      openAssignment(selected);
    } catch { toast.error('Submit failed'); }
    setSubmitting(false);
  };

  const isOverdue = (d) => d && new Date(d) < new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><BookOpen className="w-7 h-7 text-primary" />Assignments</h1>
        <p className="text-text-secondary text-sm">View and submit your assignments</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {assignments.map(a => (
            <div key={a._id} onClick={() => openAssignment(a)}
              className={`p-4 rounded-xl bg-white dark:bg-bg-dark border cursor-pointer transition-all hover:shadow-lg ${selected?._id === a._id ? 'border-primary' : 'border-border dark:border-white/10'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{a.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                    <span>{a.classId?.name || 'Class'}</span>
                    {a.deadline && <span className={`flex items-center gap-1 ${isOverdue(a.deadline) ? 'text-red-500' : ''}`}>
                      <Clock className="w-3 h-3" /> Due: {new Date(a.deadline).toLocaleDateString()}
                    </span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p className="py-12 text-center text-text-secondary">No assignments yet</p>}
        </div>

        {selected && (
          <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{selected.title}</h2>
              {mySubmission && <span className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Submitted</span>}
            </div>
            <p className="text-sm text-text-secondary">{selected.description}</p>
            {selected.deadline && <p className={`text-xs flex items-center gap-1 ${isOverdue(selected.deadline) ? 'text-red-500' : 'text-text-secondary'}`}>
              <Clock className="w-3 h-3" /> Due: {new Date(selected.deadline).toLocaleString()}
            </p>}

            {mySubmission?.grade > 0 && (
              <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                <p className="text-sm font-medium">Grade: {mySubmission.grade}/100</p>
                {mySubmission.gemmaFeedback && <p className="text-xs text-text-secondary mt-1">AI: {mySubmission.gemmaFeedback}</p>}
              </div>
            )}

            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50 resize-none" rows={5}
              placeholder="Write your answer here..." />

            <div>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border dark:border-white/10 cursor-pointer hover:bg-surface-hover dark:hover:bg-white/5 text-sm text-text-secondary">
                <Paperclip className="w-4 h-4" />
                {file ? file.name : 'Attach a file (PDF, DOC, TXT, ZIP, PNG, JPG)'}
                <input type="file" onChange={e => setFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png,.pptx,.xlsx" />
              </label>
            </div>

            {mySubmission?.fileUrl && (
              <a href={mySubmission.fileUrl} target="_blank" className="flex items-center gap-2 text-xs text-primary hover:underline">
                <FileText className="w-3 h-3" /> View submitted file
              </a>
            )}

            <button onClick={submit} disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50">
              <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
