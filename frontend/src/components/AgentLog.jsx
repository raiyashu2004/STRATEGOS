import { useEffect, useRef } from 'react'
import { CheckCircle2, Circle, Clock, Loader2, Search, BarChart3, Code2, AlertTriangle, GitBranch, FileText, Database, Terminal } from 'lucide-react'

const TOOL_META = {
  inspect_dataset:   { icon: Search,         label: 'Inspecting Dataset' },
  get_column_stats:  { icon: BarChart3,      label: 'Column Statistics' },
  run_analysis:      { icon: Code2,          label: 'Running Analysis' },
  detect_anomalies:  { icon: AlertTriangle,  label: 'Detecting Anomalies' },
  correlate_columns: { icon: GitBranch,      label: 'Computing Correlations' },
  generate_report:   { icon: FileText,       label: 'Generating Report' },
}

function StepItem({ step, index, isLast, running }) {
  const isComplete = step.type === 'tool_result' || step.type === 'done' || (!isLast)
  const isCurrent = isLast && running
  const isError = step.type === 'error' || step.data?.error
  const meta = step.tool ? TOOL_META[step.tool] : null
  const label = meta?.label || (step.type === 'thinking' ? 'Reasoning' : step.type === 'start' ? 'Initialization' : step.type === 'thought' ? 'ReAct Thought' : 'Processing')

  return (
    <div className="relative flex gap-3 pb-4">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[11px] top-[22px] bottom-0 w-px bg-slate-200" />
      )}

      {/* Node status */}
      <div className="relative z-10 flex flex-col items-center mt-0.5 shrink-0">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs border transition-all
          ${isError ? 'bg-red-50 text-red-600 border-red-200' :
            isComplete ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            isCurrent ? 'bg-blue-50 text-[#2563EB] border-blue-300' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
          {isError ? <AlertTriangle size={11} /> :
           isComplete ? <CheckCircle2 size={11} /> :
           isCurrent ? <Loader2 size={11} className="animate-spin" /> :
           <Circle size={7} />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className={`text-xs font-bold ${isError ? 'text-red-600' : 'text-[#0F172A]'}`}>
            {label}
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            STEP {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        
        <div className="text-xs text-slate-600 leading-normal break-words font-sans">
          {step.message || ''}
        </div>

        {/* Code snippet */}
        {step.type === 'tool_result' && step.data?.output && !step.data.error && (
          <div className="mt-2 p-2.5 bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-[10px] font-mono max-h-24 overflow-x-auto whitespace-pre-wrap break-all">
            {String(step.data.output).slice(0, 280)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AgentLog({ steps, running }) {
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [steps.length])

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0F172A] flex items-center justify-center text-white">
            <Terminal size={13} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#0F172A]">ReAct Execution Log</h3>
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              {running ? `${steps.length} steps logged` : steps.length > 0 ? `${steps.length} steps completed` : 'Awaiting input'}
            </p>
          </div>
        </div>
        {running && (
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>

      {/* Steps Stream */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {!steps.length && !running && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-10">
            <Clock size={20} className="text-slate-400" />
            <div>
              <p className="text-xs font-bold text-[#0F172A]">Agent Console Ready</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Submit a data query to inspect live Python code execution steps.</p>
            </div>
          </div>
        )}

        {steps.map((s, i) => (
          <StepItem key={i} step={s} index={i} isLast={i === steps.length - 1} running={running} />
        ))}

        {running && (
          <div className="relative flex gap-3">
            <div className="relative z-10 flex flex-col items-center mt-0.5 shrink-0">
              <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Loader2 size={11} className="animate-spin text-[#2563EB]" />
              </div>
            </div>
            <div className="flex-1 pt-0.5">
              <div className="text-xs font-mono text-slate-500">Executing sandbox code...</div>
            </div>
          </div>
        )}

        {/* Completion Banner */}
        {!running && steps.length > 0 && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={13} />
              ReAct Loop Completed
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0 text-[10px] font-mono text-slate-500">
        <div className="flex justify-between items-center">
          <span>Sandbox: Python 3.11</span>
          <span className="text-emerald-700 font-bold">SSE Live Stream</span>
        </div>
      </div>
    </div>
  )
}
