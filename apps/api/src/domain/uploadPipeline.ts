import { parseFits, validateParsedFits } from '@space-hunter/parser-core'
import type { LedgerRepository } from '../repositories/ledgerRepository'
import type { UploadRepository } from '../repositories/uploadRepository'

export interface UploadInput {
  userId: string
  fileName: string
  checksum: string
  fileBuffer: Buffer
}

const calcQualityScore = (completenessScore: number): number => {
  return Math.round(completenessScore * 100)
}

const calcConfidenceScore = (qualityScore: number, issueCount: number): number => {
  return Math.max(0, qualityScore - issueCount * 10)
}

const calcPoints = (qualityScore: number, confidenceScore: number): number => {
  return Math.round((qualityScore * 0.6 + confidenceScore * 0.4) / 10)
}

export class UploadPipelineService {
  constructor(
    private readonly uploads: UploadRepository,
    private readonly ledger: LedgerRepository
  ) {}

  async handleUpload(input: UploadInput) {
    const now = new Date().toISOString()
    const uploadId = crypto.randomUUID()

    await this.uploads.create({
      id: uploadId,
      userId: input.userId,
      fileName: input.fileName,
      checksum: input.checksum,
      status: 'uploaded',
      createdAt: now,
      updatedAt: now
    })

    await this.uploads.updateStatus(uploadId, 'parsing')
    const metadata = parseFits(input.fileBuffer)
    const validation = validateParsedFits(metadata)
    await this.uploads.updateMetadata(uploadId, metadata)

    const qualityScore = calcQualityScore(validation.completenessScore)
    const confidenceScore = calcConfidenceScore(qualityScore, validation.issues.length)
    await this.uploads.updateScores(uploadId, qualityScore, confidenceScore)

    const points = calcPoints(qualityScore, confidenceScore)
    const currentBalance = await this.ledger.getBalance(input.userId)
    await this.ledger.append({
      userId: input.userId,
      eventType: 'upload_reward',
      delta: points,
      balanceAfter: currentBalance + points,
      referenceType: 'upload',
      referenceId: uploadId
    })

    await this.uploads.updateReward(uploadId, points)

    return {
      uploadId,
      status: 'rewarded',
      metadata,
      validation,
      qualityScore,
      confidenceScore,
      points
    }
  }
}
