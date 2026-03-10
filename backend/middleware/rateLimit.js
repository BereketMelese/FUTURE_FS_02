const buckets = new Map();

const cleanupBuckets = (now) => {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 120,
  message = "Too many requests, please try again later.",
  code = "RATE_LIMITED",
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const routeKey = req.baseUrl || req.path || "global";
    const key = `${req.ip}:${routeKey}`;

    cleanupBuckets(now);

    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existing.count >= max) {
      const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
      res.set("Retry-After", String(Math.max(retryAfter, 1)));

      return res.status(429).json({
        success: false,
        code,
        message,
      });
    }

    existing.count += 1;
    return next();
  };
};
