import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { User } from "../../src/entity/User";

jest.setTimeout(30000);

describe("Database connection", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
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
