import Tesseract from 'tesseract.js'
import type { OCRResult } from '../types'

export async function runTesseract(
  imageData: string | File | Blob,
  lang: string,
  onProgress?: (pct: number) => void
): Promise<OCRResult> {
  const { data } = await Tesseract.recognize(imageData, lang, {
    logger: (m) => {
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
