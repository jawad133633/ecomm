const request = require("supertest");
const app = require("../app");

describe("MarketHub Health & Core API Tests", () => {
  test("GET /api/health should return 200 status and correct response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Server is running",
    });
  });

  test("GET / should return 200 status and greeting message", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "MarketHub backend is running!",
    });
  });

  test("GET /health should return status and database connection info", async () => {
    const response = await request(app).get("/health");

    // In isolated test environment without active DB, it reports 503 unavailable, or 200 if connected
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("database");
  });
});
