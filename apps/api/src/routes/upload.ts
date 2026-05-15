import type { FastifyInstance } from 'fastify'
import { UploadPipelineService } from '../domain/uploadPipeline'

export const registerUploadRoutes = (
  app: FastifyInstance,
  service: UploadPipelineService
) => {
  app.post('/v1/uploads', async (request, reply) => {
    const body = request.body as {
      userId: string
      fileName: string
      checksum: string
      fitsHeaderText: string
    }

    if (!body?.userId || !body?.fileName || !body?.checksum || !body?.fitsHeaderText) {
      return reply.status(400).send({ message: 'Missing required fields' })
    }

    const result = await service.handleUpload({
      userId: body.userId,
      fileName: body.fileName,
      checksum: body.checksum,
      fileBuffer: Buffer.from(body.fitsHeaderText, 'ascii')
    })

    return reply.status(201).send(result)
  })
}
