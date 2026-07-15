import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { Tenant } from "../../src/entity/Tenant";
import { createTenant } from "../utils";

jest.setTimeout(3000);
describe("POST /users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5000");

    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });
  describe("Given all fields", () => {
    it("Should persist the user in the database", async () => {
      // Create tenant
      const tenant = await createTenant(connection.getRepository(Tenant));

      const adminToken = jwks.token({
        sub: "1",
        role: Roles.Admin,
      });

      // Register user
      const userData = {
        firstName: "kunal",
        lastName: "p",
        email: "kunal@mern.space",
        password: "secret045",
        tenantId: tenant.id,
        role: Roles.Manager,
      };

      // Add token to cookie
      await request(app)
        .post("/users")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      // Assert
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });
  });
});
