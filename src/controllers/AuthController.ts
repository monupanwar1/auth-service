import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { Roles } from "../constants";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { RegisterUserRequest } from "../types";

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
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
        role: Roles.Customer,
      });

      this.logger.info("User has been registered", { id: user.id });

      // payload
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      //access token
      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res.status(201).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
}
