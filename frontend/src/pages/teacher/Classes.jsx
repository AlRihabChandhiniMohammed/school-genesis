import { useState, useEffect } from 'react';
import { classAPI } from '../../services/api.js';
import { Link } from 'react-router-dom';
import { Plus, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TeacherClasses() {
  const [classes, setClasses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', section: 'A', academicYear: '2024-25' });

  const fetch = () => classAPI.list().then(r => setClasses(r.data)).catch(() => {});
  useEffect(() => { fetch(); }, []);

  const create = async () => {
    if (!form.name.trim()) return toast.error('Name required');
    await classAPI.create(form);
    toast.success('Class created');
    setShowCreate(false);
    setForm({ name: '', subject: '', section: 'A', academicYear: '2024-25' });
    fetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold flex items-center gap-3"><Users className="w-7 h-7 text-primary" />My Classes</h1>
          <p className="text-text-secondary text-sm">{classes.length} classes</p></div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark">
          <Plus className="w-4 h-4" /> New Class
        </button>
      </div>

      {showCreate && (
        <div className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Class 10 - Science"
              className="px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject"
              className="px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
            <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} placeholder="Section A"
              className="px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
            <input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} placeholder="2024-25"
              className="px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" />
          </div>
          <button onClick={create} className="px-6 py-3 rounded-xl bg-primary text-white font-medium">Create Class</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => (
          <Link key={cls._id} to={`/teacher/classes/${cls._id}`}
            className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 hover:shadow-lg transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{cls.name}</h3>
            {cls.subject && <p className="text-sm text-text-secondary mb-3">{cls.subject}</p>}
            <div className="flex items-center gap-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{cls.studentIds?.length || 0} students</span>
              <span>{cls.section}</span>
            </div>
          </Link>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full text-center py-16 text-text-secondary">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No classes yet. Create your first class!</p>
          </div>
        )}
      </div>
    </div>
  );
}
