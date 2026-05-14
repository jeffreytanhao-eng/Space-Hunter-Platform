import Fastify from 'fastify'
import { UploadPipelineService } from './domain/uploadPipeline'
import { InMemoryLedgerRepository } from './repositories/ledgerRepository'
import { InMemoryUploadRepository } from './repositories/uploadRepository'
import { registerUploadRoutes } from './routes/upload'

const app = Fastify({ logger: true })

const uploadRepository = new InMemoryUploadRepository()
const ledgerRepository = new InMemoryLedgerRepository()
const uploadPipelineService = new UploadPipelineService(uploadRepository, ledgerRepository)

registerUploadRoutes(app, uploadPipelineService)

const start = async () => {
  await app.listen({ port: 3000, host: '0.0.0.0' })
}

start().catch((error) => {
  app.log.error(error)
  process.exit(1)
})
