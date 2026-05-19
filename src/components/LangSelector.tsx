import React from 'react'
import type { OCRLang } from '../types'

interface Props {
  lang: OCRLang
  onChange: (lang: OCRLang) => void
  disabled?: boolean
}

const OPTIONS: { value: OCRLang; label: string }[] = [
  { value: 'eng', label: 'Tieng Anh' },
  { value: 'vie', label: 'Tieng Viet' },
  { value: 'eng+vie', label: 'Anh + Viet' },
]

export default function LangSelector({ lang, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-500 shrink-0">Ngon ngu:</span>
      <div className="flex rounded-lg overflow-hidden border border-ink-700 bg-ink-900">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={`text-xs px-3 py-1.5 transition-colors
              ${lang === o.value ? 'bg-amber-500 text-ink-900 font-medium' : 'text-ink-400 hover:text-ink-200 hover:bg-ink-800'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
