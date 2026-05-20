import React from 'react'
import type { OCRLang } from '../types'

interface Props {
  lang: OCRLang
  onChange: (lang: OCRLang) => void
  disabled?: boolean
}

const OPTIONS: { value: OCRLang; label: string }[] = [
  { value: 'eng', label: 'Tiếng Anh' },
  { value: 'vie', label: 'Tiếng Việt' },
  { value: 'eng+vie', label: 'Anh + Việt' },
]

export default function LangSelector({ lang, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngôn ngữ nhận dạng:</span>
      <div className="flex flex-col gap-1.5 w-full">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`w-full text-left text-[10px] px-3 py-1.5 rounded-lg border font-semibold transition-all duration-200
              ${lang === o.value 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
