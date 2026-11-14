import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/routes/auth.routes";

const app = express();

app.use(express.json());

app.use(
  cors({
    // origines autorisees, separees par des virgules (avec credentials, "*" est interdit)
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(","),
    credentials: true,
  }),
);

app.use(cookieParser());

// COnfiguration des routers
app.use("/api/auth", authRouter);

export default app;
