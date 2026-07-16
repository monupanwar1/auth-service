import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { Tenant } from "../../src/entity/Tenant";

jest.setTimeout(30000);
describe("POST /tenants", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5000");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();

    adminToken = jwks.token({
      sub: "1",
      role: Roles.Admin,
    });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("Should return the 201 status code", async () => {
      //  Arrange
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      // act
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      //assert
      expect(response.statusCode).toBe(201);
    });
    it("Should create a tenant in database", async () => {
      //  Arrange
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      // act
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);

      const tenants = await tenantRepository.find();

      //assert

      expect(tenants).toHaveLength(1);
      expect(tenants[0].name).toBe(tenantData.name);
      expect(tenants[0].address).toBe(tenantData.address);

      expect(response.statusCode).toBe(201);
    });
    it("Should  return status code 401 if user is not authenticated", async () => {
      //  Arrange
      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      // act
      const response = await request(app).post("/tenants").send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);

      const tenants = await tenantRepository.find();

      //assert

      expect(tenants).toHaveLength(0);

      expect(response.statusCode).toBe(401);
    });
    it("Should return status code 403 if user is not a admin", async () => {
      //  Arrange
      const managerToken = jwks.token({
        sub: "1",
        role: Roles.Manager,
      });

      const tenantData = {
        name: "Tenant name",
        address: "Tenant address",
      };
      // act
      const response = await request(app)
        .post("/tenants")
        .set("Cookie", [`accessToken=${managerToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(403);

      const tenantRepository = connection.getRepository(Tenant);

      const tenants = await tenantRepository.find();

      //assert

      expect(tenants).toHaveLength(0);
    });
  });
});
