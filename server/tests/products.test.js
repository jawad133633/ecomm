const request = require("supertest");
const app = require("../app");

describe("MarketHub Product API Tests", () => {
  test("GET /api/products without DB should handle gracefully with 500 or 200", async () => {
    const response = await request(app).get("/api/products");

    expect([200, 500, 503]).toContain(response.status);
    expect(response.body).toHaveProperty("success");
  });

  test("GET /api/products/invalid-id should return 400 for invalid MongoDB ObjectId", async () => {
    const response = await request(app).get("/api/products/invalid-id");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid product ID",
    });
  });
});
