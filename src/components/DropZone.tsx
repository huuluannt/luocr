import React, { useCallback, useRef, useState } from 'react'
import { Upload, FileImage, FileText, X } from 'lucide-react'

interface Props {
  onFile: (file: File) => void
  file: File | null
  preview: string | null
  isPdf: boolean
  pdfPageCount: number
  onClear: () => void
}

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export default function DropZone({ onFile, file, preview, isPdf, pdfPageCount, onClear }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && ACCEPT.includes(f.type)) onFile(f)
  }, [onFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFile(f)
    e.target.value = ''
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (file) {
    return (
      <div className="relative rounded-2xl overflow-hidden glass h-full min-h-[220px] flex flex-col border border-ink-800/40">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700/40 bg-ink-950/20 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {isPdf
              ? <FileText size={15} className="text-amber-400 shrink-0" />
              : <FileImage size={15} className="text-amber-400 shrink-0" />
            }
            <span className="text-xs text-ink-200 truncate font-medium">{file.name}</span>
          </div>
          <div className="flex items-center gap-3 ml-2 shrink-0">
            <span className="text-[10px] text-ink-500 font-mono">{formatSize(file.size)}</span>
            {isPdf && <span className="text-[10px] text-ink-500 font-mono">{pdfPageCount} trang</span>}
            <button onClick={onClear} className="text-ink-500 hover:text-red-400 transition-colors p-1" title="Xóa file">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden bg-ink-950/10">
          {isPdf ? (
            <div className="flex flex-col items-center gap-2 text-ink-400">
              <FileText size={48} className="text-amber-400/25 animate-pulse" />
              <p className="text-xs text-center font-medium">
                PDF - <span className="text-amber-400 font-semibold">{pdfPageCount} trang</span>
              </p>
              <p className="text-[10px] text-ink-600">Xem trước PDF không được hỗ trợ trực tiếp</p>
            </div>
          ) : preview ? (
            <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-md border border-ink-800/50" />
          ) : null}
        </div>

        <div className="px-4 py-2 border-t border-ink-700/40 bg-ink-950/10 flex-shrink-0">
          <button onClick={() => inputRef.current?.click()} className="text-[11px] font-medium text-ink-400 hover:text-amber-400 transition-colors">
            Chọn file khác...
          </button>
          <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={handleChange} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl glass border-2 border-dashed transition-all duration-300 cursor-pointer h-full min-h-[200px] flex flex-col items-center justify-center gap-3.5 p-6 text-center ${dragging ? 'drop-zone-active border-amber-400 bg-amber-500/5' : 'border-ink-800/80 hover:border-amber-500/45 hover:bg-amber-500/[0.02]'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={handleChange} />

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${dragging ? 'bg-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-ink-850 border border-ink-800'}`}>
        <Upload size={20} className={`transition-transform duration-300 ${dragging ? 'text-amber-400 -translate-y-0.5' : 'text-ink-400'}`} />
      </div>

      <div>
        <p className="text-ink-200 text-xs font-semibold mb-1 tracking-wide">{dragging ? 'Thả file vào đây' : 'Kéo thả hoặc nhấn để chọn file'}</p>
        <p className="text-[10px] text-ink-500 font-medium">JPG, PNG, WEBP, PDF • Tối đa 10MB</p>
      </div>
    </div>
  )
}
