import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller";
import { requiredAuth } from "../../../middlewares/required-auth";
import { session } from "../../../config/session";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requiredAuth(session), me);
authRouter.post("/logout", logout);
