import { isAfter, isBefore, isEqual } from "date-fns";
import { Task, StatusType } from "../types/task";

export function computeStatus(task: Pick<Task, "dueAt" | "completedAt">, now: Date = new Date()): StatusType {
  const dueAt = new Date(task.dueAt);
  const completedAt = task.completedAt ? new Date(task.completedAt) : null;

  if (completedAt) {
    if (isBefore(completedAt, dueAt) || isEqual(completedAt, dueAt)) return "Completed On Time";
    return "Completed Late";
  }

  if (isAfter(now, dueAt)) return "Delayed";
  return "On Track";
}
