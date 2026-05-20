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
      <div className="relative rounded-xl overflow-hidden glass h-full min-h-[110px] max-h-[140px] flex flex-col border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {isPdf
              ? <FileText size={14} className="text-indigo-500 shrink-0" />
              : <FileImage size={14} className="text-indigo-500 shrink-0" />
            }
            <span className="text-[11px] text-slate-700 truncate font-semibold">{file.name}</span>
          </div>
          <div className="flex items-center gap-3 ml-2 shrink-0">
            <span className="text-[10px] text-slate-400 font-mono">{formatSize(file.size)}</span>
            {isPdf && <span className="text-[10px] text-slate-400 font-mono">{pdfPageCount} trang</span>}
            <button onClick={onClear} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Xóa file">
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 min-h-0 overflow-hidden bg-slate-50/20">
          {isPdf ? (
            <div className="flex items-center gap-2.5 text-slate-500">
              <FileText size={32} className="text-indigo-500/70" />
              <div className="text-left leading-none">
                <p className="text-[11px] font-semibold text-slate-700">Tệp tin PDF</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{pdfPageCount} trang sẽ được nhận dạng</p>
              </div>
            </div>
          ) : preview ? (
            <img src={preview} alt="Preview" className="max-w-full max-h-[70px] object-contain rounded border border-slate-200/60 shadow-sm" />
          ) : null}
        </div>

        <div className="px-3.5 py-1.5 border-t border-slate-100 bg-slate-50/30 flex-shrink-0">
          <button onClick={() => inputRef.current?.click()} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
            Chọn tệp khác...
          </button>
          <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={handleChange} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-xl glass border-2 border-dashed transition-all duration-350 cursor-pointer h-full min-h-[110px] max-h-[130px] flex flex-col items-center justify-center p-4 text-center ${dragging ? 'drop-zone-active border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/80'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={handleChange} />

      <div className="flex items-center gap-3.5 text-left">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${dragging ? 'bg-indigo-100 shadow-[0_0_10px_rgba(79,70,229,0.15)]' : 'bg-slate-50 border border-slate-100'}`}>
          <Upload size={16} className={`transition-transform duration-300 ${dragging ? 'text-indigo-600 -translate-y-0.5' : 'text-slate-500'}`} />
        </div>

        <div className="leading-tight">
          <p className="text-slate-800 text-[11px] font-semibold tracking-wide">{dragging ? 'Thả file tại đây' : 'Kéo thả hoặc nhấn để chọn file'}</p>
          <p className="text-[9px] text-slate-400 mt-0.5">Hỗ trợ ảnh JPG, PNG, WEBP hoặc PDF • Tối đa 10MB</p>
        </div>
      </div>
    </div>
  )
}
