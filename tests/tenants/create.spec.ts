import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";

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
      console.log(response.statusCode);
      console.log(response.body);

      //assert
      expect(response.statusCode).toBe(201);
    });
  });
});
