import { NextApiRequest, NextApiResponse } from "next";

// Use global WebSocket server instance
declare global {
  var io: any;
  var activeConnections: Map<string, any>;
  var locationClusters: Map<string, any>;
}

// Get active connections
export const getActiveConnections = () => global.activeConnections || new Map();
export const getLocationClusters = () => global.locationClusters || new Map();

// Send notification to specific shopper
export const sendToShopper = (userId: string, event: string, data: any) => {
  const activeConnections = getActiveConnections();
  const connection = activeConnections.get(userId);
  if (connection && global.io) {
    global.io.to(connection.socketId).emit(event, data);
    return true;
  }
  return false;
};

// Send notification to multiple shoppers
export const sendToShoppers = (userIds: string[], event: string, data: any) => {
  let sentCount = 0;
  userIds.forEach((userId) => {
    if (sendToShopper(userId, event, data)) {
      sentCount++;
    }
  });
  return sentCount;
};

// Send notification to location cluster
export const sendToCluster = (clusterId: string, event: string, data: any) => {
  const locationClusters = getLocationClusters();
  const cluster = locationClusters.get(clusterId);
  if (cluster) {
    return sendToShoppers(cluster.shoppers, event, data);
  }
  return 0;
};

// API route handler - just returns status since server is handled in server.js
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    success: true,
    message: "WebSocket server is running",
    connected: !!global.io,
    activeConnections: getActiveConnections().size,
    clusters: getLocationClusters().size,
  });
}
