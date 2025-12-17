import "express-async-errors";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import taskRouter from "./routes/tasks";
import importExportRouter from "./routes/importExport";

const app = express();
app.use(cors());
app.use(express.json());

export const prisma = new PrismaClient();

app.use("/api", taskRouter);
app.use("/api", importExportRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ message: err?.message || "Unexpected error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
