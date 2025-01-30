import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['interested', 'ignored', 'accepted', 'rejected'], required: true }
}, { timestamps: true });

export const Connection = mongoose.model('Connection', connectionSchema);

