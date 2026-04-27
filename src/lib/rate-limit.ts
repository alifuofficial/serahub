import { headers } from "next/headers";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const cache = new Map<string, RateLimitRecord>();

/**
 * Basic memory-based rate limiter.
 * In production serverless environments, this should be replaced with Redis.
 */
export async function rateLimit(limit: number = 5, durationMs: number = 60000) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  
  let record = cache.get(ip);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + durationMs,
    };
    cache.set(ip, record);
    return { success: true, count: 1, reset: record.resetTime };
  }
  
  if (record.count >= limit) {
    return { success: false, count: record.count, reset: record.resetTime };
  }
  
  record.count++;
  return { success: true, count: record.count, reset: record.resetTime };
}
