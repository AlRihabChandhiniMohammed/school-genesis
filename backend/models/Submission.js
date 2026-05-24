import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignmentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  textAnswer:    { type: String, default: '' },
  fileUrl:       { type: String, default: '' },
  status:        { type: String, enum: ['draft', 'submitted', 'graded'], default: 'submitted' },
  grade:         { type: Number, default: 0 },
  totalMarks:    { type: Number, default: 100 },
  gemmaFeedback: { type: String, default: '' },
  submittedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

submissionSchema.index({ assignmentId: 1, studentId: 1 });

export default mongoose.model('Submission', submissionSchema);
