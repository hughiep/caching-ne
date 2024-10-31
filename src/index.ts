import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { T } from "./templates/home.js";

export const app = new Hono();

// Middleware to log incoming requests
app.use("*", async (c, next) => {
  console.log(
    `Request: ${c.req.method} ${c.req.url} at ${new Date().toISOString()}`
  );
  await next();
});

app.get("/", (c) => {
  return c.html(T());
});

app.get("/cache", (c) => {
  c.header("Content-Type", "text/plain");
  c.header("Cache-Control", "private, maxage=3600, stale-while-revalidate");
  return c.text("Hello Cache!");
});

app.get("/close", (c) => {
  c.header("Connection", "keep-alive");
  return c.html(`<img src="/static/image.png" />`);
});

/**
 * Serve static files from the public directory
 */

app.use(
  "/static/*",
  serveStatic({
    root: "./",
    rewriteRequestPath: (path) => {
      console.log(path, path.replace(/^\/static/, "../public"));
      return path.replace(/^\/static/, "./public");
    },
  })
);

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
