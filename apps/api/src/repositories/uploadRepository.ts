import type { UploadRecord, UploadStatus } from '../types/upload'

export interface UploadRepository {
  create(record: UploadRecord): Promise<void>
  updateStatus(id: string, status: UploadStatus): Promise<void>
  updateMetadata(id: string, metadata: UploadRecord['metadata']): Promise<void>
  updateScores(id: string, qualityScore: number, confidenceScore: number): Promise<void>
  updateReward(id: string, pointsAwarded: number): Promise<void>
  findById(id: string): Promise<UploadRecord | null>
}

export class InMemoryUploadRepository implements UploadRepository {
  private readonly data = new Map<string, UploadRecord>()

  async create(record: UploadRecord): Promise<void> {
    this.data.set(record.id, record)
  }

  async updateStatus(id: string, status: UploadStatus): Promise<void> {
    const current = this.data.get(id)
    if (!current) return
    this.data.set(id, { ...current, status, updatedAt: new Date().toISOString() })
  }

  async updateMetadata(id: string, metadata: UploadRecord['metadata']): Promise<void> {
    const current = this.data.get(id)
    if (!current) return
    this.data.set(id, {
      ...current,
      metadata,
      status: 'parsed',
      updatedAt: new Date().toISOString()
    })
  }

  async updateScores(id: string, qualityScore: number, confidenceScore: number): Promise<void> {
    const current = this.data.get(id)
    if (!current) return
    this.data.set(id, {
      ...current,
      qualityScore,
      confidenceScore,
      status: 'scoring',
      updatedAt: new Date().toISOString()
    })
  }

  async updateReward(id: string, pointsAwarded: number): Promise<void> {
    const current = this.data.get(id)
    if (!current) return
    this.data.set(id, {
      ...current,
      pointsAwarded,
      status: 'rewarded',
      updatedAt: new Date().toISOString()
    })
  }

  async findById(id: string): Promise<UploadRecord | null> {
    return this.data.get(id) ?? null
  }
}
