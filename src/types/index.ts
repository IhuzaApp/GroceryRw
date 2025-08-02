export interface Data {
  users?: any[];
  categories?: any[];
  shops?: any[];
  products?: any[];
  addresses?: any[];
  carts?: any[];
  cartItems?: any[];
  orders?: any[];
  orderItems?: any[];
  shopperAvailability?: any[];
  deliveryIssues?: any[];
  notifications?: any[];
  platformSettings?: any[];
  restaurants?: any[];
}

export interface UsersResponse {
  Users: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
  }>;
}

export interface CategoriesResponse {
  Categories: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
    image: string;
    is_active: boolean;
  }>;
}

export interface ShopsResponse {
  Shops: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
    category_id: string;
    image: string;
    is_active: boolean;
    latitude: string;
    longitude: string;
    operating_hours?: any;
    updated_at?: string;
  }>;
}

export interface ProductsResponse {
  Products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    created_at: string;
  }>;
}

export interface AddressesResponse {
  Addresses: Array<{
    id: string;
    user_id: string;
    street: string;
    city: string;
    postal_code: string;
    created_at: string;
  }>;
}

export interface CartsResponse {
  Carts: Array<{
    id: string;
    user_id: string;
    created_at: string;
  }>;
}

export interface CartItemsResponse {
  Cart_Items: Array<{
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    created_at: string;
  }>;
}

export interface OrdersResponse {
  Orders: Array<{
    id: string;
    user_id: string;
    status: string;
    created_at: string;
  }>;
}

export interface OrderItemsResponse {
  Order_Items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: string;
    created_at: string;
  }>;
}

export interface ShopperAvailabilityResponse {
  Shopper_Availability: Array<{
    id: string;
    user_id: string;
    is_available: boolean;
    created_at: string;
  }>;
}

export interface DeliveryIssuesResponse {
  Delivery_Issues: Array<{
    id: string;
    order_id: string;
    issue_type: string;
    description: string;
    created_at: string;
  }>;
}

export interface NotificationsResponse {
  Notifications: Array<{
    id: string;
    user_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
  }>;
}

export interface PlatformSettingsResponse {
  Platform_Settings: Array<{
    id: string;
    key: string;
    value: string;
    created_at: string;
  }>;
}

export interface RestaurantsResponse {
  Restaurants: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    lat: string;
    long: string;
    profile: string;
    verified: boolean;
    created_at: string;
  }>;
}

export interface ShopCardProps {
  name: string;
  description: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: string;
  distance?: string;
}
