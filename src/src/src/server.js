const { createApp } = require("./app");

if (!process.env.JWT_SECRET && !process.env.JWT_SECRET_FILE) {
  console.error("Set JWT_SECRET or JWT_SECRET_FILE");
  process.exit(1);
}

createApp().listen(3000, () => console.log("API on port 3000"));
