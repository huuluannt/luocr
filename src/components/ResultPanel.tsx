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
      <div className="glass rounded-xl p-5 flex flex-col items-center justify-center h-full min-h-0 w-full gap-3 border border-slate-200 bg-white">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
          <div
            className="absolute inset-0 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"
            style={{ transform: 'rotate(0deg)', borderTopColor: 'transparent' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-indigo-600">{progress}%</span>
          </div>
        </div>
        <div className="text-center leading-tight">
          <p className="text-slate-800 text-xs font-semibold tracking-wide">Đang nhận dạng văn bản...</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass rounded-xl p-5 h-full min-h-0 w-full flex flex-col items-center justify-center gap-2.5 border border-slate-200 bg-white">
        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
          <span className="text-red-600 text-sm font-bold">!</span>
        </div>
        <p className="text-red-600 text-xs text-center font-semibold max-w-md leading-normal">{error}</p>
        <button onClick={onClear} className="text-xs text-slate-500 hover:text-indigo-600 font-semibold transition-colors underline underline-offset-4">Thử lại</button>
      </div>
    )
  }

  if (!result && !text) {
    return (
      <div className="glass rounded-xl p-5 h-full min-h-0 w-full flex flex-col items-center justify-center gap-2.5 text-slate-400 border border-slate-200 bg-slate-50/20">
        <FileText size={32} className="opacity-30 animate-pulse text-indigo-500/85" />
        <p className="text-[11px] font-semibold tracking-wide">Kết quả sẽ hiển thị ở đây</p>
      </div>
    )
  }

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col h-full min-h-0 w-full border border-slate-200 shadow-sm bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider shrink-0">KẾT QUẢ</span>
          {result && (
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/50 font-bold truncate">
                {ENGINE_LABELS[result.engine] || result.engine}
              </span>
              {result.confidence !== undefined && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold shrink-0
                  ${result.confidence >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                  {result.confidence}% tin cậy
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={copyText}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors border border-slate-200"
            title="Sao chép"
          >
            {copied ? <CheckCircle size={11} className="text-emerald-600" /> : <Copy size={11} />}
            {copied ? 'Đã chép' : 'Chép'}
          </button>
          <button
            onClick={() => download('txt')}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors border border-slate-200"
          >
            <Download size={11} />
            .txt
          </button>
          <button
            onClick={() => download('md')}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors border border-slate-200"
          >
            <Download size={11} />
            .md
          </button>
          <button
            onClick={() => { setText(''); onClear() }}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-0.5"
            title="Xóa kết quả"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Text area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-white text-slate-800 p-3.5 resize-none outline-none min-h-0 overflow-y-auto placeholder-slate-300 custom-scrollbar focus:bg-slate-50/20 transition-colors border-0"
        placeholder="Văn bản trích xuất sẽ hiển thị ở đây..."
        spellCheck={false}
      />

      <div className="px-3.5 py-1.5 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between flex-shrink-0">
        <span className="text-[9px] text-slate-400 font-mono">{text.length} ký tự</span>
        <span className="text-[9px] text-slate-400 font-medium italic">Có thể chỉnh sửa trực tiếp</span>
      </div>
    </div>
  )
}
