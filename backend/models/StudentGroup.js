import mongoose from 'mongoose';

const studentGroupSchema = new mongoose.Schema({
  classId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  groupType:    { type: String, enum: ['advanced', 'average', 'slow'], required: true },
  studentIds:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  gemmaInsight: { type: String, default: '' },
}, { timestamps: true });

studentGroupSchema.index({ classId: 1, groupType: 1 });

export default mongoose.model('StudentGroup', studentGroupSchema);
