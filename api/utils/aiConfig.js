module.exports = {
    RATE_LIMIT: {
      MAX_RETRIES: 3,
      DELAY_MS: 1000,
      MAX_REQUESTS_PER_MINUTE: 30
    },
    CACHE: {
      TTL_MS: 3600000 // 1 hour
    },
    API: {
      TIMEOUT_MS: 10000,
      SHOULD_USE_API: process.env.NODE_ENV !== 'test'
    }
  };