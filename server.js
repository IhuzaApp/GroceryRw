const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const cron = require("node-cron");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: dev ? ["http://localhost:3000", "http://127.0.0.1:3000"] : false,
    methods: ["GET", "POST"],
    credentials: true,
  },
  path: "/api/websocket",
  transports: ["polling", "websocket"],
  allowEIO3: true,
});

// Store active connections
const activeConnections = new Map();
const locationClusters = new Map();

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Update location clusters
const updateLocationClusters = (userId, location) => {
  const clusterRadius = 2; // 2km radius
  let assignedToCluster = false;

  for (const [clusterId, cluster] of Array.from(locationClusters.entries())) {
    const distance = calculateDistance(
      cluster.center.lat,
      cluster.center.lng,
      location.lat,
      location.lng
    );

    if (distance <= clusterRadius) {
      if (!cluster.shoppers.includes(userId)) {
        cluster.shoppers.push(userId);
        cluster.lastUpdated = new Date();
      }
      assignedToCluster = true;
      break;
    }
  }

  if (!assignedToCluster) {
    const newClusterId = `cluster_${Date.now()}`;
    locationClusters.set(newClusterId, {
      center: location,
      shoppers: [userId],
      lastUpdated: new Date(),
    });
  }
};

// WebSocket event handlers
const handleConnection = (socket) => {
  // Handle shopper registration
  socket.on("shopper-register", (data) => {
    activeConnections.set(data.userId, {
      socketId: socket.id,
      userId: data.userId,
      location: data.location,
      lastSeen: new Date(),
    });

    // Update location clusters
    if (data.location) {
      updateLocationClusters(data.userId, data.location);
    }

    socket.emit("registered", { success: true, userId: data.userId });
  });

  // Handle location updates
  socket.on("location-update", (data) => {
    const connection = activeConnections.get(data.userId);
    if (connection) {
      connection.location = data.location;
      connection.lastSeen = new Date();
      updateLocationClusters(data.userId, data.location);
    }
  });

  // Handle order acceptance
  socket.on("accept-order", (data) => {
    socket.emit("order-accepted", { orderId: data.orderId, success: true });
  });

  // Handle order rejection
  socket.on("reject-order", (data) => {
    socket.emit("order-rejected", { orderId: data.orderId, success: true });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Find and remove the connection
    for (const [userId, connection] of Array.from(
      activeConnections.entries()
    )) {
      if (connection.socketId === socket.id) {
        activeConnections.delete(userId);
        break;
      }
    }
  });

  // Handle ping/pong for connection health
  socket.on("ping", () => {
    socket.emit("pong");
  });
};

// Set up Socket.IO
io.on("connection", handleConnection);

// Make io available globally for API routes
global.io = io;
global.activeConnections = activeConnections;
global.locationClusters = locationClusters;

// Handle Next.js requests
httpServer.on("request", async (req, res) => {
  try {
    // Skip Socket.IO requests
    if (req.url.startsWith("/api/websocket")) {
      return;
    }

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
    console.log(`WebSocket server running on /api/websocket`);
  });
});
