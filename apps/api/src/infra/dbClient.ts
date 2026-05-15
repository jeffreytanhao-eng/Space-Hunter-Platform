import { Pool, type PoolClient } from 'pg'

export interface DbClient {
  query<T = any>(text: string, values?: any[]): Promise<{ rows: T[]; rowCount: number }>
  transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>
  close(): Promise<void>
}

export class PostgresDbClient implements DbClient {
  private pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString })
  }

  async query<T = any>(text: string, values?: any[]) {
    const result = await this.pool.query<T>(text, values)
    return {
      rows: result.rows,
      rowCount: result.rowCount ?? 0
    }
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async close(): Promise<void> {
    await this.pool.end()
  }
}
