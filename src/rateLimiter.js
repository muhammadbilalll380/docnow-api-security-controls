const { RateLimiter } = require("limiter");

// Token bucket per IP: bucket size = limit, refills `limit` tokens per minute
function createRateLimiter({ limit = 20 } = {}) {
  const buckets = new Map();
  return (req, res, next) => {
    const ip = req.ip;
    let bucket = buckets.get(ip);
    if (!bucket) {
      bucket = new RateLimiter({ tokensPerInterval: limit, interval: "minute" });
      buckets.set(ip, bucket);
    }
    if (bucket.tryRemoveTokens(1)) {
      return next();
    }
    res.set("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests" });
  };
}

module.exports = { createRateLimiter };
