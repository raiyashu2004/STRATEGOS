import { useState, useRef, useEffect } from 'react'
import { startAnalysis } from '../api'
import toast from 'react-hot-toast'
import {
  Send, Brain, Home, PieChart, FileText, Database, Settings,
  Upload, TrendingUp, CheckCircle2, History,
  Clock, Search, BarChart3, Layers, Terminal, Play, RotateCcw, ChevronDown
} from 'lucide-react'
import Report from '../components/Report'
import AgentLog from '../components/AgentLog'
import DataProfile from '../components/DataProfile'
import { useHistory } from '../hooks/useHistory'
import Logo from '../components/Logo'

const TABS = [
  { id: 'overview',  icon: Terminal,  label: 'Notebook & Console' },
  { id: 'explorer',  icon: Database,  label: 'Schema & Profile' },
  { id: 'insights',  icon: PieChart,  label: 'Visualizations' },
  { id: 'reports',   icon: FileText,  label: 'Session History' },
]

const PROVIDERS = [
  { value: 'gemini', label: 'Gemini 1.5' },
  { value: 'claude', label: 'Claude 3.5' },
  { value: 'openai', label: 'GPT-4o' },
]

const SAMPLE_QUESTIONS = {
  sales: [
    "What is driving the Q3 revenue variance across regions?",
    "Which product categories yield the highest margin?",
    "What is the correlation between discounts and order units?",
  ],
  students: [
    "Which metrics predict student exam performance?",
    "Identify key risk factors for low attendance.",
    "How does sleep duration correlate with score metrics?",
  ],
  default: [
    "Provide a detailed exploratory analysis of this dataset.",
    "Identify key trends, anomalies, and metric drivers.",
    "What actionable recommendations emerge from this data?",
  ]
}

