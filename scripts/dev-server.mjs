import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { Readable } from "node:stream";
import { handleRequest } from "../src/server/handler.mjs";
import { openStores } from "../src/server/open-stores.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const port = Number(process.env.PORT || 4173);
const env = {
  ...process.env,
  CMSA_DEV: "1",
  CMSA_STORE: "file",
  CMSA_DATA_DIR: path.join(root, ".data"),
  CMSA_ROOT: root,
  CMSA_AI: process.env.CMSA_AI || "stub",
  ALLOW_DEV_MAGIC_LINK: "true",
  SITE_URL: process.env.SITE_URL || `http://127.0.0.1:${port}`,
};

const stores = await openStores(env);
const types = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

function staticFile(urlPath) {
  const relative = urlPath === "/" ? "index.html" : decodeURIComponent(urlPath).replace(/^\/+/, "");
  const file = path.resolve(dist, relative);
  if (!file.startsWith(dist)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  const index = path.join(file, "index.html");
  if (fs.existsSync(index)) return index;
  return null;
}

function toRequest(req) {
  const host = req.headers.host || `127.0.0.1:${port}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value != null) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  const method = req.method || "GET";
  if (method === "GET" || method === "HEAD") return new Request(`http://${host}${req.url}`, { method, headers });
  return new Request(`http://${host}${req.url}`, {
    method,
    headers,
    body: Readable.toWeb(req),
    duplex: "half",
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    const route = url.pathname.replace(/\/+$/, "") || "/";
    if (route.startsWith("/api") || route.startsWith("/members")) {
      const response = await handleRequest(toRequest(req), { stores, env });
      res.statusCode = response.status;
      response.headers.forEach((value, key) => {
        if (key === "set-cookie") res.setHeader("Set-Cookie", value);
        else res.setHeader(key, value);
      });
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const file = staticFile(url.pathname);
    if (!file) {
      const missing = path.join(dist, "404.html");
      res.statusCode = 404;
      res.end(fs.existsSync(missing) ? fs.readFileSync(missing) : "Not found");
      return;
    }
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    res.end(fs.readFileSync(file));
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end("Dev server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Dev server http://127.0.0.1:${port}`);
  console.log("Magic links are printed here and shown on the sign-in page. Email is not sent.");
});
