import { NextApiRequest, NextApiResponse } from "next";

// Use global WebSocket server instance
declare global {
  var io: any;
  var activeConnections: Map<string, any>;
  var locationClusters: Map<string, any>;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const status = {
      websocketServer: !!global.io,
      activeConnections: global.activeConnections?.size || 0,
      locationClusters: global.locationClusters?.size || 0,
      connections: global.activeConnections
        ? Array.from(global.activeConnections.entries()).map(
            ([userId, conn]) => ({
              userId,
              socketId: conn.socketId,
              hasLocation: !!conn.location,
              lastSeen: conn.lastSeen,
            })
          )
        : [],
      clusters: global.locationClusters
        ? Array.from(global.locationClusters.entries()).map(
            ([id, cluster]) => ({
              id,
              center: cluster.center,
              shopperCount: cluster.shoppers.length,
              lastUpdated: cluster.lastUpdated,
            })
          )
        : [],
    };

    res.status(200).json({
      success: true,
      message: "WebSocket server status",
      ...status,
    });
  } catch (error) {
    console.error("Error getting WebSocket status:", error);
    res.status(500).json({
      error: "Failed to get WebSocket status",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
