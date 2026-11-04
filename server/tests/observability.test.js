const request = require("supertest");
const app = require("../app");

describe("MarketHub Observability & Metrics Tests", () => {
  test("GET /metrics should expose Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.text).toContain("# HELP");
    expect(response.text).toContain("# TYPE");
  });

  test("POST /api/observability/client-event should record client observability events", async () => {
    const payload = {
      eventType: "test_event",
      meta: { sample: "data" },
      timestamp: new Date().toISOString()
    };

    const response = await request(app)
      .post("/api/observability/client-event")
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
  });
});
