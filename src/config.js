const fs = require("fs");

// Docker secret file first, then plain environment variable
function getSecret() {
  const file = process.env.JWT_SECRET_FILE;
  if (file && fs.existsSync(file)) {
    return fs.readFileSync(file, "utf8").trim();
  }
  return process.env.JWT_SECRET;
}

module.exports = { getSecret };
