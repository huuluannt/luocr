import type { OCRResult } from '../types'

const FREE_KEY = 'helloworld' // OCR.space public demo key

function isQuotaError(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('limit reached') ||
    lower.includes('too many') ||
    lower.includes('exceeded') ||
    lower.includes('subscription')
  )
}

export async function runOCRSpace(
  file: File | Blob,
  apiKey?: string
): Promise<OCRResult> {
  const key = apiKey?.trim() || FREE_KEY
  const formData = new FormData()
  formData.append('file', file)
  formData.append('apikey', key)
  formData.append('language', 'eng')
  formData.append('isOverlayRequired', 'false')
  formData.append('detectOrientation', 'true')
  formData.append('scale', 'true')

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()

  if (json.IsErroredOnProcessing) {
    const errMsg = json.ErrorMessage?.[0] || json.ErrorDetails || 'OCR.space error'
    if (isQuotaError(errMsg)) {
      const err = new Error(errMsg) as any
      err.isQuota = true
      throw err
    }
    throw new Error(errMsg)
  }

  const pages = json.ParsedResults || []
  const text = pages.map((p: any) => p.ParsedText || '').join('\n\n').trim()
  const confidence = pages[0]?.TextOverlay?.Lines?.[0]?.Words?.[0]?.WordConfidence

  return {
    text,
    confidence: confidence ? Math.round(confidence) : undefined,
    engine: 'ocrspace',
    pages: pages.length,
  }
}
