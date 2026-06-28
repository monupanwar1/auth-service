import { NextFunction, Response } from "express";
import { Logger } from "winston";
import { UserService } from "../services/UserService";
import { createUserRequest } from "../types";

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
  ) {}

  async register(req: createUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
      password: "******",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });

      this.logger.info("User has been registered", { id: user.id });
      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
}
