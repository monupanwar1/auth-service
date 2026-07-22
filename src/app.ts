import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import { Config } from "./config";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import userRouter from "./routes/user";

const app = express();
console.log(Config.ADMIN_UI_DOMAIN);
const ALLOWED_DOMAINS = [Config.ADMIN_UI_DOMAIN];
app.use(cors({ origin: ALLOWED_DOMAINS as string[], credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order auth service!" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);
app.use("/users", userRouter);

app.use(globalErrorHandler);

export default app;
