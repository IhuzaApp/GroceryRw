import { gql } from "@apollo/client";

export const CREATE_RESTAURANT_ACCOUNT = gql`
 mutation createRestaurantaccount(
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
    $request_count: Int = 10
    $month: String = ""
    $year: String = ""
    $balance: String = ""
    $billing_cycle: String = ""
    $start_date: timestamptz = ""
    $status: String = ""
    $updated_at: timestamptz = ""
    $end_date: timestamptz = ""
    $plan_id: uuid = ""
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
    $status1: String = ""
    $subtotal_amount: String = ""
    $tax_amount: String = ""
    $Address: String = ""
    $Position: String = ""
    $dob: String = ""
    $email1: String = ""
    $employeeID: Int = 10
    $fullnames: String = ""
    $gender: String = ""
    $last_login: String = ""
    $password: String = ""
    $phone1: String = ""
    $roleType: String = ""
    $twoFactorSecrets: String = ""
    $business_id1: uuid = ""
    $month1: String = ""
    $upload_count: Int = 10
    $year1: String = ""
  ) {
    # 1. Insert Restaurant
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

    # 2. Insert Wallet
    insert_merchant_wallets(
      objects: {
        active: false
        balance: $balance
        restaurant_id: $restaurant_id
      }
    ) {
    affected_rows
  }

    # 3. Insert AI Usage
    insert_ai_usage(
      objects: {
        id: $aiUsage_id
        restaurant_id: $restaurant_id
        request_count: $request_count
        month: $month
        year: $year
        business_id: $restaurant_id
      }
    ) {
      affected_rows
    }

    # 4. Insert Reel Usage
    insert_reel_usage(
      objects: {
        id: $reelUsage_id
        restaurant_id: $restaurant_id
        month: $month1
        upload_count: $upload_count
        year: $year1
      }
    ) {
      affected_rows
    }

    # 5. Insert Subscription
    insert_shop_subscriptions(
      objects: {
        id: $shopSubscription_id
        billing_cycle: $billing_cycle
        restaurant_id: $restaurant_id
        business_id: $restaurant_id
        start_date: $start_date
        status: $status
        updated_at: $updated_at
        end_date: $end_date
        plan_id: $plan_id
      }
    ) {
      affected_rows
    }

    # 6. Insert Invoice
    insert_subscription_invoices(
      objects: {
        aiUsage_id: $aiUsage_id
        currency: $currency
        deleted: false
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
        status: $status1
        subtotal_amount: $subtotal_amount
        tax_amount: $tax_amount
      }
    ) {
      affected_rows
    }

    # 7. Insert Employee
    insert_orgEmployees(
      objects: {
        Address: $Address
        Position: $Position
        active: true
        dob: $dob
        email: $email1
        employeeID: $employeeID
        fullnames: $fullnames
        gender: $gender
        generatePassword: false
        last_login: $last_login
        multAuthEnabled: false
        online: false
        password: $password
        phone: $phone1
        restaurant_id: $restaurant_id
        roleType: $roleType
      }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_SHOP_ACCOUNT = gql`
  mutation CreateShopAccount($address: String = "", $category_id: uuid = "", $description: String = "", $image: String = "", $latitude: String = "", $logo: String = "", $longitude: String = "", $name: String = "", $operating_hours: json = "", $phone: String = "", $ssd: String = "", $tin: String = "", $shop_id: uuid = "", $upload_count: Int = 10, $year: String = "", $billing_cycle: String = "", $end_date: timestamptz = "", $plan_id: uuid = "", $start_date: timestamptz = "", $status: String = "", $aiUsage_id: uuid = "", $currency: String = "", $discount_amount: String = "", $invoice_number: String = "", $due_date: timestamptz = "", $issued_at: timestamptz = "", $paid_at: timestamptz = "", $payment_method: String = "", $plan_name: String = "", $plan_price: String = "", $reelUsage_id: uuid = "", $shopSubscription_id: uuid = "", $status1: String = "", $subtotal_amount: String = "", $tax_amount: String = "", $balance: String = "", $Address: String = "", $Position: String = "", $dob: String = "", $email: String = "", $employeeID: Int = 10, $fullnames: String = "", $gender: String = "", $password: String = "", $phone1: String = "", $roleType: String = "", $orgEmployeeID: uuid = "", $privillages: jsonb = "", $update_on: timestamptz = "", $restaurant_id: uuid = "", $month: String = "", $employeeID1: Int = 10, $twoFactorSecrets: String = "", $month1: String = "") {
  insert_Shops(objects: {address: $address, category_id: $category_id, description: $description, image: $image, is_active: false, latitude: $latitude, logo: $logo, longitude: $longitude, name: $name, operating_hours: $operating_hours, phone: $phone, ssd: $ssd, tin: $tin}) {
    affected_rows
  }
  insert_merchant_wallets(objects: {active: false, balance: $balance, shop_id: $shop_id, restaurant_id: $restaurant_id}) {
    affected_rows
  }
  insert_ai_usage(objects: {id: $aiUsage_id, shop_id: $shop_id, request_count: $upload_count, year: $year, business_id: $shop_id, month: $month}) {
    affected_rows
  }
  insert_reel_usage(objects: {id: $reelUsage_id, shop_id: $shop_id, upload_count: $upload_count, year: $year, month: $month1}) {
    affected_rows
  }
  insert_shop_subscriptions(objects: {id: $shopSubscription_id, billing_cycle: $billing_cycle, end_date: $end_date, plan_id: $plan_id, shop_id: $shop_id, business_id: $shop_id, start_date: $start_date, status: $status}) {
    affected_rows
  }
  insert_subscription_invoices(objects: {aiUsage_id: $aiUsage_id, currency: $currency, deleted: false, discount_amount: $discount_amount, due_date: $due_date, invoice_number: $invoice_number, is_overdue: false, issued_at: $issued_at, paid_at: $paid_at, payment_method: $payment_method, plan_name: $plan_name, plan_price: $plan_price, reelUsage_id: $reelUsage_id, shopSubscription_id: $shopSubscription_id, status: $status1, subtotal_amount: $subtotal_amount, tax_amount: $tax_amount}) {
    affected_rows
  }
  insert_orgEmployees(objects: {Address: $Address, Position: $Position, active: true, dob: $dob, email: $email, fullnames: $fullnames, gender: $gender, generatePassword: false, multAuthEnabled: false, online: false, password: $password, phone: $phone1, shop_id: $shop_id, roleType: $roleType, orgEmployeeRoles: {data: {orgEmployeeID: $orgEmployeeID, privillages: $privillages, update_on: $update_on}}, employeeID: $employeeID1, twoFactorSecrets: $twoFactorSecrets}) {
    affected_rows
  }
}

`;
