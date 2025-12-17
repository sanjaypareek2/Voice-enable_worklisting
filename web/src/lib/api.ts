import axios from "axios";
import { Task } from "../types/task";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

export interface PendingRequest {
  url: string;
  method: "post" | "patch";
  data: any;
}

const QUEUE_KEY = "task-offline-queue";

export function enqueueRequest(req: PendingRequest) {
  const existing: PendingRequest[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  existing.push(req);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
}

export async function flushQueue() {
  const queue: PendingRequest[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  if (!queue.length) return;
  const remaining: PendingRequest[] = [];
  for (const entry of queue) {
    try {
      await api.request({ url: entry.url, method: entry.method, data: entry.data });
    } catch (e) {
      remaining.push(entry);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
}

window.addEventListener("online", () => flushQueue());

export async function listTasks(params?: any) {
  const res = await api.get<Task[]>("/tasks", { params });
  return res.data;
}

export async function createTask(data: Partial<Task> & { title: string; estimatedDays: number }) {
  if (!navigator.onLine) {
    enqueueRequest({ url: "/tasks", method: "post", data });
  }
  const res = await api.post<Task>("/tasks", data);
  return res.data;
}

export async function updateTask(id: string, data: Partial<Task>) {
  if (!navigator.onLine) enqueueRequest({ url: `/tasks/${id}`, method: "patch", data });
  const res = await api.patch<Task>(`/tasks/${id}`, data);
  return res.data;
}

export async function completeTask(id: string) {
  if (!navigator.onLine) enqueueRequest({ url: `/tasks/${id}/complete`, method: "post", data: {} });
  const res = await api.post<Task>(`/tasks/${id}/complete`);
  return res.data;
}

export async function extendTask(id: string, addDays: number) {
  if (!navigator.onLine) enqueueRequest({ url: `/tasks/${id}/extend`, method: "post", data: { addDays } });
  const res = await api.post<Task>(`/tasks/${id}/extend`, { addDays });
  return res.data;
}
