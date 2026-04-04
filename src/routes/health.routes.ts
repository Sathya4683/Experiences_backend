import { Request, Response, Router } from "express";
import prisma from "../db/prisma";

const router = Router();

//Basically this pings the DB so we can verify connectivity in production/CI
router.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: "ok", db: "connected" });
  } catch {
    return res.status(503).json({ status: "error", db: "unreachable" });
  }
});

export default router;
