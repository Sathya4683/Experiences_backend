import { Response } from "express";

interface ErrorDetail {
  field?: string;
  message: string;
}

//Centralised error sender so every error looks the same across the app
export const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
  details: ErrorDetail[] = [],
) => {
  return res.status(status).json({
    error: {
      code,
      message,
      details,
    },
  });
};

//Quick helpers so we don't repeat status codes everywhere
export const unauthorized = (res: Response, message = "Unauthorized") =>
  sendError(res, 401, "UNAUTHORIZED", message);

export const forbidden = (res: Response, message = "Forbidden") =>
  sendError(res, 403, "FORBIDDEN", message);

export const notFound = (res: Response, message = "Resource not found") =>
  sendError(res, 404, "NOT_FOUND", message);

export const badRequest = (
  res: Response,
  message: string,
  details: ErrorDetail[] = [],
) => sendError(res, 400, "BAD_REQUEST", message, details);

export const serverError = (res: Response, message = "Internal server error") =>
  sendError(res, 500, "INTERNAL_ERROR", message);
