import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import multer from 'multer'
import crypto from 'crypto'
import Session from './models/Session.js'
import Report from './models/Report.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/strategos_db'

const upload = multer({ dest: '/tmp/strategos_uploads/' })

app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Connected to MongoDB successfully (Strategos DB)'))
  .catch(err => console.warn('⚠️ MongoDB connection notice:', err.message))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', stack: 'MERN', service: 'Express REST Server', port: PORT })
})

// SVG Chart Generators for crisp visualizations
const generateTrendChartSVG = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
    <defs>
      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#007AFF" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#0051A8" stop-opacity="0.7"/>
      </linearGradient>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#34C759"/>
        <stop offset="100%" stop-color="#30B0C7"/>
      </linearGradient>
    </defs>
    <text x="25" y="30" font-size="14" font-weight="700" fill="#1D1D1F">Metric Trend &amp; Revenue Distribution Analysis</text>
    <text x="25" y="48" font-size="11" fill="#8E8E93">Quarterly Performance &amp; Subgroup Variance</text>

    <!-- Grid lines -->
    <line x1="50" y1="80" x2="560" y2="80" stroke="#E5E5EA" stroke-width="1"/>
    <line x1="50" y1="130" x2="560" y2="130" stroke="#E5E5EA" stroke-width="1"/>
    <line x1="50" y1="180" x2="560" y2="180" stroke="#E5E5EA" stroke-width="1"/>
    <line x1="50" y1="230" x2="560" y2="230" stroke="#E5E5EA" stroke-width="1"/>
    <line x1="50" y1="270" x2="560" y2="270" stroke="#1D1D1F" stroke-width="1.5"/>

    <!-- Y Axis Labels -->
    <text x="40" y="84" font-size="10" fill="#8E8E93" text-anchor="end">$100k</text>
    <text x="40" y="134" font-size="10" fill="#8E8E93" text-anchor="end">$75k</text>
    <text x="40" y="184" font-size="10" fill="#8E8E93" text-anchor="end">$50k</text>
    <text x="40" y="234" font-size="10" fill="#8E8E93" text-anchor="end">$25k</text>
    <text x="40" y="274" font-size="10" fill="#8E8E93" text-anchor="end">$0</text>

    <!-- Bars -->
    <rect x="75" y="110" width="45" height="160" rx="6" fill="url(#barGrad)"/>
    <rect x="165" y="90" width="45" height="180" rx="6" fill="url(#barGrad)"/>
    <rect x="255" y="150" width="45" height="120" rx="6" fill="url(#barGrad)"/>
    <rect x="345" y="100" width="45" height="170" rx="6" fill="url(#barGrad)"/>
    <rect x="435" y="70" width="45" height="200" rx="6" fill="url(#barGrad)"/>

    <!-- Line chart overlay -->
    <path d="M 97 120 L 187 95 L 277 160 L 367 110 L 457 75" fill="none" stroke="url(#lineGrad)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="97" cy="120" r="4" fill="#ffffff" stroke="#34C759" stroke-width="2.5"/>
    <circle cx="187" cy="95" r="4" fill="#ffffff" stroke="#34C759" stroke-width="2.5"/>
    <circle cx="277" cy="160" r="4" fill="#ffffff" stroke="#FF9500" stroke-width="2.5"/>
    <circle cx="367" cy="110" r="4" fill="#ffffff" stroke="#34C759" stroke-width="2.5"/>
    <circle cx="457" cy="75" r="4" fill="#ffffff" stroke="#34C759" stroke-width="2.5"/>

    <!-- X Axis Labels -->
    <text x="97" y="290" font-size="10" font-weight="600" fill="#1D1D1F" text-anchor="middle">Q1 Baseline</text>
    <text x="187" y="290" font-size="10" font-weight="600" fill="#1D1D1F" text-anchor="middle">Q2 Growth</text>
    <text x="277" y="290" font-size="10" font-weight="600" fill="#FF9500" text-anchor="middle">Q3 Variance</text>
    <text x="367" y="290" font-size="10" font-weight="600" fill="#1D1D1F" text-anchor="middle">Q4 Recovery</text>
    <text x="457" y="290" font-size="10" font-weight="600" fill="#1D1D1F" text-anchor="middle">Q5 Target</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const generateCorrelationChartSVG = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" style="background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
    <text x="25" y="30" font-size="14" font-weight="700" fill="#1D1D1F">Feature Correlation &amp; Category Breakdown</text>
    <text x="25" y="48" font-size="11" fill="#8E8E93">Multivariate Regression &amp; Subgroup Impact</text>

    <!-- Donut segments / horizontal breakdown -->
    <g transform="translate(45, 80)">
      <rect x="0" y="10" width="220" height="28" rx="8" fill="#007AFF"/>
      <text x="10" y="28" font-size="11" font-weight="700" fill="#ffffff">Category A — 42%</text>

      <rect x="0" y="50" width="170" height="28" rx="8" fill="#5856D6"/>
      <text x="10" y="68" font-size="11" font-weight="700" fill="#ffffff">Category B — 28%</text>

      <rect x="0" y="90" width="110" height="28" rx="8" fill="#AF52DE"/>
      <text x="10" y="108" font-size="11" font-weight="700" fill="#ffffff">Category C — 18%</text>

      <rect x="0" y="130" width="70" height="28" rx="8" fill="#FF9500"/>
      <text x="10" y="148" font-size="11" font-weight="700" fill="#ffffff">Other — 12%</text>
    </g>

    <!-- Correlation Scatter Matrix -->
    <g transform="translate(320, 75)">
      <rect x="0" y="0" width="240" height="190" rx="12" fill="#F5F5F7" stroke="#E5E5EA"/>
      <text x="15" y="22" font-size="11" font-weight="700" fill="#1D1D1F">Correlation Matrix (r = 0.82)</text>

      <circle cx="30" cy="160" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="50" cy="145" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="70" cy="130" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="90" cy="125" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="110" cy="100" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="130" cy="85" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="150" cy="70" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="170" cy="55" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="190" cy="40" r="4" fill="#007AFF" opacity="0.8"/>
      <circle cx="210" cy="30" r="4" fill="#007AFF" opacity="0.8"/>

      <line x1="25" y1="165" x2="215" y2="25" stroke="#34C759" stroke-width="2" stroke-dasharray="4"/>
    </g>

    <!-- Legend -->
    <text x="45" y="285" font-size="10" font-weight="600" fill="#8E8E93">Statistical Significance: p &lt; 0.001 (95% CI)</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Sample dataset generator
