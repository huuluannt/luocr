import type { AppSettings } from '../types'

const KEY = 'luocr_settings'
const DISABLED_KEY = 'luocr_disabled_engines'

const defaults: AppSettings = {
  ocrspaceKey: '',
  googleKey: '',
  azureEndpoint: '',
  azureKey: '',
  tesseractLang: 'eng+vie',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

export function saveSettings(s: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s))
}

interface DisabledEngines {
  [engine: string]: number // timestamp disabled until
}

export function getDisabledEngines(): DisabledEngines {
  try {
    const raw = localStorage.getItem(DISABLED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function disableEngine(engine: string, durationMs = 3600000): void {
  const current = getDisabledEngines()
  current[engine] = Date.now() + durationMs
  localStorage.setItem(DISABLED_KEY, JSON.stringify(current))
}

export function isEngineDisabled(engine: string): boolean {
  const current = getDisabledEngines()
  const until = current[engine]
  if (!until) return false
  if (Date.now() > until) {
    delete current[engine]
    localStorage.setItem(DISABLED_KEY, JSON.stringify(current))
    return false
  }
  return true
}

export function enableEngine(engine: string): void {
  const current = getDisabledEngines()
  delete current[engine]
  localStorage.setItem(DISABLED_KEY, JSON.stringify(current))
}
