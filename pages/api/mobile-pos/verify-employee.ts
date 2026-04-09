import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { shopName, employeeId } = req.body;

  if (!shopName || !employeeId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // Parse employeeId as integer
  const empIdInt = parseInt(String(employeeId), 10);
  if (isNaN(empIdInt)) {
    return res.status(400).json({ success: false, message: "Employee ID must be a number" });
  }

  if (!hasuraClient) {
    return res.status(500).json({ error: "Hasura client not initialized" });
  }

  try {
    const VERIFY_EMPLOYEE_QUERY = gql`
      query VerifyEmployee($shopName: String!, $employeeID: Int!) {
        orgEmployees(where: {
          employeeID: {_eq: $employeeID},
          Shops: {name: {_eq: $shopName}}
        }) {
          id
          password
          twoFactorSecret: twoFactorSecrets
          shop_id
          fullnames
          Shops {
            name
          }
          Position
          multAuthEnabled
          last_login
          updated_on
        }
      }
    `;

    const variables = { shopName, employeeID: empIdInt };
    const data: any = await hasuraClient.request(VERIFY_EMPLOYEE_QUERY, variables);

    if (data.orgEmployees && data.orgEmployees.length > 0) {
      const user = data.orgEmployees[0];
      
      // Handle the case where twoFactorSecrets is a JSON mapping (e.g., {"4-shopId": {"secret": "BASE32", "uri": "..."}})
      let extractedSecret = user.twoFactorSecret;
      if (extractedSecret && typeof extractedSecret === "string" && extractedSecret.trim().startsWith("{")) {
        try {
          const secretsMap = JSON.parse(extractedSecret);

          // Find the right key: exact int, exact string, composite key starting with employeeID, or first key
          const matchingKey = 
            Object.keys(secretsMap).find(k => k === String(empIdInt) || k.startsWith(`${empIdInt}-`)) 
            || Object.keys(secretsMap)[0];

          if (matchingKey) {
            const rawValue = secretsMap[matchingKey];
            
            if (typeof rawValue === "string") {
              // Already a plain Base32 string
              extractedSecret = rawValue;
            } else if (rawValue && typeof rawValue === "object") {
              // Nested object like {secret: "BASE32", uri: "otpauth://..."}
              extractedSecret = rawValue.secret || rawValue.base32 || rawValue.key || Object.values(rawValue)[0] as string;
            }
          }

          console.log("Extracted TOTP secret type:", typeof extractedSecret);
        } catch (e) {
          console.warn("Failed to parse twoFactorSecrets JSON:", e);
        }
      }

      // Ensure it's always a string before returning
      if (typeof extractedSecret !== "string") {
        extractedSecret = String(extractedSecret || "");
      }

      // Update the user object with the clean, flat secret
      user.twoFactorSecret = extractedSecret;

      return res.status(200).json({ success: true, user });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials or shop name" });
    }
  } catch (error: any) {
    console.error("Employee verification failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error", details: error.message });
  }
}
