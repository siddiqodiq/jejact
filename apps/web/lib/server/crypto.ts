import "server-only";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { getEnv } from "./env";

/**
 * Seals/unseals small JSON payloads with AES-256-GCM (confidentiality +
 * integrity), for storing Strava tokens in an httpOnly cookie without a
 * database. Format: base64url(iv).base64url(tag).base64url(ciphertext)
 */

function key(): Buffer {
  const secret = getEnv().SESSION_SECRET;
  return /^[0-9a-fA-F]{64}$/.test(secret)
    ? Buffer.from(secret, "hex")
    : createHash("sha256").update(secret).digest();
}

export function seal(payload: unknown): string {
  return encryptString(JSON.stringify(payload));
}

export function unseal<T>(sealed: string): T | null {
  try {
    const plain = decryptString(sealed);
    if (!plain) return null;
    return JSON.parse(plain) as T;
  } catch {
    return null; // tampered, corrupted, or sealed with an old secret
  }
}

export function encryptString(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((b) => b.toString("base64url")).join(".");
}

export function decryptString(encryptedData: string): string | null {
  try {
    const [iv, tag, data] = encryptedData
      .split(".")
      .map((part) => Buffer.from(part, "base64url"));
    if (!iv || !tag || !data) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(data), decipher.final()]);
    return plain.toString("utf8");
  } catch {
    return null;
  }
}
