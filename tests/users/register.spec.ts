import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { RefreshToken } from "../../src/entity/RefreshToken";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";

jest.setTimeout(30000);

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    // Database truncate
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it("should connect to the PostgreSQL database", async () => {
    expect(AppDataSource.isInitialized).toBe(true);
  });

  describe("Given all fields", () => {
    it("should return the 201 status code", async () => {
      // Arrange

      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      // Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act

      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.headers["content-type"]).toEqual(
        expect.stringContaining("json"),
      );
    });

    it("should persist the user in database ", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act

      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });
    it("should return id of created user  ", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act

      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(response.body).toHaveProperty("id");
      expect((response.body as Record<string, string>).id).toBe(users[0].id);
    });
    it("should return assign role ", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act

      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.Customer);
    });

    it("should store the hashed password in the database", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act
      await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({
        select: {
          password: true,
        },
      });
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
    });

    it("should return 400 status code if email already exists", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      const userRepository = connection.getRepository(User);
      userRepository.save({ ...userData, role: Roles.Customer });

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert

      const users = await userRepository.find();

      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    it("should return the access token and refresh token inside a cookie", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert

      let accessToken = null;
      let refreshToken = null;

      interface Headers {
        ["set-cookie"]?: string[];
      }

      const cookies = (response.headers as Headers)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should store the refresh token in the database", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const refreshTokenRepo = connection.getRepository(RefreshToken);

      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .leftJoin("refreshToken.user", "user")
        .where("user.id = :userId", {
          userId: (response.body as Record<string, string>).id,
        })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });
});

// health
describe("App", () => {
  describe("GET /health", () => {
    it("Should return 200 OK", async () => {
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
    });

    it("Should return a success message", async () => {
      const response = await request(app).get("/health");
      expect(response.body).toEqual({
        status: "ok",
      });
    });
  });
});
