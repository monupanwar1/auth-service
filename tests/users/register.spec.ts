import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";

jest.setTimeout(30000);

describe("Database connection", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  afterEach(async () => {
    const userRepository = connection.getRepository(User);
    await userRepository.clear();
  });

  afterAll(async () => {
    if (connection && connection.isInitialized) {
      await connection.destroy();
    }
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
