import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  shape: {
    rows: { type: Number, default: 0 },
    cols: { type: Number, default: 0 }
  },
  columns: [
    {
      name: { type: String },
      dtype: { type: String },
      sample: [{ type: String }]
    }
  ],
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Session', SessionSchema)
