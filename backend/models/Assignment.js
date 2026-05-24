import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline:     { type: Date },
  attachments:  [{ url: String, publicId: String }],
  groupTarget:  { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
