import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { storage } from "../../../src/lib/firebaseAdmin";

const GET_ALL_USED_URLS = gql`
  query GetAllUsedUrls {
    Restaurants { logo profile rdb_cert }
    Shops { logo image rdb_certificate }
    logisticsAccount { license business_cert nationalIdOrPassport proof_address }
    vehicleBookings { driving_license carVideo_Status }
    Issuecomplains { vehicleVideo }
    pets { image vaccination_cert video parent_images }
    pet_vendors { nationalIdOrPassport proof_residency rdb_certificate sherter_permit }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CLEANUP_API_TOKEN;
  const isDevelopment = req.headers.host?.includes("localhost") || req.headers.host?.includes("127.0.0.1");

  if (expectedToken && !isDevelopment && authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!storage) {
    return res.status(500).json({ error: "Firebase Storage not initialized" });
  }

  try {
    // 1. Fetch all URLs from Database
    const dbData = await hasuraClient?.request<any>(GET_ALL_USED_URLS);
    const usedUrls = new Set<string>();

    const addUrl = (url: any) => {
      if (typeof url === "string" && url.startsWith("http")) {
        // Normalize: extract the path part from Firebase Storage URL
        try {
          if (url.includes("firebasestorage.googleapis.com")) {
            const path = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
            usedUrls.add(path);
          }
        } catch (e) {}
      }
    };

    // Process all tables
    Object.values(dbData).forEach((rows: any) => {
      if (!Array.isArray(rows)) return;
      rows.forEach(row => {
        Object.entries(row).forEach(([key, value]) => {
          if (key === "parent_images" && Array.isArray(value)) {
            value.forEach((img: any) => addUrl(img.url));
          } else {
            addUrl(value);
          }
        });
      });
    });

    // 2. Scan Storage and Delete Orphans
    const bucket = storage.bucket();
    const prefixes = ["business/", "verifications/", "pets/", "bookings/", "licenses/"];
    let deletedCount = 0;
    let totalScanned = 0;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    for (const prefix of prefixes) {
      const [files] = await bucket.getFiles({ prefix });
      for (const file of files) {
        totalScanned++;
        
        // Skip if recently created (within 24 hours) to avoid race conditions
        const [metadata] = await file.getMetadata();
        const created = new Date(metadata.timeCreated || 0);
        if (created > oneDayAgo) continue;

        if (!usedUrls.has(file.name)) {
          // Check if it's a folder (ends with /)
          if (file.name.endsWith("/")) continue;

          await file.delete();
          deletedCount++;
        }
      }
    }

    return res.status(200).json({
      success: true,
      totalScanned,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Storage Orphan Cleanup Error:", error);
    return res.status(500).json({ error: error.message || "Cleanup failed" });
  }
}
