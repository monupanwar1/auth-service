import createJWKSMock from "mock-jwks";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

jest.setTimeout(30000);
describe("GET /auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
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
    it("should return the 200 status code ", async () => {
      // Arrange
      const accessToken = jwks.token({
        sub: "1",
        role: Roles.Customer,
      });
      // act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // assert
      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      // arrange
      const userData = {
        firstName: "kunal",
        lastName: "p",
        email: "kunal@mern.space",
        password: "supersecret",
      };

      const userRepository = connection.getRepository(User);

      const data = await userRepository.save({
        ...userData,
        role: Roles.Customer,
      });

      const accessToken = jwks.token({
        sub: String(data.id),
        role: data.role,
      });

      // act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", `accessToken=${accessToken}`)
        .send();

      // assert
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(data.id);
    });

    it("should not return password field ", async () => {
      // Arrange
      const accessToken = jwks.token({
        sub: "1",
        role: Roles.Customer,
      });
      // act
      const response = await request(app)
        .get("/auth/self")
        .set("Cookie", [`accessToken=${accessToken}`])
        .send();

      // assert
      expect(response.body as Record<string, string>).not.toHaveProperty(
        "Password",
      );
    });

    it("should return status code token does not exists", async () => {
      // Arrange
      const userData = {
        firstName: "kunal",
        lastName: "p",
        email: "kunal@mern.space",
        password: "supersecret",
      };

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        role: Roles.Customer,
      });
      // act
      const response = await request(app).get("/auth/self").send();

      // assert
      expect(response.statusCode).toBe(401);
    });
  });
});
