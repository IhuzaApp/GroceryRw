import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import crypto from "crypto";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";

// Import Privileges logic directly to avoid client-side dependencies bleeding into API route
import {
  DEFAULT_PRIVILEGES,
  UserPrivileges,
} from "../../../src/types/privileges";
import { MODULE_DESCRIPTIONS } from "../../../src/types/moduleDescriptions";
import { Plan } from "../../../src/hooks/usePlans";

const generatePrivileges = (plan: Plan): UserPrivileges => {
  const privileges: UserPrivileges = JSON.parse(
    JSON.stringify(DEFAULT_PRIVILEGES)
  );
  if (privileges.pages) {
    privileges.pages.access = true;
    privileges.pages.view_pages = false;
  }
  plan.modules.forEach((module) => {
    const slug = module.slug;
    const description = (MODULE_DESCRIPTIONS as any)[slug];
    if (description) {
      const modulePrivs: Record<string, boolean> = { access: true };
      description.actions.forEach((action: any) => {
        modulePrivs[action.key] = true;
      });
      (privileges as any)[slug] = modulePrivs;
      if (privileges.pages) {
        const pageAccessKey = `access_${slug}`;
        (privileges.pages as any)[pageAccessKey] = true;
      }
    }
  });
  return privileges;
};

// --- GraphQL Mutations ---
const CREATE_RESTAURANT = gql`
  mutation CreateRestaurant(
    $email: String = ""
    $lat: String = ""
    $location: String = ""
    $logo: String = ""
    $long: String = ""
    $name: String = ""
    $phone: String = ""
    $profile: String = ""
    $tin: String = ""
    $ussd: String = ""
    $rdb_cert: String = ""
    $restaurant_id: uuid = ""
  ) {
    insert_Restaurants(
      objects: {
        id: $restaurant_id
        email: $email
        is_active: false
        lat: $lat
        location: $location
        logo: $logo
        long: $long
        name: $name
        phone: $phone
        profile: $profile
        tin: $tin
        ussd: $ussd
        verified: false
        rdb_cert: $rdb_cert
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_SHOP = gql`
  mutation CreateShop(
    $address: String = ""
    $category_id: uuid = ""
    $description: String = ""
    $image: String = ""
    $is_active: Boolean = false
    $latitude: String = ""
    $logo: String = ""
    $longitude: String = ""
    $name: String = ""
    $operating_hours: json = ""
    $phone: String = ""
    $ssd: String = ""
    $tin: String = ""
    $shop_id: uuid = ""
    $rdb_certificate: String = ""
  ) {
    insert_Shops(
      objects: {
        id: $shop_id
        address: $address
        category_id: $category_id
        description: $description
        image: $image
        is_active: $is_active
        latitude: $latitude
        logo: $logo
        longitude: $longitude
        name: $name
        operating_hours: $operating_hours
        phone: $phone
        ssd: $ssd
        tin: $tin
        rdb_certificate: $rdb_certificate
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee(
    $Address: String = ""
    $Position: String = ""
    $active: Boolean = false
    $dob: String = ""
    $email: String = ""
    $employeeID: Int = 0
    $fullnames: String = ""
    $gender: String = ""
    $last_login: String = ""
    $password: String = ""
    $phone: String = ""
    $restaurant_id: uuid = null
    $shop_id: uuid = null
    $roleType: String = ""
    $orgEmployeeID: uuid!
    $privillages: jsonb = ""
  ) {
    insert_orgEmployees(
      objects: {
        Address: $Address
        Position: $Position
        active: $active
        dob: $dob
        email: $email
        employeeID: $employeeID
        fullnames: $fullnames
        gender: $gender
        last_login: $last_login
        password: $password
        phone: $phone
        restaurant_id: $restaurant_id
        shop_id: $shop_id
        roleType: $roleType
        id: $orgEmployeeID
        orgEmployeeRoles: { data: { privillages: $privillages } }
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_AI_USAGE = gql`
  mutation CreateAiUsage(
    $id: uuid!
    $restaurant_id: uuid
    $shop_id: uuid
    $request_count: Int
    $month: String
    $year: String
    $business_id: uuid
    $user_id: uuid = null
  ) {
    insert_ai_usage(
      objects: {
        id: $id
        restaurant_id: $restaurant_id
        shop_id: $shop_id
        request_count: $request_count
        month: $month
        year: $year
        business_id: $business_id
        user_id: $user_id
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_REEL_USAGE = gql`
  mutation CreateReelUsage(
    $id: uuid!
    $restaurant_id: uuid
    $shop_id: uuid
    $month: String
    $upload_count: Int
    $year: String
    $business_id: uuid
  ) {
    insert_reel_usage(
      objects: {
        id: $id
        restaurant_id: $restaurant_id
        shop_id: $shop_id
        month: $month
        upload_count: $upload_count
        year: $year
        business_id: $business_id
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_SUBSCRIPTION = gql`
  mutation CreateSubscription(
    $id: uuid!
    $billing_cycle: String
    $restaurant_id: uuid
    $shop_id: uuid
    $business_id: uuid
    $start_date: timestamptz
    $status: String
    $updated_at: timestamptz
    $end_date: timestamptz
    $plan_id: uuid
  ) {
    insert_shop_subscriptions(
      objects: {
        id: $id
        billing_cycle: $billing_cycle
        restaurant_id: $restaurant_id
        shop_id: $shop_id
        business_id: $business_id
        start_date: $start_date
        status: $status
        updated_at: $updated_at
        end_date: $end_date
        plan_id: $plan_id
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_INVOICE = gql`
  mutation CreateInvoice(
    $aiUsage_id: uuid = ""
    $currency: String = ""
    $discount_amount: String = ""
    $due_date: timestamptz = ""
    $invoice_number: String = ""
    $issued_at: timestamptz = ""
    $payment_method: String = ""
    $plan_name: String = ""
    $plan_price: String = ""
    $reelUsage_id: uuid = ""
    $shopSubscription_id: uuid = ""
    $status: String = ""
    $subtotal_amount: String = ""
    $tax_amount: String = ""
    $updated_at: timestamptz = ""
  ) {
    insert_subscription_invoices(
      objects: {
        aiUsage_id: $aiUsage_id
        currency: $currency
        discount_amount: $discount_amount
        due_date: $due_date
        invoice_number: $invoice_number
        is_overdue: false
        issued_at: $issued_at
        payment_method: $payment_method
        plan_name: $plan_name
        plan_price: $plan_price
        reelUsage_id: $reelUsage_id
        shopSubscription_id: $shopSubscription_id
        status: $status
        subtotal_amount: $subtotal_amount
        tax_amount: $tax_amount
        updated_at: $updated_at
      }
    ) {
      affected_rows
    }
  }
`;

const CREATE_WALLET = gql`
  mutation CreateWallet($restaurant_id: uuid = null, $shop_id: uuid = null) {
    insert_merchant_wallets(
      objects: {
        active: false
        balance: "0"
        restaurant_id: $restaurant_id
        shop_id: $shop_id
      }
    ) {
      affected_rows
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      targetStep,
      formData,
      selectedPlan,
      businessType,
      cycle,
      businessId,
      commonIds,
      isShell,
    } = req.body;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const now = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const endDate = new Date();
    if (cycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const invNum = `INV-${Date.now()}`;

    // 1. Create Business — if already exists, fetch real ID from DB
    let actualBusinessId = businessId;
    if (targetStep === 1) {
      try {
        if (businessType === "RESTAURANT") {
          await hasuraClient.request(CREATE_RESTAURANT, {
            email: formData.email,
            lat: formData.lat,
            location: formData.address,
            logo: formData.logo,
            long: formData.long,
            name: formData.name,
            phone: formData.phone,
            profile: formData.profile,
            tin: formData.tin,
            ussd: formData.ussd,
            rdb_cert: formData.rdb_cert_url,
            restaurant_id: businessId,
          });
        } else {
          await hasuraClient.request(CREATE_SHOP, {
            address: formData.address,
            category_id: formData.categoryId,
            description: formData.description,
            image: formData.profile,
            latitude: formData.lat,
            logo: formData.logo,
            longitude: formData.long,
            name: formData.name,
            operating_hours: formData.operating_hours,
            phone: formData.phone,
            ssd: formData.ussd,
            tin: formData.tin,
            shop_id: businessId,
            is_active: false,
            rdb_certificate: formData.rdb_cert_url,
          });
        }
      } catch (createErr: any) {
        const errMsg =
          createErr.response?.errors?.[0]?.message || createErr.message || "";
        if (
          errMsg.includes("Uniqueness violation") ||
          errMsg.includes("duplicate key")
        ) {
          // Business already exists — look up its real ID
          if (businessType === "RESTAURANT") {
            const res: any = await hasuraClient.request(
              gql`
                query GetRestaurantByName($name: String!) {
                  Restaurants(where: { name: { _eq: $name } }, limit: 1) {
                    id
                  }
                }
              `,
              { name: formData.name }
            );
            actualBusinessId = res?.Restaurants?.[0]?.id || businessId;
          } else {
            const res: any = await hasuraClient.request(
              gql`
                query GetShopByName($name: String!) {
                  Shops(where: { name: { _eq: $name } }, limit: 1) {
                    id
                  }
                }
              `,
              { name: formData.name }
            );
            actualBusinessId = res?.Shops?.[0]?.id || businessId;
          }
        } else {
          throw createErr; // Real error — propagate
        }
      }
    }

    // 2. Create Employee — swallow uniqueness errors (employee already created on previous attempt)
    if (targetStep === 2) {
      try {
        await hasuraClient.request(CREATE_EMPLOYEE, {
          Address: formData.address,
          Position: formData.position || "System Administrator",
          active: true,
          dob: formData.dob,
          email: formData.ownerEmail,
          employeeID: commonIds.employee_id,
          fullnames: formData.fullnames,
          gender: formData.gender,
          last_login: now,
          password: formData.password,
          phone: formData.ownerPhone,
          restaurant_id:
            businessType === "RESTAURANT" ? actualBusinessId : null,
          shop_id: businessType === "SHOP" ? actualBusinessId : null,
          roleType: "globalAdmin",
          orgEmployeeID: commonIds.orgEmployeeID,
          privillages: generatePrivileges(selectedPlan),
        });
      } catch (empErr: any) {
        const empMsg =
          empErr.response?.errors?.[0]?.message || empErr.message || "";
        if (
          empMsg.includes("Uniqueness violation") ||
          empMsg.includes("duplicate key")
        ) {
          // Employee already created, skip silently
        } else {
          throw empErr;
        }
      }
    }

    // 3. AI Usage
    if (targetStep === 3) {
      await hasuraClient.request(CREATE_AI_USAGE, {
        id: commonIds.aiUsage_id,
        restaurant_id: businessType === "RESTAURANT" ? actualBusinessId : null,
        shop_id: businessType === "SHOP" ? actualBusinessId : null,
        request_count: selectedPlan.ai_request_limit,
        month: new Date().toLocaleString("default", { month: "long" }),
        year: new Date().getFullYear().toString(),
        business_id: null,
        user_id: null,
      });
    }

    // 4. Reel Usage
    if (targetStep === 4) {
      await hasuraClient.request(CREATE_REEL_USAGE, {
        id: commonIds.reelUsage_id,
        restaurant_id: businessType === "RESTAURANT" ? actualBusinessId : null,
        shop_id: businessType === "SHOP" ? actualBusinessId : null,
        month: new Date().toLocaleString("default", { month: "long" }),
        upload_count: selectedPlan.reel_limit,
        year: new Date().getFullYear().toString(),
        business_id: null,
      });
    }

    // 5. Subscription
    if (targetStep === 5) {
      await hasuraClient.request(CREATE_SUBSCRIPTION, {
        id: commonIds.shopSubscription_id,
        billing_cycle: cycle,
        restaurant_id: businessType === "RESTAURANT" ? actualBusinessId : null,
        shop_id: businessType === "SHOP" ? actualBusinessId : null,
        business_id: null,
        start_date: now,
        status: isShell ? "pending_payment" : "active",
        updated_at: now,
        end_date: endDate.toISOString(),
        plan_id: selectedPlan.id,
      });
    }

    // 6. Invoice
    if (targetStep === 6) {
      await hasuraClient.request(CREATE_INVOICE, {
        aiUsage_id: commonIds.aiUsage_id,
        currency: "RWF",
        discount_amount: "0",
        due_date: dueDate.toISOString(),
        invoice_number: invNum,
        issued_at: now,
        payment_method: isShell ? "UNPAID" : "MoMo",
        plan_name: selectedPlan.name,
        plan_price: (cycle === "monthly"
          ? selectedPlan.price_monthly
          : selectedPlan.price_yearly
        ).toString(),
        reelUsage_id: commonIds.reelUsage_id,
        shopSubscription_id: commonIds.shopSubscription_id,
        status: "pending",
        subtotal_amount: (cycle === "monthly"
          ? selectedPlan.price_monthly
          : selectedPlan.price_yearly
        ).toString(),
        tax_amount: "0",
        updated_at: now,
      });
    }

    // 7. Wallet
    if (targetStep === 7) {
      try {
        await hasuraClient.request(CREATE_WALLET, {
          restaurant_id:
            businessType === "RESTAURANT" ? actualBusinessId : null,
          shop_id: businessType === "SHOP" ? actualBusinessId : null,
        });
      } catch (walletErr: any) {
        if (!walletErr.message?.includes("Uniqueness violation")) {
          console.warn("Wallet creation failed", walletErr);
        }
      }
    }

    return res
      .status(200)
      .json({ success: true, invNum, businessId: actualBusinessId });
  } catch (error: any) {
    console.error("API Route Error:", error);
    await logErrorToSlack("POSIX_REGISTRATION_API", error);
    return res.status(500).json({
      error: "Registration failed",
      message:
        error.response?.errors?.[0]?.message ||
        error.message ||
        "Unknown error",
    });
  }
}
