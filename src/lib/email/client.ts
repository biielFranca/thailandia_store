import { Resend } from "resend";

/**
 * Lazy Resend client — only instantiated when needed so missing env vars
 * surface at call time (not at module load / build time).
 */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/** From-address pulled from env, with a sensible Resend-sandbox default. */
export function getFromAddress(): string {
  return process.env.EMAIL_FROM ?? "Thailandia Store <onboarding@resend.dev>";
}
