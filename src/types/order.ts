export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  orderId?: string; // Order ID this item belongs to (important for combined orders)
  product: {
    id: string;
    name: string;
    image: string;
    final_price: string;
    description?: string;
    measurement_unit?: string;
    category?: string;
    quantity?: number;
    barcode?: string;
    sku?: string;
    ProductName?: {
      id: string;
      name: string;
      description: string;
      barcode: string;
      sku: string;
      image: string;
      create_at: string;
    };
  };
  found?: boolean;
  foundQuantity?: number;
}

export interface OrderDetailsType {
  id: string;
  OrderID: string;
  placedAt: string;
  estimatedDelivery: string;
  deliveryNotes: string;
  total: number;
  serviceFee: string;
  deliveryFee: string;
  status: string;
  deliveryPhotoUrl: string;
  discount: number;
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture: string;
  };
  shop: {
    id: string;
    name: string;
    address: string;
    image: string;
  };
  Order_Items: OrderItem[];
  address: {
    id: string;
    street: string;
    city: string;
    postal_code: string;
    latitude: string;
    longitude: string;
  };
  assignedTo: {
    id: string;
    name: string;
    profile_picture: string;
    orders: {
      aggregate: {
        count: number;
      };
    };
  };
}
