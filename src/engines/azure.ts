import type { OCRResult } from '../types'

function isQuotaError(msg: string, status?: number): boolean {
  const lower = msg.toLowerCase()
  return (
    status === 429 ||
    status === 403 ||
    lower.includes('quota') ||
    lower.includes('rate limit') ||
    lower.includes('billing') ||
    lower.includes('too many requests') ||
    lower.includes('out of call volume')
  )
}

export async function runAzure(
  imageBase64: string,
  endpoint: string,
  apiKey: string,
  mimeType: string
): Promise<OCRResult> {
  // Normalize endpoint
  const base = endpoint.replace(/\/$/, '')
  const url = `${base}/vision/v3.2/read/analyze`

  // Convert base64 to binary
  const b64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
  const binaryStr = atob(b64)
  const bytes = new Uint8Array(binaryStr.length)
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })

  // Submit job
  const submitRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': mimeType,
    },
    body: blob,
  })

  if (!submitRes.ok) {
    const errText = await submitRes.text()
    const err = new Error(`Azure submit failed (${submitRes.status}): ${errText}`) as any
    err.isQuota = isQuotaError(errText, submitRes.status)
    throw err
  }

  const operationUrl = submitRes.headers.get('Operation-Location')
  if (!operationUrl) throw new Error('Azure: no Operation-Location header')

  // Poll for result
  let attempts = 0
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 1000))
    const pollRes = await fetch(operationUrl, {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
    })

    if (!pollRes.ok) {
      const errText = await pollRes.text()
      const err = new Error(`Azure poll failed (${pollRes.status}): ${errText}`) as any
      err.isQuota = isQuotaError(errText, pollRes.status)
      throw err
    }

    const result = await pollRes.json()

    if (result.status === 'succeeded') {
      const lines: string[] = []
      for (const page of result.analyzeResult?.readResults || []) {
        for (const line of page.lines || []) {
          lines.push(line.text)
        }
      }
      return {
        text: lines.join('\n').trim(),
        engine: 'azure',
        pages: result.analyzeResult?.readResults?.length,
      }
    }

    if (result.status === 'failed') {
      throw new Error(result.analyzeResult?.errors?.[0]?.message || 'Azure OCR failed')
    }

    attempts++
  }

  throw new Error('Azure OCR timed out')
}
