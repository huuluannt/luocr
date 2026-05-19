export type EngineId = 'tesseract' | 'ocrspace' | 'google' | 'azure'

export type EngineStatus = 'ready' | 'running' | 'disabled' | 'unconfigured'

export interface EngineConfig {
  id: EngineId
  name: string
  badge: string
  badgeColor: string
  privacyNote: string
  requiresKey: boolean
  mayCost: boolean
}

export interface OCRResult {
  text: string
  confidence?: number
  engine: EngineId
  pages?: number
}

export interface EngineError {
  engine: EngineId
  message: string
  isQuota: boolean
  disabledUntil?: number // timestamp
}

export interface AppSettings {
  ocrspaceKey: string
  googleKey: string
  azureEndpoint: string
  azureKey: string
  tesseractLang: string
}

export type OCRLang = 'eng' | 'vie' | 'eng+vie'
