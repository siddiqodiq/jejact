import "server-only";
import { z } from "zod";

const envSchema = z.object({
  STRAVA_CLIENT_ID: z.string().min(1, "STRAVA_CLIENT_ID is required"),
  STRAVA_CLIENT_SECRET: z.string().min(1, "STRAVA_CLIENT_SECRET is required"),
  SUPABASE_URL: z.string().url("SUPABASE_URL is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  /** Encrypts the session cookie (any random string >= 16 chars). */
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET must be >= 16 chars"),
  /**
   * Optional absolute URL override for OAuth redirects (e.g. the production
   * domain). When unset, the request origin is used — which works for
   * localhost and Vercel previews alike.
   */
  APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Parsed lazily so `next build` works without secrets present. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
