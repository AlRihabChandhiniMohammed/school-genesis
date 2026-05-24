import gemmaService from '../services/gemmaService.js';
import AILog from '../models/AILog.js';
import axios from 'axios';

export async function chat(req, res) {
  try {
    const { message, role, language, history } = req.body;
    const result = await gemmaService.chatWithGemma({ message, role, language, history });

    await AILog.create({
      userId: req.user._id, role, prompt: message,
      response: result.reply, tokensUsed: result.tokensUsed, model: 'gemma-2-9b-it',
    });

    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function generateQuiz(req, res) {
  try {
    const questions = await gemmaService.generateQuiz(req.body);
    res.json(questions);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function summarize(req, res) {
  try {
    const prompt = `Summarize the following educational content in 3-4 bullet points:\n\n${req.body.content}`;
    const summary = await gemmaService.callGemma?.(prompt) || '';
    res.json({ summary });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function analyzePerformance(req, res) {
  try {
    const insight = await gemmaService.analyzePerformance(req.body);
    res.json({ insight });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getYouTubeRecommendations(req, res) {
  try {
    const { topic, classLevel } = req.query;
    if (!process.env.YOUTUBE_API_KEY) {
      return res.json(getMockVideos(topic));
    }
    try {
      const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet', type: 'video', videoCategoryId: 27,
          q: `${topic} educational class ${classLevel || ''}`,
          maxResults: 8, order: 'relevance',
          key: process.env.YOUTUBE_API_KEY,
        },
        timeout: 8000,
      });

      if (!data.items || data.items.length === 0) return res.json(getMockVideos(topic));

      const videoIds = data.items.map(i => i.id.videoId).filter(Boolean);
      let durMap = {};
      if (videoIds.length > 0) {
        try {
          const { data: details } = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: { part: 'contentDetails', id: videoIds.join(','), key: process.env.YOUTUBE_API_KEY },
            timeout: 5000,
          });
          (details.items || []).forEach(v => {
            const d = v.contentDetails?.duration || '';
            const mins = d.match(/(\d+)M/)?.[1] || '0';
            const secs = d.match(/(\d+)S/)?.[1] || '0';
            durMap[v.id] = `${mins}:${secs.padStart(2, '0')}`;
          });
        } catch {}
      }

      const videos = await Promise.all(data.items.map(async (item) => {
        const vid = item.id?.videoId;
        if (!vid) return null;
        let difficulty = '';
        try { difficulty = await gemmaService.assignDifficulty(topic, item.snippet.title, item.snippet.description); } catch {}
        return {
          videoId: vid, title: item.snippet.title, description: item.snippet.description?.slice(0, 200) || '',
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
          channelTitle: item.snippet.channelTitle || '', duration: durMap[vid] || '',
          difficulty, url: `https://youtube.com/watch?v=${vid}`,
        };
      }));
      res.json(videos.filter(Boolean));
    } catch (err) {
      console.warn('YouTube API error, using mock:', err.message);
      res.json(getMockVideos(topic));
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
}

function getMockVideos(topic) {
  const ids = ['dQw4w9WgXcQ', '9bZkp7q19f0', 'kJQP7kiw5Fk', 'fJ9rUzIMcZQ'];
  const titles = [`${topic} - Complete Tutorial`, `Advanced ${topic} Concepts`, `${topic} Made Easy`, `${topic} - Practice Problems`];
  const channels = ['EduGenius Academy', 'SmartLearn Pro', 'EduTube', 'Math & Science Hub'];
  const durations = ['15:30', '22:10', '12:45', '18:20'];
  const difficulties = ['Beginner', 'Advanced', 'Beginner', 'Intermediate'];
  const descs = [
    `A comprehensive introduction to ${topic} covering all key concepts with practical examples.`,
    `Deep dive into advanced ${topic} concepts with detailed explanations and problem-solving sessions.`,
    `Learn ${topic} the easy way with simple explanations and real-world examples.`,
    `Work through practice problems related to ${topic} with step-by-step solutions.`,
  ];
  return ids.map((id, i) => ({
    videoId: id, title: titles[i], description: descs[i],
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    channelTitle: channels[i], duration: durations[i], difficulty: difficulties[i],
    url: `https://youtube.com/watch?v=${id}`,
  }));
}
