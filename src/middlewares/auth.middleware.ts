import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { unauthorized, forbidden } from "../utils/errors";
import prisma from "../db/prisma";

//Extending express request so we can hang the user object off it
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

//Basically this middleware verifies JWT and attaches user to request
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Missing or malformed authorization header");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    //We check the DB here to make sure the user still exists (in case it was deleted)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return unauthorized(res, "User no longer exists");

    req.user = { userId: payload.userId, role: payload.role };
    return next();
  } catch {
    return unauthorized(res, "Invalid or expired token");
  }
};

//This lets us lock routes to specific roles easily
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Only ${roles.join(", ")} can perform this action`);
    }
    return next();
  };
};

//This is being done to allow either the resource owner OR an admin through
export const requireOwnerOrAdmin = (getOwnerId: (req: Request) => Promise<string | null>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);
    if (req.user.role === "admin") return next();

    const ownerId = await getOwnerId(req);
    if (!ownerId) return forbidden(res, "Resource not found or access denied");
    if (ownerId !== req.user.userId) return forbidden(res, "You can only modify your own resources");

    return next();
  };
};
