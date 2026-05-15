import Fastify from 'fastify'
import Redis from 'ioredis'
import { UploadPipelineService } from './domain/uploadPipeline'
import { SqlUploadRepository } from './repositories/uploadRepository'
import { SqlLedgerRepository } from './repositories/ledgerRepository'
import { PostgresDbClient } from './infra/dbClient'
import { registerUploadRoutes } from './routes/upload'
import { AuthService } from './auth/authService'
import { registerAuthRoutes } from './auth/routes'
import { InMemoryUserRepository } from './auth/userRepository'
import { loadConfig } from './config'

const config = loadConfig()
const app = Fastify({ logger: true })

// Initialize database client
const dbClient = new PostgresDbClient(config.databaseUrl || 'postgresql://localhost/space-hunter')

// Initialize Redis client for BullMQ
const redis = new Redis({
  host: config.redisHost || 'localhost',
  port: config.redisPort || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000)
})

// Initialize repositories with SQL persistence
const uploadRepository = new SqlUploadRepository(dbClient)
const ledgerRepository = new SqlLedgerRepository(dbClient)

// Initialize services
const uploadPipelineService = new UploadPipelineService(uploadRepository, ledgerRepository, redis, 5)
const userRepository = new InMemoryUserRepository()
const authService = new AuthService(userRepository, config.accessTokenSecret, config.refreshTokenSecret)

// Register routes
registerAuthRoutes(app, authService)
registerUploadRoutes(app, uploadPipelineService)

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  app.log.info(`[${signal}] Received, shutting down gracefully...`)
  try {
    await uploadPipelineService.close()
    await dbClient.close()
    redis.disconnect()
    await app.close()
    process.exit(0)
  } catch (error) {
    app.log.error('Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

const start = async () => {
  try {
    // Test database connection
    await dbClient.query('SELECT NOW()')
    app.log.info('✓ Database connection established')

    // Test Redis connection
    await redis.ping()
    app.log.info('✓ Redis connection established')

    await app.listen({ port: config.port, host: config.host })
    app.log.info(`✓ Server listening on ${config.host}:${config.port}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

start()
