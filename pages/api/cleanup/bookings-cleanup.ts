import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { storage } from "../../../src/lib/firebaseAdmin";

const GET_DELETABLE_BOOKINGS = gql`
  query GetDeletableBookings($dateThreshold: timestamptz!) {
    vehicleBookings(
      where: {
        return_date: { _lt: $dateThreshold }
        status: { _in: ["COMPLETED", "CANCELLED"] }
        _or: [
          { Issuecomplains: { status: { _in: ["closed", "resolved"] } } }
          { _not: { Issuecomplains: {} } }
        ]
      }
    ) {
      id
      driving_license
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Auth logic same as system-logs-cleanup
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CLEANUP_API_TOKEN;
  const isDevelopment =
    req.headers.host?.includes("localhost") ||
    req.headers.host?.includes("127.0.0.1");

  if (
    expectedToken &&
    !isDevelopment &&
    authHeader !== `Bearer ${expectedToken}`
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!storage) {
    return res.status(500).json({ error: "Firebase Storage not initialized" });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await hasuraClient?.request<any>(GET_DELETABLE_BOOKINGS, {
      dateThreshold: thirtyDaysAgo.toISOString(),
    });

    const bookings = data?.vehicleBookings || [];
    let deletedFilesCount = 0;
    let processedBookings = 0;

    const bucket = storage.bucket();

    for (const booking of bookings) {
      // 1. Delete the entire bookings folder for this ID
      const folderPath = `bookings/${booking.id}/`;
      try {
        const [files] = await bucket.getFiles({ prefix: folderPath });
        if (files.length > 0) {
          await Promise.all(files.map((file) => file.delete()));
          deletedFilesCount += files.length;
        }
      } catch (err) {
        console.warn(`Failed to delete folder ${folderPath}:`, err);
      }

      // 2. Delete license if it was uploaded specifically for this booking
      // Note: We only delete if the URL matches the "licenses/" prefix used in CarDetailsPage
      if (
        booking.driving_license &&
        booking.driving_license.includes("licenses/")
      ) {
        try {
          // Extract path from URL (simple version)
          const url = new URL(booking.driving_license);
          const path = decodeURIComponent(
            url.pathname.split("/o/")[1].split("?")[0]
          );
          await bucket.file(path).delete();
          deletedFilesCount++;
        } catch (err) {
          // It might be a persistent license or already deleted
        }
      }
      processedBookings++;
    }

    return res.status(200).json({
      success: true,
      processedBookings,
      deletedFilesCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Booking Cleanup Error:", error);
    return res.status(500).json({ error: error.message || "Cleanup failed" });
  }
}