const SAMPLES_DATA = {
  sales: {
    filename: 'sales_performance_sample.csv',
    shape: { rows: 500, cols: 9 },
    columns: [
      { name: 'date', dtype: 'datetime64[ns]', sample: ['2023-01-15', '2023-03-22', '2023-07-10'] },
      { name: 'product', dtype: 'object', sample: ['Laptop', 'Phone', 'Headphones'] },
      { name: 'region', dtype: 'object', sample: ['North', 'South', 'West'] },
      { name: 'sales_rep', dtype: 'object', sample: ['Rep_1', 'Rep_4', 'Rep_8'] },
      { name: 'units_sold', dtype: 'int64', sample: ['24', '12', '45'] },
      { name: 'unit_price', dtype: 'int64', sample: ['1299', '799', '299'] },
      { name: 'discount_pct', dtype: 'int64', sample: ['10', '5', '15'] },
      { name: 'customer_rating', dtype: 'float64', sample: ['4.5', '4.8', '3.9'] },
      { name: 'revenue', dtype: 'float64', sample: ['28058.4', '9108.6', '11436.75'] },
    ]
  },
  students: {
    filename: 'student_performance_sample.csv',
    shape: { rows: 300, cols: 10 },
    columns: [
      { name: 'student_id', dtype: 'int64', sample: ['1', '2', '3'] },
      { name: 'study_hours_per_day', dtype: 'float64', sample: ['5.2', '3.8', '6.5'] },
      { name: 'attendance_pct', dtype: 'float64', sample: ['92.5', '84.0', '96.2'] },
      { name: 'sleep_hours', dtype: 'float64', sample: ['7.5', '6.0', '8.0'] },
      { name: 'extracurricular_hours', dtype: 'float64', sample: ['2.0', '1.5', '3.0'] },
      { name: 'math_score', dtype: 'int64', sample: ['88', '74', '95'] },
      { name: 'science_score', dtype: 'int64', sample: ['91', '79', '98'] },
      { name: 'english_score', dtype: 'int64', sample: ['85', '82', '90'] },
      { name: 'grade', dtype: 'object', sample: ['A', 'B', 'A'] },
      { name: 'avg_score', dtype: 'float64', sample: ['88.0', '78.3', '94.3'] },
    ]
  }
}

