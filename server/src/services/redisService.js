import Redis from 'ioredis';

// Connect to Redis if REDIS_URL is provided, otherwise it will try localhost:6379 by default in dev
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // Retry connecting indefinitely, but back off up to 2 seconds
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  showFriendlyErrorStack: true
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export const connectRedis = async () => {
  try {
    await redis.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Redis failed to connect initially (will keep trying in background):', err.message);
  }
};

/**
 * Safe wrapper for Redis GET. If Redis is down, it returns null instead of throwing,
 * allowing the application to gracefully fall back to PostgreSQL.
 */
export const safeGet = async (key) => {
  if (redis.status !== 'ready') return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error.message);
    return null; // Fallback to DB
  }
};

/**
 * Safe wrapper for Redis SET.
 */
export const safeSet = async (key, value, ttlSeconds = null) => {
  if (redis.status !== 'ready') return false;
  try {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, stringValue, 'EX', ttlSeconds);
    } else {
      await redis.set(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error.message);
    return false;
  }
};

/**
 * Safe wrapper for Redis DEL.
 */
export const safeDel = async (key) => {
  if (redis.status !== 'ready') return false;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error.message);
    return false;
  }
};

export default redis;
