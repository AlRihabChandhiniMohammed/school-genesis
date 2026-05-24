import StudentGroup from '../models/StudentGroup.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Submission from '../models/Submission.js';
import gemmaService from '../services/gemmaService.js';

export async function autoGenerateGroups(req, res) {
  try {
    const { classId } = req.params;
    const attempts = await QuizAttempt.find().populate({
      path: 'quizId', match: { classId }, select: 'title',
    }).populate('studentId', 'name email');

    const studentData = {};
    attempts.forEach(a => {
      if (!a.quizId) return;
      const sid = a.studentId?._id?.toString();
      if (!sid) return;
      if (!studentData[sid]) studentData[sid] = { scores: [], completions: 0, total: 0, name: a.studentId.name };
      studentData[sid].scores.push(a.percentage);
      studentData[sid].total++;
      if (a.submittedAt) studentData[sid].completions++;
    });

    const groups = { advanced: [], average: [], slow: [] };
    Object.entries(studentData).forEach(([sid, d]) => {
      const avgScore = d.scores.reduce((a, b) => a + b, 0) / d.scores.length;
      const completion = d.completions / d.total;
      if (avgScore >= 75 && completion >= 0.8) groups.advanced.push(sid);
      else if (avgScore >= 50 || completion >= 0.6) groups.average.push(sid);
      else groups.slow.push(sid);
    });

    for (const [groupType, studentIds] of Object.entries(groups)) {
      await StudentGroup.findOneAndUpdate(
        { classId, groupType },
        { studentIds },
        { upsert: true, new: true },
      );
    }

    const classInfo = { name: req.body.className || 'Class', advanced: groups.advanced.length, average: groups.average.length, slow: groups.slow.length };
    let gemmaInsight = '';
    try { gemmaInsight = await gemmaService.analyzePerformance(classInfo); } catch {}
    if (gemmaInsight) {
      await StudentGroup.findOneAndUpdate({ classId, groupType: 'advanced' }, { gemmaInsight });
    }

    res.json({ groups, gemmaInsight });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getGroups(req, res) {
  try {
    const groups = await StudentGroup.find({ classId: req.params.classId }).populate('studentIds', 'name email profileImage');
    res.json(groups);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function updateGroup(req, res) {
  try {
    const group = await StudentGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(group);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
