import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { GraduationCap, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', schoolCode: '', classId: '' });
  const [classes, setClasses] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/classes/public').then(r => setClasses(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(form);
      toast.success('Account created!');
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md bg-white dark:bg-bg-dark rounded-2xl p-8 border border-border dark:border-white/10 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Create Account</h1>
          <p className="text-text-secondary text-sm">Join School Genesis today</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="John Doe" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="you@school.com" required />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="••••••••" required minLength={6} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">I am a</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm({ ...form, role: 'student', classId: '' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${form.role === 'student' ? 'border-primary bg-primary/10 text-primary' : 'border-border dark:border-white/10 text-text-secondary'}`}>
                <GraduationCap className="w-5 h-5" /> Student
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: 'teacher', classId: '' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${form.role === 'teacher' ? 'border-primary bg-primary/10 text-primary' : 'border-border dark:border-white/10 text-text-secondary'}`}>
                <Users className="w-5 h-5" /> Teacher
              </button>
            </div>
          </div>
          {form.role === 'student' && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Select Your Class</label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" required>
                <option value="">-- Select your class --</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name} - {c.subject} (Section {c.section})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1.5 block">School Code (optional)</label>
            <input type="text" value={form.schoolCode} onChange={e => setForm({ ...form, schoolCode: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="GENESIS-001" />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all">Create Account</button>
        </form>
        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
