const jwt = require("jsonwebtoken");
const { getSecret } = require("./config");

// Demo user only. Real apps use a database with hashed passwords.
const USERS = { admin: "password123" };

function checkCredentials(username, password) {
  return Object.prototype.hasOwnProperty.call(USERS, username) &&
    USERS[username] === password;
}

function signToken(username) {
  return jwt.sign({ sub: username }, getSecret(), {
    algorithm: "HS256",
    expiresIn: "1h",
  });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  try {
    req.user = jwt.verify(token, getSecret(), { algorithms: ["HS256"] });
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { checkCredentials, signToken, requireAuth };
