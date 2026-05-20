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
    icon: <Cpu size={16} />,
    name: 'Tesseract Local',
    badge: 'Cục bộ & Miễn phí',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    privacy: 'Ảnh xử lý trực tiếp trên trình duyệt của bạn.',
    requiresKey: false,
    mayCost: false,
  },
  {
    id: 'ocrspace',
    icon: <Globe size={16} />,
    name: 'OCR.space',
    badge: 'Mã miễn phí',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    privacy: 'Ảnh được gửi lên máy chủ OCR.space để xử lý.',
    requiresKey: false,
    mayCost: false,
  },
  {
    id: 'google',
    icon: <Eye size={16} />,
    name: 'Google Vision',
    badge: 'Cần API Key',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    privacy: 'Ảnh gửi lên Google. Có thể tính phí theo biểu giá API.',
    requiresKey: true,
    mayCost: true,
  },
  {
    id: 'azure',
    icon: <Cloud size={16} />,
    name: 'Azure AI Vision',
    badge: 'Cần Endpoint + Key',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/60',
    privacy: 'Ảnh gửi lên Azure AI. Có thể tính phí theo biểu giá dịch vụ.',
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
    <div className="space-y-2">
      {/* Auto mode toggle */}
      <div className="glass rounded-xl px-3 py-2 flex items-center justify-between border border-slate-200 bg-white">
        <div>
          <p className="text-xs font-semibold text-slate-800">Tự động chọn miễn phí</p>
          <p className="text-[10px] text-slate-400">Thử Tesseract trước, gợi ý OCR.space nếu cần</p>
        </div>
        <button
          onClick={() => onAutoMode(!autoMode)}
          className={`relative w-9 h-5 rounded-full transition-colors duration-250 ${autoMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-250 ${autoMode ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      {/* Engine cards */}
      {ENGINES.map((engine) => {
        const isSelected = selected === engine.id && !autoMode
        const disabled = isEngineDisabled(engine.id)

        return (
          <div key={engine.id} className={`rounded-xl overflow-hidden transition-all duration-250 border-2
            ${isSelected ? 'bg-yellow-100 border-black shadow-md shadow-yellow-200/30 scale-[1.015]' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}
            ${disabled ? 'opacity-40' : ''}`}>
            <button
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-all duration-250
                ${isSelected ? 'bg-transparent' : 'hover:bg-slate-50/40'}
                ${autoMode && engine.id !== 'tesseract' ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => handleSelect(engine)}
              disabled={disabled}
            >
              <span className={`shrink-0 transition-transform duration-250 ${isSelected ? 'text-black scale-110 font-bold' : 'text-slate-400'}`}>{engine.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[11px] font-bold leading-tight transition-colors duration-250 ${isSelected ? 'text-black font-extrabold' : 'text-slate-800'}`}>{engine.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border leading-none ${engine.badgeClass}`}>{engine.badge}</span>
                  {engine.mayCost && <span className="text-[9px] px-1.5 py-0.5 rounded border bg-red-50 text-red-600 border-red-150 leading-none">Có phí</span>}
                  {disabled && <span className="text-[9px] text-red-500 font-semibold">Đang tắt</span>}
                </div>
              </div>
              {engine.requiresKey && (
                <button onClick={(e) => { e.stopPropagation(); setExpanded(expanded === engine.id ? null : engine.id) }}
                  className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0 p-1">
                  {expanded === engine.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              )}
            </button>

            {/* Privacy note */}
            <div className="px-3 pb-1.5 flex items-start gap-1">
              <Shield size={10} className="text-slate-350 mt-0.5 shrink-0" />
              <span className="text-[9px] text-slate-400 leading-none">{engine.privacy}</span>
            </div>

            {/* Disabled reset */}
            {disabled && (
              <div className="px-3 pb-2">
                <button onClick={() => enableEngine(engine.id)} className="text-[10px] text-indigo-600 hover:underline">
                  Thử lại engine này
                </button>
              </div>
            )}

            {/* Config panel for cloud engines */}
            {(engine.id === 'ocrspace' || expanded === engine.id) && (
              <div className={`border-t border-slate-100 px-3 py-2 space-y-2 bg-slate-50/40 ${engine.id === 'ocrspace' && !isSelected && !expanded ? 'hidden' : ''}`}>
                {engine.id === 'ocrspace' && isSelected && (
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">API Key (tùy chọn - để trống dùng demo key)</label>
                    <input
                      type="text"
                      placeholder="Key riêng của bạn (nếu có)"
                      value={s.ocrspaceKey}
                      onChange={(e) => onSettingsChange({ ...s, ocrspaceKey: e.target.value })}
                      className="w-full bg-white text-slate-800 text-[10px] px-2.5 py-1.5 rounded border border-slate-200 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                )}
                {engine.id === 'google' && expanded === 'google' && (
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Google Cloud Vision API Key *</label>
                    <input
                      type="password"
                      placeholder="AIza..."
                      value={s.googleKey}
                      onChange={(e) => onSettingsChange({ ...s, googleKey: e.target.value })}
                      className="w-full bg-white text-slate-800 text-[10px] px-2.5 py-1.5 rounded border border-slate-200 focus:border-indigo-500 outline-none font-mono"
                    />
                  </div>
                )}
                {engine.id === 'azure' && expanded === 'azure' && (
                  <div className="space-y-1.5">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Azure Endpoint *</label>
                      <input
                        type="text"
                        placeholder="https://your-resource.cognitiveservices.azure.com"
                        value={s.azureEndpoint}
                        onChange={(e) => onSettingsChange({ ...s, azureEndpoint: e.target.value })}
                        className="w-full bg-white text-slate-800 text-[10px] px-2.5 py-1.5 rounded border border-slate-200 focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Azure Subscription Key *</label>
                      <input
                        type="password"
                        placeholder="Subscription key..."
                        value={s.azureKey}
                        onChange={(e) => onSettingsChange({ ...s, azureKey: e.target.value })}
                        className="w-full bg-white text-slate-800 text-[10px] px-2.5 py-1.5 rounded border border-slate-200 focus:border-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Cloud warning modal */}
      {showCloudWarn && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3.5 shadow-xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="text-amber-500 shrink-0" size={20} />
              <h3 className="text-sm font-bold text-slate-800">Cảnh báo bảo mật</h3>
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              Khi sử dụng engine này, tài liệu của bạn sẽ được gửi lên máy chủ đám mây (Google hoặc Azure) để nhận diện.
            </p>
            <p className="text-[11px] text-amber-600 font-semibold leading-normal">
              Dịch vụ này có thể phát sinh chi phí tùy thuộc vào cài đặt tài khoản Google/Azure của bạn.
            </p>
            <div className="flex gap-2.5 pt-1.5">
              <button onClick={() => setShowCloudWarn(false)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              <button onClick={confirmCloud} className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors">
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
