import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

interface SystemLog {
  id: string;
  type: string;
  message: string;
  component: string;
  details: string;
  time: string;
}

interface GetSystemLogsResponse {
  System_Logs: SystemLog[];
  System_Logs_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

// Query without type filter
const GET_ALL_SYSTEM_LOGS = gql`
  query getSystemLogs($limit: Int!, $offset: Int!) {
    System_Logs(
      order_by: { time: desc }
      limit: $limit
      offset: $offset
    ) {
      time
      type
      message
      id
      details
      component
    }
    System_Logs_aggregate {
      aggregate {
        count
      }
    }
  }
`;

// Query with type filter
const GET_FILTERED_SYSTEM_LOGS = gql`
  query getSystemLogs($limit: Int!, $offset: Int!, $type: String!) {
    System_Logs(
      order_by: { time: desc }
      limit: $limit
      offset: $offset
      where: { type: { _eq: $type } }
    ) {
      time
      type
      message
      id
      details
      component
    }
    System_Logs_aggregate(where: { type: { _eq: $type } }) {
      aggregate {
        count
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;
    const type = req.query.type as string | undefined;

    const queryVariables = {
      limit,
      offset,
      ...(type && { type }),
    };

    const data = await hasuraClient.request<GetSystemLogsResponse>(
      type ? GET_FILTERED_SYSTEM_LOGS : GET_ALL_SYSTEM_LOGS,
      queryVariables
    );

    // Transform the logs to match the expected format
    const logs = data.System_Logs.map((log) => ({
      type: log.type || "",
      message: log.message || "",
      component: log.component || "",
      details: log.details
        ? typeof log.details === "string"
          ? log.details
          : JSON.stringify(log.details)
        : undefined,
      timestamp: new Date(log.time).getTime(),
      id: log.id,
    }));

    res.status(200).json({
      logs,
      total: data.System_Logs_aggregate.aggregate.count,
      page,
      limit,
      totalPages: Math.ceil(data.System_Logs_aggregate.aggregate.count / limit),
    });
  } catch (error) {
    console.error("Error reading logs:", error);
    res.status(500).json({ error: "Failed to read logs" });
  }
} 
