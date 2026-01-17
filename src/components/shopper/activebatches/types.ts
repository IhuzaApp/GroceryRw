// Shared types for batch details components

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    final_price: string;
    measurement_unit?: string;
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
    phone?: string;
    profile_picture: string;
  };
  orderedBy?: {
    created_at: string;
    email: string;
    gender: string;
    id: string;
    is_active: boolean;
    name: string;
    password_hash: string;
    phone: string;
    profile_picture: string;
    updated_at: string;
    role: string;
  };
  customerId?: string;
  shop?: {
    id: string;
    name: string;
    address: string;
    image: string;
    phone?: string;
    operating_hours?: any;
    latitude?: string;
    longitude?: string;
  };
  Order_Items?: OrderItem[];
  address: {
    id: string;
    street: string;
    city: string;
    postal_code: string;
    latitude: string;
    longitude: string;
    placeDetails?: any;
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
  orderType?: "regular" | "reel" | "restaurant" | "combined";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
    restaurant_id?: string | null;
    user_id?: string | null;
    isRestaurantUserReel?: boolean;
    Restaurant?: {
      id: string;
      name: string;
      location: string;
      lat: number;
      long: number;
      phone?: string;
    };
    Shops?: {
      id: string;
      name: string;
      address: string;
      phone?: string;
    };
  };
  quantity?: number;
  deliveryNote?: string;
}

export interface BatchDetailsProps {
  orderData: OrderDetailsType | null;
  error: string | null;
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}
