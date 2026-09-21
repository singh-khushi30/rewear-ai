import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";

export const attachRequestId: RequestHandler = (req, _res, next) => {
  req.requestId = randomUUID();
  next();
};

export function shortenUserId(userId: string) {
  return userId.slice(0, 8);
}
