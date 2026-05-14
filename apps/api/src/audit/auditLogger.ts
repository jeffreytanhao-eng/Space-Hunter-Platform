export interface AuditEvent {
  actorId?: string
  action: string
  targetType: string
  targetId?: string
  payload?: Record<string, unknown>
}

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>
}

export class InMemoryAuditLogger implements AuditLogger {
  private readonly events: AuditEvent[] = []

  async log(event: AuditEvent): Promise<void> {
    this.events.push(event)
  }
}
