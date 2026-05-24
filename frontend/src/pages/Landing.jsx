import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Brain, Youtube, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-bg-dark">
      <nav className="flex items-center justify-between px-6 lg:px-12 h-16 border-b border-border dark:border-white/10">
        <div className="flex items-center gap-2 font-bold text-xl">
          <GraduationCap className="w-6 h-6 text-primary" />
          School Genesis
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text">Sign In</Link>
          <Link to="/signup" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark">Get Started</Link>
        </div>
      </nav>

      <main>
        <section className="px-6 lg:px-12 py-20 lg:py-32 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left lg:flex items-center gap-16">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" /> AI-Powered Education
              </span>
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                The Future of<br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">School Learning</span>
              </h1>
              <p className="text-lg text-text-secondary mb-8 max-w-xl">
                Empower teachers with AI-generated quizzes, smart grouping, and analytics. 
                Give students personalized tutoring, video recommendations, and interactive learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all">
                  Start Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-border dark:border-white/20 font-semibold hover:bg-surface-hover dark:hover:bg-white/5 transition-all">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="flex-1 mt-12 lg:mt-0">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: 'AI Quiz Generator', desc: 'Create quizzes from any topic', color: 'from-primary to-purple-500' },
                  { icon: Youtube, label: 'Video Learning', desc: 'YouTube recommendations', color: 'from-red-500 to-rose-500' },
                  { icon: BarChart3, label: 'Analytics', desc: 'Track student performance', color: 'from-secondary to-cyan-500' },
                  { icon: Users, label: 'Smart Groups', desc: 'AI-powered student grouping', color: 'from-green-500 to-emerald-500' },
                ].map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                    className="p-6 rounded-2xl bg-surface dark:bg-white/5 border border-border dark:border-white/10">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3`}>
                      <f.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{f.label}</h3>
                    <p className="text-xs text-text-secondary">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="px-6 lg:px-12 py-20 bg-surface dark:bg-white/5 border-t border-border dark:border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Built with <span className="gradient-text">Gemma 2</span> AI</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: 'For Teachers', items: ['AI quiz generation from any topic', 'Smart student grouping engine', 'Class performance analytics', 'AI teaching assistant chatbot', 'YouTube video recommendations'] },
                { title: 'For Students', items: ['Personal AI tutor for doubt clearing', 'Timed quizzes with instant grading', 'Personalized video recommendations', 'Detailed performance analytics', 'Assignment submission & feedback'] },
                { title: 'For Admins', items: ['Platform-wide analytics dashboard', 'User and class management', 'AI usage monitoring', 'System settings & configuration', 'Subscription management'] },
              ].map((col, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10">
                  <h3 className="font-bold text-lg mb-4">{col.title}</h3>
                  <ul className="space-y-3">
                    {col.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="px-6 lg:px-12 py-8 text-center text-sm text-text-secondary border-t border-border dark:border-white/10">
          <p>School Genesis &copy; 2024 — AI-Powered Learning Platform. Built with Gemma 2.</p>
        </footer>
      </main>
    </div>
  );
}

function Users({ className }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>;
}
