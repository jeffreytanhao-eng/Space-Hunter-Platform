export type UserRole = 'user' | 'moderator' | 'admin'

export interface User {
  id: string
  email: string
  passwordHash: string
  role: UserRole
  level: number
  status: 'active' | 'suspended'
  createdAt: string
}

export interface RefreshTokenRecord {
  tokenId: string
  userId: string
  expiresAt: string
  revokedAt?: string
}
