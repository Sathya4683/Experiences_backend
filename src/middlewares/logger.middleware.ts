import { NextFunction, Request, Response } from "express";

//Simple request logger so we can see what's happening in the terminal
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  res.on("finish", () => {
    const latency = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${latency}ms`,
    );
  });

  next();
};
