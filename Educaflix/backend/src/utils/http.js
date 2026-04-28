const { parse } = require("url");

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function parseUrl(req) {
  return parse(req.url, true);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 100_000) {
        req.destroy();
        reject(new Error("Payload muito grande."));
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("JSON invalido."));
      }
    });

    req.on("error", reject);
  });
}

function getCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function setCookie(res, name, value, options = {}) {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];

  if (options.maxAge !== undefined) attributes.push(`Max-Age=${options.maxAge}`);
  if (options.secure) attributes.push("Secure");

  res.setHeader("Set-Cookie", attributes.join("; "));
}

function clearCookie(res, name) {
  setCookie(res, name, "", { maxAge: 0 });
}

function getClientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local")
    .split(",")[0]
    .trim();
}

module.exports = {
  clearCookie,
  getClientIp,
  getCookies,
  parseUrl,
  readJsonBody,
  sendJson,
  setCookie
};