export default function Analyze({ session = {}, onReset }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [question, setQuestion] = useState(session._suggestedQ || '')
  const [provider, setProvider] = useState('gemini')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const [charts, setCharts] = useState([])
  const [report, setReport] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const esRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const { history = [], save, clear } = useHistory()

  const filename = session.filename || 'dataset.csv'
  const sampleType = filename.includes('sales') ? 'sales'
    : filename.includes('student') ? 'students' : 'default'
  const suggestedQs = SAMPLE_QUESTIONS[sampleType] || SAMPLE_QUESTIONS.default || []

  const columns = Array.isArray(session.columns) ? session.columns : []
  const numericCols = columns.filter(c => c && c.dtype !== 'object' && c.dtype !== 'categorical').length
  const totalNulls = columns.reduce((acc, c) => acc + (Array.isArray(c?.sample) ? c.sample.filter(s => s === 'nan' || s === 'None').length : 0), 0)
  const qualityPct = session.shape?.rows ? Math.max(90, Math.round((1 - totalNulls / (session.shape.rows * (session.shape.cols || 1))) * 100 * 10) / 10) : 100

  useEffect(() => () => { esRef.current?.close(); clearInterval(timerRef.current) }, [])

  const activeSessionId = session.session_id || session.sessionId || 'session_default'

  const run = (q = question) => {
    if (!q.trim() || running) return
    setQuestion(q)
    setActiveTab('overview')
    esRef.current?.close()
    setRunning(true)
    setSteps([])
    setCharts([])
    setReport(null)
    setElapsedTime(0)

    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)

    const es = startAnalysis(activeSessionId, q, provider)
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'end') { es.close(); setRunning(false); clearInterval(timerRef.current); return }
        if (event.type === 'error') { toast.error(event.message || 'Analysis error'); es.close(); setRunning(false); clearInterval(timerRef.current); return }
        if (event.type === 'chart') { setCharts(prev => [...prev, event.data]); return }
        if (event.type === 'report') {
          setReport(event.report)
          if (typeof save === 'function') {
            save({
              filename: filename,
              question: q,
              provider,
              reportTitle: event.report?.title || 'Analysis Report',
              findingsCount: Array.isArray(event.report?.key_findings) ? event.report.key_findings.length : 0,
              chartsCount: charts.length,
            })
          }
          setRunning(false)
          clearInterval(timerRef.current)
          es.close()
          return
        }
        if (event.type === 'done') { setRunning(false); clearInterval(timerRef.current); return }
        setSteps(prev => [...prev, event])
      } catch (parseErr) {
        console.warn('SSE parse error:', parseErr)
      }
    }
    es.onerror = () => {
      toast.error('Connection lost. Verify API server.')
      setRunning(false)
      clearInterval(timerRef.current)
    }
  }

  const stop = () => {
    esRef.current?.close()
    setRunning(false)
    clearInterval(timerRef.current)
    toast('Task execution cancelled')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'explorer':
        return (
          <div className="p-6">
            <DataProfile session={session} alwaysExpanded />
          </div>
        )
      case 'insights':
        return (
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#0F172A]">Generated Visualizations ({charts.length})</h2>
            {charts.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No charts generated yet. Execute a query to render graphs.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {charts.map((c, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded p-2">
                    <img src={typeof c === 'string' && c.startsWith('data:') ? c : `data:image/png;base64,${c}`} alt={`Chart ${i + 1}`}
                      className="w-full h-auto object-contain rounded" onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'reports':
        return (
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-[#0F172A]">Session History</h2>
              {history.length > 0 && (
                <button onClick={clear} className="text-xs text-red-600 font-mono hover:underline">Clear History</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono">No archived reports in session.</p>
            ) : (
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id || Math.random()} className="bg-white border border-slate-200 rounded p-3 text-xs space-y-1">
                    <div className="font-bold text-[#0F172A]">{h.reportTitle}</div>
                    <div className="text-slate-500 font-mono">{h.question}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{new Date(h.timestamp || Date.now()).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="p-6 space-y-5">
            {/* Query Console Editor */}
            {!report && !running && (
              <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-slate-700" />
                    <span className="text-xs font-bold text-[#0F172A]">Query Console</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">Engine:</span>
                    <select
                      value={provider}
                      onChange={e => setProvider(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded text-xs px-2 py-1 font-mono text-[#0F172A] outline-none"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <textarea
                    className="workbench-input min-h-[85px] leading-relaxed"
                    placeholder="Enter analysis query (e.g. What is driving the Q3 revenue variance across regions?)"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) run() }}
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-slate-400">Press ⌘ + Enter to execute</span>
                    <button onClick={() => run()} className="btn-workbench-blue text-xs" disabled={!question.trim()}>
                      <Play size={12} fill="currentColor" /> Execute Query
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Recommended Queries:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedQs.map(q => (
                      <button 
                        key={q} 
                        onClick={() => run(q)}
                        className="text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded font-mono text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Execution Loading Indicator */}
            {running && !report && (
              <div className="bg-white border border-slate-200 rounded-md p-6 text-center space-y-3">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
                <div className="text-xs font-bold text-[#0F172A]">Running Agent Execution Loop</div>
                <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                  Compiling Python code, executing data transformations, and generating output visuals...
                </p>
                <div className="text-[11px] font-mono text-slate-600 bg-slate-100 border border-slate-200 inline-block px-3 py-1 rounded">
                  {steps.length} steps logged &middot; {elapsedTime}s elapsed
                </div>
                <div>
                  <button onClick={stop} className="text-xs text-red-600 font-mono hover:underline">
                    Cancel Execution
                  </button>
                </div>
              </div>
            )}

            {/* Executive Report Render */}
            {report && (
              <Report
                report={report}
                charts={charts}
                question={question}
                sessionId={activeSessionId}
                provider={provider}
              />
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">

      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Logo size="small" showBadge={false} />
          
          <div className="h-4 w-px bg-slate-200" />

          {/* Active Dataset Status Tag */}
          <div className="flex items-center gap-2 font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
            <Database size={13} className="text-blue-600" />
            <span className="font-semibold">{filename}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{session.shape?.rows?.toLocaleString() || '0'} rows × {session.shape?.cols || '0'} cols</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onReset} className="btn-workbench-secondary text-xs">
            <RotateCcw size={12} /> Switch Dataset
          </button>
        </div>
      </header>

      {/* Notebook Tab Bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-1 shrink-0 text-xs font-medium">
        {TABS.map(t => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
                isActive 
                  ? 'border-blue-600 text-blue-600 font-semibold bg-blue-50/30' 
                  : 'border-transparent text-slate-600 hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              {t.label}
              {t.id === 'insights' && charts.length > 0 && (
                <span className="ml-1 text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">{charts.length}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Workspace Layout (Center & Right Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Right ReAct Execution Terminal Panel */}
        <div className="w-[310px] bg-white border-l border-slate-200 flex flex-col shrink-0">
          <AgentLog steps={steps} running={running} />
        </div>

      </div>
    </div>
  )
}
