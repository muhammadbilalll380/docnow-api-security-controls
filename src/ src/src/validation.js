const { z } = require("zod");

const loginSchema = z
  .object({
    username: z.string().min(3).max(50),
    password: z.string().min(8).max(100),
  })
  .strict();

const documentSchema = z
  .object({
    title: z.string().min(1).max(100),
    content: z.string().max(5000),
  })
  .strict();

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.issues.map((i) => i.message),
      });
    }
    req.body = result.data;
    return next();
  };
}

module.exports = { loginSchema, documentSchema, validate };
