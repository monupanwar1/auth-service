import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { JwtPayload } from "jsonwebtoken";
import { Logger } from "winston";
import { Roles } from "../constants";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import { AuthRequest, RegisterUserRequest } from "../types";
import { CredentialService } from "./../services/CredentialService";

export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly credentialService: CredentialService,
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    this.logger.debug("New request to login a user", {
      email,
      password: "******",
    });

    try {
      const user = await this.userService.findEmailWithPassword(email);

      if (!user) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

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

      this.logger.info("User has been logged in ", {
        id: user.id,
      });
      res.json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }
  async self(req: AuthRequest, res: Response) {
    // token req.auth.id
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }
  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
        tenant: req.auth.tenant,
      };
      const accessToken = this.tokenService.generateAccessToken(payload);

      const user = await this.userService.findById(Number(req.auth.sub));

      // !validation
      if (!user) {
        const error = createHttpError(400, "User with this token not found");
        next(error);
        return;
      }

      // persist the token

      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // delete old
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      // new token
      res.cookie("accessToken", accessToken, {
        // domain: Config.MAIN_DOMAIN,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, // Very Important
      });

      res.cookie("refreshToken", refreshToken, {
        // domain: Config.MAIN_DOMAIN,
        sameSite: "none",
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1Y
        httpOnly: true, // Very Important
      });

      this.logger.info("User has been loggedIn successfully!", {
        id: user.id,
      });

      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      this.logger.info("RefreshToken has been deleted o", { id: req.auth.id });
      this.logger.info("User has been logged out", { id: req.auth.sub });
    } catch (err) {
      next(err);
      return;
    }
  }
}
