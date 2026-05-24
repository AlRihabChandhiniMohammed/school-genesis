import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Class from '../models/Class.js';

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const signRefresh = (user) => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

export async function register(req, res) {
  try {
    const { name, email, password, role, schoolCode, classId } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role, schoolCode });

    if (role === 'student' && classId) {
      const cls = await Class.findById(classId);
      if (cls) {
        cls.studentIds.push(user._id);
        await cls.save();
        user.classId = classId;
        await user.save();
      }
    }

    const token = signToken(user);
    const refreshToken = signRefresh(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user: { id: user._id, name, email, role }, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user);
    const refreshToken = signRefresh(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function logout(req, res) {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    }
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function refreshToken(req, res) {
  try {
    const rt = req.cookies?.refreshToken;
    if (!rt) return res.status(401).json({ error: 'No refresh token' });
    const decoded = jwt.verify(rt, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== rt) return res.status(401).json({ error: 'Invalid refresh token' });

    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token });
  } catch { res.status(401).json({ error: 'Invalid refresh token' }); }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetToken = resetTokenHash;
    user.resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`\n  [PASSWORD RESET] ${email} → ${resetUrl}\n`);

    res.json({ message: 'If that email exists, a reset link has been sent (check server console)' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetToken: resetTokenHash, resetTokenExp: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = '';
    user.resetTokenExp = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}
