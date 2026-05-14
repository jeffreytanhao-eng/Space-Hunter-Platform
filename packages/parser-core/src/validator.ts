import type { FitsValidationIssue, FitsValidationResult, ParsedFitsResult } from './types'

const REQUIRED_FIELDS: Array<keyof ParsedFitsResult> = [
  'timestamp',
  'ra',
  'dec',
  'exposure',
  'telescope'
]

export const validateParsedFits = (
  metadata: ParsedFitsResult
): FitsValidationResult => {
  const issues: FitsValidationIssue[] = []

  if (metadata.timestamp && Number.isNaN(Date.parse(metadata.timestamp))) {
    issues.push({
      field: 'timestamp',
      code: 'invalid_timestamp',
      message: 'Timestamp must be a valid ISO-8601 date string'
    })
  }

  if (typeof metadata.ra === 'number' && (metadata.ra < 0 || metadata.ra >= 360)) {
    issues.push({
      field: 'ra',
      code: 'invalid_ra',
      message: 'RA must be in [0, 360) degrees'
    })
  }

  if (typeof metadata.dec === 'number' && (metadata.dec < -90 || metadata.dec > 90)) {
    issues.push({
      field: 'dec',
      code: 'invalid_dec',
      message: 'DEC must be in [-90, 90] degrees'
    })
  }

  const missingRequired = REQUIRED_FIELDS.filter((field) => metadata[field] == null)
  if (missingRequired.length > 0) {
    issues.push({
      field: 'metadata',
      code: 'missing_required_fields',
      message: `Missing required metadata fields: ${missingRequired.join(', ')}`
    })
  }

  const presentCount = Object.values(metadata).filter((value) => value != null).length
  const completenessScore = presentCount / Object.keys(metadata).length || 0

  return {
    isValid: issues.length === 0,
    issues,
    completenessScore
  }
}
