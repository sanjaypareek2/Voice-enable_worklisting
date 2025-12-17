import express from "express";
import { z } from "zod";
import { addDays, parseISO } from "date-fns";
import { prisma } from "../index";
import { computeStatus } from "../utils/status";

const router = express.Router();

const createSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  estimatedDays: z.number().int().nonnegative(),
  startAt: z.string().optional()
});

const updateSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  estimatedDays: z.number().int().nonnegative().optional(),
  archived: z.boolean().optional(),
  assigneeId: z.string().optional()
});

function normalizeDate(input?: string) {
  if (!input) return new Date();
  return parseISO(input);
}

router.post("/tasks", async (req, res) => {
  const parsed = createSchema.parse(req.body);
  const startAt = normalizeDate(parsed.startAt);
  const dueAt = addDays(startAt, parsed.estimatedDays);
  const status = computeStatus({ dueAt });

  const task = await prisma.task.create({
    data: {
      title: parsed.title,
      notes: parsed.notes,
      category: parsed.category || "General",
      priority: parsed.priority || "Medium",
      estimatedDays: parsed.estimatedDays,
      startAt,
      dueAt,
      status,
      auditLogs: { create: { action: "created" } }
    },
    include: { auditLogs: true }
  });

  res.json(taskWithComputed(task));
});

router.get("/tasks", async (req, res) => {
  const { search, status, category, priority, dateFrom, dateTo, includeArchived } = req.query;
  const where: Record<string, any> = {
    archived: includeArchived === "true" ? undefined : false
  };
  if (search && typeof search === "string") {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } }
    ];
  }
  if (status && typeof status === "string") {
    where.status = status;
  }
  if (category && typeof category === "string") {
    where.category = category;
  }
  if (priority && typeof priority === "string") {
    where.priority = priority;
  }
  if (dateFrom && typeof dateFrom === "string") {
    where.startAt = { ...(where.startAt || {}), gte: parseISO(dateFrom) };
  }
  if (dateTo && typeof dateTo === "string") {
    where.startAt = { ...(where.startAt || {}), lte: parseISO(dateTo) };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  const now = new Date();
  const updated = await Promise.all(
    tasks.map(async (t: any) => {
      const computed = computeStatus({ dueAt: t.dueAt, completedAt: t.completedAt }, now);
      if (computed !== t.status) {
        await prisma.task.update({ where: { id: t.id }, data: { status: computed } });
      }
      return { ...t, status: computed };
    })
  );

  res.json(updated.map(taskWithComputed));
});

router.get("/tasks/:id", async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { auditLogs: { orderBy: { createdAt: "desc" } } }
  });
  if (!task) return res.status(404).json({ message: "Not found" });
  res.json(taskWithComputed(task));
});

router.patch("/tasks/:id", async (req, res) => {
  const parsed = updateSchema.parse(req.body);
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Not found" });

  let dueAt = existing.dueAt;
  const updates: Record<string, any> = { ...parsed };
  if (parsed.estimatedDays !== undefined) {
    dueAt = addDays(existing.startAt, parsed.estimatedDays);
    updates.estimatedDays = parsed.estimatedDays;
    updates.dueAt = dueAt;
  }

  const result = await prisma.task.update({
    where: { id: req.params.id },
    data: updates
  });

  if (parsed.estimatedDays !== undefined) {
    await prisma.auditLog.create({
      data: { taskId: result.id, action: "edited", meta: { estimatedDays: parsed.estimatedDays } }
    });
  }

  const status = computeStatus({ dueAt, completedAt: result.completedAt });
  if (status !== result.status) {
    await prisma.task.update({ where: { id: result.id }, data: { status } });
  }

  res.json({ ...result, status });
});

router.post("/tasks/:id/complete", async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const completedAt = new Date();
  const status = computeStatus({ dueAt: existing.dueAt, completedAt });
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { completedAt, status }
  });
  await prisma.auditLog.create({ data: { taskId: task.id, action: "completed" } });
  res.json(taskWithComputed(task));
});

router.post("/tasks/:id/reopen", async (req, res) => {
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const status = computeStatus({ dueAt: existing.dueAt });
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { completedAt: null, status }
  });
  await prisma.auditLog.create({ data: { taskId: task.id, action: "reopened" } });
  res.json(taskWithComputed(task));
});

router.post("/tasks/:id/extend", async (req, res) => {
  const parsed = z.object({ addDays: z.number().int().min(1) }).parse(req.body);
  const existing = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  const newDue = addDays(existing.dueAt, parsed.addDays);
  const status = computeStatus({ dueAt: newDue, completedAt: existing.completedAt });
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { dueAt: newDue, status }
  });
  await prisma.auditLog.create({
    data: { taskId: task.id, action: "extended_deadline", meta: { addDays: parsed.addDays } }
  });
  res.json(taskWithComputed(task));
});

function taskWithComputed(task: any) {
  return {
    ...task,
    computedStatus: computeStatus({ dueAt: task.dueAt, completedAt: task.completedAt })
  };
}

export default router;
