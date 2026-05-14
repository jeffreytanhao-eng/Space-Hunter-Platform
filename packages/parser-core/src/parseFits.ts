import type { ParsedFitsResult } from './types'

const KEYWORD_MAP: Record<string, keyof ParsedFitsResult> = {
  OBSERVER: 'observer',
  EXPTIME: 'exposure',
  FILTER: 'filter',
  TELESCOP: 'telescope',
  OBJCTRA: 'ra',
  OBJCTDEC: 'dec',
  OBJECT: 'object',
  DATEOBS: 'timestamp',
  GAIN: 'gain',
  XBINNING: 'binning',
  CCDTEMP: 'temperature'
}

const toNumber = (value: string): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

const normalizeValue = (targetKey: keyof ParsedFitsResult, rawValue: string) => {
  const cleaned = rawValue.replace(/^'|'$/g, '').trim()

  if (['exposure', 'ra', 'dec', 'gain', 'temperature'].includes(targetKey)) {
    return toNumber(cleaned)
  }

  return cleaned
}

export const parseFits = (buffer: Buffer): ParsedFitsResult => {
  const headerText = buffer.toString('ascii', 0, Math.min(buffer.length, 2880 * 12))
  const cards = headerText.match(/.{1,80}/g) ?? []

  const parsed: ParsedFitsResult = {}

  for (const card of cards) {
    const keyword = card.slice(0, 8).trim().toUpperCase()
    if (keyword === 'END') {
      break
    }

    const mappedKey = KEYWORD_MAP[keyword]
    if (!mappedKey || !card.includes('=')) {
      continue
    }

    const rawValue = card.split('=')[1]?.split('/')[0]?.trim()
    if (!rawValue) {
      continue
    }

    const normalized = normalizeValue(mappedKey, rawValue)
    if (normalized !== undefined) {
      ;(parsed[mappedKey] as unknown) = normalized
    }
  }

  return parsed
}
