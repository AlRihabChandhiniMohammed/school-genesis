import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  subject:      { type: String, default: '' },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  academicYear: { type: String, default: '' },
  section:      { type: String, default: 'A' },
}, { timestamps: true });

export default mongoose.model('Class', classSchema);
