import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { UserRepository } from './userRepository'
import type { UserRole } from './types'

const ACCESS_TOKEN_TTL_SEC = 15 * 60
const REFRESH_TOKEN_TTL_SEC = 7 * 24 * 60 * 60

const encode = (payload: Record<string, unknown>): string => {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

const signToken = (payload: Record<string, unknown>, secret: string): string => {
  const body = encode(payload)
  const signature = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${signature}`
}

const verifyToken = (token: string, secret: string): Record<string, unknown> | null => {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  const ok = timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  if (!ok) return null
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as Record<string, unknown>
}

const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex')
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly accessSecret: string,
    private readonly refreshSecret: string
  ) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email)
    if (existing) throw new Error('Email already registered')
    const user = await this.users.create(email, hashPassword(password))
    return this.issueTokens(user.id, user.role)
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email)
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid credentials')
    }
    return this.issueTokens(user.id, user.role)
  }

  async refresh(refreshToken: string) {
    const payload = verifyToken(refreshToken, this.refreshSecret)
    if (!payload) throw new Error('Invalid refresh token')

    const tokenId = String(payload.tokenId)
    const userId = String(payload.sub)
    const role = String(payload.role) as UserRole

    const tokenRecord = await this.users.getRefreshToken(tokenId)
    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new Error('Refresh token revoked')
    }

    await this.users.revokeRefreshToken(tokenId)
    return this.issueTokens(userId, role)
  }

  verifyAccessToken(accessToken: string): { sub: string; role: UserRole } {
    const payload = verifyToken(accessToken, this.accessSecret)
    if (!payload) throw new Error('Invalid access token')
    return { sub: String(payload.sub), role: String(payload.role) as UserRole }
  }

  private async issueTokens(userId: string, role: UserRole) {
    const now = Math.floor(Date.now() / 1000)
    const tokenId = crypto.randomUUID()
    const accessToken = signToken(
      { sub: userId, role, iat: now, exp: now + ACCESS_TOKEN_TTL_SEC },
      this.accessSecret
    )
    const refreshToken = signToken(
      { sub: userId, role, tokenId, iat: now, exp: now + REFRESH_TOKEN_TTL_SEC },
      this.refreshSecret
    )

    await this.users.saveRefreshToken({
      tokenId,
      userId,
      expiresAt: new Date((now + REFRESH_TOKEN_TTL_SEC) * 1000).toISOString()
    })

    return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_TTL_SEC }
  }
}
