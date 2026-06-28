import express, { NextFunction, RequestHandler } from "express";

const router = express.Router();

router.post(
  "/",
  (req, res: Response, next: NextFunction) =>
    userController.create(req, res, next) as unknown as RequestHandler,
);
