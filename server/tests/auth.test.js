const request = require("supertest");
const app = require("../app");

describe("MarketHub Auth Validation Tests", () => {
  test("POST /api/auth/signup should reject missing fields with 400", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });

  test("POST /api/auth/signup should reject invalid email format with 400", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "not-an-email",
        password: "password123"
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body.message).toContain("valid email");
  });

  test("POST /api/auth/login should reject missing credentials with 400", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("success", false);
  });
});
