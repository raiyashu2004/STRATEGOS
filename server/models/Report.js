import mongoose from 'mongoose'

const ReportSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  filename: { type: String, required: true },
  question: { type: String, required: true },
  provider: { type: String, default: 'gemini' },
  reportTitle: { type: String, default: 'Executive Analysis Report' },
  summary: { type: String },
  keyFindings: [{ type: String }],
  recommendations: [{ type: String }],
  conclusion: { type: String },
  findingsCount: { type: Number, default: 0 },
  chartsCount: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.model('Report', ReportSchema)
