const windowMs = 60_000;
const maxRequests = 55; // stay under Gemini's 60 RPM

const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  entry.count += 1;
  if (entry.count > maxRequests) {
    const waitSeconds = Math.ceil((entry.resetAt - now) / 1000);
    throw new Error(
      `Rate limit exceeded. Try again in ${waitSeconds}s.`,
    );
  }
}
