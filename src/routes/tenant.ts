import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import authenticate from "../common/middleware/authenticate";
import { canAccess } from "../common/middleware/canAccess";
import { AppDataSource } from "../config/data-source";
import logger from "../config/logger";
import { Roles } from "../constants";
import { Tenant } from "../entity/Tenant";
import { TenantService } from "../services/TenantService";
import listTenantsValidator from "../validators/list-tenants-validator";
import tenantValidator from "../validators/tenant-validator";
import { TenantController } from "./../controllers/TenantController";

const router = express();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.Admin]),
  tenantValidator,
  (req: Request, res: Response, next: NextFunction) => {
    tenantController.create(req, res, next) as unknown as RequestHandler;
  },
);
router.get(
  "/",
  listTenantsValidator,
  authenticate as RequestHandler,
  (req: Request, res: Response, next: NextFunction) => {
    tenantController.getAll(req, res, next) as unknown as RequestHandler;
  },
);

router.get(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.Admin]),
  (req: Request, res: Response, next: NextFunction) => {
    tenantController.getOne(req, res, next) as unknown as RequestHandler;
  },
);
router.patch(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.Admin]),

  (req: Request, res: Response, next: NextFunction) => {
    tenantController.update(req, res, next) as unknown as RequestHandler;
  },
);
router.delete(
  "/:id",
  authenticate as RequestHandler,
  canAccess([Roles.Admin]),

  (req: Request, res: Response, next: NextFunction) => {
    tenantController.destroy(req, res, next) as unknown as RequestHandler;
  },
);

export default router;
