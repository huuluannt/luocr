import React, { useState } from 'react'
import { Cpu, Globe, Eye, Cloud, ChevronDown, ChevronUp, AlertTriangle, Info, Shield } from 'lucide-react'
import type { EngineId, AppSettings } from '../types'
import { isEngineDisabled, enableEngine } from '../utils/storage'

interface Props {
  selected: EngineId
  onSelect: (id: EngineId) => void
  settings: AppSettings
  onSettingsChange: (s: AppSettings) => void
  autoMode: boolean
  onAutoMode: (v: boolean) => void
  cloudWarningAccepted: boolean
  onAcceptCloudWarning: () => void
}

interface Engine {
  id: EngineId
  icon: React.ReactNode
  name: string
  badge: string
  badgeClass: string
  privacy: string
  requiresKey: boolean
  mayCost: boolean
}

const ENGINES: Engine[] = [
  {
    id: 'tesseract',
    icon: <Cpu size={18} />,
    name: 'Tesseract Local',
    badge: 'Mien phi & Cuc bo',
    badgeClass: 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50',
    privacy: 'Anh KHONG roi khoi trinh duyet. Hoan toan rieng tu.',
    requiresKey: false,
    mayCost: false,
  },
  {
    id: 'ocrspace',
    icon: <Globe size={18} />,
    name: 'OCR.space',
    badge: 'Free Quota',
    badgeClass: 'bg-blue-900/50 text-blue-400 border-blue-700/50',
    privacy: 'Anh se duoc gui len may chu OCR.space de xu ly.',
    requiresKey: false,
    mayCost: false,
  },
  {
    id: 'google',
    icon: <Eye size={18} />,
    name: 'Google Cloud Vision',
    badge: 'Can API Key',
    badgeClass: 'bg-amber-900/50 text-amber-400 border-amber-700/50',
    privacy: 'Anh gui len Google. Co the mat phi tuy cau hinh billing.',
    requiresKey: true,
    mayCost: true,
  },
  {
    id: 'azure',
    icon: <Cloud size={18} />,
    name: 'Azure AI Vision',
    badge: 'Can Endpoint + Key',
    badgeClass: 'bg-amber-900/50 text-amber-400 border-amber-700/50',
    privacy: 'Anh gui len Azure. Co the mat phi tuy cap do dich vu.',
    requiresKey: true,
    mayCost: true,
  },
]

