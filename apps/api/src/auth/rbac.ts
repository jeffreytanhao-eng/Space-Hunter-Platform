import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserRole } from './types'

const ROLE_LEVEL: Record<UserRole, number> = {
  user: 1,
  moderator: 2,
  admin: 3
}

export const requireRole =
  (minimumRole: UserRole) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const role = (request.headers['x-role'] as UserRole | undefined) ?? 'user'
    if (ROLE_LEVEL[role] < ROLE_LEVEL[minimumRole]) {
      reply.status(403).send({ message: 'forbidden' })
    }
  }
