import { MemoryStore } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../services/redisService.js';

export const createHybridStore = () => {
  let hybridStoreOptions = null;
  const memoryStore = new MemoryStore();
  const redisStore = new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  });

  let isRedisStoreInit = false;

  return {
    init: (options) => {
      memoryStore.init(options);
      // We do not eagerly init RedisStore here because it will crash if Redis is offline.
      // We'll init it on-demand when Redis is ready.
      hybridStoreOptions = options;
    },
    increment: async (key) => {
      if (redisClient.status === 'ready') {
        if (!isRedisStoreInit && hybridStoreOptions) {
          redisStore.init(hybridStoreOptions);
          isRedisStoreInit = true;
        }
        try {
          return await redisStore.increment(key);
        } catch (e) {
          return memoryStore.increment(key);
        }
      }
      return memoryStore.increment(key);
    },
    decrement: async (key) => {
      if (redisClient.status === 'ready') {
        if (!isRedisStoreInit && hybridStoreOptions) {
          redisStore.init(hybridStoreOptions);
          isRedisStoreInit = true;
        }
        try {
          return await redisStore.decrement(key);
        } catch (e) {
          return memoryStore.decrement(key);
        }
      }
      return memoryStore.decrement(key);
    },
    resetKey: async (key) => {
      if (redisClient.status === 'ready') {
        if (!isRedisStoreInit && hybridStoreOptions) {
          redisStore.init(hybridStoreOptions);
          isRedisStoreInit = true;
        }
        try {
          return await redisStore.resetKey(key);
        } catch (e) {
          return memoryStore.resetKey(key);
        }
      }
      return memoryStore.resetKey(key);
    }
  };
};
