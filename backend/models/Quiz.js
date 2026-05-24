import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  subject:        { type: String, default: '' },
  classId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  teacherId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  difficulty:     { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' },
  timer:          { type: Number, default: 0 },
  isRandomized:   { type: Boolean, default: false },
  negativeMarking:{ type: Boolean, default: false },
  groupTarget:    { type: String, default: '' },
  useGroupQuestions: { type: Boolean, default: false },
  questionGroups: {
    type: Map,
    of: [{
      id:           Number,
      type:         { type: String, enum: ['mcq', 'truefalse', 'short', 'long'], default: 'mcq' },
      question:     String,
      options:      [String],
      answer:       String,
      explanation:  String,
      marks:        { type: Number, default: 1 },
    }],
    default: {},
  },
  questions:      [{
    id:           Number,
    type:         { type: String, enum: ['mcq', 'truefalse', 'short', 'long'], default: 'mcq' },
    question:     String,
    options:      [String],
    answer:       String,
    explanation:  String,
    marks:        { type: Number, default: 1 },
  }],
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
