export type UserRole = 'user' | 'moderator' | 'admin'

export interface UploadLifecycle {
  uploadId: string
  status:
    | 'pending'
    | 'uploaded'
    | 'parsing'
    | 'parsed'
    | 'scoring'
    | 'rewarded'
    | 'archived'
  createdAt: string
  updatedAt: string
}
