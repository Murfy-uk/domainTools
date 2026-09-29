import http from "node:http";
import { readFile, appendFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractDomains, isValidDomain } from "./public/extractDomains.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "domains.txt");
const PORT = Number(process.env.PORT) || 3000;
const HOST = "127.0.0.1";
const MAX_BODY_BYTES = 5 * 1024 * 1024;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const known = new Set();
let needsLeadingNewline = false;

if (existsSync(DATA_FILE)) {
  const contents = readFileSync(DATA_FILE, "utf8");
  for (const line of contents.split("\n")) {
    const domain = line.trim();
    if (isValidDomain(domain)) known.add(domain);
  }
  needsLeadingNewline = contents.length > 0 && !contents.endsWith("\n");
}

let queue = Promise.resolve();

function record(domains) {
  queue = queue
    .then(async () => {
      const fresh = domains.filter((domain) => !known.has(domain));
      if (fresh.length === 0) return;

      await mkdir(DATA_DIR, { recursive: true });
      const prefix = needsLeadingNewline ? "\n" : "";
      await appendFile(DATA_FILE, prefix + fresh.join("\n") + "\n");
      needsLeadingNewline = false;
      fresh.forEach((domain) => known.add(domain));
    })
    .catch((error) => console.error("Failed to write domains:", error));
  return queue;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function handleFilter(req, res) {
  let text;
  try {
    ({ text } = JSON.parse(await readBody(req)));
  } catch (error) {
    return sendJson(res, error.status || 400, { error: "Invalid request" });
  }
  if (typeof text !== "string") {
    return sendJson(res, 400, { error: "Expected { text: string }" });
  }

  const domains = extractDomains(text);
  await record(domains);
  sendJson(res, 200, { domains });
}

async function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.resolve(PUBLIC_DIR, "." + pathname);
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(404).end("Not found");
    return;
  }

  try {
    const content = await readFile(filePath);
    const type =
      CONTENT_TYPES[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

const server = http.createServer((req, res) => {
  if (req.url === "/api/filter" && req.method === "POST") {
    handleFilter(req, res).catch((error) => {
      console.error(error);
      if (!res.headersSent) sendJson(res, 500, { error: "Server error" });
    });
    return;
  }
  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405).end("Method not allowed");
});

server.listen(PORT, HOST, () => {
  console.log(`Domain Filter running at http://localhost:${PORT}`);
});
