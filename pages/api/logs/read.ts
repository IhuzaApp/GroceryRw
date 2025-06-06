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
}

const GET_SYSTEM_LOGS = gql`
  query getSystemLogs {
    System_Logs(order_by: { time: desc }) {
      time
      type
      message
      id
      details
      component
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

    const data = await hasuraClient.request<GetSystemLogsResponse>(
      GET_SYSTEM_LOGS
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
      total: logs.length,
    });
  } catch (error) {
    console.error("Error reading logs:", error);
    res.status(500).json({ error: "Failed to read logs" });
  }
}
