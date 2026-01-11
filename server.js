const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const cron = require("node-cron");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create HTTP server
const httpServer = createServer();

// Handle Next.js requests
httpServer.on("request", async (req, res) => {
  try {
    const parsedUrl = parse(req.url, true);
    await handle(req, res, parsedUrl);
  } catch (err) {
    console.error("Error occurred handling", req.url, err);
    res.statusCode = 500;
    res.end("internal server error");
  }
});

// Setup cleanup cron job for development
if (dev) {
  // Run cleanup every hour in development (for testing)
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🧹 Running automatic cleanup in development...");
      // Set the correct API URL for development
      process.env.API_BASE_URL = `http://localhost:${port}`;
      const { cleanupSystemLogs } = require("./scripts/cleanup-logs.js");
      await cleanupSystemLogs();
    } catch (error) {
      console.error("❌ Development cleanup failed:", error.message);
    }
  });

  console.log("📅 Development cleanup scheduled to run every hour");
}

// Start server
app.prepare().then(() => {
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`Ready on http://${hostname}:${port}`);
    console.log(`Notifications powered by Firebase Cloud Messaging`);
  });
});
