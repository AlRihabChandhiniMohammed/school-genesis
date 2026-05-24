import Class from '../models/Class.js';
import User from '../models/User.js';
import QuizAttempt from '../models/QuizAttempt.js';

export async function getPublicClasses(req, res) {
  try {
    const classes = await Class.find({}, 'name subject section academicYear').sort('-createdAt');
    res.json(classes);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getClasses(req, res) {
  try {
    if (!req.user) return getPublicClasses(req, res);
    if (req.user.role === 'student') {
      const classes = await Class.find({ studentIds: req.user._id }).populate('teacherId', 'name email');
      return res.json(classes);
    }
    if (req.user.role === 'teacher') {
      let classes = await Class.find({ teacherId: req.user._id }).populate('studentIds', 'name email').sort('-createdAt');
      if (classes.length === 0) {
        classes = await Class.find({}).populate('studentIds', 'name email').sort('-createdAt');
      }
      return res.json(classes);
    }
    const classes = await Class.find({}).populate('studentIds', 'name email').sort('-createdAt');
    res.json(classes);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function createClass(req, res) {
  try {
    const cls = await Class.create({ ...req.body, teacherId: req.user._id });
    res.status(201).json(cls);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getClass(req, res) {
  try {
    const cls = await Class.findById(req.params.id).populate('studentIds', 'name email profileImage').populate('teacherId', 'name email');
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function updateClass(req, res) {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function deleteClass(req, res) {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getClassPerformanceGroups(req, res) {
  try {
    const cls = await Class.findById(req.params.id).populate('studentIds', 'name email');
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const attempts = await QuizAttempt.find({ studentId: { $in: cls.studentIds.map(s => s._id) } })
      .sort('-createdAt');

    const studentAvg = {};
    attempts.forEach(a => {
      if (!studentAvg[a.studentId]) studentAvg[a.studentId] = [];
      studentAvg[a.studentId].push(a.percentage);
    });

    const groups = { high: [], medium: [], low: [] };
    cls.studentIds.forEach(s => {
      const scores = studentAvg[s._id.toString()] || [];
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const group = avg >= 80 ? 'high' : avg >= 50 ? 'medium' : 'low';
      groups[group].push({ _id: s._id, name: s.name, email: s.email, avgScore: avg, attemptsCount: scores.length });
    });

    res.json({ groups, classId: cls._id, className: cls.name });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function addStudents(req, res) {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    const studentIds = req.body.studentIds || [];
    cls.studentIds = [...new Set([...cls.studentIds.map(s => s.toString()), ...studentIds])];
    await cls.save();
    res.json(cls);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
