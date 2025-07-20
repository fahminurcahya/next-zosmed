import { Redis } from "@upstash/redis";
import { Redis as IoRedis } from "ioredis";

export interface RedisClient {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, options?: { ex?: number }) => Promise<string>;
    del: (key: string) => Promise<number>;
    incr: (key: string) => Promise<number>;
    expire: (key: string, seconds: number) => Promise<number>;
    lpush: (key: string, ...values: string[]) => Promise<number>;
    rpop: (key: string) => Promise<string | null>;
    llen: (key: string) => Promise<number>;
    lrem: (key: string, count: number, value: string) => Promise<number>;
    pipeline: () => any;
}

class LocalRedisClient implements RedisClient {
    private client: IoRedis;

    constructor() {
        this.client = new IoRedis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
            password: process.env.REDIS_PASSWORD,
        });

        this.client.on("connect", () => {
            console.log("✅ Connected to local Redis");
        });

        this.client.on("error", (err) => {
            console.error("❌ Redis connection error:", err);
        });
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, options?: { ex?: number }): Promise<string> {
        if (options?.ex) {
            return this.client.set(key, value, "EX", options.ex);
        }
        return this.client.set(key, value);
    }

    async del(key: string): Promise<number> {
        return this.client.del(key);
    }

    async incr(key: string): Promise<number> {
        return this.client.incr(key);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return this.client.expire(key, seconds);
    }

    async lpush(key: string, ...values: string[]): Promise<number> {
        return this.client.lpush(key, ...values);
    }

    async rpop(key: string): Promise<string | null> {
        return this.client.rpop(key);
    }

    async llen(key: string): Promise<number> {
        return this.client.llen(key);
    }

    async lrem(key: string, count: number, value: string): Promise<number> {
        return this.client.lrem(key, count, value);
    }

    pipeline() {
        return this.client.pipeline();
    }
}

class UpstashRedisClient implements RedisClient {
    private client: Redis;

    constructor() {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            throw new Error("Upstash Redis credentials not found");
        }

        this.client = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        console.log("✅ Connected to Upstash Redis");
    }

    async get(key: string): Promise<string | null> {
        const result = await this.client.get(key);
        return result as string | null;
    }

    async set(key: string, value: string, options?: { ex?: number }): Promise<string> {
        if (options?.ex) {
            return await this.client.setex(key, options.ex, value);
        }
        const result = await this.client.set(key, value);
        return result || "OK";
    }

    async del(key: string): Promise<number> {
        return await this.client.del(key);
    }

    async incr(key: string): Promise<number> {
        return await this.client.incr(key);
    }

    async expire(key: string, seconds: number): Promise<number> {
        return await this.client.expire(key, seconds);
    }

    async lpush(key: string, ...values: string[]): Promise<number> {
        return await this.client.lpush(key, ...values);
    }

    async rpop(key: string): Promise<string | null> {
        const result = await this.client.rpop(key);
        return result as string | null;
    }

    async llen(key: string): Promise<number> {
        return await this.client.llen(key);
    }

    async lrem(key: string, count: number, value: string): Promise<number> {
        return await this.client.lrem(key, count, value);
    }

    pipeline() {
        return this.client.pipeline();
    }
}

let redisClient: RedisClient | null = null;

// Get Redis client based on environment
export function getRedisClient(): RedisClient {
    if (!redisClient) {
        const isDevelopment = process.env.NODE_ENV === "development";
        const useLocalRedis = process.env.USE_LOCAL_REDIS === "true";

        console.log(process.env.NODE_ENV)

        if (isDevelopment && useLocalRedis) {
            console.log("🔧 Using local Redis for development");
            redisClient = new LocalRedisClient();
        } else {
            console.log("☁️  Using Upstash Redis");
            redisClient = new UpstashRedisClient();
        }
    }

    return redisClient;
}

export const redis = getRedisClient();

// Helper functions for common patterns
export const redisHelpers = {
    // Get with JSON parse
    async getJSON<T>(key: string): Promise<T | null> {
        const value = await redis.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return null;
        }
    },

    // Set with JSON stringify
    async setJSON<T>(key: string, value: T, ttl?: number): Promise<string> {
        const stringValue = JSON.stringify(value);
        return redis.set(key, stringValue, ttl ? { ex: ttl } : undefined);
    },

    // Check if key exists
    async exists(key: string): Promise<boolean> {
        const value = await redis.get(key);
        return value !== null;
    },

    // Get multiple keys
    async mget(keys: string[]): Promise<(string | null)[]> {
        // For local Redis, we need to handle this differently
        const results = await Promise.all(keys.map(key => redis.get(key)));
        return results;
    },
};