export interface Order {
  OrderID: string;
  combined_order_id: string | null;
  created_at: string;
  delivery_address_id: string;
  delivery_fee: string;
  delivery_notes: string | null;
  delivery_photo_url: string | null;
  delivery_time: string;
  discount: string | null;
  found: boolean;
  total: string;
  updated_at: string;
  status: string;
  shopper_id: string | null;
  shop_id: string;
  service_fee: string;
  id: string;
  user_id: string;
  voucher_code: string | null;
}

export interface Shop {
  logo: string | null;
  longitude: number | null;
  name: string;
  operating_hours: any | null;
  updated_at: string | null;
  category_id: string | null;
  created_at: string;
  description: string | null;
  id: string;
  image: string | null;
  is_active: boolean;
  latitude: number | null;
  address: string | null;
}

export interface Shopper {
  Employment_id: number;
  address: string;
  active: boolean;
  created_at: string;
  background_check_completed: boolean;
  full_name: string;
  driving_license: string | null;
  id: string;
  phone_number: string;
  user_id: string;
  updated_at: string | null;
  status: string;
  profile_photo: string | null;
  onboarding_step: string;
  national_id: string;
}

export interface Revenue {
  id: string;
  amount: string;
  type: "commission" | "plasa_fee";
  created_at: string;
  order_id: string | null;
  shop_id: string;
  shopper_id: string | null;
  products: string | null; // JSONB string for product details
  commission_percentage: string | null;
  Order?: Order;
  Shop?: Shop;
  shopper?: Shopper;
}

export interface RevenueResponse {
  Revenue: Revenue[];
}

export interface RevenueWithMetrics extends Revenue {
  calculated_commission_percentage: string;
}

// Product profit details for revenue tracking
export interface ProductProfit {
  product: string;
  quantity: number;
  price: number;
  final_price: number;
  profit: number;
}

// Revenue calculation result
export interface RevenueCalculationResult {
  commission_revenue: string;
  plasa_fee: string;
  product_profits: ProductProfit[];
}
