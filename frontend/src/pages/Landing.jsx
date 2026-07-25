import { ArrowRight, Zap, BarChart3, MessageSquare, FileText, Database, ShieldCheck, CheckCircle2, Upload } from 'lucide-react'
import Logo from '../components/Logo'

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Upload Dataset',
    desc: 'Support for CSV, Excel (.xlsx), and JSON files with instant schema validation and null profiling.'
  },
  {
    num: '02',
    title: 'Autonomous Analysis',
    desc: 'AI formulates data hypotheses, executes analysis code, and generates correlation matrices.'
  },
  {
    num: '03',
    title: 'Executive Insights',
    desc: 'Receive publication-ready charts, key metric drivers, strategic recommendations, and exportable reports.'
  }
]

const FEATURES = [
  {
    icon: Database,
    label: 'Instant Schema Profiling',
    desc: 'Automatically parses column data types, missing value distributions, and numerical statistics.'
  },
  {
    icon: BarChart3,
    label: 'Automated Chart Generation',
    desc: 'Renders high-resolution bar charts, scatter plots, and distribution graphs tailored to your query.'
  },
  {
    icon: FileText,
    label: 'Executive Summaries',
    desc: 'Translates complex statistical findings into clear bulleted findings, risks, and next steps.'
  },
  {
    icon: MessageSquare,
    label: 'Interactive Dataset Chat',
    desc: 'Ask follow-up questions post-analysis for deeper metric exploration and scenario modeling.'
  }
]

export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-sans relative overflow-hidden pb-16">
      
      {/* Navigation Bar */}
      <header className="border-b border-slate-200 bg-white px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/raiyashu2004/data-analyst-agent" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-studio-secondary text-xs hidden sm:flex"
            >
              GitHub
            </a>
            <button onClick={onStart} className="btn-studio-blue text-xs">
              Launch Workspace <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 pt-16 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          AI-Powered Data Analyst Workspace
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-[1.15] mb-5">
          Instant Data Intelligence <br className="hidden sm:block" />
          <span className="text-blue-600">Powered by Autonomous AI.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Upload any CSV or Excel file. STRATEGOS automatically profiles your dataset, answers complex questions, generates charts, and writes executive reports in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button onClick={onStart} className="btn-studio-blue text-sm px-6 py-2.5">
            <Zap size={15} /> Launch Workspace Now
          </button>
          <button onClick={onStart} className="btn-studio-secondary text-sm px-6 py-2.5">
            <Upload size={15} /> Try Sample Dataset
          </button>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="px-6 py-10 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">How It Works</h2>
            <p className="text-xl font-bold text-[#0F172A] mt-1">Three Simple Steps to Data Clarity</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {WORKFLOW_STEPS.map((step) => (
              <div key={step.num} className="bg-white border border-slate-200 rounded-md p-5 relative">
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  STEP {step.num}
                </span>
                <h3 className="text-sm font-bold text-[#0F172A] mt-3 mb-1.5">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Built for Accurate Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Everything you need to turn spreadsheets into decisions.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.label} className="bg-white border border-slate-200 rounded-md p-5 hover:border-slate-300 transition-all">
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F172A] mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-[#0F172A] mb-1">{f.label}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <button onClick={onStart} className="btn-studio-blue text-xs px-6 py-2.5">
            Open Analyst Workspace <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="text-center text-xs text-slate-400 pt-8 border-t border-slate-200 max-w-5xl mx-auto font-mono">
        STRATEGOS &copy; 2026 Achintya Rai. Autonomous Data Intelligence Engine.
      </footer>
    </div>
  )
}
