import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId:    { type: String, required: true },
  videoTitle: { type: String, required: true },
  thumbnail:  { type: String, default: '' },
  topic:      { type: String, default: '' },
  difficulty: { type: String, default: '' },
  watched:    { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Recommendation', recommendationSchema);
