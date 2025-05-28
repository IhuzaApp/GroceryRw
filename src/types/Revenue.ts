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

export interface Revenue {
  id: string;
  amount: string;
  type: string;
  created_at: string;
  order_id: string;
  Order: Order;
}

export interface RevenueWithMetrics extends Revenue {
  commission_percentage: string;
}

export interface RevenueResponse {
  Revenue: Revenue[];
} 