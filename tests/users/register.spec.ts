import request from "supertest";
import app from "../../src/app";

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
