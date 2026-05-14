export interface LedgerEntry {
  id: string
  userId: string
  eventType: 'upload_reward'
  delta: number
  balanceAfter: number
  referenceType: 'upload'
  referenceId: string
  createdAt: string
}

export interface LedgerRepository {
  append(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry>
  getBalance(userId: string): Promise<number>
}

export class InMemoryLedgerRepository implements LedgerRepository {
  private readonly entries: LedgerEntry[] = []

  async append(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
    const created: LedgerEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    }
    this.entries.push(created)
    return created
  }

  async getBalance(userId: string): Promise<number> {
    return this.entries
      .filter((entry) => entry.userId === userId)
      .reduce((sum, entry) => sum + entry.delta, 0)
  }
}
