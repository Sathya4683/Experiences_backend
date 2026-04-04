import { PrismaClient } from "@prisma/client";

//We keep a single prisma instance to avoid connection pool exhaustion in dev
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["error"],
});

export default prisma;
