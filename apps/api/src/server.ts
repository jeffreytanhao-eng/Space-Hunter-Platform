import Fastify from 'fastify'
import { UploadPipelineService } from './domain/uploadPipeline'
import { InMemoryLedgerRepository } from './repositories/ledgerRepository'
import { InMemoryUploadRepository } from './repositories/uploadRepository'
import { registerUploadRoutes } from './routes/upload'
import { AuthService } from './auth/authService'
import { registerAuthRoutes } from './auth/routes'
import { InMemoryUserRepository } from './auth/userRepository'
import { loadConfig } from './config'

const config = loadConfig()
const app = Fastify({ logger: true })

const uploadRepository = new InMemoryUploadRepository()
const userRepository = new InMemoryUserRepository()
const ledgerRepository = new InMemoryLedgerRepository()
const uploadPipelineService = new UploadPipelineService(uploadRepository, ledgerRepository)

const authService = new AuthService(userRepository, config.accessTokenSecret, config.refreshTokenSecret)

registerAuthRoutes(app, authService)
registerUploadRoutes(app, uploadPipelineService)

const start = async () => {
  await app.listen({ port: config.port, host: config.host })
}

start().catch((error) => {
  app.log.error(error)
  process.exit(1)
})