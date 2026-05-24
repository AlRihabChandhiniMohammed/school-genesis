import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  passwordHash:    { type: String, required: true },
  role:            { type: String, enum: ['teacher', 'student', 'admin'], required: true },
  isVerified:      { type: Boolean, default: false },
  profileImage:    { type: String, default: '' },
  schoolCode:      { type: String, default: '' },
  classId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  refreshToken:    { type: String, default: '' },
  resetToken:      { type: String, default: '' },
  resetTokenExp:   { type: Date },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
