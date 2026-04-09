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
      return res.status(200).json({ success: true, user: data.orgEmployees[0] });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials or shop name" });
    }
  } catch (error: any) {
    console.error("Employee verification failed:", error);
    return res.status(500).json({ success: false, message: "Internal server error", details: error.message });
  }
}
