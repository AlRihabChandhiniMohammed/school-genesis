import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await axios.post(`/api/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md bg-white dark:bg-bg-dark rounded-2xl p-8 border border-border dark:border-white/10 shadow-xl text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Password Reset!</h1>
        <p className="text-text-secondary text-sm">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md bg-white dark:bg-bg-dark rounded-2xl p-8 border border-border dark:border-white/10 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Set New Password</h1>
        <p className="text-text-secondary text-sm mb-6">Enter your new password below</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">New Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="••••••••" required minLength={6} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="••••••••" required minLength={6} />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark">Reset Password</button>
        </form>
        <p className="text-center text-sm text-text-secondary mt-4"><Link to="/login" className="text-primary font-medium hover:underline">Back to Login</Link></p>
      </div>
    </div>
  );
}
