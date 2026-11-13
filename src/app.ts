import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/routes/auth.routes";

const app = express();

app.use(express.json());

app.use(
  cors({
    //origin
    origin: process.env.CORS_ORIGINS,
    credentials: true,
  }),
);

app.use(cookieParser());

// COnfiguration des routers
app.use("/api/auth", authRouter);

export default app;
