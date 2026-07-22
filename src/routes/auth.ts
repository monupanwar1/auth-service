import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { AuthController } from "../controllers/AuthController";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { TokenService } from "../services/TokenService";
import { UserService } from "../services/UserService";
import loginValidator from "../validators/login-validator";
import registerValidator from "../validators/register-validator";

import { AuthRequest } from "../types";
import authenticate from "../common/middleware/authenticate";
import validateRefreshToken from "../common/middleware/validateRefreshToken";
import parseRefreshToken from "../common/middleware/parseRefreshToken";
import { CredentialService } from "../services/CredentialService";

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);

const credentialService = new CredentialService();

const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService,
);

router.post("/register", registerValidator, (async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await authController.register(req, res, next);
}) as unknown as RequestHandler);

router.post(
  "/login",
  loginValidator,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next) as unknown as RequestHandler,
);

router.get(
  "/self",
  authenticate as RequestHandler,
  (req: Request, res: Response) =>
    authController.self(req as AuthRequest, res) as unknown as RequestHandler,
);

router.post(
  "/refresh",
  validateRefreshToken as RequestHandler,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(
      req as AuthRequest,
      res,
      next,
    ) as unknown as RequestHandler,
);

router.post(
  "/logout",
  authenticate as RequestHandler,
  parseRefreshToken as RequestHandler,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(
      req as AuthRequest,
      res,
      next,
    ) as unknown as RequestHandler,
);

export default router;
