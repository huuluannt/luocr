import React, { useState } from 'react'
import { Copy, Download, Trash2, CheckCircle, FileText } from 'lucide-react'
import type { OCRResult } from '../types'

interface Props {
  result: OCRResult | null
  loading: boolean
  progress: number
  error: string | null
  onClear: () => void
}

const ENGINE_LABELS: Record<string, string> = {
  tesseract: 'Tesseract Local',
  ocrspace: 'OCR.space',
  google: 'Google Vision',
  azure: 'Azure AI',
}

export default function ResultPanel({ result, loading, progress, error, onClear }: Props) {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  React.useEffect(() => {
    if (result) setText(result.text)
  }, [result])

  const copyText = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = (ext: string) => {
    const content = ext === 'md' ? `# OCR Result\n\n${text}` : text
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `luocr-result.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-ink-700" />
          <div
            className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
            style={{ transform: 'rotate(0deg)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-mono text-amber-400">{progress}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-ink-200 font-medium">Dang nhan dang van ban...</p>
          <p className="text-xs text-ink-500 mt-1">Vui long doi</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <p className="text-red-400 text-sm text-center font-medium">{error}</p>
        <button onClick={onClear} className="text-xs text-ink-500 hover:text-amber-400 transition-colors">Thu lai</button>
      </div>
    )
  }

  if (!result && !text) {
    return (
      <div className="glass rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center gap-3 text-ink-600">
        <FileText size={40} className="opacity-30" />
        <p className="text-sm">Ket qua se hien thi o day</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/40">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-ink-200">Ket qua</span>
          {result && (
            <>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {ENGINE_LABELS[result.engine] || result.engine}
              </span>
              {result.confidence !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full border
                  ${result.confidence >= 80 ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40'}`}>
                  {result.confidence}% tin cay
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyText}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 transition-colors"
            title="Sao chep"
          >
            {copied ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
            {copied ? 'Da sao chep' : 'Sao chep'}
          </button>
          <button
            onClick={() => download('txt')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 transition-colors"
          >
            <Download size={13} />
            .txt
          </button>
          <button
            onClick={() => download('md')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 transition-colors"
          >
            <Download size={13} />
            .md
          </button>
          <button
            onClick={() => { setText(''); onClear() }}
            className="text-ink-600 hover:text-red-400 transition-colors p-1.5"
            title="Xoa ket qua"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-transparent text-ink-200 p-4 resize-none outline-none min-h-64 placeholder-ink-700"
        placeholder="Van ban trich xuat se hien thi o day..."
        spellCheck={false}
      />

      <div className="px-4 py-2 border-t border-ink-700/30 flex items-center justify-between">
        <span className="text-xs text-ink-600">{text.length} ky tu</span>
        <span className="text-xs text-ink-600">Co the chinh sua truc tiep</span>
      </div>
    </div>
  )
}
