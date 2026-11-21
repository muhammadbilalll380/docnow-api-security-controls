process.env.JWT_SECRET = "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { createApp } = require("../src/app");

const validLogin = { username: "admin", password: "password123" };

async function getToken(app) {
  const res = await request(app).post("/login").send(validLogin);
  return res.body.token;
}

describe("Login / JWT", () => {
  test("valid login returns a signed JWT", async () => {
    const res = await request(createApp()).post("/login").send(validLogin);
    expect(res.status).toBe(200);
    expect(res.body.token.split(".")).toHaveLength(3);
  });

  test("wrong password returns 401", async () => {
    const res = await request(createApp())
      .post("/login")
      .send({ username: "admin", password: "wrongpass1" });
    expect(res.status).toBe(401);
  });

  test("unknown user returns 401", async () => {
    const res = await request(createApp())
      .post("/login")
      .send({ username: "nobody", password: "password123" });
    expect(res.status).toBe(401);
  });

  test("missing JWT returns 401", async () => {
    const res = await request(createApp()).get("/documents");
    expect(res.status).toBe(401);
  });

  test("garbage token returns 401", async () => {
    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", "Bearer not.a.token");
    expect(res.status).toBe(401);
  });

  test("expired token returns 401", async () => {
    const expired = jwt.sign({ sub: "admin" }, "test-secret", { expiresIn: -10 });
    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  test("token signed with wrong secret returns 401", async () => {
    const forged = jwt.sign({ sub: "admin" }, "other-secret");
    const res = await request(createApp())
      .get("/documents")
      .set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  test("valid token allows access", async () => {
    const app = createApp();
    const token = await getToken(app);
    const res = await request(app)
      .get("/documents")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("Input validation", () => {
  test("login with missing fields returns 400", async () => {
    const res = await request(createApp()).post("/login").send({ username: "admin" });
    expect(res.status).toBe(400);
  });

  test("login with extra field returns 400", async () => {
    const res = await request(createApp())
      .post("/login")
      .send({ ...validLogin, role: "admin" });
    expect(res.status).toBe(400);
  });

  test("malformed JSON returns 400", async () => {
    const res = await request(createApp())
      .post("/login")
      .set("Content-Type", "application/json")
      .send('{"username": "admin", ');
    expect(res.status).toBe(400);
  });

  test("document with empty title returns 400", async () => {
    const app = createApp();
    const token = await getToken(app);
    const res = await request(app)
      .post("/documents")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "", content: "x" });
    expect(res.status).toBe(400);
  });

  test("valid document returns 201", async () => {
    const app = createApp();
    const token = await getToken(app);
    const res = await request(app)
      .post("/documents")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Report", content: "Hello" });
    expect(res.status).toBe(201);
  });
});

describe("Rate limiting", () => {
  test("21st request in a minute returns 429", async () => {
    const app = createApp({ rateLimit: 20 });
    for (let i = 0; i < 20; i++) {
      const ok = await request(app).get("/documents");
      expect(ok.status).toBe(401); // allowed through limiter, rejected by auth
    }
    const blocked = await request(app).get("/documents");
    expect(blocked.status).toBe(429);
  });
});