export default function EngineSelector({ selected, onSelect, settings, onSettingsChange, autoMode, onAutoMode, cloudWarningAccepted, onAcceptCloudWarning }: Props) {
  const [expanded, setExpanded] = useState<EngineId | null>(null)
  const [showCloudWarn, setShowCloudWarn] = useState(false)
  const [pendingEngine, setPendingEngine] = useState<EngineId | null>(null)

  const handleSelect = (engine: Engine) => {
    if (autoMode) return
    if ((engine.id === 'google' || engine.id === 'azure') && !cloudWarningAccepted) {
      setPendingEngine(engine.id)
      setShowCloudWarn(true)
      return
    }
    onSelect(engine.id)
    setExpanded(engine.id)
  }

  const confirmCloud = () => {
    onAcceptCloudWarning()
    setShowCloudWarn(false)
    if (pendingEngine) {
      onSelect(pendingEngine)
      setExpanded(pendingEngine)
    }
    setPendingEngine(null)
  }

  const s = settings

  return (
    <div className="space-y-3">
      {/* Auto mode toggle */}
      <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-200">Tu dong chon mien phi</p>
          <p className="text-xs text-ink-500">Thu Tesseract truoc, goi y OCR.space neu can</p>
        </div>
        <button
          onClick={() => onAutoMode(!autoMode)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${autoMode ? 'bg-amber-500' : 'bg-ink-700'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${autoMode ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      {/* Engine cards */}
      {ENGINES.map((engine) => {
        const isSelected = selected === engine.id && !autoMode
        const disabled = isEngineDisabled(engine.id)

        return (
          <div key={engine.id} className={`glass rounded-xl overflow-hidden transition-all duration-200
            ${isSelected ? 'ring-1 ring-amber-500/50' : ''}
            ${disabled ? 'opacity-50' : ''}`}>
            <button
              className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                ${isSelected ? 'bg-amber-500/5' : 'hover:bg-ink-800/50'}
                ${autoMode && engine.id !== 'tesseract' ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleSelect(engine)}
              disabled={disabled}
            >
              <span className={`shrink-0 ${isSelected ? 'text-amber-400' : 'text-ink-500'}`}>{engine.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-ink-100">{engine.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${engine.badgeClass}`}>{engine.badge}</span>
                  {engine.mayCost && <span className="text-xs px-2 py-0.5 rounded-full border bg-red-900/30 text-red-400 border-red-700/40">Co the mat phi</span>}
                  {disabled && <span className="text-xs text-red-400">Da tam tat</span>}
                </div>
              </div>
              {engine.requiresKey && (
                <button onClick={(e) => { e.stopPropagation(); setExpanded(expanded === engine.id ? null : engine.id) }}
                  className="text-ink-500 hover:text-amber-400 transition-colors shrink-0">
                  {expanded === engine.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </button>

            {/* Privacy note */}
            <div className="px-4 pb-2 flex items-start gap-1.5">
              <Shield size={11} className="text-ink-600 mt-0.5 shrink-0" />
              <span className="text-xs text-ink-600">{engine.privacy}</span>
            </div>

            {/* Disabled reset */}
            {disabled && (
              <div className="px-4 pb-3">
                <button onClick={() => enableEngine(engine.id)} className="text-xs text-amber-400 hover:underline">
                  Thu lai engine nay
                </button>
              </div>
            )}

            {/* Config panel for cloud engines */}
            {(engine.id === 'ocrspace' || expanded === engine.id) && (
              <div className={`border-t border-ink-700/30 px-4 py-3 space-y-3 ${engine.id === 'ocrspace' && !isSelected && !expanded ? 'hidden' : ''}`}>
                {engine.id === 'ocrspace' && isSelected && (
                  <div>
                    <label className="block text-xs text-ink-400 mb-1">API Key (tuy chon - de trong de dung demo key)</label>
                    <input
                      type="text"
                      placeholder="Key rieng cua ban (tuy chon)"
                      value={s.ocrspaceKey}
                      onChange={(e) => onSettingsChange({ ...s, ocrspaceKey: e.target.value })}
                      className="w-full bg-ink-900 text-ink-200 text-xs px-3 py-2 rounded-lg border border-ink-700 focus:border-amber-500 outline-none font-mono"
                    />
                    <p className="text-xs text-ink-600 mt-1">De trong se dung demo key (co gioi han). Lay key mien phi tai ocr.space</p>
                  </div>
                )}
                {engine.id === 'google' && expanded === 'google' && (
                  <div>
                    <label className="block text-xs text-ink-400 mb-1">Google Cloud Vision API Key *</label>
                    <input
                      type="password"
                      placeholder="AIza..."
                      value={s.googleKey}
                      onChange={(e) => onSettingsChange({ ...s, googleKey: e.target.value })}
                      className="w-full bg-ink-900 text-ink-200 text-xs px-3 py-2 rounded-lg border border-ink-700 focus:border-amber-500 outline-none font-mono"
                    />
                    <p className="text-xs text-ink-600 mt-1">Key luu trong localStorage. Khong gui len bat ky may chu nao khac ngoai Google.</p>
                  </div>
                )}
                {engine.id === 'azure' && expanded === 'azure' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-ink-400 mb-1">Azure Endpoint *</label>
                      <input
                        type="text"
                        placeholder="https://your-resource.cognitiveservices.azure.com"
                        value={s.azureEndpoint}
                        onChange={(e) => onSettingsChange({ ...s, azureEndpoint: e.target.value })}
                        className="w-full bg-ink-900 text-ink-200 text-xs px-3 py-2 rounded-lg border border-ink-700 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-ink-400 mb-1">Azure Subscription Key *</label>
                      <input
                        type="password"
                        placeholder="Subscription key..."
                        value={s.azureKey}
                        onChange={(e) => onSettingsChange({ ...s, azureKey: e.target.value })}
                        className="w-full bg-ink-900 text-ink-200 text-xs px-3 py-2 rounded-lg border border-ink-700 focus:border-amber-500 outline-none font-mono"
                      />
                    </div>
                    <p className="text-xs text-ink-600">Key luu trong localStorage. Khong gui len bat ky may chu nao khac ngoai Azure.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Cloud warning modal */}
      {showCloudWarn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-400 shrink-0" size={24} />
              <h3 className="text-lg font-semibold text-ink-100">Canh bao bao mat</h3>
            </div>
            <p className="text-sm text-ink-300">
              Khi su dung engine nay, anh/PDF cua ban se duoc gui len may chu bên ngoai (Google hoac Azure) de xu ly.
            </p>
            <p className="text-sm text-amber-400/80">
              Service nay co the mat phi tuy theo cau hinh billing cua tai khoan Google/Azure cua ban. Vui long kiem tra han muc mien phi truoc.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCloudWarn(false)} className="flex-1 px-4 py-2 rounded-xl border border-ink-600 text-ink-300 text-sm hover:border-ink-500 transition-colors">
                Huy
              </button>
              <button onClick={confirmCloud} className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-ink-900 text-sm font-medium hover:bg-amber-400 transition-colors">
                Toi hieu, tiep tuc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
