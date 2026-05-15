export interface ParsedFitsResult {
  observer?: string
  exposure?: number
  filter?: string
  telescope?: string
  ra?: number
  dec?: number
  object?: string
  timestamp?: string
  gain?: number
  binning?: string
  temperature?: number
}

export interface FitsValidationIssue {
  field: keyof ParsedFitsResult | 'metadata'
  code:
    | 'invalid_timestamp'
    | 'invalid_ra'
    | 'invalid_dec'
    | 'missing_required_fields'
  message: string
}

export interface FitsValidationResult {
  isValid: boolean
  issues: FitsValidationIssue[]
  completenessScore: number
}
