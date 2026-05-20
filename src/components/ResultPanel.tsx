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
      <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center h-full min-h-0 w-full gap-4 border border-ink-800/40">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-ink-700/30" />
          <div
            className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
            style={{ transform: 'rotate(0deg)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-amber-400">{progress}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-ink-200 text-sm font-semibold tracking-wide">Đang nhận dạng văn bản...</p>
          <p className="text-[10px] text-ink-500 mt-1">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 h-full min-h-0 w-full flex flex-col items-center justify-center gap-3 border border-ink-800/40">
        <div className="w-10 h-10 rounded-full bg-red-900/20 border border-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-lg font-bold">!</span>
        </div>
        <p className="text-red-400 text-xs text-center font-semibold max-w-md">{error}</p>
        <button onClick={onClear} className="text-xs text-ink-400 hover:text-amber-400 transition-colors underline underline-offset-4">Thử lại</button>
      </div>
    )
  }

  if (!result && !text) {
    return (
      <div className="glass rounded-2xl p-6 h-full min-h-0 w-full flex flex-col items-center justify-center gap-3 text-ink-600 border border-ink-800/40 bg-ink-950/5">
        <FileText size={36} className="opacity-20 animate-pulse" />
        <p className="text-xs font-medium tracking-wide">Kết quả sẽ hiển thị ở đây</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-full min-h-0 w-full border border-ink-800/40 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700/40 bg-ink-950/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-ink-200 tracking-wider">KẾT QUẢ</span>
          {result && (
            <>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                {ENGINE_LABELS[result.engine] || result.engine}
              </span>
              {result.confidence !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
                  ${result.confidence >= 80 ? 'bg-emerald-900/20 text-emerald-400 border-emerald-700/30' : 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30'}`}>
                  {result.confidence}% tin cậy
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyText}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 transition-colors border border-ink-700/40"
            title="Sao chép"
          >
            {copied ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Đã chép' : 'Chép'}
          </button>
          <button
            onClick={() => download('txt')}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 transition-colors border border-ink-700/40"
          >
            <Download size={12} />
            .txt
          </button>
          <button
            onClick={() => download('md')}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100 transition-colors border border-ink-700/40"
          >
            <Download size={12} />
            .md
          </button>
          <button
            onClick={() => { setText(''); onClear() }}
            className="text-ink-500 hover:text-red-400 transition-colors p-1.5 ml-1"
            title="Xóa kết quả"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-transparent text-ink-200 p-4 resize-none outline-none min-h-0 overflow-y-auto placeholder-ink-700 custom-scrollbar focus:bg-ink-950/10 transition-colors"
        placeholder="Văn bản trích xuất sẽ hiển thị ở đây..."
        spellCheck={false}
      />

      <div className="px-4 py-2 border-t border-ink-700/30 bg-ink-950/10 flex items-center justify-between flex-shrink-0">
        <span className="text-[10px] text-ink-500 font-mono">{text.length} ký tự</span>
        <span className="text-[10px] text-ink-600 font-medium italic">Có thể chỉnh sửa trực tiếp</span>
      </div>
    </div>
  )
}
