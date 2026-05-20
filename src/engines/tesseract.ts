import * as TesseractModule from 'tesseract.js'

// Vite CJS/ESM interop handling
const Tesseract = (TesseractModule as any).default || TesseractModule
const recognize = Tesseract.recognize || (TesseractModule as any).recognize
import type { OCRResult } from '../types'

export async function runTesseract(
  imageData: string | File | Blob,
  lang: string,
  onProgress?: (pct: number) => void
): Promise<OCRResult> {
  const { data } = await recognize(imageData, lang, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  return {
    text: data.text.trim(),
    confidence: Math.round(data.confidence),
    engine: 'tesseract',
  }
}
