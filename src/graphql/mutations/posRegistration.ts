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
    $shop_id: uuid = ""
    $balance: String = ""
    $restaurant_id1: uuid = ""
    $shop_id1: uuid = ""
    $billing_cycle: String = ""
    $business_id: uuid = ""
    $restaurant_id2: uuid = ""
    $shop_id2: uuid = ""
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
    $restaurant_id3: uuid = ""
    $roleType: String = ""
    $shop_id3: uuid = ""
    $twoFactorSecrets: String = ""
    $business_id1: uuid = ""
    $shop_id4: uuid = ""
    $restaurant_id4: uuid = ""
    $month1: String = ""
    $upload_count: Int = 10
    $year1: String = ""
  ) {
    insert_Restaurants(
      objects: {
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
        ai_usages: {
          data: {
            restaurant_id: $restaurant_id
            request_count: $request_count
            month: $month
            year: $year
            shop_id: $shop_id
            subscription_invoices: {
              data: {
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
            }
          }
        }
        merchant_wallets: {
          data: {
            active: false
            balance: $balance
            restaurant_id: $restaurant_id1
            shop_id: $shop_id1
          }
        }
        shop_subscription: {
          data: {
            billing_cycle: $billing_cycle
            restaurant_id: $restaurant_id2
            shop_id: $shop_id2
            start_date: $start_date
            status: $status
            updated_at: $updated_at
            end_date: $end_date
            plan_id: $plan_id
          }
          on_conflict: {
            constraint: shop_subscriptions_pkey
            update_columns: [status, updated_at, start_date, end_date]
          }
        }
        orgEmployees: {
          data: {
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
            restaurant_id: $restaurant_id3
            roleType: $roleType
            shop_id: $shop_id3
            twoFactorSecrets: $twoFactorSecrets
          }
        }
        rdb_cert: $rdb_cert
        reel_usages: {
          data: {
            shop_id: $shop_id4
            restaurant_id: $restaurant_id4
            month: $month1
            upload_count: $upload_count
            year: $year1
          }
        }
      }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_SHOP_ACCOUNT = gql`
  mutation CreateShopAccount(
    $address: String = ""
    $category_id: uuid = ""
    $description: String = ""
    $image: String = ""
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
    $upload_count: Int = 10
    $year: String = ""
    $billing_cycle: String = ""
    $business_id: uuid = ""
    $end_date: timestamptz = ""
    $plan_id: uuid = ""
    $shop_id1: uuid = ""
    $restaurant_id: uuid = ""
    $start_date: timestamptz = ""
    $status: String = ""
    $aiUsage_id: uuid = ""
    $currency: String = ""
    $discount_amount: String = ""
    $invoice_number: String = ""
    $due_date: timestamptz = ""
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
    $balance: String = ""
    $shop_id2: uuid = ""
    $restaurant_id1: uuid = ""
    $Address: String = ""
    $Position: String = ""
    $dob: String = ""
    $email: String = ""
    $employeeID: Int = 10
    $fullnames: String = ""
    $gender: String = ""
    $password: String = ""
    $phone1: String = ""
    $restaurant_id2: uuid = ""
    $roleType: String = ""
    $shop_id3: uuid = ""
    $twoFactorSecrets: String = ""
    $orgEmployeeID: uuid = ""
    $privillages: jsonb = ""
    $update_on: timestamptz = ""
  ) {
    insert_Shops(
      objects: {
        address: $address
        category_id: $category_id
        description: $description
        image: $image
        is_active: false
        latitude: $latitude
        logo: $logo
        longitude: $longitude
        name: $name
        operating_hours: $operating_hours
        phone: $phone
        ssd: $ssd
        tin: $tin
        reel_usages: {
          data: { shop_id: $shop_id, upload_count: $upload_count, year: $year }
        }
        shop_subscription: {
          data: {
            billing_cycle: $billing_cycle
            end_date: $end_date
            plan_id: $plan_id
            shop_id: $shop_id1
            restaurant_id: $restaurant_id
            start_date: $start_date
            status: $status
            subscription_invoices: {
              data: {
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
            }
          }
          on_conflict: {
            constraint: shop_subscriptions_pkey
            update_columns: [status, plan_id, end_date]
          }
        }
        merchant_wallet: {
          data: {
            active: false
            balance: $balance
            shop_id: $shop_id2
            restaurant_id: $restaurant_id1
          }
        }
        orgEmployees: {
          data: {
            Address: $Address
            Position: $Position
            active: true
            dob: $dob
            email: $email
            fullnames: $fullnames
            gender: $gender
            generatePassword: false
            multAuthEnabled: false
            online: false
            password: $password
            phone: $phone1
            restaurant_id: $restaurant_id2
            roleType: $roleType
            shop_id: $shop_id3
            twoFactorSecrets: $twoFactorSecrets
            orgEmployeeRoles: {
              data: {
                orgEmployeeID: $orgEmployeeID
                privillages: $privillages
                update_on: $update_on
              }
            }
          }
        }
      }
    ) {
      affected_rows
    }
  }
`;
