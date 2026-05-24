import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Class from '../models/Class.js';
import gemmaService from '../services/gemmaService.js';

export async function generateQuizAI(req, res) {
  try {
    const questions = await gemmaService.generateQuiz(req.body);
    res.json(questions);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function createQuiz(req, res) {
  try {
    const quiz = await Quiz.create({ ...req.body, teacherId: req.user._id });
    res.status(201).json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getQuizzes(req, res) {
  try {
    const filter = {};
    if (req.user.role === 'teacher') filter.teacherId = req.user._id;
    if (req.user.role === 'student') {
      const classes = await Class.find({ studentIds: req.user._id });
      filter.classId = { $in: classes.map(c => c._id) };
    }
    const quizzes = await Quiz.find(filter).populate('classId', 'name').sort('-createdAt');
    res.json(quizzes);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('classId', 'name');
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (req.user.role === 'student' && quiz.useGroupQuestions && quiz.questionGroups?.size > 0) {
      const attempts = await QuizAttempt.find({ quizId: quiz._id, studentId: req.user._id }).sort('-createdAt');
      const scores = attempts.map(a => a.percentage);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const group = avg >= 80 ? 'high' : avg >= 50 ? 'medium' : 'low';
      const groupQs = quiz.questionGroups.get(group);
      if (groupQs && groupQs.length > 0) {
        const quizObj = quiz.toObject();
        quizObj.questions = groupQs;
        return res.json(quizObj);
      }
    }
    res.json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function updateQuiz(req, res) {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function deleteQuiz(req, res) {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function submitQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const { answers, timeTaken } = req.body;

    let questionSet = quiz.questions || [];
    if ((!questionSet || questionSet.length === 0) && quiz.useGroupQuestions && quiz.questionGroups?.size > 0) {
      const attempts = await QuizAttempt.find({ quizId: quiz._id, studentId: req.user._id }).sort('-createdAt');
      const scores = attempts.map(a => a.percentage);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const group = avg >= 80 ? 'high' : avg >= 50 ? 'medium' : 'low';
      questionSet = quiz.questionGroups.get(group) || [];
    }

    let score = 0;
    let totalMarks = 0;
    const processed = answers.map(a => {
      const q = questionSet.find(qq => qq.id === a.questionId);
      totalMarks += q?.marks || 1;
      const isCorrect = q && q.answer === a.answer;
      if (isCorrect) score += q.marks || 1;
      else if (quiz.negativeMarking) score -= (q?.marks || 1) * 0.25;
      return { questionId: a.questionId, answer: a.answer, isCorrect: !!isCorrect, marksObtained: isCorrect ? (q?.marks || 1) : 0 };
    });

    const attempt = await QuizAttempt.create({
      quizId: quiz._id, studentId: req.user._id, answers: processed,
      score: Math.max(0, score), totalMarks, percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0, timeTaken,
    });
    res.json(attempt);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getQuizResults(req, res) {
  try {
    const filter = { quizId: req.params.id };
    if (req.user.role === 'student') filter.studentId = req.user._id;
    const attempts = await QuizAttempt.find(filter).populate('studentId', 'name email').sort('-submittedAt');
    res.json(attempts);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
