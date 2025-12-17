import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import { computeStatus } from "./utils/status";

const prisma = new PrismaClient();
const categories = ["Procurement", "Operations", "Finance", "Personal"];
const priorities = ["Low", "Medium", "High"];

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  const now = new Date();

  const tasks = Array.from({ length: 25 }).map((_, i) => {
    const startOffset = Math.floor(Math.random() * 10) - 5;
    const startAt = subDays(now, startOffset);
    const estimatedDays = Math.floor(Math.random() * 7) + 1;
    const dueAt = addDays(startAt, estimatedDays);
    const completed = Math.random() > 0.5;
    const completedAt = completed ? addDays(startAt, Math.floor(Math.random() * 9)) : null;
    const status = computeStatus({ dueAt, completedAt: completedAt ?? undefined }, now);

    return {
      title: `Sample Task ${i + 1}`,
      notes: "Seeded sample data to demo dashboard",
      category: categories[i % categories.length],
      priority: priorities[i % priorities.length],
      startAt,
      estimatedDays,
      dueAt,
      completedAt,
      status
    };
  });

  for (const t of tasks) {
    await prisma.task.create({
      data: { ...t, auditLogs: { create: { action: "created", meta: { seed: true } } } }
    });
  }

  console.log("Seeded", tasks.length, "tasks");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
