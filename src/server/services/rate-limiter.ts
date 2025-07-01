// server/services/rate-limiter.ts
import { Redis } from '@upstash/redis';

interface RateLimitOptions {
    maxRequests: number;
    windowMs: number;
}

export class RateLimiter {
    private redis: Redis;

    constructor() {
        // Initialize Redis client (using Upstash for serverless)
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
    }

    async checkLimit(
        identifier: string,
        action: string,
        options: RateLimitOptions
    ): Promise<boolean> {
        const key = `rate_limit:${action}:${identifier}`;
        const now = Date.now();
        const windowStart = now - options.windowMs;

        try {
            // Remove old entries
            await this.redis.zremrangebyscore(key, 0, windowStart);

            // Count current requests in window
            const currentCount = await this.redis.zcard(key);

            if (currentCount >= options.maxRequests) {
                return false; // Rate limit exceeded
            }

            // Add current request
            await this.redis.zadd(key, { score: now, member: `${now}` });

            // Set expiry
            await this.redis.expire(key, Math.ceil(options.windowMs / 1000));

            return true;
        } catch (error) {
            console.error('Rate limiter error:', error);
            // Fail open - allow request if rate limiter fails
            return true;
        }
    }

    // Get remaining requests
    async getRemainingRequests(
        identifier: string,
        action: string,
        options: RateLimitOptions
    ): Promise<number> {
        const key = `rate_limit:${action}:${identifier}`;
        const now = Date.now();
        const windowStart = now - options.windowMs;

        try {
            await this.redis.zremrangebyscore(key, 0, windowStart);
            const currentCount = await this.redis.zcard(key);
            return Math.max(0, options.maxRequests - currentCount);
        } catch (error) {
            console.error('Rate limiter error:', error);
            return options.maxRequests;
        }
    }
}

// Alternative implementation using in-memory storage (for development)
export class InMemoryRateLimiter {
    private requests: Map<string, number[]> = new Map();

    async checkLimit(
        identifier: string,
        action: string,
        options: RateLimitOptions
    ): Promise<boolean> {
        const key = `${action}:${identifier}`;
        const now = Date.now();
        const windowStart = now - options.windowMs;

        // Get existing requests
        let requestTimes = this.requests.get(key) || [];

        // Filter out old requests
        requestTimes = requestTimes.filter(time => time > windowStart);

        if (requestTimes.length >= options.maxRequests) {
            return false;
        }

        // Add current request
        requestTimes.push(now);
        this.requests.set(key, requestTimes);

        return true;
    }

    async getRemainingRequests(
        identifier: string,
        action: string,
        options: RateLimitOptions
    ): Promise<number> {
        const key = `${action}:${identifier}`;
        const now = Date.now();
        const windowStart = now - options.windowMs;

        let requestTimes = this.requests.get(key) || [];
        requestTimes = requestTimes.filter(time => time > windowStart);

        return Math.max(0, options.maxRequests - requestTimes.length);
    }
}