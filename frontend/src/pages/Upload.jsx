import { useState, useRef } from 'react'
import { uploadFile, loadSample } from '../api'
import toast from 'react-hot-toast'
import { Upload as UploadIcon, Database, ArrowRight, FileSpreadsheet, Play, Layers, HelpCircle, HardDrive } from 'lucide-react'
import Logo from '../components/Logo'

const SAMPLES = [
  {
    key: 'sales', 
    name: 'sales_performance_q3.csv',
    type: 'CSV',
    rows: '500 rows',
    cols: '12 cols',
    features: 'revenue, region, order_units, discount_pct',
    desc: 'Regional revenue metrics with Q3 variance dip.',
  },
  {
    key: 'students', 
    name: 'student_academic_metrics.csv',
    type: 'CSV',
    rows: '300 rows',
    cols: '9 cols',
    features: 'exam_score, study_hours, attendance_pct',
    desc: 'Academic scores, study habits, and risk metrics.',
  },
]

export default function Upload({ onSessionReady }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(null)
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['csv', 'xlsx', 'xls', 'json'].includes(ext)) {
      toast.error('Supported formats: CSV, Excel (.xlsx), JSON')
      return
    }
    setLoading('upload')
    try {
      const res = await uploadFile(file)
      toast.success(`Loaded ${res.data.shape?.rows?.toLocaleString()} rows into Analyst Session`)
      onSessionReady(res.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed — verify API server.')
    } finally { 
      setLoading(null) 
    }
  }

  const handleSample = async (key) => {
    setLoading(key)
    try {
      const res = await loadSample(key)
      toast.success('Sample dataset initialized')
      onSessionReady(res.data)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load sample dataset.')
    } finally { 
      setLoading(null) 
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <Logo />
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Data Sources & Datasets</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Initialize an analyst workbench session by uploading a file or selecting a sample dataset.</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Upload Dropzone */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <HardDrive size={16} className="text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Upload New Dataset</h2>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => inputRef.current?.click()}
              className={`
                border border-dashed rounded-md p-8 text-center cursor-pointer transition-all duration-150 bg-slate-50/50
                ${dragging ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
                ${loading === 'upload' ? 'pointer-events-none opacity-60' : ''}
              `}
            >
              <input 
                ref={inputRef} 
                type="file" 
                accept=".csv,.xlsx,.xls,.json" 
                className="hidden" 
                onChange={e => handleFile(e.target.files[0])} 
              />

              {loading === 'upload' ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-xs font-mono font-medium text-slate-700">Profiling dataset schema...</span>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-blue-600">
                    <UploadIcon size={18} />
                  </div>
                  <div className="text-xs font-bold text-[#0F172A] mb-1">
                    Drag and drop file here, or click to browse
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mb-4">
                    CSV, Excel (.xlsx), or JSON &middot; Max 50MB
                  </div>
                  <button type="button" className="btn-workbench-secondary text-xs">
                    <FileSpreadsheet size={13} /> Select File
                  </button>
                </>
              )}
            </div>

            <div className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
              <div className="font-semibold text-slate-700">Supported Formats:</div>
              <div>&bull; Comma-Separated Values (.csv)</div>
              <div>&bull; Microsoft Excel (.xlsx, .xls)</div>
              <div>&bull; Structured JSON Records (.json)</div>
            </div>
          </div>

          {/* Right Column: Pre-loaded Datasets Table */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Database size={16} className="text-slate-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Available Sample Datasets</h2>
            </div>

            <div className="border border-slate-200 rounded divide-y divide-slate-200 overflow-hidden">
              {SAMPLES.map(s => (
                <div key={s.key} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0F172A] font-mono truncate">{s.name}</span>
                      <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-semibold">{s.type}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {s.rows} &middot; {s.cols} &middot; <span className="text-slate-600">{s.features}</span>
                    </div>
                    <div className="text-xs text-slate-600 font-normal">{s.desc}</div>
                  </div>

                  <button
                    onClick={() => handleSample(s.key)}
                    disabled={!!loading}
                    className="btn-workbench-blue text-xs shrink-0"
                  >
                    {loading === s.key ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Play size={12} fill="currentColor" /> Open
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs font-mono text-slate-500">
        STRATEGOS Analyst Studio &copy; 2026 Achintya Rai
      </footer>
    </div>
  )
}
