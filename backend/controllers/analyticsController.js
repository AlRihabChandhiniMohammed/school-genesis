import QuizAttempt from '../models/QuizAttempt.js';
import Quiz from '../models/Quiz.js';
import Class from '../models/Class.js';
import Submission from '../models/Submission.js';
import gemmaService from '../services/gemmaService.js';

export async function getClassAnalytics(req, res) {
  try {
    const cls = await Class.findById(req.params.classId).populate('studentIds', 'name email');
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const classQuizzes = await Quiz.find({ classId: cls._id }, '_id');
    const quizIds = classQuizzes.map(q => q._id);

    const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } })
      .populate('quizId', 'title subject difficulty')
      .populate('studentId', 'name email')
      .sort('submittedAt').limit(500);

    const valid = attempts.filter(a => a.quizId);

    const scoreTrend = valid.map(a => ({
      date: a.submittedAt, score: a.percentage, student: a.studentId?.name, quiz: a.quizId?.title,
    }));

    const distribution = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
    valid.forEach(a => {
      if (a.percentage <= 25) distribution['0-25']++;
      else if (a.percentage <= 50) distribution['26-50']++;
      else if (a.percentage <= 75) distribution['51-75']++;
      else distribution['76-100']++;
    });

    const avgScore = valid.length ? valid.reduce((a, b) => a + b.percentage, 0) / valid.length : 0;
    const sorted = [...valid].sort((a, b) => b.percentage - a.percentage);
    const top5 = sorted.slice(0, 5);
    const bottom5 = sorted.slice(-5).reverse();

    const studentAverages = {};
    valid.forEach(a => {
      if (!studentAverages[a.studentId?._id]) studentAverages[a.studentId?._id] = { name: a.studentId?.name, scores: [] };
      studentAverages[a.studentId?._id].scores.push(a.percentage);
    });
    const performanceGroups = { high: 0, medium: 0, low: 0 };
    Object.values(studentAverages).forEach(s => {
      const avg = s.scores.length > 0 ? s.scores.reduce((a, b) => a + b, 0) / s.scores.length : 0;
      if (avg >= 80) performanceGroups.high++;
      else if (avg >= 50) performanceGroups.medium++;
      else performanceGroups.low++;
    });

    const quizBreakdown = {};
    valid.forEach(a => {
      const qid = a.quizId?._id;
      if (!qid) return;
      if (!quizBreakdown[qid]) quizBreakdown[qid] = { title: a.quizId?.title || 'Quiz', subject: a.quizId?.subject || '', scores: [], total: 0 };
      quizBreakdown[qid].scores.push(a.percentage);
      quizBreakdown[qid].total++;
    });
    const quizPerformance = Object.values(quizBreakdown).map(q => ({
      title: q.title, subject: q.subject, avgScore: q.scores.length > 0 ? Math.round(q.scores.reduce((a, b) => a + b, 0) / q.scores.length) : 0, attempts: q.total,
    }));

    let gemmaInsight = '';
    try {
      gemmaInsight = await gemmaService.analyzePerformance({
        name: cls.name, avgScore, totalStudents: cls.studentIds.length, attemptCount: valid.length,
      });
    } catch {}

    res.json({
      scoreTrend, distribution, avgScore, top5, bottom5, gemmaInsight,
      totalAttempts: valid.length, totalStudents: cls.studentIds.length,
      performanceGroups, quizPerformance,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getStudentAnalytics(req, res) {
  try {
    const sid = req.params.studentId || req.user._id;
    const attempts = await QuizAttempt.find({ studentId: sid }).populate('quizId', 'title subject difficulty').sort('submittedAt');

    const scoreTrend = attempts.map(a => ({ date: a.submittedAt, score: a.percentage, quiz: a.quizId?.title }));
    const subjectScores = {};
    attempts.forEach(a => {
      const sub = a.quizId?.subject || 'General';
      if (!subjectScores[sub]) subjectScores[sub] = [];
      subjectScores[sub].push(a.percentage);
    });
    const radarData = Object.entries(subjectScores).map(([subject, scores]) => ({
      subject, score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }));

    const avgScore = attempts.length ? Math.round(attempts.reduce((a, b) => a + b.percentage, 0) / attempts.length) : 0;
    const bestScore = attempts.length ? Math.max(...attempts.map(a => a.percentage)) : 0;
    const worstScore = attempts.length ? Math.min(...attempts.map(a => a.percentage)) : 0;
    const streak = attempts.filter(a => a.percentage >= 60).length;

    res.json({
      scoreTrend, radarData, avgScore, bestScore, worstScore, streak,
      totalAttempts: attempts.length, attempts,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
