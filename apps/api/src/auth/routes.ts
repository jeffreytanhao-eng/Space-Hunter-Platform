import type { FastifyInstance } from 'fastify'
import { AuthService } from './authService'

export const registerAuthRoutes = (app: FastifyInstance, auth: AuthService) => {
  app.post('/v1/auth/register', async (request, reply) => {
    const body = request.body as { email: string; password: string }
    if (!body?.email || !body?.password) {
      return reply.status(400).send({ message: 'email and password are required' })
    }

    const tokens = await auth.register(body.email, body.password)
    return reply.status(201).send(tokens)
  })

  app.post('/v1/auth/login', async (request, reply) => {
    const body = request.body as { email: string; password: string }
    if (!body?.email || !body?.password) {
      return reply.status(400).send({ message: 'email and password are required' })
    }

    const tokens = await auth.login(body.email, body.password)
    return reply.send(tokens)
  })

  app.post('/v1/auth/refresh', async (request, reply) => {
    const body = request.body as { refreshToken: string }
    if (!body?.refreshToken) {
      return reply.status(400).send({ message: 'refreshToken is required' })
    }

    const tokens = await auth.refresh(body.refreshToken)
    return reply.send(tokens)
  })
}
