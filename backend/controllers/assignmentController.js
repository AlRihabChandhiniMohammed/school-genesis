import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Class from '../models/Class.js';
import gemmaService from '../services/gemmaService.js';
import { upload } from '../middleware/upload.js';

export const uploadMiddleware = upload.single('file');

export async function createAssignment(req, res) {
  try {
    const assignment = await Assignment.create({ ...req.body, teacherId: req.user._id });
    res.status(201).json(assignment);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getAssignments(req, res) {
  try {
    const filter = {};
    if (req.user.role === 'teacher') filter.teacherId = req.user._id;
    if (req.user.role === 'student') {
      const classes = await Class.find({ studentIds: req.user._id });
      filter.classId = { $in: classes.map(c => c._id) };
    }
    const assignments = await Assignment.find(filter).populate('classId', 'name').sort('-createdAt');
    res.json(assignments);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getAssignment(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('classId', 'name');
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    res.json(assignment);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function updateAssignment(req, res) {
  try {
    const a = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(a);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function deleteAssignment(req, res) {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function submitAssignment(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.fileUrl || '');
    const existing = await Submission.findOne({ assignmentId: assignment._id, studentId: req.user._id });
    if (existing && existing.status !== 'draft') {
      existing.textAnswer = req.body.textAnswer || existing.textAnswer;
      if (fileUrl) existing.fileUrl = fileUrl;
      existing.status = 'submitted';
      await existing.save();
      return res.json(existing);
    }
    const sub = await Submission.create({
      assignmentId: assignment._id, studentId: req.user._id,
      textAnswer: req.body.textAnswer || '', fileUrl,
    });
    res.status(201).json(sub);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getSubmissions(req, res) {
  try {
    const filter = { assignmentId: req.params.id };
    if (req.user.role === 'student') filter.studentId = req.user._id;
    const subs = await Submission.find(filter).populate('studentId', 'name email').sort('-submittedAt');
    res.json(subs);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function gradeSubmission(req, res) {
  try {
    const { grade, correctAnswer } = req.body;
    const sub = await Submission.findByIdAndUpdate(req.params.subId, { grade, status: 'graded' }, { new: true });
    if (correctAnswer && sub.textAnswer) {
      try {
        const feedback = await gemmaService.generateFeedback({ studentAnswer: sub.textAnswer, correctAnswer, classLevel: '10' });
        sub.gemmaFeedback = feedback;
        await sub.save();
      } catch {}
    }
    res.json(sub);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
