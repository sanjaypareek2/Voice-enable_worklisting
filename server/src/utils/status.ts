import { isAfter, isBefore, isEqual } from "date-fns";

export type StatusType =
  | "On Track"
  | "Delayed"
  | "Completed On Time"
  | "Completed Late";

export interface StatusTaskLike {
  dueAt: Date;
  completedAt?: Date | null;
}

export function computeStatus(task: StatusTaskLike, now: Date = new Date()): StatusType {
  const { dueAt, completedAt } = task;
  if (completedAt) {
    if (isBefore(completedAt, dueAt) || isEqual(completedAt, dueAt)) {
      return "Completed On Time";
    }
    return "Completed Late";
  }

  if (isAfter(now, dueAt)) {
    return "Delayed";
  }

  return "On Track";
}
