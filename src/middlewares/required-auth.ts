import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionService } from "../services/session.service";

export function requiredAuth(sessions: SessionService): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await sessions.authenticated(req.headers.cookie);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "not authenticated",
      });
    }

    res.locals.user = session.user;

    next();
  };
}
