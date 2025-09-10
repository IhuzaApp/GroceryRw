export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  order_type: "regular" | "reel";
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  tax: number;
  discount?: number;
  created_at: string;
  status: "paid" | "pending" | "overdue";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items_count: number;
  shop_name?: string;
  shop_address?: string;
  reel_title?: string;
  reel_description?: string;
  reel_price?: string;
  delivery_time?: string;
  delivery_notes?: string;
  delivery_note?: string;
  found?: boolean;
  order_status: string;
  Proof?: string;
  delivery_photo_url?: string;
}

export interface InvoicesPageProps {
  initialInvoices?: Invoice[];
  initialError?: string | null;
}
