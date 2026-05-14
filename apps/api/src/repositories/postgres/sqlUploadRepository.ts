import type { UploadRecord, UploadStatus } from '../../types/upload'
import type { UploadRepository } from '../uploadRepository'

export interface DbClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>
}

export class SqlUploadRepository implements UploadRepository {
  constructor(private readonly db: DbClient) {}

  async create(record: UploadRecord): Promise<void> {
    await this.db.query(
      `INSERT INTO uploads (id, user_id, file_url, checksum, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [record.id, record.userId, record.fileName, record.checksum, record.status, record.createdAt, record.updatedAt]
    )
  }

  async updateStatus(id: string, status: UploadStatus): Promise<void> {
    await this.db.query('UPDATE uploads SET status=$2, updated_at=NOW() WHERE id=$1', [id, status])
  }

  async updateMetadata(id: string, metadata: UploadRecord['metadata']): Promise<void> {
    await this.updateStatus(id, 'parsed')
    await this.db.query(
      `INSERT INTO fits_metadata (id, upload_id, raw_json, normalized_json)
       VALUES ($1, $2, $3::jsonb, $4::jsonb)
       ON CONFLICT (upload_id) DO UPDATE SET normalized_json=EXCLUDED.normalized_json`,
      [crypto.randomUUID(), id, JSON.stringify(metadata ?? {}), JSON.stringify(metadata ?? {})]
    )
  }

  async updateScores(id: string, qualityScore: number, confidenceScore: number): Promise<void> {
    await this.updateStatus(id, 'scoring')
    await this.db.query(
      `INSERT INTO quality_scores (id, upload_id, quality_score, confidence_score, flags)
       VALUES ($1, $2, $3, $4, '[]'::jsonb)
       ON CONFLICT (upload_id) DO UPDATE SET quality_score=EXCLUDED.quality_score, confidence_score=EXCLUDED.confidence_score`,
      [crypto.randomUUID(), id, qualityScore, confidenceScore]
    )
  }

  async updateReward(id: string, pointsAwarded: number): Promise<void> {
    await this.updateStatus(id, 'rewarded')
    await this.db.query('UPDATE uploads SET updated_at=NOW() WHERE id=$1', [id])
    void pointsAwarded
  }

  async findById(id: string): Promise<UploadRecord | null> {
    const result = await this.db.query<UploadRecord>(
      `SELECT id, user_id as "userId", file_url as "fileName", checksum, status, created_at as "createdAt", updated_at as "updatedAt"
       FROM uploads WHERE id=$1`,
      [id]
    )
    return result.rows[0] ?? null
  }
}
