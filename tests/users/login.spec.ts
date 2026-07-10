import bcrypt from "bcryptjs";
import request from "supertest";
import { DataSource } from "typeorm";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constants";
import { User } from "../../src/entity/User";
import { isJwt } from "../utils";

jest.setTimeout(30000);
describe("Post /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return the access token and refresh token inside a cookie", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.Customer,
      });

      //Act
      const response = await request(app).post("/auth/login").send({
        email: userData.email,
        password: userData.password,
      });

      //Assert

      interface Headers {
        ["set-cookie"]?: string[];
      }

      let accessToken = null;
      let refreshToken = null;

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
    it("should return the 400 if email or password is wrong", async () => {
      //Arrange
      const userData = {
        firstName: "Kunal",
        lastName: "Panwar",
        email: "Kunal@mern.space",
        password: "superSecret",
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const userRepository = connection.getRepository(User);

      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.Customer,
      });

      //Act
      const response = await request(app).post("/auth/login").send({
        email: userData.email,
        password: "wrongpassword",
      });

      //Assert
      expect(response.statusCode).toBe(400);
    });
  });
});
