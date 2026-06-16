import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";

const app = express();
app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order auth service!" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use(globalErrorHandler);

export default app;
