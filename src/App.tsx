import React, { useState, useCallback, useEffect } from 'react'
import { Scan, Zap, Info } from 'lucide-react'
import DropZone from './components/DropZone'
import EngineSelector from './components/EngineSelector'
import ResultPanel from './components/ResultPanel'
import LangSelector from './components/LangSelector'
import type { EngineId, OCRResult, AppSettings, OCRLang } from './types'
import { runTesseract } from './engines/tesseract'
import { runOCRSpace } from './engines/ocrspace'
import { runGoogleVision } from './engines/google'
import { runAzure } from './engines/azure'
import { pdfToImages } from './utils/pdf'
import { fileToBase64 } from './utils/fileToBase64'
import { loadSettings, saveSettings, disableEngine, isEngineDisabled } from './utils/storage'

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [selectedEngine, setSelectedEngine] = useState<EngineId>('tesseract')
  const [settings, setSettings] = useState<AppSettings>(loadSettings())
  const [autoMode, setAutoMode] = useState(false)
  const [lang, setLang] = useState<OCRLang>('eng+vie')
  const [result, setResult] = useState<OCRResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cloudWarningAccepted, setCloudWarningAccepted] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const handleFile = useCallback(async (f: File) => {
    setFile(f)
    setResult(null)
    setError(null)

    if (f.type === 'application/pdf') {
      setIsPdf(true)
      setPreview(null)
      setPdfLoading(true)
      try {
        const imgs = await pdfToImages(f)
        setPdfImages(imgs)
      } catch (e) {
        setError('Khong the doc file PDF. Vui long thu file khac.')
      } finally {
        setPdfLoading(false)
      }
    } else {
      setIsPdf(false)
      setPdfImages([])
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }, [])

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setIsPdf(false)
    setPdfImages([])
    setResult(null)
    setError(null)
    setProgress(0)
  }

  const getEngineToUse = (): EngineId => {
    if (autoMode) {
      if (!isEngineDisabled('tesseract')) return 'tesseract'
      if (!isEngineDisabled('ocrspace')) return 'ocrspace'
      return 'tesseract'
    }
    return selectedEngine
  }

  const runOCR = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress(0)

    const engine = getEngineToUse()

    try {
      if (engine === 'tesseract') {
        // Handle multi-page PDF
        if (isPdf && pdfImages.length > 0) {
          let combined = ''
          for (let i = 0; i < pdfImages.length; i++) {
            setProgress(Math.round((i / pdfImages.length) * 100))
            const res = await runTesseract(pdfImages[i], lang, (p) => {
              setProgress(Math.round(((i + p / 100) / pdfImages.length) * 100))
            })
            combined += (i > 0 ? '\n\n--- Trang ' + (i + 1) + ' ---\n\n' : '') + res.text
          }
          setResult({ text: combined, engine: 'tesseract', pages: pdfImages.length })
        } else {
          const res = await runTesseract(file, lang, setProgress)
          setResult(res)
        }

      } else if (engine === 'ocrspace') {
        // OCR.space handles PDF natively
        const res = await runOCRSpace(file, settings.ocrspaceKey || undefined)
        setResult(res)

      } else if (engine === 'google') {
        if (!settings.googleKey) throw new Error('Chua cau hinh Google API Key. Vui long nhap key trong cai dat engine.')
        const images = isPdf && pdfImages.length > 0 ? pdfImages : [await fileToBase64(file)]
        let combined = ''
        for (let i = 0; i < images.length; i++) {
          setProgress(Math.round((i / images.length) * 100))
          const res = await runGoogleVision(images[i], settings.googleKey)
          combined += (i > 0 ? '\n\n--- Trang ' + (i + 1) + ' ---\n\n' : '') + res.text
        }
        setResult({ text: combined, engine: 'google', pages: images.length })

      } else if (engine === 'azure') {
        if (!settings.azureEndpoint || !settings.azureKey) {
          throw new Error('Chua cau hinh Azure Endpoint hoac Key. Vui long nhap trong cai dat engine.')
        }
        const images = isPdf && pdfImages.length > 0 ? pdfImages : [await fileToBase64(file)]
        let combined = ''
        for (let i = 0; i < images.length; i++) {
          setProgress(Math.round((i / images.length) * 100))
          const res = await runAzure(images[i], settings.azureEndpoint, settings.azureKey, 'image/png')
          combined += (i > 0 ? '\n\n--- Trang ' + (i + 1) + ' ---\n\n' : '') + res.text
        }
        setResult({ text: combined, engine: 'azure', pages: images.length })
      }

    } catch (e: any) {
      const msg = e?.message || 'Loi khong xac dinh'
      if (e?.isQuota) {
        disableEngine(engine)
        setError(`Engine nay da het han muc mien phi hoac gap loi thanh toan. Da tam tat. Vui long chon engine khac.\n\nChi tiet: ${msg}`)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
      setProgress(100)
    }
  }

  const canRun = !!file && !loading && !pdfLoading && (isPdf ? pdfImages.length > 0 : true)

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-ink-900 font-sans select-none" style={{ background: 'radial-gradient(ellipse at 20% 20%, #1a1508 0%, #0f0d09 60%)' }}>
      {/* Header */}
      <header className="border-b border-ink-800/60 flex-shrink-0 z-40 bg-ink-950/80 backdrop-blur-md">
        <div className="w-full px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25 animate-pulse-slow">
              <Scan size={16} className="text-ink-900" />
            </div>
            <div>
              <span className="font-display font-bold text-base text-ink-100 tracking-tight">LuOCR</span>
              <span className="text-[11px] text-ink-500 ml-3 hidden sm:inline border-l border-ink-800 pl-3">Nhận dạng văn bản từ ảnh & PDF</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://ocr.space/OCRAPI" target="_blank" rel="noopener noreferrer"
              className="text-xs text-ink-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium">
              <Info size={13} />
              Hướng dẫn API
            </a>
          </div>
        </div>
      </header>

      {/* Main Workspace (No global page scroll) */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top Pane (toppane) */}
        <div className="flex-[5.8] min-h-0 flex flex-col lg:flex-row border-b border-ink-800/40">
          
          {/* Left Pane (leftpane) - Part 1: Chọn file */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-ink-800/40 custom-scrollbar">
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-[11px] font-semibold text-amber-500/90 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-amber"></span>
                1. Chọn file
              </h2>
            </div>
            
            <div className="flex-1 min-h-0">
              <DropZone
                onFile={handleFile}
                file={file}
                preview={preview}
                isPdf={isPdf}
                pdfPageCount={pdfImages.length}
                onClear={handleClear}
              />
            </div>

            {pdfLoading && (
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3 flex-shrink-0 shadow-sm border border-amber-500/10">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-ink-300">Đang xử lý PDF...</span>
              </div>
            )}

            {/* Lang selector for tesseract */}
            {(selectedEngine === 'tesseract' || autoMode) && (
              <div className="glass rounded-xl px-4 py-2.5 flex-shrink-0 border border-ink-800/30">
                <LangSelector lang={lang} onChange={setLang} disabled={loading} />
                <p className="text-[10px] text-ink-500 mt-1">Hỗ trợ cho Tesseract Local. Cloud engine tự phát hiện ngôn ngữ.</p>
              </div>
            )}

            {/* OCR Button */}
            <button
              onClick={runOCR}
              disabled={!canRun}
              className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-300 flex-shrink-0 uppercase tracking-wider
                ${canRun
                  ? 'bg-amber-500 hover:bg-amber-400 text-ink-900 shadow-[0_4px_20px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-ink-850 text-ink-600 cursor-not-allowed border border-ink-800/30'}`}
            >
              <Zap size={14} className={loading ? 'animate-bounce' : ''} />
              {loading ? 'Đang xử lý...' : 'Bắt đầu nhận dạng OCR'}
            </button>
          </div>

          {/* Right Pane (rightpane) - Part 2: Chọn engine OCR */}
          <div className="flex-1 lg:flex-[1.1] min-h-0 overflow-y-auto p-5 flex flex-col gap-4 custom-scrollbar">
            <h2 className="text-[11px] font-semibold text-amber-500/90 uppercase tracking-widest flex items-center gap-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-amber"></span>
              2. Chọn engine OCR
            </h2>
            <div className="flex-1">
              <EngineSelector
                selected={selectedEngine}
                onSelect={setSelectedEngine}
                settings={settings}
                onSettingsChange={setSettings}
                autoMode={autoMode}
                onAutoMode={setAutoMode}
                cloudWarningAccepted={cloudWarningAccepted}
                onAcceptCloudWarning={() => setCloudWarningAccepted(true)}
              />
            </div>
          </div>

        </div>

        {/* Bottom Pane (bottompane) - Part 3: Kết quả */}
        <div className="flex-[4.2] min-h-0 flex flex-col p-5 bg-ink-950/20">
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <h2 className="text-[11px] font-semibold text-amber-500/90 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-amber"></span>
              3. Kết quả nhận dạng
            </h2>
            <span className="text-[10px] text-ink-600 font-medium">Bảo mật tuyệt đối • Chạy trực tiếp trong trình duyệt</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResultPanel
              result={result}
              loading={loading}
              progress={progress}
              error={error}
              onClear={() => { setResult(null); setError(null) }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
