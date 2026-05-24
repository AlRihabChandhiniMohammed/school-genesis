import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api.js';
import { Brain, Send, Bot, User, Loader2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const suggestions = [
  'Explain quantum physics simply',
  'How does photosynthesis work?',
  'Solve this: x² + 5x + 6 = 0',
  'What is the water cycle?',
  'Give me practice questions on algebra',
];

export default function StudentAITutor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI tutor powered by Gemma 2. Ask me anything about your studies!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('english');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat({ message: input, role: 'student', language, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-2xl font-bold flex items-center gap-3"><Brain className="w-7 h-7 text-primary" />AI Tutor</h1>
          <p className="text-text-secondary text-sm">Powered by Gemma 2 — your personal learning assistant</p></div>
        <select value={language} onChange={e => setLanguage(e.target.value)} className="px-3 py-2 rounded-xl border border-border dark:border-white/10 bg-transparent text-sm">
          <option value="english">English</option><option value="hindi">Hindi</option><option value="telugu">Telugu</option><option value="tamil">Tamil</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 mb-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white" /></div>}
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface dark:bg-white/5 border border-border dark:border-white/10 rounded-tl-sm'}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-primary" /></div>}
          </motion.div>
        ))}
        {loading && <div className="flex gap-3"><div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div><div className="p-4 rounded-2xl bg-surface dark:bg-white/5"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div></div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => setInput(s)} className="px-3 py-1.5 rounded-lg bg-surface dark:bg-white/5 border text-xs text-text-secondary hover:text-text">{s}</button>
        ))}
      </div>

      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-white dark:bg-bg-dark focus:outline-none focus:border-primary/50" placeholder="Ask anything..." />
        <button onClick={send} disabled={loading || !input.trim()} className="px-6 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50 flex items-center gap-2">
          <Send className="w-4 h-4" /> Ask
        </button>
      </div>
    </div>
  );
}
