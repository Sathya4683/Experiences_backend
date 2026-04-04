import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { badRequest } from "../utils/errors";

//Generic validator middleware factory - pass in any zod schema
export const validate = (
  schema: ZodSchema,
  source: "body" | "query" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "body" ? req.body : req.query);

    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return badRequest(res, "Validation failed", details);
    }

    //We replace the source data with the parsed/coerced version from zod
    if (source === "body") req.body = result.data;
    else req.query = result.data as typeof req.query;

    return next();
  };
};
