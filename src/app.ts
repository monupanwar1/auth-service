import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";

const app = express();
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

app.use(globalErrorHandler);

export default app;
