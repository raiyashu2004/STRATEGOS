import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Upload from './pages/Upload'
import Analyze from './pages/Analyze'
import './index.css'

export default function App() {
  const [page, setPage] = useState('upload') // 'upload' | 'analyze'
  const [session, setSession] = useState(null)

  const handleSessionReady = (s) => {
    setSession(s)
    setPage('analyze')
  }

  const handleReset = () => {
    setSession(null)
    setPage('upload')
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F172A',
            color: '#FFFFFF',
            border: '1px solid #1E293B',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: '6px',
            padding: '8px 12px',
          },
        }}
      />
      {page === 'upload' && (
        <Upload onSessionReady={handleSessionReady} />
      )}
      {page === 'analyze' && session && (
        <Analyze 
          session={session} 
          onReset={handleReset} 
        />
      )}
    </>
  )
}
