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
    <div className="min-h-screen bg-ink-900" style={{ background: 'radial-gradient(ellipse at 20% 20%, #1a1508 0%, #0f0d09 60%)' }}>
      {/* Header */}
      <header className="border-b border-ink-800/60 sticky top-0 z-40" style={{ background: 'rgba(15,13,9,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Scan size={16} className="text-ink-900" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-ink-100 tracking-tight">LuOCR</span>
              <span className="text-xs text-ink-600 ml-2 hidden sm:inline">Nhan dang van ban tu anh & PDF</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://ocr.space/OCRAPI" target="_blank" rel="noopener noreferrer"
              className="text-xs text-ink-600 hover:text-amber-400 transition-colors hidden sm:flex items-center gap-1">
              <Info size={12} />
              Huong dan
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">1. Chon file</h2>
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
              <div className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-ink-300">Dang xu ly PDF...</span>
              </div>
            )}

            {/* Lang selector for tesseract */}
            {(selectedEngine === 'tesseract' || autoMode) && (
              <div className="glass rounded-xl px-4 py-3">
                <LangSelector lang={lang} onChange={setLang} disabled={loading} />
                <p className="text-xs text-ink-600 mt-2">Chi ho tro cho Tesseract Local. Cloud engine tu phat hien ngon ngu.</p>
              </div>
            )}

            {/* OCR Button */}
            <button
              onClick={runOCR}
              disabled={!canRun}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200
                ${canRun
                  ? 'bg-amber-500 hover:bg-amber-400 text-ink-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:-translate-y-0.5'
                  : 'bg-ink-800 text-ink-600 cursor-not-allowed'}`}
            >
              <Zap size={16} />
              {loading ? 'Dang xu ly...' : 'Bat dau nhan dang OCR'}
            </button>
          </div>

          {/* Right: Engine + Result */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">2. Chon engine OCR</h2>
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

            <div>
              <h2 className="text-sm font-semibold text-ink-400 uppercase tracking-wider mb-3">3. Ket qua</h2>
              <ResultPanel
                result={result}
                loading={loading}
                progress={progress}
                error={error}
                onClear={() => { setResult(null); setError(null) }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-ink-700 space-y-1">
          <p>LuOCR - Ung dung nhan dang van ban mien phi. Khong luu tru file tren may chu.</p>
          <p>Tesseract.js chay hoan toan trong trinh duyet. Cloud engine chi duoc su dung khi ban chon va cau hinh.</p>
        </footer>
      </main>
    </div>
  )
}
