import crypto from "node:crypto";

const DEV_SECRET = "dev-only-secret-change-me";

export function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

export function sessionSecret(env) {
  const secret = env.SESSION_SECRET || "";
  if (secret.length >= 16 && secret !== DEV_SECRET) return secret;
  if (env.CMSA_DEV === "1") return secret.length >= 16 && secret !== DEV_SECRET ? secret : DEV_SECRET;
  return "";
}

export function signSession(email, secret, ttlSeconds = 60 * 60 * 12) {
  const payload = base64url(JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }));
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSession(token, secret) {
  if (!token || !secret || !String(token).includes(".")) return null;
  const [payload, sig] = String(token).split(".");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.email || !data.exp || data.exp < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

export function newToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function newId() {
  return crypto.randomBytes(8).toString("hex");
}
