import type { ParsedFitsResult } from '@space-hunter/parser-core'

export type UploadStatus =
  | 'pending'
  | 'uploaded'
  | 'parsing'
  | 'parsed'
  | 'scoring'
  | 'rewarded'
  | 'archived'

export interface UploadRecord {
  id: string
  userId: string
  fileName: string
  checksum: string
  status: UploadStatus
  metadata?: ParsedFitsResult
  qualityScore?: number
  confidenceScore?: number
  pointsAwarded?: number
  createdAt: string
  updatedAt: string
}