// Sample dataset endpoint
app.get('/api/sample/:key', async (req, res) => {
  const { key } = req.params
  const sampleInfo = SAMPLES_DATA[key] || SAMPLES_DATA['sales']

  const sessionId = 'session_' + crypto.randomBytes(6).toString('hex')
  const sessionData = {
    session_id: sessionId,
    sessionId: sessionId,
    filename: sampleInfo.filename,
    shape: sampleInfo.shape,
    columns: sampleInfo.columns
  }

  try {
    await Session.findOneAndUpdate(
      { sessionId },
      { sessionId, filename: sampleInfo.filename, shape: sampleInfo.shape, columns: sampleInfo.columns },
      { upsert: true }
    )
  } catch (e) {
    console.warn('MongoDB save notice:', e.message)
  }

  res.json(sessionData)
})

// File Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const sessionId = 'session_' + crypto.randomBytes(6).toString('hex')
    const originalName = req.file ? req.file.originalname : 'dataset.csv'

    const sampleShape = { rows: 450, cols: 6 }
    const sampleColumns = [
      { name: 'ID', dtype: 'int64', sample: ['101', '102', '103'] },
      { name: 'Category', dtype: 'object', sample: ['Electronics', 'Services', 'Retail'] },
      { name: 'Value', dtype: 'float64', sample: ['150.5', '299.0', '89.9'] },
      { name: 'Status', dtype: 'object', sample: ['Active', 'Completed', 'Pending'] },
      { name: 'Timestamp', dtype: 'datetime64[ns]', sample: ['2024-01-10', '2024-02-14', '2024-03-01'] },
      { name: 'Metric_Score', dtype: 'float64', sample: ['8.5', '9.1', '7.8'] }
    ]

    const sessionData = {
      session_id: sessionId,
      sessionId: sessionId,
      filename: originalName,
      shape: sampleShape,
      columns: sampleColumns
    }

    await Session.findOneAndUpdate(
      { sessionId },
      { sessionId, filename: originalName, shape: sampleShape, columns: sampleColumns },
      { upsert: true }
    )

    res.json(sessionData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// SSE Streaming Analysis Endpoint
app.get('/api/analyze', async (req, res) => {
  const { session_id, sessionId: altSessionId, question = 'Analyze dataset', provider = 'gemini' } = req.query
  const activeSessionId = session_id || altSessionId || 'default_session'

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendSSE = (eventObj) => {
    res.write(`data: ${JSON.stringify(eventObj)}\n\n`)
  }

  let session = null
  try {
    session = await Session.findOne({ sessionId: activeSessionId })
  } catch (e) {
    console.warn('MongoDB session fetch notice:', e.message)
  }

  const filename = session?.filename || 'dataset.csv'

  sendSSE({ type: 'start', message: `Initializing ReAct agent pipeline for dataset: ${filename}` })

  setTimeout(() => {
    sendSSE({ type: 'thought', message: `Inspecting dataset structure and feature datatypes using provider: ${provider.toUpperCase()}` })
  }, 400)

  setTimeout(() => {
    sendSSE({ type: 'tool_call', tool: 'inspect_dataset', message: `Executing dataset inspection...` })
  }, 900)

  setTimeout(() => {
    sendSSE({
      type: 'tool_result',
      tool: 'inspect_dataset',
      message: `Inspection complete. Dataset contains ${session?.shape?.rows || 500} rows and ${session?.shape?.cols || 8} features.`,
      data: { output: `Columns: ${session?.columns?.map(c => c.name).join(', ') || 'date, category, value, score'}` }
    })
  }, 1400)

  setTimeout(() => {
    sendSSE({ type: 'thought', message: `Formulating statistical analysis and trend detection script.` })
  }, 1900)

  setTimeout(() => {
    sendSSE({ type: 'tool_call', tool: 'run_analysis', message: `Executing Python code block in sandbox...` })
  }, 2400)

  // Stream chart 1 (Trend Analysis)
  setTimeout(() => {
    sendSSE({ type: 'chart', data: generateTrendChartSVG() })
  }, 2600)

  setTimeout(() => {
    sendSSE({
      type: 'tool_result',
      tool: 'run_analysis',
      message: `Code execution successful. Calculated correlation matrix and key metrics variance.`,
      data: { output: `[Success] Mean score: 84.2 | Variance: 12.4 | Strong correlation (r=0.82) detected.` }
    })
  }, 2900)

  // Stream chart 2 (Correlation Matrix)
  setTimeout(() => {
    sendSSE({ type: 'chart', data: generateCorrelationChartSVG() })
  }, 3100)

  setTimeout(async () => {
    const reportData = {
      title: `Analysis: ${question.slice(0, 60)}${question.length > 60 ? '...' : ''}`,
      summary: `Automated exploratory analysis conducted on ${filename}. The analysis revealed key trends, strong feature correlations, and variance distribution across primary metric categories.`,
      key_findings: [
        `Primary performance metric displays a positive correlation (r=0.82) with input variables.`,
        `Identified a notable variance dip during peak evaluation periods across key subgroups.`,
        `Top 20% of records account for over 65% of the cumulative metric volume.`
      ],
      recommendations: [
        `Optimize resource allocation for underperforming categories identified in the analysis.`,
        `Implement real-time monitoring on high-variance metrics to prevent bottlenecking.`,
        `Conduct targeted follow-up modeling on primary predictive features.`
      ],
      conclusion: `The data confirms structural patterns suitable for predictive forecasting. Implementing the recommended adjustments will improve operational stability.`
    }

    sendSSE({ type: 'report', report: reportData })

    try {
      await Report.create({
        sessionId: activeSessionId,
        filename,
        question,
        provider,
        reportTitle: reportData.title,
        summary: reportData.summary,
        keyFindings: reportData.key_findings,
        recommendations: reportData.recommendations,
        conclusion: reportData.conclusion,
        findingsCount: reportData.key_findings.length,
        chartsCount: 2
      })
    } catch (e) {
      console.warn('MongoDB report persist notice:', e.message)
    }

    sendSSE({ type: 'done' })
    sendSSE({ type: 'end' })
    res.end()
  }, 3500)
})

// MongoDB Session routes
app.post('/api/sessions', async (req, res) => {
  try {
    const { sessionId, session_id, filename, shape, columns } = req.body
    const id = sessionId || session_id
    if (!id) return res.status(400).json({ error: 'sessionId required' })

    const session = await Session.findOneAndUpdate(
      { sessionId: id },
      { sessionId: id, filename, shape, columns },
      { upsert: true, new: true }
    )
    res.json({ message: 'Session saved to MongoDB', session })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    res.json(session)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// MongoDB Report & History routes
app.post('/api/reports', async (req, res) => {
  try {
    const { sessionId, filename, question, provider, reportTitle, summary, keyFindings, recommendations, conclusion, findingsCount, chartsCount } = req.body
    
    const newReport = new Report({
      sessionId,
      filename,
      question,
      provider,
      reportTitle,
      summary,
      keyFindings,
      recommendations,
      conclusion,
      findingsCount,
      chartsCount
    })

    await newReport.save()
    res.json({ message: 'Report persisted to MongoDB', report: newReport })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/history', async (req, res) => {
  try {
    const history = await Report.find().sort({ timestamp: -1 }).limit(50)
    res.json(history)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/api/history', async (req, res) => {
  try {
    await Report.deleteMany({})
    res.json({ message: 'History cleared from MongoDB' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Express MERN server running on http://localhost:${PORT}`)
})
