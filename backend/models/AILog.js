import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:       { type: String, required: true },
  prompt:     { type: String, required: true },
  response:   { type: String, required: true },
  tokensUsed: { type: Number, default: 0 },
  model:      { type: String, default: 'gemma-2-9b-it' },
}, { timestamps: true });

export default mongoose.model('AILog', aiLogSchema);
