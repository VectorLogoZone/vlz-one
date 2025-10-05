

// VLZ handles look like this:
const handleRegex = new RegExp("^[a-z0-9][-_a-z0-9]*[a-z0-9]$");

function StatusHandler(request: Request, env: Env): Response {
  const status = {
    success: true,
    message: "OK",
    commit: env.COMMIT || "unknown",
    tech: "Cloudflare Workers",
    lastmod: env.LASTMOD || "unknown",
    timestamp: new Date().toISOString(),
    cloudflare:  env.CF_VERSION_METADATA,
  };
  return new Response(JSON.stringify(status, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}

function NotFoundHandler(url: URL): Response {
  const retVal = {
    "success": false, 
    "message": "Not found", 
    "url": url.pathname,
  };
  return new Response(JSON.stringify(retVal), { 
    headers: { "Content-Type": "application/json" },
    status: 404 
  });
}

const handler: FetchHandler = {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response {

    console.log("Request received:", request);
    const url = new URL(request.url);

    if (url.pathname === "/status.json") {
      return StatusHandler(request, env);
    }

    const handle = url.pathname.slice(1); // Remove leading "/"
    if (handle.match(handleRegex)) {
      const destination = `https://www.vectorlogo.zone/logos/${handle}/`;
      if (url.searchParams.get("debug")) {
        const retVal = {
          "success": true, 
          "message": "Valid handle", 
          "handle": handle,
          "destination": destination,
        };
        return new Response(JSON.stringify(retVal), { 
          headers: { "Content-Type": "application/json" } 
        });
      } else {
        return new Response(`Redirecting to ${destination}...`, {
          status: 302,
          headers: {
            "Content-Type": "text/plain",
            "Location": destination,
          },
        });
      }
    }

    return NotFoundHandler(url);
  },
};

export default handler;