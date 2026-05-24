import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  quizId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers:    [{
    questionId: Number,
    answer:     String,
    isCorrect:  Boolean,
    marksObtained: Number,
  }],
  score:      { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeTaken:  { type: Number, default: 0 },
  submittedAt:{ type: Date, default: Date.now },
}, { timestamps: true });

quizAttemptSchema.index({ quizId: 1, studentId: 1 });

export default mongoose.model('QuizAttempt', quizAttemptSchema);
