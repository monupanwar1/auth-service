import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";

import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import {
  CreateTenantRequest,
  TenantQueryParams,
  UpdateTenantRequest,
} from "../types";

export class TenantController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { name, address } = req.body;
    this.logger.debug("Request for creating tenant", req.body);

    try {
      const tenant = await this.tenantService.create({ name, address });

      this.logger.info("Tenant has been created", { id: tenant.id });
      res.status(201).json({ id: tenant.id });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [tenants, count] = await this.tenantService.getAll(
        validatedQuery as TenantQueryParams,
      );
      this.logger.info("All tenant have been fetched");
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: tenants,
      });
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    // Validation

    if (isNaN(Number(tenantId))) {
      const err = createHttpError(400, "Invalid url params");
      next(err);
      return;
    }

    try {
      const tenant = await this.tenantService.getById(Number(tenantId));

      if (!tenant) {
        const err = createHttpError(400, "Tenant does not exist");
        next(err);
        return;
      }

      this.logger.info("Tenant has been fetched", { id: tenant.id });
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async update(req: UpdateTenantRequest, res: Response, next: NextFunction) {
    // validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0].msg as string));
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;

    this.logger.debug("Request for updating a tenant", req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });

      this.logger.info("Tenant has been updated", Number(tenantId));
      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;
    // Validation

    if (isNaN(Number(tenantId))) {
      const err = createHttpError(400, "Invalid url params");
      next(err);
      return;
    }

    try {
      await this.tenantService.deleteById(Number(tenantId));

      this.logger.info("Tenant has been deleted", { id: Number(tenantId) });
      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }
}
