const express = require("express");
const { checkCredentials, signToken, requireAuth } = require("./auth");
const { validate, loginSchema, documentSchema } = require("./validation");
const { createRateLimiter } = require("./rateLimiter");

function createApp({ rateLimit = 20 } = {}) {
  const app = express();
  app.use(createRateLimiter({ limit: rateLimit }));
  app.use(express.json({ limit: "10kb" }));

  app.post("/login", validate(loginSchema), (req, res) => {
    const { username, password } = req.body;
    if (!checkCredentials(username, password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.json({ token: signToken(username) });
  });

  app.get("/documents", requireAuth, (req, res) => {
    res.json({ documents: [] });
  });

  app.post("/documents", requireAuth, validate(documentSchema), (req, res) => {
    res.status(201).json({ document: req.body });
  });

  // Error handler: malformed JSON -> 400
  app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed" || err instanceof SyntaxError) {
      return res.status(400).json({ error: "Malformed JSON" });
    }
    return res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
