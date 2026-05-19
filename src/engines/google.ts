import type { OCRResult } from '../types'

function isQuotaError(msg: string): boolean {
  const lower = msg.toLowerCase()
  return (
    lower.includes('quota') ||
    lower.includes('billing') ||
    lower.includes('budget') ||
    lower.includes('rate limit') ||
    lower.includes('resource exhausted') ||
    lower.includes('429') ||
    lower.includes('403')
  )
}

export async function runGoogleVision(
  imageBase64: string,
  apiKey: string
): Promise<OCRResult> {
  // Remove data URL prefix if present
  const base64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64

  const body = {
    requests: [
      {
        image: { content: base64 },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
      },
    ],
  }

  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  const json = await res.json()

  if (json.error) {
    const msg = json.error.message || 'Google Vision error'
    if (isQuotaError(msg) || json.error.code === 429 || json.error.code === 403) {
      const err = new Error(msg) as any
      err.isQuota = true
      throw err
    }
    throw new Error(msg)
  }

  const response = json.responses?.[0]
  if (response?.error) {
    const msg = response.error.message || 'Google Vision response error'
    const err = new Error(msg) as any
    err.isQuota = isQuotaError(msg)
    throw err
  }

  const text = response?.fullTextAnnotation?.text || ''
  const confidence = response?.fullTextAnnotation?.pages?.[0]?.confidence

  return {
    text: text.trim(),
    confidence: confidence ? Math.round(confidence * 100) : undefined,
    engine: 'google',
  }
}
