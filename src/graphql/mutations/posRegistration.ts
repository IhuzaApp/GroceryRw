import { gql } from "@apollo/client";

export const CREATE_RESTAURANT = gql`
 mutation CreateRestaurant($email: String = "", $lat: String = "", $location: String = "", $logo: String = "", $long: String = "", $name: String = "", $phone: String = "", $profile: String = "", $tin: String = "", $ussd: String = "", $rdb_cert: String = "", $restaurant_id: uuid = "", $relatedTo: String = null) {
  insert_Restaurants(objects: {id: $restaurant_id, email: $email, is_active: false, lat: $lat, location: $location, logo: $logo, long: $long, name: $name, phone: $phone, profile: $profile, tin: $tin, ussd: $ussd, verified: false, rdb_cert: $rdb_cert, relatedTo: $relatedTo}) {
    affected_rows
  }
}

`;

export const CREATE_SHOP = gql`
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
    $relatedTo: String = ""
    $ssd: String = ""
    $tin: String = ""
    $shop_id: uuid = ""
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
        relatedTo: $relatedTo
        ssd: $ssd
        tin: $tin
      }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_WALLET = gql`
  mutation CreateWallet(
    $active: Boolean = false
    $balance: String = "0"
    $restaurant_id: uuid = null
    $shop_id: uuid = null
  ) {
    insert_merchant_wallets(
      objects: {
        active: $active
        balance: $balance
        restaurant_id: $restaurant_id
        shop_id: $shop_id
      }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_AI_USAGE = gql`
  mutation CreateAiUsage(
    $id: uuid!
    $restaurant_id: uuid
    $shop_id: uuid
    $request_count: Int
    $month: String
    $year: String
    $business_id: uuid
    $user_id: uuid
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

export const CREATE_REEL_USAGE = gql`
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

export const CREATE_SUBSCRIPTION = gql`
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

export const CREATE_INVOICE = gql`
  mutation CreateInvoice(
    $aiUsage_id: uuid = ""
    $currency: String = ""
    $discount_amount: String = ""
    $due_date: timestamptz = ""
    $invoice_number: String = ""
    $issued_at: timestamptz = ""
    $paid_at: timestamptz = ""
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
        paid_at: $paid_at
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

export const CREATE_EMPLOYEE = gql`
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
    $update_on: timestamptz = ""
    $generatePassword: Boolean = false
    $multAuthEnabled: Boolean = false
    $online: Boolean = false
    $twoFactorSecrets: String = ""
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
        generatePassword: $generatePassword
        multAuthEnabled: $multAuthEnabled
        online: $online
        twoFactorSecrets: $twoFactorSecrets
        orgEmployeeRoles: { data: { role: $roleType, privillages: $privillages } }
      }
    ) {
      affected_rows
    }
  }
`;
