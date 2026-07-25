import { useState } from 'react'
import { Search, Hash, ToggleLeft, Calendar, List, Type, ChevronRight, ChevronDown } from 'lucide-react'

const getTypeInfo = (dtype) => {
  const typeStr = (dtype || '').toLowerCase()
  if (typeStr.includes('int') || typeStr.includes('float')) {
    return { icon: Hash, name: 'Numeric', color: 'text-[#2563EB]', bg: 'bg-blue-50 border-blue-100' }
  } else if (typeStr.includes('bool')) {
    return { icon: ToggleLeft, name: 'Boolean', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' }
  } else if (typeStr.includes('date') || typeStr.includes('time')) {
    return { icon: Calendar, name: 'DateTime', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' }
  } else if (typeStr.includes('cat')) {
    return { icon: List, name: 'Categorical', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' }
  } else {
    return { icon: Type, name: 'Text', color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' }
  }
}

function ColumnCard({ col }) {
  const { icon: Icon, color, bg } = getTypeInfo(col.dtype)
  const isId = col.name.toLowerCase().includes('id')

  const sampleValues = Array.isArray(col.sample)
    ? col.sample.filter(v => v !== null && v !== undefined && v !== 'nan' && v !== 'None').slice(0, 3)
    : []

  const hasNulls = Array.isArray(col.sample) && col.sample.some(v => v === 'nan' || v === 'None')

  return (
    <div className="studio-card p-3.5 studio-card-hover">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md border ${bg}`}>
            <Icon size={13} className={color} />
          </div>
          <span className="font-bold text-[#0F172A] text-xs truncate max-w-[140px] font-mono">{col.name}</span>
        </div>
        {isId && (
          <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">ID</span>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono mb-2.5">
        <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{col.dtype}</span>
        {hasNulls && (
          <span className="text-red-600 font-semibold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">Has Nulls</span>
        )}
      </div>

      <div className="bg-slate-50 rounded-md p-2 border border-slate-200 min-h-[50px]">
        <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Sample Data</div>
        <div className="flex flex-wrap gap-1">
          {sampleValues.length > 0 ? (
            sampleValues.map((val, i) => (
              <span key={i} className="text-[10px] font-mono bg-white text-[#0F172A] px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-full">
                {String(val)}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">No samples</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DataProfile({ session, alwaysExpanded = false }) {
  const [expanded, setExpanded] = useState(alwaysExpanded)

  const numericCols = session.columns?.filter(c => c.dtype !== 'object' && c.dtype !== 'categorical').length || 0
  const catCols = (session.columns?.length || 0) - numericCols
  const nullCols = session.columns?.filter(c => c.sample?.includes('nan') || c.sample?.includes('None')).length || 0

  return (
    <div className="border-b border-slate-200 bg-white shrink-0">
      {/* Summary Header */}
      <div
        className={`px-5 py-2.5 flex items-center justify-between transition-colors ${!alwaysExpanded ? 'cursor-pointer hover:bg-slate-50' : ''}`}
        onClick={() => !alwaysExpanded && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-[#0F172A]">Dataset Schema Profile</span>
          </div>

          <div className="h-3.5 w-px bg-slate-200" />

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-600"><strong className="text-[#0F172A]">{session.columns?.length || 0}</strong> Features</span>
            <span className="text-slate-600"><strong className="text-[#2563EB]">{numericCols}</strong> Numeric</span>
            <span className="text-slate-600"><strong className="text-amber-600">{catCols}</strong> Categorical</span>
            {nullCols > 0 && (
              <span className="text-slate-600"><strong className="text-red-600">{nullCols}</strong> Null</span>
            )}
          </div>
        </div>

        {!alwaysExpanded && (
          <div className="text-slate-400 p-1 hover:text-[#0F172A]">
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </div>
        )}
      </div>

      {/* Expanded Grid */}
      {expanded && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-200 bg-[#F8FAFC]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {session.columns?.map((col, i) => (
              <ColumnCard key={i} col={col} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
