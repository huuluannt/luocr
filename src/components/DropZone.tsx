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
      <div className="relative rounded-2xl overflow-hidden glass h-full min-h-64 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/40">
          <div className="flex items-center gap-2 min-w-0">
            {isPdf
              ? <FileText size={16} className="text-amber-400 shrink-0" />
              : <FileImage size={16} className="text-amber-400 shrink-0" />
            }
            <span className="text-sm text-ink-200 truncate font-medium">{file.name}</span>
          </div>
          <div className="flex items-center gap-3 ml-2 shrink-0">
            <span className="text-xs text-ink-500">{formatSize(file.size)}</span>
            {isPdf && <span className="text-xs text-ink-500">{pdfPageCount} trang</span>}
            <button onClick={onClear} className="text-ink-500 hover:text-amber-400 transition-colors" title="Xoa file">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {isPdf ? (
            <div className="flex flex-col items-center gap-3 text-ink-400">
              <FileText size={64} className="text-amber-400/30" />
              <p className="text-sm text-center">
                PDF - <span className="text-amber-400">{pdfPageCount} trang</span> se duoc nhan dang
              </p>
              <p className="text-xs text-ink-600">Xem truoc PDF khong duoc ho tro truc tiep</p>
            </div>
          ) : preview ? (
            <img src={preview} alt="Preview" className="max-w-full max-h-96 object-contain rounded-lg shadow-lg" />
          ) : null}
        </div>

        <div className="px-4 py-2 border-t border-ink-700/40">
          <button onClick={() => inputRef.current?.click()} className="text-xs text-ink-500 hover:text-amber-400 transition-colors">
            Chon file khac
          </button>
          <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={handleChange} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded-2xl glass border-2 border-dashed transition-all duration-200 cursor-pointer min-h-64 flex flex-col items-center justify-center gap-4 p-8 ${dragging ? 'drop-zone-active border-amber-400' : 'border-ink-700 hover:border-ink-500'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={ACCEPT.join(',')} className="hidden" onChange={handleChange} />

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${dragging ? 'bg-amber-400/20' : 'bg-ink-800'}`}>
        <Upload size={28} className={dragging ? 'text-amber-400' : 'text-ink-500'} />
      </div>

      <div className="text-center">
        <p className="text-ink-200 font-medium mb-1">{dragging ? 'Tha file vao day' : 'Keo tha hoac nhan de chon file'}</p>
        <p className="text-xs text-ink-500">JPG, PNG, WEBP, PDF - Toi da 10MB</p>
      </div>
    </div>
  )
}
