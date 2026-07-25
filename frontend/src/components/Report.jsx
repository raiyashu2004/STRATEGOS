import { useState } from 'react'
import { CheckCircle2, Lightbulb, Download, Send, MessageSquare, TrendingUp, Copy, Check } from 'lucide-react'
import { startAnalysis } from '../api'

function FindingCard({ text }) {
  if (!text || typeof text !== 'string') return null
  return (
    <div className="flex gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-md mb-2">
      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
      <p className="text-xs text-emerald-950 leading-relaxed font-medium">{text}</p>
    </div>
  )
}

function RecommendationCard({ text }) {
  if (!text || typeof text !== 'string') return null
  return (
    <div className="flex gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
      <Lightbulb size={15} className="text-blue-600 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-950 leading-relaxed font-medium">{text}</p>
    </div>
  )
}

function FollowUpChat({ sessionId, provider }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  const QUICK_QUESTIONS = [
    'Which metric had the highest variance?',
    'What would happen in an optimistic scenario?',
    'Summarize in 3 bullet points',
    'What additional data is recommended?',
  ]

  const ask = (question) => {
    if (!question.trim() || loading) return
    setLoading(true)
    let answer = ''

    const es = startAnalysis(sessionId, question, provider)
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data)
        if (event.type === 'report') {
          answer = event.report?.summary || ''
        }
        if (event.type === 'thought' && !answer) {
          answer = event.message || ''
        }
        if (event.type === 'done' || event.type === 'end') {
          es.close()
          const finalAnswer = answer || 'Analysis complete.'
          setHistory(prev => [...prev, { q: question, a: finalAnswer }])
          setLoading(false)
          setQ('')
        }
        if (event.type === 'error') {
          setHistory(prev => [...prev, { q: question, a: `Error: ${event.message}` }])
          es.close()
          setLoading(false)
          setQ('')
        }
      } catch (err) {
        console.warn('Follow-up parse error:', err)
      }
    }
    es.onerror = () => { es.close(); setLoading(false) }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={15} className="text-blue-600" />
        <div>
          <div className="text-xs font-bold text-[#0F172A]">Follow-up Dataset Chat</div>
          <div className="text-[10px] text-slate-500 font-mono">Ask scenario questions or request deeper metric breakdowns</div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {QUICK_QUESTIONS.map(qq => (
          <button key={qq} onClick={() => ask(qq)} disabled={loading}
            className="text-[11px] font-medium px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all disabled:opacity-50">
            {qq}
          </button>
        ))}
      </div>

      {/* Answer History */}
      {history.length > 0 && (
        <div className="mb-3 space-y-2">
          {history.map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="text-xs font-bold text-[#0F172A] mb-1 font-mono">
                Q: {item.q}
              </div>
              <div className="text-xs text-slate-700 leading-relaxed">
                {item.a}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="studio-input text-xs"
          placeholder="Ask a follow-up question..."
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(q)}
          disabled={loading}
        />
        <button className="btn-studio-blue px-4 shrink-0 text-xs py-1.5" onClick={() => ask(q)} disabled={loading || !q.trim()}>
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={13} />}
        </button>
      </div>
    </div>
  )
}

export default function Report({ report, charts, question, sessionId, provider }) {
  const [copied, setCopied] = useState(false)

  const title = report?.title || 'Executive Analysis Report'
  const summary = report?.summary || 'No summary available.'
  const conclusion = report?.conclusion || 'No conclusion available.'
  const safeFindings = Array.isArray(report?.key_findings)
    ? report.key_findings.filter(f => f && typeof f === 'string')
    : (typeof report?.key_findings === 'string' ? [report.key_findings] : [])
  const safeRecommendations = Array.isArray(report?.recommendations)
    ? report.recommendations.filter(r => r && typeof r === 'string')
    : (typeof report?.recommendations === 'string' ? [report.recommendations] : [])
  const safeCharts = Array.isArray(charts) ? charts : []

  const exportMarkdown = () => {
    const md = `# ${title}\n\n> **Question:** ${question}\n\n## Executive Summary\n${summary}\n\n## Key Findings\n${safeFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\n## Recommendations\n${safeRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n## Conclusion\n${conclusion}\n\n---\n*Generated by STRATEGOS Engine*`
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'analysis-report.md'; a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    const text = `${title}\n\nSummary: ${summary}\n\nKey Findings:\n${safeFindings.map((f, i) => `${i+1}. ${f}`).join('\n')}\n\nRecommendations:\n${safeRecommendations.map((r, i) => `${i+1}. ${r}`).join('\n')}\n\nConclusion: ${conclusion}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-md border border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
              Report Complete
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
              {safeCharts.length} Visualizations
            </span>
            <span className="text-[10px] font-mono font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded">
              {safeFindings.length} Findings
            </span>
          </div>
          <h1 className="text-lg font-bold text-[#0F172A] tracking-tight leading-tight">
            {title}
          </h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={copyToClipboard} className="btn-studio-secondary text-xs">
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={exportMarkdown} className="btn-studio-secondary text-xs">
            <Download size={13} /> Export .md
          </button>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-white border border-slate-200 rounded-md p-5 border-l-4 border-l-blue-600">
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">Executive Summary</div>
        <p className="text-xs text-[#0F172A] leading-relaxed font-medium">{summary}</p>
      </div>

      {/* Charts Gallery */}
      {safeCharts.length > 0 && (
        <div>
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Visualizations</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safeCharts.map((c, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-md p-2">
                <img
                  src={typeof c === 'string' && c.startsWith('data:') ? c : `data:image/png;base64,${c}`}
                  alt={`Chart ${i + 1}`}
                  className="w-full h-auto object-contain rounded"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Findings & Recommendations Grid */}
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <TrendingUp size={13} className="text-emerald-600" /> Key Insights ({safeFindings.length})
          </div>
          {safeFindings.length > 0
            ? safeFindings.map((f, i) => <FindingCard key={i} text={f} />)
            : <p className="text-xs text-slate-400 italic">No findings reported.</p>
          }
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Lightbulb size={13} className="text-blue-600" /> Strategic Recommendations ({safeRecommendations.length})
          </div>
          {safeRecommendations.length > 0
            ? safeRecommendations.map((r, i) => <RecommendationCard key={i} text={r} />)
            : <p className="text-xs text-slate-400 italic">No recommendations reported.</p>
          }
        </div>
      </div>

      {/* Conclusion Box */}
      <div className="bg-white border border-slate-200 rounded-md p-4">
        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Conclusion</div>
        <p className="text-xs text-slate-700 leading-relaxed font-normal">{conclusion}</p>
      </div>

      {/* Follow-up Chat */}
      <FollowUpChat sessionId={sessionId} provider={provider} />
    </div>
  )
}
