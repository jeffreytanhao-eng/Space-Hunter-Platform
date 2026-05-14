import type { RefreshTokenRecord, User, UserRole } from './types'

export interface UserRepository {
  create(email: string, passwordHash: string, role?: UserRole): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  saveRefreshToken(record: RefreshTokenRecord): Promise<void>
  getRefreshToken(tokenId: string): Promise<RefreshTokenRecord | null>
  revokeRefreshToken(tokenId: string): Promise<void>
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>()
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>()

  async create(email: string, passwordHash: string, role: UserRole = 'user'): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role,
      level: 1,
      status: 'active',
      createdAt: new Date().toISOString()
    }
    this.users.set(user.id, user)
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    this.refreshTokens.set(record.tokenId, record)
  }

  async getRefreshToken(tokenId: string): Promise<RefreshTokenRecord | null> {
    return this.refreshTokens.get(tokenId) ?? null
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    const current = this.refreshTokens.get(tokenId)
    if (!current) return
    this.refreshTokens.set(tokenId, { ...current, revokedAt: new Date().toISOString() })
  }
}
