import { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api.js';
import { Brain, Send, Copy, Check, Sparkles, Youtube, Loader2, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const suggestions = [
  'Create a lesson plan for photosynthesis',
  'Explain the Pythagorean theorem with examples',
  'Suggest 5 quiz questions about the water cycle',
  'How to teach fractions to Class 5 students?',
  'Summarize the key events of World War II',
];

export default function TeacherAIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI teaching assistant powered by Gemma 2. How can I help you with your lessons today?' },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await aiAPI.chat({ message: input, role: 'teacher', language, history });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply || res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please check your AI configuration and try again.' }]);
    }
    setLoading(false);
  };

  const copyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied!');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3"><Brain className="w-7 h-7 text-primary" />AI Teaching Assistant</h1>
          <p className="text-text-secondary text-sm">Powered by Gemma 2 — ask anything about teaching, lessons, and quizzes</p>
        </div>
        <select value={language} onChange={e => setLanguage(e.target.value)}
          className="px-3 py-2 rounded-xl border border-border dark:border-white/10 bg-transparent text-sm focus:outline-none">
          <option value="english">English</option><option value="hindi">Hindi</option><option value="telugu">Telugu</option><option value="tamil">Tamil</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 mb-4">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white" /></div>}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface dark:bg-white/5 border border-border dark:border-white/10 rounded-tl-sm'}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              {msg.role === 'assistant' && (
                <button onClick={() => copyMessage(msg.content, i)} className="mt-1 text-xs text-text-secondary hover:text-text flex items-center gap-1">
                  {copiedId === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy
                </button>
              )}
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-primary" /></div>}
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
            <div className="p-4 rounded-2xl bg-surface dark:bg-white/5 border border-border dark:border-white/10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => setInput(s)} className="px-3 py-1.5 rounded-lg bg-surface dark:bg-white/5 border border-border dark:border-white/10 text-xs text-text-secondary hover:text-text hover:border-primary/30 transition-all">
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-white dark:bg-bg-dark focus:outline-none focus:border-primary/50" placeholder="Ask about teaching, lessons, or quizzes..." />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2">
          <Send className="w-4 h-4" /> Send
        </button>
      </div>
    </div>
  );
}
