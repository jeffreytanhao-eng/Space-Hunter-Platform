export interface ObjectStorageAdapter {
  putObject(input: {
    bucket: string
    key: string
    body: Buffer
    contentType: string
  }): Promise<{ url: string }>
}

export class InMemoryObjectStorageAdapter implements ObjectStorageAdapter {
  private readonly data = new Map<string, Buffer>()

  async putObject(input: {
    bucket: string
    key: string
    body: Buffer
    contentType: string
  }): Promise<{ url: string }> {
    const objectKey = `${input.bucket}/${input.key}`
    this.data.set(objectKey, input.body)
    return { url: `memory://${objectKey}` }
  }
}
