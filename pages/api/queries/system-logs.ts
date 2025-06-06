import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

interface SystemLog {
  id: string;
  type: string;
  message: string;
  component: string;
  details?: any;
  timestamp: string;
}

interface InsertSystemLogResponse {
  insert_System_Logs_one: SystemLog;
}

interface GetSystemLogsResponse {
  System_Logs: SystemLog[];
  System_Logs_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

const INSERT_SYSTEM_LOG = gql`
  mutation InsertSystemLog(
    $type: String!
    $message: String!
    $component: String!
    $details: jsonb
    $timestamp: timestamptz!
  ) {
    insert_System_Logs_one(
      object: {
        type: $type
        message: $message
        component: $component
        details: $details
        timestamp: $timestamp
      }
    ) {
      id
      type
      message
      component
      details
      timestamp
    }
  }
`;

const GET_SYSTEM_LOGS = gql`
  query GetSystemLogs($limit: Int = 100, $offset: Int = 0, $type: String) {
    System_Logs(
      order_by: { timestamp: desc }
      limit: $limit
      offset: $offset
      where: { type: { _eq: $type } }
    ) {
      id
      type
      message
      component
      details
      timestamp
    }
    System_Logs_aggregate(where: { type: { _eq: $type } }) {
      aggregate {
        count
      }
    }
  }
`;

export async function insertSystemLog(
  type: string,
  message: string,
  component: string,
  details?: any
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const timestamp = new Date().toISOString();
    
    const response = await hasuraClient.request<InsertSystemLogResponse>(INSERT_SYSTEM_LOG, {
      type,
      message,
      component,
      details,
      timestamp
    });

    return response.insert_System_Logs_one;
  } catch (error) {
    // Only log to console here to avoid recursive logging
    console.error("Failed to insert system log:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { type, message, component, details } = req.body;

      if (!type || !message || !component) {
        return res.status(400).json({
          error: "Missing required fields: type, message, component"
        });
      }

      const result = await insertSystemLog(type, message, component, details);
      return res.status(200).json(result);

    } catch (error) {
      return res.status(500).json({
        error: "Failed to insert log",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  if (req.method === "GET") {
    try {
      if (!hasuraClient) {
        throw new Error("Hasura client is not initialized");
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const type = req.query.type as string;

      const data = await hasuraClient.request<GetSystemLogsResponse>(GET_SYSTEM_LOGS, {
        limit,
        offset,
        type: type || null
      });

      return res.status(200).json({
        logs: data.System_Logs,
        total: data.System_Logs_aggregate.aggregate.count
      });

    } catch (error) {
      return res.status(500).json({
        error: "Failed to fetch logs",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
} 