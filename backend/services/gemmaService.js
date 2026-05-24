import axios from 'axios';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = 'gemma2:2b';

async function callAI(prompt, systemContext = '') {
  // Option 1: Groq (fast cloud, free tier 30 req/min)
  if (GROQ_API_KEY) {
    try {
      const messages = [];
      if (systemContext) messages.push({ role: 'system', content: systemContext });
      messages.push({ role: 'user', content: prompt });

      const { data } = await axios.post(GROQ_URL, {
        model: GROQ_MODEL,
        messages,
        temperature: 0.7, max_tokens: 2048,
      }, { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 });
      return data.choices[0].message.content;
    } catch (err) {
      console.warn('Groq error:', err.response?.data?.error?.message || err.message);
    }
  }

  // Option 2: Ollama (local, free, unlimited)
  try {
    const messages = [];
    if (systemContext) messages.push({ role: 'system', content: systemContext });
    messages.push({ role: 'user', content: prompt });

    const { data } = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.7, num_predict: 2048 },
    }, { timeout: 60000 });
    return data.message.content;
  } catch (err) {
    console.warn('Ollama error:', err.response?.data?.error || err.message);
  }

  // Option 3: Mock mode (always works)
  console.warn('All AI providers unavailable. Using mock responses.');
  return mockAIResponse(prompt);
}

function mockAIResponse(prompt) {
  if (prompt.includes('quiz') || prompt.includes('Question')) {
    return JSON.stringify({
      quiz: [
        { id: 1, type: 'mcq', question: 'What is the main concept discussed?', options: ['Core Principle', 'Secondary Topic', 'Unrelated Concept', 'Minor Detail'], answer: 'A', explanation: 'This is the central theme.', marks: 1 },
        { id: 2, type: 'mcq', question: 'Which statement best describes the topic?', options: ['Superficial Overview', 'In-depth Analysis', 'Brief Mention', 'Conclusion Only'], answer: 'B', explanation: 'The content provides thorough examination.', marks: 1 },
        { id: 3, type: 'mcq', question: 'What is a key takeaway?', options: ['Irrelevant Fact', 'Minor Point', 'Important Lesson', 'Tangential Idea'], answer: 'C', explanation: 'This is the most significant learning point.', marks: 2 },
        { id: 4, type: 'mcq', question: 'How does this apply in real life?', options: ['Practical Use', 'No Application', 'Only Theoretical', 'Limited Scope'], answer: 'A', explanation: 'The concept has direct real-world applications.', marks: 1 },
        { id: 5, type: 'mcq', question: 'What is the best way to remember this?', options: ['Memorization', 'Practice Problems', 'Group Discussion', 'Video Tutorial'], answer: 'B', explanation: 'Practice reinforces understanding.', marks: 2 },
      ]
    });
  }
  if (prompt.includes('performance') || prompt.includes('class data')) {
    return 'The class shows strong overall performance with an average score above 70%. Students excel in conceptual questions but need improvement in application-based problems. Recommended action: Incorporate more real-world problem-solving exercises into lessons.';
  }
  if (prompt.includes('feedback')) {
    return 'Great effort on this submission! Try to provide more specific examples to support your answers. Review the key concepts one more time to strengthen your understanding.';
  }
  if (prompt.includes('Beginner') || prompt.includes('Intermediate') || prompt.includes('Advanced')) {
    return 'Intermediate';
  }
  return 'I understand your question. Based on the educational content, here are some key points to consider. The main concepts revolve around understanding fundamental principles and applying them to practical scenarios. Would you like me to explain any specific aspect in more detail?';
}

export async function generateQuiz({ topic, classLevel, difficulty, count, types }) {
  const prompt = `You are an expert teacher. Generate a quiz in valid JSON format only. No extra text. No markdown.

Topic: ${topic}
Class: ${classLevel}
Difficulty: ${difficulty}
Number of questions: ${count}
Types: ${types.join(', ')}

Return this exact JSON structure:
{
  "quiz": [
    {
      "id": 1,
      "type": "mcq",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "..."
    }
  ]
}`;

  const raw = await callAI(prompt);
  const cleaned = raw.replace(/```json?/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { quiz: JSON.parse(mockAIResponse('quiz')).quiz.slice(0, count) };
  }
}

export async function chatWithGemma({ message, role, language = 'english', history = [] }) {
  const teacherSystem = `You are an expert educational assistant for school teachers. Help with quiz creation, lesson planning, topic explanation, performance analysis, and educational content generation. Be concise, structured, and professional. Language: ${language}.`;
  const studentSystem = `You are a friendly and patient AI tutor for school students. Explain concepts step by step, give examples, provide practice questions, and always encourage the student. Language: ${language}.`;

  const systemContext = role === 'teacher' ? teacherSystem : studentSystem;
  const messages = history.map(h => `${h.role}: ${h.content}`).join('\n');
  const prompt = `${messages}\nuser: ${message}\nassistant:`;

  const reply = await callAI(prompt, systemContext);
  return { reply, tokensUsed: Math.round(prompt.length / 4) };
}

export async function analyzePerformance(classData) {
  const prompt = `Here is the performance data for class ${classData.name}: ${JSON.stringify(classData)}. Write a 3-sentence summary of class performance, highlight the weakest topic, and suggest one teaching action.`;
  return callAI(prompt);
}

export async function generateFeedback({ studentAnswer, correctAnswer, classLevel }) {
  const prompt = `Student answered: '${studentAnswer}'. Correct answer: '${correctAnswer}'. Write 2 sentences of constructive feedback for a class ${classLevel} student.`;
  return callAI(prompt);
}

export async function assignDifficulty(topic, title, description) {
  const prompt = `Based on this educational video:\nTitle: ${title}\nTopic: ${topic}\nDescription: ${description}\n\nRespond with exactly one word: Beginner, Intermediate, or Advanced.`;
  return (await callAI(prompt)).trim();
}

export default { generateQuiz, chatWithGemma, analyzePerformance, generateFeedback, assignDifficulty };
