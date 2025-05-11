export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    price: number;
    description?: string;
    measurement_unit?: string;
    category?: string;
    quantity?: number;
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
