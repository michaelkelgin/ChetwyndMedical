import { findMember } from "../config/members.mjs";
import {
  cancelChange,
  chatOnChange,
  consumeMagicLink,
  createChange,
  decideChange,
  getChange,
  listChanges,
  listDocuments,
  listMemberPages,
  requestMagicLink,
  restoreRevision,
  reverseChange,
  submitChange,
} from "./changes.mjs";
import { userFromCookie } from "./changes.mjs";
import {
  authResultPage,
  documentsPage,
  editPage,
  memberPageView,
  membersHome,
  updatesPage,
} from "./pages.mjs";

function isForm(request) {
  const type = request.headers.get("content-type") || "";
  return type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
}

function originAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET" || request.method === "HEAD";
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

function clientIp(request) {
  return request.headers.get("x-nf-client-connection-ip")
    || (request.headers.get("x-forwarded-for") || "").split(",")[0].trim()
    || "local";
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(/;\s*/)) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index) === name) return decodeURIComponent(part.slice(index + 1));
  }
  return "";
}

function html(body, status = 200, extra = {}) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
}

function json(body, status = 200, extra = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}

function sessionCookie(token, request, maxAge = 60 * 60 * 12) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `cmsa_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function redirect(request, location, error) {
  const url = new URL(location, request.url);
  if (error) url.searchParams.set("error", error);
  return Response.redirect(url, 303);
}

async function readPayload(request) {
  if (!isForm(request) && (request.headers.get("content-type") || "").includes("application/json")) {
    const body = await request.json();
    return { fields: body, files: body.files || [] };
  }
  const form = await request.formData();
  const fields = {};
  const files = [];
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
      continue;
    }
    if (!value || !value.size) continue;
    if (value.size > 5 * 1024 * 1024) return { error: "Files must be 5 MB or smaller." };
    const bytes = Buffer.from(await value.arrayBuffer());
    const name = value.name || "upload";
    const text = /text|json|csv|markdown|\.md$|\.txt$/i.test(`${value.type} ${name}`) ? bytes.toString("utf8") : "";
    files.push({ name, type: value.type || "application/octet-stream", bytes, text });
  }
  return { fields, files };
}

function requireUser(request, env) {
  const user = userFromCookie(readCookie(request, "cmsa_session"), env);
  if (!user) return { error: "Sign in required.", status: 401 };
  return { user };
}

export async function handleRequest(request, { stores, env }) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (request.method === "POST" && !originAllowed(request)) {
    return json({ error: "Cross-site request blocked." }, 403);
  }

  if (request.method === "POST" && path === "/api/auth/request") {
    const payload = await readPayload(request);
    const result = await requestMagicLink({
      stores,
      env,
      email: payload.fields?.email || payload.fields?.message,
      ip: clientIp(request),
    });
    if (isForm(request)) {
      if (result.error) return html(authResultPage({ devLink: "", delivery: result.error }), result.status || 400);
      return html(authResultPage(result));
    }
    return json(result, result.status || 200);
  }

  if (request.method === "GET" && path === "/api/auth/verify") {
    const result = await consumeMagicLink({ stores, env, token: url.searchParams.get("token") });
    if (result.error) return html(`<p>${result.error}</p> <p><a href="/login/">Try again</a></p>`, result.status || 400);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/members/",
        "Set-Cookie": sessionCookie(result.cookie, request),
        "Cache-Control": "no-store",
      },
    });
  }

  if (request.method === "POST" && path === "/api/auth/logout") {
    return new Response(null, {
      status: 303,
      headers: {
        Location: "/login/",
        "Set-Cookie": sessionCookie("", request, 0),
        "Cache-Control": "no-store",
      },
    });
  }

  if (request.method === "GET" && path === "/api/auth/me") {
    const user = userFromCookie(readCookie(request, "cmsa_session"), env);
    return json({ user: user || null });
  }

  const auth = requireUser(request, env);
  if (path.startsWith("/members") || path.startsWith("/api/changes")) {
    if (auth.error) {
      if (path.startsWith("/api/")) return json({ error: auth.error }, 401);
      return Response.redirect(new URL("/login/", request.url), 302);
    }
  }
  const user = auth.user;

  if (request.method === "GET" && path === "/members") {
    const pages = await listMemberPages(stores);
    return html(membersHome({ user, pages }));
  }

  if (request.method === "GET" && path === "/members/documents") {
    const documents = (await listDocuments(stores)).map((doc) => ({ ...doc, id: doc.id || "" }));
    const rows = await stores.records.list("doc:");
    const docs = rows.map((row) => ({ id: row.key.slice(4), ...row.value }));
    return html(documentsPage({ user, documents: docs.length ? docs : documents }));
  }

  if (request.method === "GET" && path.startsWith("/members/documents/")) {
    const id = path.slice("/members/documents/".length);
    const doc = await stores.records.get(`doc:${id}`);
    if (!doc) return html("<p>Document not found.</p>", 404);
    const blob = await stores.blobs.get(doc.blobKey);
    if (!blob) return html("<p>Document file is missing.</p>", 404);
    return new Response(blob.bytes, {
      headers: {
        "Content-Type": doc.type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${String(doc.name || "document").replace(/"/g, "")}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (request.method === "GET" && path.startsWith("/members/pages/")) {
    const slug = path.slice("/members/pages/".length);
    const pages = await listMemberPages(stores);
    const page = pages.find((item) => item.path.endsWith(`/${slug}.md`) || item.path.endsWith(slug));
    if (!page) return html("<p>Page not found.</p>", 404);
    return html(memberPageView({ user, page }));
  }

  if (request.method === "GET" && path === "/members/updates") {
    return html(updatesPage({ user, changes: await listChanges(stores), error: url.searchParams.get("error") }));
  }

  if (request.method === "POST" && path === "/members/updates") {
    const payload = await readPayload(request);
    if (payload.error) return redirect(request, "/members/updates/", payload.error);
    const result = await createChange({
      stores,
      env,
      user,
      message: payload.fields.message || "",
      files: payload.files,
    });
    if (result.error) return redirect(request, "/members/updates/", result.error);
    return redirect(request, `/members/updates/${result.change.id}/`);
  }

  const editMatch = path.match(/^\/members\/updates\/([a-f0-9]+)$/);
  if (editMatch && request.method === "GET") {
    const change = await getChange(stores, editMatch[1]);
    if (!change) return html("<p>Change not found.</p>", 404);
    return html(editPage({ user, change, error: url.searchParams.get("error") }));
  }

  if (editMatch && request.method === "POST") {
    const payload = await readPayload(request);
    const id = editMatch[1];
    const action = payload.fields?.action || "chat";
    let result;
    if (action === "chat") result = await chatOnChange({ stores, env, user, id, message: payload.fields.message || "", files: payload.files });
    else if (action === "restore") result = await restoreRevision({ stores, user, id, revisionId: payload.fields.revisionId });
    else if (action === "submit") result = await submitChange({ stores, env, user, id });
    else if (action === "cancel") result = await cancelChange({ stores, env, user, id });
    else if (action === "reverse") result = await reverseChange({ stores, env, user, id });
    else if (action === "approve") result = await decideChange({ stores, env, user, id, decision: "approve" });
    else if (action === "deny") result = await decideChange({ stores, env, user, id, decision: "deny" });
    else if (action === "preview") result = { change: await getChange(stores, id) };
    else result = { error: "Unknown action.", status: 400 };
    if (result.error) return redirect(request, `/members/updates/${id}/`, result.error);
    return redirect(request, `/members/updates/${id}/`);
  }

  const apiChange = path.match(/^\/api\/changes(?:\/([a-f0-9]+))?(?:\/([a-z]+))?$/);
  if (apiChange && path.startsWith("/api/changes")) {
    if (!user) return json({ error: "Sign in required." }, 401);
    if (request.method === "GET" && !apiChange[1]) return json({ changes: await listChanges(stores) });
    if (request.method === "POST" && !apiChange[1]) {
      const payload = await readPayload(request);
      const result = await createChange({ stores, env, user, message: payload.fields.message || payload.fields.note || "", files: payload.files });
      return json(result.error ? { error: result.error } : { change: result.change }, result.status || (result.error ? 400 : 200));
    }
    if (request.method === "GET" && apiChange[1] && !apiChange[2]) {
      const change = await getChange(stores, apiChange[1]);
      return change ? json({ change }) : json({ error: "Not found" }, 404);
    }
    if (request.method === "POST" && apiChange[1]) {
      const payload = await readPayload(request);
      const id = apiChange[1];
      const action = apiChange[2] || payload.fields.action;
      const args = { stores, env, user, id };
      let result;
      if (action === "chat") result = await chatOnChange({ ...args, message: payload.fields.message || "", files: payload.files });
      else if (action === "restore") result = await restoreRevision({ stores, user, id, revisionId: payload.fields.revisionId });
      else if (action === "submit") result = await submitChange(args);
      else if (action === "cancel") result = await cancelChange(args);
      else if (action === "reverse") result = await reverseChange(args);
      else if (action === "approve") result = await decideChange({ ...args, decision: "approve" });
      else if (action === "deny") result = await decideChange({ ...args, decision: "deny" });
      else result = { error: "Unknown action.", status: 400 };
      return json(result.error ? { error: result.error, change: result.change } : { change: result.change }, result.status || (result.error ? 400 : 200));
    }
  }

  if (path.startsWith("/members")) return html("<p>Not found.</p>", 404);
  return json({ error: "Not found" }, 404);
}

export { findMember };
