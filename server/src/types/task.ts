export interface TaskModel {
  id: string;
  title: string;
  notes?: string | null;
  category: string;
  priority: string;
  startAt: Date;
  estimatedDays: number;
  dueAt: Date;
  completedAt?: Date | null;
  status: string;
  archived: boolean;
  assigneeId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogModel {
  id: string;
  taskId: string;
  action: string;
  meta?: unknown;
  createdAt: Date;
}

export type TaskWithStatus = TaskModel & { computedStatus: string };
export type TaskWithLogs = TaskModel & { auditLogs: AuditLogModel[] };
