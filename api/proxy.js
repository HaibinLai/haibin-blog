const ORIGIN = "https://www.haibinlaiblog.top";
const ORIGIN_HOST = "www.haibinlaiblog.top";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "x-forwarded-host",
  "x-forwarded-proto"
]);

function getTargetUrl(req) {
  const publicUrl = new URL(req.url, `https://${req.headers.host}`);
  const path = publicUrl.searchParams.get("path") || "";
  publicUrl.searchParams.delete("path");

  const pathname = path.startsWith("/") ? path : `/${path}`;
  return `${ORIGIN}${pathname}${publicUrl.search}`;
}

function getPublicOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers.host}`;
}

function getRequestHeaders(req) {
  const headers = {};

  for (const [name, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase()) && value !== undefined) {
      headers[name] = value;
    }
  }

  headers.host = ORIGIN_HOST;
  headers["accept-encoding"] = "identity";
  return headers;
}

async function getRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return undefined;
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function rewriteLocation(location, publicOrigin) {
  if (!location) {
    return location;
  }

  return location
    .replaceAll(ORIGIN, publicOrigin)
    .replaceAll(`http://${ORIGIN_HOST}`, publicOrigin)
    .replaceAll(`//${ORIGIN_HOST}`, `//${new URL(publicOrigin).host}`);
}

function rewriteText(body, publicOrigin) {
  const publicHost = new URL(publicOrigin).host;

  return body
    .replaceAll(ORIGIN, publicOrigin)
    .replaceAll(`http://${ORIGIN_HOST}`, publicOrigin)
    .replaceAll(`//${ORIGIN_HOST}`, `//${publicHost}`);
}

module.exports = async function proxy(req, res) {
  const publicOrigin = getPublicOrigin(req);
  const targetUrl = getTargetUrl(req);

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers: getRequestHeaders(req),
    body: await getRequestBody(req),
    redirect: "manual"
  });

  res.statusCode = upstream.status;

  upstream.headers.forEach((value, name) => {
    const headerName = name.toLowerCase();

    if (HOP_BY_HOP_HEADERS.has(headerName)) {
      return;
    }

    if (headerName === "location") {
      res.setHeader(name, rewriteLocation(value, publicOrigin));
      return;
    }

    res.setHeader(name, value);
  });

  const contentType = upstream.headers.get("content-type") || "";
  const isTextResponse =
    contentType.includes("text/") ||
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("xml");

  if (isTextResponse) {
    const body = await upstream.text();
    res.setHeader("cache-control", "s-maxage=60, stale-while-revalidate=300");
    res.end(rewriteText(body, publicOrigin));
    return;
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  res.end(body);
};
