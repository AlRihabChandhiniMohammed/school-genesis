import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md bg-white dark:bg-bg-dark rounded-2xl p-8 border border-border dark:border-white/10 shadow-xl text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Check Your Email</h1>
        <p className="text-text-secondary text-sm mb-6">If an account exists for {email}, a reset link has been sent. Check the server console.</p>
        <Link to="/login" className="text-primary font-medium text-sm hover:underline">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="w-full max-w-md bg-white dark:bg-bg-dark rounded-2xl p-8 border border-border dark:border-white/10 shadow-xl">
        <Link to="/login" className="flex items-center gap-2 text-sm text-text-secondary mb-6 hover:text-primary"><ArrowLeft className="w-4 h-4" /> Back to Login</Link>
        <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
        <p className="text-text-secondary text-sm mb-6">Enter your email and we'll send you a reset link</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="you@school.com" required />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
