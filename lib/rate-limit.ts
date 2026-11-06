const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const item = hits.get(key);

  if (!item || item.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  item.count += 1;
  return { ok: item.count <= limit, remaining: Math.max(0, limit - item.count) };
}
