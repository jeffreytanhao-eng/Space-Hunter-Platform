export interface AppConfig {
  port: number
  host: string
  accessTokenSecret: string
  refreshTokenSecret: string
}

export const loadConfig = (): AppConfig => {
  return {
    port: Number(process.env.API_PORT ?? 3000),
    host: process.env.API_HOST ?? '0.0.0.0',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? 'dev-access-secret',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? 'dev-refresh-secret'
  }
}
