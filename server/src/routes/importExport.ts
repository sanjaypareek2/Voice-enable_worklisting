import express from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { addDays, parseISO } from "date-fns";
import { z } from "zod";
import { prisma } from "../index";
import { computeStatus } from "../utils/status";

const upload = multer();
const router = express.Router();

router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Missing file" });
  const rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true });
  const results = [];
  for (const row of rows) {
    const estimatedDays = Number(row.estimatedDays ?? row.estimated_days ?? 0);
    const startAt = row.startAt ? parseISO(row.startAt) : new Date();
    const dueAt = addDays(startAt, estimatedDays);
    const status = computeStatus({ dueAt });
    const task = await prisma.task.create({
      data: {
        title: row.title,
        notes: row.notes,
        category: row.category || "General",
        priority: row.priority || "Medium",
        estimatedDays,
        startAt,
        dueAt,
        status,
        auditLogs: { create: { action: "created", meta: { imported: true } } }
      }
    });
    results.push(task);
  }
  res.json({ imported: results.length });
});

router.get("/export.csv", async (req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  const data = tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    priority: t.priority,
    startAt: t.startAt.toISOString(),
    dueAt: t.dueAt.toISOString(),
    status: computeStatus({ dueAt: t.dueAt, completedAt: t.completedAt })
  }));
  const csv = stringify(data, { header: true });
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
});

export default router;
