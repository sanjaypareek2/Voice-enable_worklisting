export type StatusType = "On Track" | "Delayed" | "Completed On Time" | "Completed Late";

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  category: string;
  priority: string;
  startAt: string;
  estimatedDays: number;
  dueAt: string;
  completedAt?: string | null;
  status: StatusType;
  computedStatus?: StatusType;
  archived: boolean;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
}
