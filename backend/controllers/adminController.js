import User from '../models/User.js';
import Class from '../models/Class.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Assignment from '../models/Assignment.js';

export async function getStats(req, res) {
  try {
    const [users, classes, quizzes, attempts, assignments] = await Promise.all([
      User.countDocuments(),
      Class.countDocuments(),
      Quiz.countDocuments(),
      QuizAttempt.countDocuments(),
      Assignment.countDocuments(),
    ]);
    const roleCounts = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    res.json({ users, classes, quizzes, attempts, assignments, roleCounts });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getUsers(req, res) {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = role && role !== 'all' ? { role } : {};
    const users = await User.find(filter).select('-passwordHash -refreshToken -resetToken -resetTokenExp')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'teacher') await Class.deleteMany({ teacherId: user._id });
    if (user.role === 'student') {
      await Class.updateMany({ studentIds: user._id }, { $pull: { studentIds: user._id } });
      await QuizAttempt.deleteMany({ studentId: user._id });
    }
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getSystemLogs(req, res) {
  try {
    const recentAttempts = await QuizAttempt.find().populate('studentId', 'name email').populate('quizId', 'title')
      .sort('-submittedAt').limit(20);
    const recentUsers = await User.find().select('name email role createdAt')
      .sort('-createdAt').limit(10);
    res.json({ recentAttempts, recentUsers });
  } catch (err) { res.status(500).json({ error: err.message }); }
}
