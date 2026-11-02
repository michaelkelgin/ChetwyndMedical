function bytesToBase64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sessionEmail(token, secret) {
  if (!token || !secret || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  if (bytesToBase64url(mac) !== sig) return null;
  try {
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const data = JSON.parse(atob(padded));
    if (!data.email || !data.exp || data.exp < Date.now() / 1000) return null;
    return data.email;
  } catch {
    return null;
  }
}

function cookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(/;\s*/)) {
    const index = part.indexOf("=");
    if (index !== -1 && part.slice(0, index) === name) return decodeURIComponent(part.slice(index + 1));
  }
  return "";
}

export default async (request, context) => {
  const secret = Netlify.env.get("SESSION_SECRET") || "";
  const email = await sessionEmail(cookie(request, "cmsa_session"), secret);
  if (!email) return Response.redirect(new URL("/login/", request.url), 302);
  return context.next();
};

export const config = {
  path: ["/members", "/members/*"],
};
