import { useState } from 'react';
import { aiAPI } from '../../services/api.js';
import { Youtube, Search, Loader2, Brain, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentVideos() {
  const [topic, setTopic] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState({});
  const [questionLoading, setQuestionLoading] = useState(null);

  const search = async () => {
    if (!topic.trim()) return toast.error('Enter a topic');
    setLoading(true);
    try {
      const res = await aiAPI.videoRecommendations({ topic, classLevel: '10' });
      setVideos(res.data);
    } catch { toast.error('Search failed'); }
    setLoading(false);
  };

  const getQuestions = async (video) => {
    setQuestionLoading(video.url);
    try {
      const res = await aiAPI.generateQuiz({ topic: video.title, classLevel: '10', difficulty: 'medium', count: 3, types: ['mcq'] });
      setQuestions({ ...questions, [video.url]: res.data.quiz || res.data.questions || [] });
    } catch { toast.error('Failed to generate questions'); }
    setQuestionLoading(null);
  };

  const diffColors = { Beginner: 'bg-green-500/10 text-green-600', Intermediate: 'bg-yellow-500/10 text-yellow-600', Advanced: 'bg-red-500/10 text-red-600' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold flex items-center gap-3"><Youtube className="w-7 h-7 text-red-500" />Learning Videos</h1>
        <p className="text-text-secondary text-sm">AI-recommended educational videos</p></div>

      <div className="flex gap-3">
        <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
          className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-white/10 bg-transparent focus:outline-none focus:border-primary/50" placeholder="Search for a topic..." />
        <button onClick={search} disabled={loading} className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Search
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((v, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-bg-dark border border-border dark:border-white/10 hover:shadow-lg transition-all">
            <div className="flex gap-4">
              <img src={v.thumbnail} alt={v.title} className="w-36 h-24 rounded-xl object-cover shrink-0" onError={e => e.target.style.display = 'none'} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{v.title}</h3>
                <p className="text-xs text-text-secondary mb-1">{v.channelTitle}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-secondary">{v.duration}</span>
                  {v.difficulty && <span className={`text-xs px-2 py-0.5 rounded-full ${diffColors[v.difficulty] || 'bg-gray-500/10'}`}>{v.difficulty}</span>}
                </div>
                <div className="flex gap-2">
                  <a href={v.url} target="_blank" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20">
                    <ExternalLink className="w-3 h-3" /> Watch
                  </a>
                  <button onClick={() => getQuestions(v)} disabled={questionLoading === v.url} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-xs font-medium hover:bg-secondary/20 disabled:opacity-50">
                    {questionLoading === v.url ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />} AI Questions
                  </button>
                </div>
                {questions[v.url]?.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-secondary/5 border border-secondary/20">
                    <p className="text-xs font-semibold mb-2">AI Questions:</p>
                    {questions[v.url].map((q, qi) => (
                      <p key={qi} className="text-xs mb-1">{qi+1}. {q.question}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
