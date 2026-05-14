import type { LedgerEntry, LedgerRepository } from '../ledgerRepository'
import type { DbClient } from './sqlUploadRepository'

export class SqlLedgerRepository implements LedgerRepository {
  constructor(private readonly db: DbClient) {}

  async append(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
    const created: LedgerEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }

    await this.db.query(
      `INSERT INTO points_ledger (id, user_id, event_type, delta, balance_after, reference_type, reference_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        created.id,
        created.userId,
        created.eventType,
        created.delta,
        created.balanceAfter,
        created.referenceType,
        created.referenceId,
        created.createdAt
      ]
    )

    return created
  }

  async getBalance(userId: string): Promise<number> {
    const result = await this.db.query<{ balance: number }>(
      'SELECT COALESCE(SUM(delta), 0)::int as balance FROM points_ledger WHERE user_id = $1',
      [userId]
    )

    return result.rows[0]?.balance ?? 0
  }
}
