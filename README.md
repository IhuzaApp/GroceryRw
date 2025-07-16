This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
  - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

# Grocery Delivery System

## Overview

A comprehensive grocery delivery platform with advanced revenue tracking, wallet management, order processing systems, and intelligent delivery time management. The system supports both regular orders and reel-based orders with sophisticated payment, revenue management, and real-time delivery tracking.

## Key Systems

### 1. Revenue Management System

### 2. Wallet Balance System

### 3. Order Processing System

### 4. Payment Management System

### 5. Reel Orders System

### 6. Delivery Time Management System

---

# Revenue Management System

## Overview

The revenue system uses a **trigger-based approach** with a two-price model for revenue generation. Revenue is calculated and recorded at specific order status changes, not during checkout.

## Revenue Types

### 1. Commission Revenue (Product Profits)

- **Trigger**: Order status changes to "shopping"
- **Calculation**: `(final_price - price) × quantity` for each product
- **Purpose**: Track profit margins from product markups
- **API**: `/api/shopper/calculateCommissionRevenue`

### 2. Plasa Fee Revenue (Platform Earnings)

- **Trigger**: Order status changes to "delivered"
- **Calculation**: `(service_fee + delivery_fee) × (deliveryCommissionPercentage / 100)`
- **Purpose**: Track platform earnings from service fees
- **API**: `/api/shopper/calculatePlasaFeeRevenue`

## Revenue Calculation Flow

```
Order Created → Shopper Accepts → Shopping → Picked → On the Way → Delivered
                                    ↑                    ↑
                              COMMISSION           PLASA FEE
                              REVENUE             REVENUE
                              (Product Profits)   (Platform Earnings)
```

## Example Calculations

### Commission Revenue Example

```typescript
Product: {
  price: 1233,        // Original price
  final_price: 4555,  // Customer price
  quantity: 3         // Units ordered
}

// Calculations
Customer Pays: 4555 × 3 = 13,665 RWF
Shop Gets: 1233 × 3 = 3,699 RWF
Our Revenue: 13,665 - 3,699 = 9,966 RWF
```

### Plasa Fee Revenue Example

```typescript
Service Fee = 2000
Delivery Fee = 2400
Total Fees = 4400
deliveryCommissionPercentage = 10 (10%)

Platform Fee = 4400 × (10/100) = 440
Remaining Earnings = 4400 - 440 = 3960

Revenue Table: 440 (platform earnings)
Shopper Wallet: 3960 (remaining earnings)
```

## API Endpoints

### 1. Commission Revenue API (`/api/shopper/calculateCommissionRevenue`)

**POST** - Calculate and record commission revenue

```typescript
POST /api/shopper/calculateCommissionRevenue
{
  orderId: uuid
}

// Response
{
  success: true,
  message: "Commission revenue calculated and recorded successfully",
  data: {
    commission_revenue: "9966.00",
    product_profits: [...]
  }
}
```

### 2. Plasa Fee Revenue API (`/api/shopper/calculatePlasaFeeRevenue`)

**POST** - Calculate and record plasa fee revenue

```typescript
POST /api/shopper/calculatePlasaFeeRevenue
{
  orderId: uuid
}

// Response
{
  success: true,
  message: "Plasa fee revenue calculated and recorded successfully",
  data: {
    plasa_fee: "440.00",
    commission_percentage: 10
  }
}
```

### 3. Revenue Records API (`/api/revenue`)

**GET** - Fetch all revenue records

```typescript
GET / api / revenue;

// Response
{
  Revenue: [
    {
      id: uuid,
      type: "commission" | "plasa_fee",
      amount: string,
      order_id: uuid,
      shop_id: uuid,
      shopper_id: uuid,
      products: jsonb,
      commission_percentage: string,
      created_at: string,
    },
  ];
}
```

## Database Schema

### Revenue Table

```sql
Revenue {
  id: uuid (primary key)
  type: string ("commission" | "plasa_fee")
  amount: string
  order_id: uuid (nullable, for commission revenue)
  shop_id: uuid (foreign key)
  shopper_id: uuid (foreign key to shoppers table)
  products: jsonb (nullable, for commission revenue)
  commission_percentage: string (nullable)
  created_at: timestamp
}
```

---

# Wallet Balance System

## Overview

The wallet system manages shopper earnings with two balance types: **Available Balance** (earnings) and **Reserved Balance** (pending orders). The system follows a specific flow for balance updates based on order status changes.

## Balance Types

### 1. Available Balance

**Purpose**: Funds that the shopper has earned and can withdraw
**Increases**: When order is delivered (remaining earnings after platform fee)
**Decreases**: When platform fee is deducted

### 2. Reserved Balance

**Purpose**: Funds set aside for pending orders (locked until completion)
**Increases**: When order is accepted (order total)
**Decreases**: When order is delivered (used to pay for goods)

## Wallet Balance Flow

### Order Acceptance ("shopping" status)

```typescript
// Reserved Balance increases by order total
newReservedBalance = currentReservedBalance + orderTotal;

// Available Balance: No change (shopper hasn't earned fees yet)
// Commission Revenue: Added to revenue table
```

### Order Delivery ("delivered" status)

```typescript
// Calculate platform fee and remaining earnings
totalEarnings = serviceFee + deliveryFee
platformFee = totalEarnings × (deliveryCommissionPercentage / 100)
remainingEarnings = totalEarnings - platformFee

// Available Balance: Add remaining earnings
newAvailableBalance = currentAvailableBalance + remainingEarnings

// Reserved Balance: No change (already used for goods)
// Plasa Fee Revenue: Added to revenue table
```

### Order Cancellation ("cancelled" status)

```typescript
// Reserved Balance decreases by order total
newReservedBalance = currentReservedBalance - orderTotal;

// Available Balance: No change
// Refund: Created in Refunds table (not back to available balance)
```

## Example Flow

```
Order Total: $9000
Service Fee: $2000
Delivery Fee: $2400
Platform Commission: 10%

Shopping Status:
- Reserved Balance: +$9000 (set aside for goods)
- Available Balance: No change
- Commission Revenue: Added (product profits)

Delivered Status:
- Reserved Balance: No change (already used for goods)
- Available Balance: +$3960 (remaining earnings after platform fee)
- Plasa Fee Revenue: Added (platform earnings)
```

## API Endpoints

### 1. Wallet Balance API (`/api/queries/wallet-balance`)

**GET/POST** - Get shopper wallet balance

```typescript
GET /api/queries/wallet-balance?shopper_id=uuid

// Response
{
  wallet: {
    id: uuid,
    available_balance: "3960.00",
    reserved_balance: "15000.00",
    last_updated: string
  }
}
```

### 2. Wallet History API (`/api/shopper/walletHistory`)

**GET** - Get wallet transaction history

```typescript
GET /api/shopper/walletHistory

// Response
{
  wallet: {
    availableBalance: 3960,
    reservedBalance: 15000
  },
  transactions: [
    {
      id: uuid,
      amount: number,
      type: "reserve" | "earnings" | "payment" | "platform_fee" | "refund",
      status: "completed",
      description: string,
      date: string,
      time: string
    }
  ]
}
```

### 3. Create Wallet API (`/api/queries/createWallet`)

**POST** - Create new wallet for shopper

```typescript
POST /api/queries/createWallet
{
  shopper_id: uuid
}

// Response
{
  success: true,
  wallet: {
    id: uuid,
    shopper_id: uuid,
    available_balance: "0",
    reserved_balance: "0"
  }
}
```

## Database Schema

### Wallets Table

```sql
Wallets {
  id: uuid (primary key)
  shopper_id: uuid (foreign key to shoppers table)
  available_balance: string
  reserved_balance: string
  last_updated: timestamp
}
```

### Wallet_Transactions Table

```sql
Wallet_Transactions {
  id: uuid (primary key)
  wallet_id: uuid (foreign key to Wallets)
  amount: string
  type: string ("reserve" | "earnings" | "payment" | "platform_fee" | "refund")
  status: string ("completed" | "pending")
  description: string
  related_order_id: uuid (nullable)
  created_at: timestamp
}
```

---

# Order Processing System

## Overview

The order processing system handles order status updates with integrated wallet balance management and revenue calculation triggers.

## Order Status Flow

### 1. "shopping" Status

**Triggers**:

- Reserved balance increases by order total
- Commission revenue is calculated and recorded
- Wallet transaction created for reserved balance

### 2. "delivered" Status

**Triggers**:

- Available balance updated with remaining earnings
- Plasa fee revenue is calculated and recorded
- Wallet transactions created for earnings
- Revenue calculation APIs called

### 3. "cancelled" Status

**Triggers**:

- Reserved balance decreases by order total
- Refund record created in Refunds table
- Wallet transaction created for refund

## API Endpoints

### 1. Update Order Status API (`/api/shopper/updateOrderStatus`)

**POST** - Update order status with wallet balance management

```typescript
POST /api/shopper/updateOrderStatus
{
  orderId: uuid,
  status: "shopping" | "delivered" | "cancelled"
}

// Response
{
  success: true,
  order: {
    id: uuid,
    status: string,
    updated_at: string
  }
}
```

## Database Schema

### Orders Table

```sql
Orders {
  id: uuid (primary key)
  OrderID: string
  user_id: uuid (foreign key to Users)
  shopper_id: uuid (foreign key to Users)
  shop_id: uuid (foreign key to Shops)
  total: string
  service_fee: string
  delivery_fee: string
  status: string
  delivery_photo_url: string (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### Order_Items Table

```sql
Order_Items {
  id: uuid (primary key)
  order_id: uuid (foreign key to Orders)
  product_id: uuid (foreign key to Products)
  quantity: number
  price: string (base price for shopper calculations)
  found: boolean
  foundQuantity: number
}
```

---

# Payment Management System

## Overview

The payment system handles order payments using reserved balance funds with refund capabilities for missing items.

## Payment Flow

### 1. Payment Processing

- Shopper uses reserved balance to pay for found items
- System calculates refund for missing items
- Refund record created if needed
- Reserved balance updated

### 2. Refund Management

- Missing items trigger refund creation
- Refunds go to Refunds table (not back to available balance)
- Refund status tracking

## API Endpoints

### 1. Process Payment API (`/api/shopper/processPayment`)

**POST** - Process order payment from reserved balance

```typescript
POST /api/shopper/processPayment
{
  orderId: uuid,
  orderAmount: number,
  originalOrderTotal?: number,
  momoCode: string,
  privateKey: string
}

// Response
{
  success: true,
  message: "Payment processed successfully",
  data: {
    paymentAmount: number,
    refundAmount: number,
    newReservedBalance: number
  }
}
```

### 2. Record Transaction API (`/api/shopper/recordTransaction`)

**POST** - Record wallet transaction for payment

```typescript
POST /api/shopper/recordTransaction
{
  shopperId: uuid,
  orderId: uuid,
  orderAmount: number,
  originalOrderTotal?: number
}

// Response
{
  success: true,
  message: "Transaction recorded successfully",
  data: {
    transactionResponse: object,
    refund: object,
    newBalance: {
      reserved: number
    }
  }
}
```

## Database Schema

### Refunds Table

```sql
Refunds {
  id: uuid (primary key)
  order_id: uuid (foreign key to Orders)
  amount: string
  status: string ("pending" | "paid")
  reason: string
  user_id: uuid (foreign key to Users)
  generated_by: string
  paid: boolean
  created_at: timestamp
}
```

---

# Reel Orders System

## Overview

The Reel Orders system allows users to place direct orders from reel content without going through the traditional cart system. This creates a seamless shopping experience where users can order items they see in video content immediately.

## Key Features

### 1. Direct Order Placement

- **No Cart Required**: Orders are placed directly from reel content
- **Instant Purchase**: One-click ordering from video content
- **Real-time Pricing**: Dynamic pricing based on quantity and delivery location
- **Promo Code Support**: Apply discount codes during checkout

### 2. Order Management

- **Unified Order Tracking**: Reel orders appear alongside regular orders
- **Status Tracking**: Same delivery status system as regular orders
- **Shopper Assignment**: Automatic shopper assignment when available
- **Delivery Tracking**: Real-time delivery updates

### 3. User Experience

- **Modal Checkout**: Clean, focused checkout experience
- **Quantity Selection**: Adjust quantity with real-time price updates
- **Special Instructions**: Add delivery notes and special requests
- **Payment Integration**: Seamless payment processing

## Technical Architecture

### Database Schema

#### Reel Orders Table

```sql
reel_orders {
  id: uuid (primary key)
  OrderID: string (unique order number)
  user_id: uuid (foreign key to Users)
  reel_id: uuid (foreign key to Reels)
  quantity: string
  total: string
  service_fee: string
  delivery_fee: string
  discount: string (nullable)
  voucher_code: string (nullable)
  delivery_time: string
  delivery_note: string
  status: "PENDING" | "shopping" | "packing" | "on_the_way" | "delivered"
  found: boolean
  shopper_id: uuid (nullable, foreign key to Shoppers)
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### 1. Reel Orders API (`/api/reel-orders`)

**POST** - Create new reel order

```typescript
POST /api/reel-orders
{
  reel_id: uuid,
  quantity: number,
  total: string,
  service_fee: string,
  delivery_fee: string,
  discount?: string,
  voucher_code?: string,
  delivery_time: string,
  delivery_note?: string,
  delivery_address_id: uuid
}

// Response
{
  success: true,
  order_id: uuid,
  order_number: string,
  message: "Reel order placed successfully"
}
```

#### 2. All Orders API (`/api/queries/all-orders`)

**GET** - Fetch both regular and reel orders

```typescript
GET / api / queries / all - orders;

// Response
{
  orders: [
    {
      id: uuid,
      OrderID: string,
      status: string,
      created_at: string,
      total: number,
      orderType: "regular" | "reel",
      // Regular order fields
      shop: object,
      itemsCount: number,
      unitsCount: number,
      // Reel order fields
      reel: object,
      quantity: number,
      delivery_note: string,
    },
  ];
}
```

#### 3. Reel Order Details API (`/api/queries/reel-order-details`)

**GET** - Fetch detailed reel order information

```typescript
GET /api/queries/reel-order-details?id=uuid

// Response
{
  order: {
    id: uuid,
    OrderID: string,
    status: string,
    created_at: string,
    total: number,
    service_fee: number,
    delivery_fee: number,
    discount: number,
    quantity: number,
    delivery_note: string,
    orderType: "reel",
    reel: {
      id: uuid,
      title: string,
      description: string,
      Price: string,
      Product: string,
      type: string,
      video_url: string
    },
    assignedTo?: {
      id: uuid,
      name: string,
      phone: string,
      profile_photo: string,
      transport_mode: string
    }
  }
}
```

## Frontend Components

### 1. Order Modal (`src/components/Reels/OrderModal.tsx`)

**Features:**

- Quantity selection with real-time price updates
- Promo code application
- Special instructions input
- Payment method display
- Order summary with breakdown
- Loading states with placeholders

**Key Functions:**

```typescript
// Calculate order totals
const basePrice = post?.restaurant?.price || post?.product?.price || 0;
const subtotal = basePrice * quantity;
const finalTotal = subtotal - discount + serviceFee + deliveryFee;

// Handle promo code application
const handleApplyPromo = () => {
  const PROMO_CODES = { SAVE10: 0.1, SAVE20: 0.2 };
  const code = promoCode.trim().toUpperCase();
  if (PROMO_CODES[code]) {
    setDiscount(subtotal * PROMO_CODES[code]);
    setAppliedPromo(code);
  }
};

// Place order
const handlePlaceOrder = async () => {
  const payload = {
    reel_id: post.id,
    quantity: quantity,
    total: finalTotal.toString(),
    service_fee: serviceFee.toString(),
    delivery_fee: deliveryFee.toString(),
    discount: discount > 0 ? discount.toString() : null,
    voucher_code: appliedPromo,
    delivery_time: deliveryTimestamp,
    delivery_note: comments || "",
    delivery_address_id: deliveryAddressId,
  };

  const res = await fetch("/api/reel-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
```

### 2. Video Reel Component (`src/components/Reels/VideoReel.tsx`)

**Features:**

- "Order Now" button integration
- Modal trigger functionality
- Reel information display
- Price and delivery information

**Order Button Integration:**

```typescript
// Order button with modal trigger
<button
  onClick={() => setShowOrderModal(true)}
  className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
>
  Order Now
</button>;

// Order modal
{
  showOrderModal && (
    <OrderModal
      open={showOrderModal}
      onClose={() => setShowOrderModal(false)}
      post={post}
      shopLat={shopLat}
      shopLng={shopLng}
      shopAlt={shopAlt}
      shopId={shopId}
    />
  );
}
```

### 3. Order Details Components

#### Regular Order Details (`src/components/UserCarts/orders/UserOrderDetails.tsx`)

- Displays regular shop orders
- Shows shop information and item details
- Green theme styling

#### Reel Order Details (`src/components/UserCarts/orders/UserReelOrderDetails.tsx`)

- Displays reel-specific order information
- Shows reel video thumbnail and details
- Purple theme styling
- Comprehensive shopper information

**Key Differences:**

```typescript
// Regular orders show shop information
{
  order.shop && (
    <div className="shop-info">
      <h3>{order.shop.name}</h3>
      <p>{order.shop.address}</p>
    </div>
  );
}

// Reel orders show reel information
{
  order.reel && (
    <div className="reel-info">
      <video src={order.reel.video_url} />
      <h3>{order.reel.title}</h3>
      <p>{order.reel.description}</p>
    </div>
  );
}
```

## Order Management System

### 1. Unified Order Display (`src/components/userProfile/userRecentOrders.tsx`)

**Features:**

- Displays both regular and reel orders
- Visual distinction between order types
- Consistent filtering and pagination
- Dark theme support

**Order Type Detection:**

```typescript
// Visual distinction
const buttonClass =
  order.orderType === "reel"
    ? "bg-purple-500 hover:bg-purple-600"
    : "bg-green-500 hover:bg-green-600";

// Content display
{
  order.orderType === "reel" ? (
    <div className="reel-order-info">
      <span>{order.quantity} quantity</span>
      <span>{order.reel?.title}</span>
    </div>
  ) : (
    <div className="regular-order-info">
      <span>
        {order.itemsCount} items ({order.unitsCount} units)
      </span>
      <span>{order.shop?.name}</span>
    </div>
  );
}
```

### 2. Order Details Pages

#### Unified Order Details (`pages/CurrentPendingOrders/viewOrderDetails/[orderId].tsx`)

**Smart Order Detection:**

```typescript
// Try regular order first
let res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
if (res.ok) {
  const data = await res.json();
  if (data.order) {
    setOrder(data.order);
    setOrderType("regular");
    return;
  }
}

// Try reel order if regular not found
res = await fetch(`/api/queries/reel-order-details?id=${orderId}`);
if (res.ok) {
  const data = await res.json();
  setOrder(data.order);
  setOrderType("reel");
}

// Render appropriate component
{
  orderType === "reel" ? (
    <UserReelOrderDetails order={order} />
  ) : (
    <UserOrderDetails order={order} />
  );
}
```

## User Experience Flow

### 1. Discovery and Ordering

1. **Browse Reels**: User scrolls through video content
2. **View Details**: Tap on reel to see product information
3. **Order Now**: Click "Order Now" button
4. **Configure Order**: Select quantity, add notes, apply promo codes
5. **Place Order**: Complete checkout process
6. **Confirmation**: Receive order confirmation

### 2. Order Tracking

1. **Order Placed**: Order appears in order history
2. **Shopper Assignment**: Automatic assignment when available
3. **Status Updates**: Real-time status changes
4. **Delivery**: Track delivery progress
5. **Completion**: Order delivered and marked complete

### 3. Order Management

1. **View Orders**: Access order history from main menu
2. **Filter Orders**: Filter by status (pending/completed)
3. **Order Details**: View comprehensive order information
4. **Contact Shopper**: Call or message assigned shopper
5. **Feedback**: Rate and review completed orders

## Examples

### Example 1: Restaurant Reel Order

**Scenario**: User sees a delicious pizza reel from "Pizza Palace"

1. **Reel Content**: Video shows fresh pizza being made
2. **Product Info**: Title: "Margherita Pizza", Price: $15.99
3. **Order Process**:

   ```typescript
   // User clicks "Order Now"
   setShowOrderModal(true);

   // User selects quantity
   setQuantity(2);

   // User adds special instructions
   setComments("Extra cheese, well done");

   // User applies promo code
   handleApplyPromo("SAVE10"); // 10% discount

   // Order is placed
   const order = {
     reel_id: "pizza-reel-123",
     quantity: 2,
     total: "28.78", // $15.99 * 2 - 10% discount + fees
     delivery_note: "Extra cheese, well done",
     voucher_code: "SAVE10",
   };
   ```

### Example 2: Supermarket Reel Order

**Scenario**: User sees a fresh produce showcase from "Fresh Market"

1. **Reel Content**: Video shows fresh vegetables and fruits
2. **Product Info**: Title: "Organic Vegetable Basket", Price: $25.00
3. **Order Process**:

   ```typescript
   // User selects quantity
   setQuantity(1);

   // System calculates delivery fee based on distance
   const deliveryFee = calculateDeliveryFee(userLocation, shopLocation);

   // Order summary
   const orderSummary = {
     subtotal: 25.0,
     service_fee: 2.0,
     delivery_fee: 3.5,
     total: 30.5,
   };
   ```

### Example 3: Chef Recipe Reel Order

**Scenario**: User sees a cooking tutorial for "Homemade Pasta"

1. **Reel Content**: Video shows chef making pasta from scratch
2. **Product Info**: Title: "Fresh Homemade Pasta Kit", Price: $35.00
3. **Order Process**:

   ```typescript
   // User adds special dietary requirements
   setComments("Gluten-free pasta, no dairy");

   // User applies multiple promo codes
   handleApplyPromo("SAVE20"); // 20% discount

   // Final order
   const order = {
     reel_id: "pasta-kit-456",
     quantity: 1,
     total: "30.00", // $35.00 - 20% discount + fees
     delivery_note: "Gluten-free pasta, no dairy",
     voucher_code: "SAVE20",
   };
   ```

## Technical Implementation Details

### 1. Database Relationships

```sql
-- Reel orders reference reels
ALTER TABLE reel_orders
ADD CONSTRAINT fk_reel_orders_reel
FOREIGN KEY (reel_id) REFERENCES reels(id);

-- Reel orders reference users
ALTER TABLE reel_orders
ADD CONSTRAINT fk_reel_orders_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- Reel orders can reference shoppers
ALTER TABLE reel_orders
ADD CONSTRAINT fk_reel_orders_shopper
FOREIGN KEY (shopper_id) REFERENCES shoppers(id);
```

### 2. API Error Handling

```typescript
// Comprehensive error handling
try {
  const response = await fetch("/api/reel-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Order placement failed");
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error.message.includes("delivery_address")) {
    showError("Please select a delivery address");
  } else if (error.message.includes("promo")) {
    showError("Invalid promo code");
  } else {
    showError("Order placement failed. Please try again.");
  }
}
```

### 3. Real-time Updates

```typescript
// Optimistic UI updates
const handlePlaceOrder = async () => {
  // Immediately show loading state
  setIsOrderLoading(true);

  try {
    // Place order
    const response = await placeOrder(payload);

    // Show success message
    showSuccess("Order placed successfully!");

    // Close modal after delay
    setTimeout(() => {
      onClose();
    }, 1500);
  } catch (error) {
    // Handle error
    showError(error.message);
  } finally {
    setIsOrderLoading(false);
  }
};
```

## Best Practices

### 1. For Developers

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show appropriate loading indicators
3. **Validation**: Validate all user inputs before submission
4. **Optimistic Updates**: Update UI immediately, sync with backend
5. **Type Safety**: Use TypeScript interfaces for all data structures

### 2. For Users

1. **Order Placement**: Review order details before confirming
2. **Promo Codes**: Check promo code validity before applying
3. **Delivery Address**: Ensure delivery address is correct
4. **Special Instructions**: Be specific with delivery notes
5. **Order Tracking**: Monitor order status for updates

### 3. For Content Creators

1. **Clear Product Information**: Provide accurate titles and descriptions
2. **Quality Videos**: Ensure good video quality and lighting
3. **Pricing**: Set competitive and accurate prices
4. **Availability**: Keep product availability up to date
5. **Engagement**: Respond to comments and questions

## Troubleshooting

### Common Issues

1. **Order Not Placed**

   - Check internet connection
   - Verify delivery address is selected
   - Ensure all required fields are filled

2. **Promo Code Not Working**

   - Verify promo code is valid
   - Check if discounts are enabled
   - Ensure minimum order requirements are met

3. **Order Not Appearing**

   - Refresh the orders page
   - Check order status filter
   - Contact support if issue persists

4. **Video Not Loading**
   - Check internet connection
   - Try refreshing the page
   - Clear browser cache

### Support

For technical issues or questions about the Reels and Reel Orders system:

- **Technical Support**: support@example.com
- **Bug Reports**: bugs@example.com
- **Feature Requests**: features@example.com

## Future Enhancements

### Planned Features

1. **Advanced Ordering**

   - Multiple item selection from single reel
   - Customization options (size, toppings, etc.)
   - Scheduled delivery times

2. **Enhanced Tracking**

   - Real-time shopper location
   - Estimated arrival times
   - Delivery notifications

3. **Social Features**

   - Share orders with friends
   - Group ordering
   - Order recommendations

4. **Analytics**
   - Order conversion tracking
   - Popular reel analysis
   - Revenue reporting

### Performance Improvements

1. **Caching**

   - Reel content caching
   - Order history caching
   - API response caching

2. **Optimization**

   - Image and video compression
   - Lazy loading
   - Bundle size optimization

3. **Scalability**
   - Database query optimization
   - API rate limiting
   - Load balancing

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Grocery Delivery Application

## Table of Contents

1. [Reels Feature](#reels-feature-documentation)
2. [Reel Orders System](#reel-orders-system)
3. [Delivery Photo Upload Feature](#delivery-photo-upload-feature)
4. [Nearby Dasher Notification Logic](#nearby-dasher-notification-logic)

# Reels Feature Documentation

## Overview

The Reels feature is a TikTok-style video feed system that allows users to create, view, and interact with food-related video content. It supports three types of content: restaurant posts, supermarket posts, and chef/recipe posts.

## Core Features

### 1. Video Types

- **Restaurant Posts**: Food delivery and dining experiences
- **Supermarket Posts**: Product showcases and shopping content
- **Chef Posts**: Recipe tutorials and cooking content

### 2. User Interactions

- **Like/Unlike**: Real-time like functionality with optimistic updates
- **Comments**: Add and interact with comments on reels
- **Share**: Share reels with other users
- **Scroll Navigation**: Smooth vertical scrolling between reels

### 3. Responsive Design

- **Mobile**: Full-screen experience with bottom navigation
- **Desktop**: Integrated layout with sidebar and navigation
- **Auto-play**: Videos play when visible, pause when not

## Technical Architecture

### Database Schema

#### Reels Table

```sql
Reels {
  id: uuid (primary key)
  title: string
  description: string
  video_url: string
  category: string
  type: "restaurant" | "supermarket" | "chef"
  user_id: uuid (foreign key to Users)
  restaurant_id: uuid (optional, foreign key to Restaurants)
  created_on: timestamp
  isLiked: boolean
  likes: string
  delivery_time: string
  Price: string
  Product: jsonb
}
```

#### Reel Likes Table

```sql
reel_likes {
  id: uuid (primary key)
  reel_id: uuid (foreign key to Reels)
  user_id: uuid (foreign key to Users)
  created_at: timestamp
}
```

#### Reel Comments Table

```sql
Reels_comments {
  id: uuid (primary key)
  reel_id: uuid (foreign key to Reels)
  user_id: uuid (foreign key to Users)
  text: string
  created_on: timestamp
  likes: string
  isLiked: boolean
}
```

### API Endpoints

#### 1. Reels API (`/api/queries/reels`)

**GET** - Fetch reels

```typescript
// Get all reels
GET /api/queries/reels

// Get reels by user
GET /api/queries/reels?user_id=uuid

// Get reels by restaurant
GET /api/queries/reels?restaurant_id=uuid

// Filter by type
GET /api/queries/reels?type=restaurant
```

**POST** - Create new reel

```typescript
POST /api/queries/reels
{
  title: string,
  description: string,
  video_url: string,
  category: string,
  type: "restaurant" | "supermarket" | "chef",
  restaurant_id?: uuid,
  Product?: object,
  delivery_time?: string,
  Price?: string
}
```

#### 2. Reel Likes API (`/api/queries/reel-likes`)

**GET** - Get likes for a reel

```typescript
GET /api/queries/reel-likes?reel_id=uuid
```

**POST** - Add like to reel

```typescript
POST / api / queries / reel - likes;
{
  reel_id: uuid;
}
```

**DELETE** - Remove like from reel

```typescript
DELETE / api / queries / reel - likes;
{
  reel_id: uuid;
}
```

#### 3. Reel Comments API (`/api/queries/reel-comments`)

**GET** - Get comments for a reel

```typescript
GET /api/queries/reel-comments?reel_id=uuid
```

**POST** - Add comment to reel

```typescript
POST /api/queries/reel-comments
{
  reel_id: uuid,
  text: string
}
```

**PUT** - Toggle comment like

```typescript
PUT /api/queries/reel-comments
{
  comment_id: uuid,
  action: "toggle_like"
}
```

**DELETE** - Delete comment

```typescript
DELETE / api / queries / reel - comments;
{
  comment_id: uuid;
}
```

## Frontend Components

### 1. Main Reels Component (`pages/Reels/index.tsx`)

**Features:**

- Fetches reels from database
- Handles responsive layout (mobile/desktop)
- Manages like/unlike functionality
- Optimistic UI updates
- Loading states with placeholder content

**Key Functions:**

```typescript
// Fetch reels from database
const fetchReels = async () => {
  const response = await fetch("/api/queries/reels");
  const data = await response.json();
  const convertedPosts = data.reels.map(convertDatabaseReelToFoodPost);
  setPosts(convertedPosts);
};

// Optimistic like updates
const toggleLike = async (postId: string) => {
  // Immediately update UI
  setPosts(
    posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            stats: {
              ...post.stats,
              likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
            },
          }
        : post
    )
  );

  // Process backend request in background
  fetch("/api/queries/reel-likes", {
    method: isLiked ? "DELETE" : "POST",
    body: JSON.stringify({ reel_id: postId }),
  });
};
```

### 2. Video Reel Component (`src/components/Reels/VideoReel.tsx`)

**Features:**

- Video player with auto-play/pause
- Like button with visual feedback
- Comment and share buttons
- Type and category badges
- Responsive design

**Visual Elements:**

```typescript
// Type badges with colors
const getPostTypeColor = (type: PostType) => {
  switch (type) {
    case "restaurant":
      return "#ff6b35"; // Orange
    case "supermarket":
      return "#4ade80"; // Green
    case "chef":
      return "#3b82f6"; // Blue
  }
};

// Category badges
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "shopping":
      return "#8b5cf6"; // Purple
    case "organic":
      return "#10b981"; // Emerald
    case "tutorial":
      return "#f59e0b"; // Amber
    // ... more categories
  }
};
```

### 3. Comments Drawer (`src/components/Reels/CommentsDrawer.tsx`)

**Features:**

- Slide-up drawer for mobile
- Side panel for desktop
- Real-time comment addition
- Like/unlike comments
- Responsive design

## User Experience Features

### 1. Optimistic Updates

- **Instant Feedback**: Like button turns red immediately
- **Background Processing**: API calls don't block UI
- **Smooth Scrolling**: No loading interruptions
- **Error Handling**: Backend errors logged but UI stays updated

### 2. Loading States

- **Placeholder Content**: Shows 3 placeholder reels while loading
- **Smooth Transitions**: Seamless switch from placeholders to real content
- **Error States**: Clear error messages with retry options

### 3. Responsive Design

**Mobile Layout:**

- Full-screen video experience
- Bottom navigation bar
- Slide-up comments drawer
- Touch-optimized interactions

**Desktop Layout:**

- Integrated with main app layout
- Side panel comments
- Keyboard shortcuts support
- Larger video player

### 4. Video Management

- **Auto-play**: Videos play when visible in viewport
- **Auto-pause**: Videos pause when scrolled away
- **Intersection Observer**: Efficient visibility detection
- **Loading States**: Video loading indicators
- **Error Handling**: Fallback for failed video loads

## Data Flow

### 1. Reel Creation

```
User Upload → API Validation → Database Storage → UI Update
```

### 2. Like Interaction

```
User Click → Optimistic UI Update → Background API Call → Database Update
```

### 3. Comment System

```
User Comment → API Call → Database Storage → Real-time UI Update
```

### 4. Data Fetching

```
Component Mount → API Call → Database Query → Data Conversion → UI Render
```

## Security & Authentication

### 1. User Authentication

- All write operations require valid session
- User ID extracted from NextAuth session
- Unauthorized requests return 401 status

### 2. Authorization

- Users can only delete their own comments
- Admin users can delete any comment
- Like operations tied to authenticated user

### 3. Input Validation

- Required fields validation
- Video URL validation
- Comment text sanitization
- Type and category validation

## Performance Optimizations

### 1. Video Optimization

- Preload metadata only
- Lazy loading for off-screen videos
- Efficient video format support
- Background loading

### 2. State Management

- Optimistic updates for better UX
- Efficient re-rendering with React
- Proper cleanup of event listeners
- Memory leak prevention

### 3. API Optimization

- Efficient database queries
- Proper indexing on foreign keys
- Caching strategies
- Error handling and logging

## Configuration

### Environment Variables

```env
# Database
HASURA_GRAPHQL_ENDPOINT=your_hasura_endpoint
HASURA_GRAPHQL_ADMIN_SECRET=your_admin_secret

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# File Storage (for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### GraphQL Schema

The reels feature uses the following GraphQL operations:

- `GetAllReels` - Fetch all reels with user and restaurant data
- `AddReels` - Create new reel
- `GetReelsLikes` - Get likes for specific reel
- `AddReelLike` - Add like to reel
- `RemoveReelLike` - Remove like from reel
- `GetComments` - Get comments for reel
- `AddReelComment` - Add comment to reel

## Future Enhancements

### Planned Features

- Video upload functionality
- Advanced filtering and search
- User profiles and following
- Push notifications for new content
- Analytics and insights
- Content moderation tools

### Technical Improvements

- Video compression and optimization
- CDN integration for faster loading
- Real-time notifications
- Advanced caching strategies
- Performance monitoring

## Revenue and Checkout System

### Revenue Calculation Logic

The system uses a two-price model for revenue generation with a **trigger-based approach**:

1. **Price Structure**:

   - `price`: Original shop price (what we pay to shop)
   - `final_price`: Marked up price (what customer pays)

2. **Example Calculation**:

```typescript
// Single Product Example
Product = {
  price: 1233,        // Original price
  final_price: 4555,  // Customer price
  quantity: 3         // Units ordered
}

// Calculations
Customer Pays: 4555 × 3 = 13,665 RWF
Shop Gets: 1233 × 3 = 3,699 RWF
Our Revenue: 13,665 - 3,699 = 9,966 RWF

// Multiple Products Example
Two identical products:
Total Customer Pays: 27,330 RWF (13,665 × 2)
Total Shop Gets: 7,398 RWF (3,699 × 2)
Total Revenue: 19,932 RWF (27,330 - 7,398)
```

### Checkout Process

1. **Cart Calculation**:

   - System calculates total using `final_price` for each item (what customer sees)
   - Calculates actual total using `price` (what we pay to shop)
   - Adds service fee and delivery fee
   - Applies any discounts or vouchers

2. **Order Creation**:

   - Creates order record with actual total (what we pay to shop)
   - Stores order items with base price (for shopper calculations)
   - **No revenue records created yet** (trigger-based approach)

3. **Revenue Calculation Trigger**:

   Revenue is calculated and recorded **only when the order is completed**:

   - **When order status becomes "delivered"**
   - **When delivery photo is uploaded** (if order is already delivered)

4. **Payment Flow**:
   - Customer pays the total with final_price + fees
   - Shop receives their original price amount (stored in Orders table)
   - System calculates and records revenue when order is completed

### Revenue Calculation Triggers

#### 1. Order Status Update Trigger

When a shopper updates order status to "delivered":

```typescript
// In pages/api/shopper/updateOrderStatus.ts
if (status === "delivered" && !isReelOrder) {
  // Trigger revenue calculation
  await fetch("/api/shopper/calculateRevenue", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}
```

#### 2. Delivery Photo Upload Trigger

When a delivery photo is uploaded for a delivered order:

```typescript
// In pages/api/shopper/uploadDeliveryPhoto.ts
if (orderStatus === "delivered") {
  // Trigger revenue calculation
  await fetch("/api/shopper/calculateRevenue", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}
```

### Revenue Calculation Process

When triggered, the system:

1. **Retrieves all products from the order**
2. **Calculates profit for commission-based revenue**:
   ```typescript
   Profit = (final_price - price) × quantity
   ```
3. **Calculates plasa fee**:
   ```typescript
   Plasa Fee = (Service Fee + Delivery Fee) × (deliveryCommissionPercentage)
   ```
4. **Creates revenue records**:
   - Commission revenue (product profits)
   - Plasa fee revenue (service + delivery fees)

### Technical Implementation

1. **Revenue Calculator** (`src/lib/revenueCalculator.ts`):

```typescript
export class RevenueCalculator {
  public static calculateRevenue(items: CartItem[]): {
    actualTotal: string; // What we pay to shop (stored in Orders)
    customerTotal: string; // What customer pays (used for checkout)
    revenue: string; // Our profit
  } {
    const customerTotal = this.calculateTotal(items, "final_price");
    const actualTotal = this.calculateTotal(items, "price");
    const revenue = customerTotal - actualTotal;

    return {
      actualTotal: actualTotal.toFixed(2),
      customerTotal: customerTotal.toFixed(2),
      revenue: revenue.toFixed(2),
    };
  }

  public static calculatePlasaFee(
    serviceFee: number,
    deliveryFee: number,
    deliveryCommissionPercentage: number
  ): number {
    return (serviceFee + deliveryFee) * (deliveryCommissionPercentage / 100);
  }
}
```

2. **Revenue Calculation API** (`pages/api/shopper/calculateRevenue.ts`):

```typescript
// Triggered when order is completed
export default async function handler(req, res) {
  // 1. Get order details with items
  const orderData = await hasuraClient.request(GET_ORDER_WITH_ITEMS, {
    orderId,
  });

  // 2. Calculate revenue using RevenueCalculator
  const revenueData = RevenueCalculator.calculateRevenue(cartItems);
  const productProfits = RevenueCalculator.calculateProductProfits(cartItems);

  // 3. Calculate plasa fee
  const plasaFee = RevenueCalculator.calculatePlasaFee(
    serviceFee,
    deliveryFee,
    deliveryCommissionPercentage
  );

  // 4. Create revenue records
  await hasuraClient.request(CREATE_REVENUE, {
    type: "commission",
    order_id: orderId,
    amount: revenueData.revenue,
    products: JSON.stringify(productProfits),
  });

  await hasuraClient.request(CREATE_REVENUE, {
    type: "plasa_fee",
    amount: plasaFee.toFixed(2),
    commission_percentage: deliveryCommissionPercentage.toString(),
  });
}
```

3. **Checkout Process** (`pages/api/checkout.ts`):

```typescript
// Create order (no revenue yet)
const orderRes = await hasuraClient.request(CREATE_ORDER, {
  total: actualTotal.toFixed(2), // Store what we pay to shop
  // ... other order details
});

// Note: Revenue records will be created when the order is completed (delivered)
// This matches the described trigger-based approach
```

### Revenue Types

1. **Commission Revenue**:

   - Type: `"commission"`
   - Amount: Product profit (final_price - price) × quantity
   - Linked to specific order
   - Includes product-level details in JSONB format

2. **Plasa Fee Revenue**:
   - Type: `"plasa_fee"`
   - Amount: (Service Fee + Delivery Fee) × deliveryCommissionPercentage
   - Not tied to specific order
   - Includes commission percentage used

### System Configuration

Revenue calculations use settings from `System_configuratioins` table:

- `deliveryCommissionPercentage`: Used for plasa fee calculation
- `productCommissionPercentage`: Available for future use

### Revenue Table Structure

```typescript
interface Revenue {
  id: string;
  amount: string;
  type: "commission" | "plasa_fee";
  created_at: string;
  order_id: string | null;
  shop_id: string;
  shopper_id: string | null;
  products: any; // JSONB for product details
  commission_percentage: string | null;
}
```

### Important Notes

- Customers only see and interact with `final_price`
- Original `price` is used for backend calculations and stored in Orders table
- Revenue is automatically calculated and stored per order
- All monetary values are stored in RWF (Rwandan Francs)
- The system uses fixed-point arithmetic with 2 decimal places for all calculations
- All monetary values are stored as strings to preserve precision
- Product-level profit tracking enables detailed revenue analytics

# Grocery Delivery Notification System

## Overview

The notification system manages real-time order notifications for shoppers in the grocery delivery application. It implements a sophisticated batch distribution system with multiple checks to ensure appropriate and timely notifications.

## Notification Settings

### Location Preferences

Shoppers can configure their notification preferences through the Settings page:

- **Live Location (Default)**: Receive notifications based on current GPS location
- **Custom Locations**: Choose up to 2 specific locations for notifications
- **Location Toggle**: When custom locations are enabled, live location is automatically disabled
- **Sequential Notifications**: Notifications are shown one by one per location, not simultaneously
- **Maximum Distance**: Set distance limit (5-30 km) for order notifications per location
- **Notification Types**: Configure which notifications to receive:
  - New Orders
  - Batch Orders
  - Earnings Updates
  - System Notifications

### Settings Management

- **API Endpoints**:
  - `GET /api/queries/shopper-notification-settings` - Fetch current settings
  - `POST /api/mutations/shopper-notification-settings` - Save settings
  - `POST /api/shopper/check-notifications-with-settings` - Check notifications with settings
  - `GET /api/test/notification-settings-integration` - Test integration

### System Integration

The notification settings are fully integrated with the entire notification system:

1. **NotificationSystem Component**: Updated to use settings-aware API
2. **Location-Based Filtering**: Respects live location vs custom locations
3. **Distance Filtering**: Only shows notifications within configured distance
4. **Type Filtering**: Only shows notifications for enabled types
5. **Real-time Updates**: Settings changes take effect immediately

### Database Schema

```sql
shopper_notification_settings {
  id: uuid (primary key)
  user_id: uuid (foreign key to Users)
  use_live_location: boolean (default: true)
  custom_locations: jsonb (array of location objects)
  max_distance: string (default: "10")
  notification_types: jsonb (object with boolean flags)
  created_at: timestamp
  updated_at: timestamp
}
```

### Location Object Structure

```typescript
interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}
```

### Notification Types Configuration

```typescript
interface NotificationTypes {
  orders: boolean; // Individual orders
  batches: boolean; // Batch/reel orders
  earnings: boolean; // Earnings updates
  system: boolean; // System notifications
}

interface SoundSettings {
  enabled: boolean; // Enable/disable sound notifications
  volume: number; // Volume level (0.0 to 1.0)
}
```

### Integration Flow

1. **Settings Configuration**: Shopper configures preferences in Settings → Notifications
2. **Settings Storage**: Preferences saved to `shopper_notification_settings` table
3. **Location Management**:
   - When custom locations are added, live location is automatically disabled
   - When live location is enabled, custom locations are cleared
   - Maximum 2 custom locations allowed
4. **Notification Check**: `NotificationSystem` calls `/api/shopper/check-notifications-with-settings`
5. **Age Filtering**: Only NEW orders/batches (created within last 10 minutes) are shown
6. **Sequential Location Processing**:
   - Each location is checked one by one
   - First location with matching orders gets notifications
   - Other locations are skipped to avoid duplicate notifications
7. **Distance Filtering**: Only orders within `max_distance` from each location are considered
8. **Type Filtering**: Only enabled notification types are processed
9. **Sound Settings**: Sound notifications respect user preferences (enabled/disabled, volume)
10. **Notification Display**: Filtered notifications shown to shopper

### Existing APIs Updated

- **`/api/queries/check-new-orders`**:

  - Updated to use 10-minute age filter (was 3 minutes)
  - Added notification settings integration
  - Added sound settings respect
  - Added scheduler integration (via shopper availability)
  - **Fixed**: Now uses `max_distance` from notification settings instead of hardcoded values

- **`/api/queries/notify-nearby-dashers`**:

  - Updated to use 10-minute age filter (was 20 minutes)
  - Added notification settings integration
  - Added scheduler integration (checks shopper availability)
  - Added sound settings respect
  - **Fixed**: Now uses `max_distance` from notification settings instead of hardcoded values
  - **Enhanced**: Added sequential location processing - checks each location one by one
  - **Enhanced**: Added support for custom locations vs live location toggle

- **`/api/shopper/check-notifications-with-settings`**:

  - Already includes age filtering and sound settings
  - Added `sound_settings` field to response
  - **Enhanced**: Now includes scheduler checks, shopper status, and active order checks
  - **Optimized**: Moved all logic to backend to reduce frontend complexity
  - **Enhanced**: Added sequential location processing for both regular and reel orders

- **`/api/queries/shopper-notification-settings`**:
  - Added `sound_settings` field to query response

### Frontend Components Updated

- **`NotificationTab.tsx`**:
  - **Enhanced**: Added automatic live location toggle when custom locations are added
  - **Enhanced**: Added automatic custom location clearing when live location is enabled
  - **Enhanced**: Added validation for maximum 2 custom locations
  - **Enhanced**: Added Google Maps autocomplete for address selection

### API Response Format

```typescript
interface NotificationResponse {
  success: boolean;
  notifications: Array<{
    id: string;
    type: "order" | "batch";
    shopName: string;
    distance: number;
    createdAt: string;
    customerAddress: string;
    locationName: string;
    // Additional fields based on type
  }>;
  settings: {
    use_live_location: boolean;
    max_distance: string;
    notification_types: NotificationTypes;
  };
}
```

## Core Features

### 1. Notification Conditions

Before showing any notifications, the system checks:

- **Shopper Schedule**

  - Verifies current time is within shopper's scheduled hours
  - Schedule is defined per day (e.g., Monday 9:00-18:00)
  - No notifications outside scheduled hours
  - Handles day of week conversion (Sunday = 7)

- **Active Orders**

  - One batch per shopper at a time
  - No new notifications while shopper has an active order
  - Resumes notifications after order completion/delivery

- **Shopper Status**
  - Only shows notifications if shopper is marked as active
  - Status must be explicitly enabled
  - Automatically disables notifications when inactive

### 2. Batch Distribution Logic

- **Order Processing**

  - Orders are sorted by creation time (oldest first)
  - Each order becomes a batch
  - System tracks batch assignments for 60 seconds
  - Prevents duplicate notifications for the same batch

- **Assignment Rules**
  - One batch per shopper
  - 60-second acceptance window
  - Batch expires if not accepted within time limit
  - Shopper becomes eligible for new batches after:
    - Current batch expires
    - Active order is completed
    - Previous batch is rejected

### 3. Notification Types

- **In-App Toast Notifications**

  ```
  New Batch!
  [Customer Address]
  [Store Name] (Distance in km)

  [Accept Batch] [View Details]
  ```

- **Desktop Notifications**
  - Requires browser permission
  - Shows same information as toast
  - Clicking opens batch details
  - Includes notification sound

### 4. Time Management

- **Schedule Checks**

  - Validates against shopper's defined schedule
  - Checks current day and time
  - Prevents notifications outside working hours
  - Handles timezone considerations

- **Notification Timing**

  - 60-second cooldown between notifications
  - 60-second acceptance window per batch
  - Automatic cleanup of expired assignments
  - Logging of all timing-related events

- **Age-Based Filtering**
  - Only shows NEW orders/batches (created within last 10 minutes)
  - Prevents notifications for old/stale orders
  - Ensures shoppers only see fresh opportunities
  - Applies to both regular orders and reel orders (batches)

### 5. Sound Settings

- **Sound Configuration**

  - Enable/disable sound notifications per user preference
  - Configurable volume level (0-100%)
  - Settings stored in `sound_settings` object
  - Real-time application of sound preferences

- **Sound Integration**
  - Sound only plays when enabled in user settings
  - Volume respects user configuration
  - Fallback to default settings if not configured
  - Logging of sound-related events

## Technical Implementation

### API Endpoints Required

1. `/api/shopper/schedule`

   - Returns shopper's availability schedule

2. `/api/queries/check-new-orders`

   - Main API for checking NEW orders (10-minute age filter)
   - Includes sound notifications and travel time calculations
   - Usage: `GET /api/queries/check-new-orders?latitude=<lat>&longitude=<lng>`

3. `/api/shopper/check-notifications-with-settings`

   - Settings-aware notification API with age filtering
   - Respects user notification preferences and sound settings
   - Usage: `GET /api/shopper/check-notifications-with-settings?user_id=<uuid>`

4. `/api/test/notification-settings-integration`

   - Test endpoint to verify notification settings integration

- **`/api/test/check-orders-in-zone`**: Test endpoint to check what orders are in the shopper's zone based on their notification preferences
  - Tests settings retrieval and notification API integration
  - Usage: `GET /api/test/notification-settings-integration`
  - Format: `{ schedule: Array<{ day_of_week: number, start_time: string, end_time: string, is_available: boolean }> }`

2. `/api/shopper/activeOrders`

   - Returns shopper's current active orders
   - Format: `{ orders: Array<Order> }`

3. `/api/shopper/status`

   - Returns shopper's active status
   - Format: `{ isActive: boolean }`

4. `/api/shopper/availableOrders`
   - Returns available orders for assignment
   - Includes location-based filtering
   - Format: `Array<Order>`

### Key Interfaces

```typescript
interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
}

interface ShopperSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}
```

### Error Handling

- Schedule check failures default to no notifications
- Active order check failures assume shopper is busy
- Status check failures default to inactive
- All errors are logged for debugging
- Graceful degradation of features

## Usage Example

1. **Shopper Setup**

   ```typescript
   // Set schedule
   POST / api / shopper / schedule;
   {
     schedule: [
       {
         day_of_week: 1,
         start_time: "09:00",
         end_time: "18:00",
         is_available: true,
       },
       // ... other days
     ];
   }

   // Enable active status
   POST / api / shopper / status;
   {
     isActive: true;
   }
   ```

2. **Component Integration**
   ```typescript
   <NotificationSystem
     onAcceptBatch={(orderId) => {
       // Handle batch acceptance
     }}
     onViewBatchDetails={(orderId) => {
       // Show batch details modal
     }}
     currentLocation={userLocation}
   />
   ```

## Best Practices

1. **Schedule Management**

   - Set realistic working hours
   - Update schedule regularly
   - Consider break times

2. **Order Handling**

   - Complete current order before accepting new ones
   - Check batch details before accepting
   - Maintain active status during working hours

3. **System Monitoring**
   - Monitor notification logs
   - Track acceptance rates
   - Review schedule adherence

## Troubleshooting

Common issues and solutions:

1. **No Notifications**

   - Check shopper status is active
   - Verify current time is within schedule
   - Ensure no active orders exist
   - Check browser notification permissions

2. **Multiple Notifications**

   - Check batch assignment cleanup
   - Verify cooldown period
   - Review assignment tracking

3. **Timing Issues**
   - Validate timezone settings
   - Check schedule format
   - Review server-client time sync

# Logging System

## Overview

The logging system provides comprehensive logging capabilities for both client and server-side operations, with a web interface for real-time monitoring and filtering.

## Features

### 1. Dual Environment Support

- **Client-side Logging**

  - Uses localStorage for temporary storage
  - Maintains last 1000 log entries
  - Automatic cleanup of old entries
  - Console mirroring for development

- **Server-side Logging**
  - Daily log file creation
  - Automatic cleanup after 24 hours
  - Buffer system (100 entries before flush)
  - File-based persistent storage

### 2. Log Levels

```typescript
type LogLevel = "log" | "error" | "warn" | "info" | "debug";
```

Each level has distinct color coding:

- Error: Red (#FF4D4F)
- Warning: Orange (#FAAD14)
- Info: Blue (#1890FF)
- Debug: Purple (#722ED1)
- Log: Green (#52C41A)

### 3. Log Entry Structure

```typescript
interface LogEntry {
  timestamp: string;
  type: LogLevel;
  message: string;
  component?: string;
  details?: any;
}
```

### 4. Web Interface (/dev/logs)

- Real-time log viewing
- Type-based filtering
- Component-based filtering
- Text search capability
- Auto-refresh (60-second intervals)
- Dark theme interface
- JSON details formatting
- Clear logs functionality

## Usage Examples

### 1. Basic Logging

```typescript
import { logger } from "@/utils/logger";

// Basic log
logger.log("Order processed successfully");

// With component
logger.info("Payment received", "PaymentSystem");

// With details
logger.debug("Order details", "OrderSystem", {
  orderId: "123",
  total: 1500,
  items: ["item1", "item2"],
});

// Error logging
try {
  // ... some operation
} catch (error) {
  logger.error("Failed to process order", "OrderSystem", error);
}
```

### 2. Component Integration

```typescript
function PaymentComponent() {
  useEffect(() => {
    logger.info("Payment component mounted", "PaymentSystem");
    return () => {
      logger.info("Payment component unmounted", "PaymentSystem");
    };
  }, []);
}
```

### 3. API Route Logging

```typescript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("Processing payment", "PaymentAPI", {
      method: req.method,
      body: req.body,
    });
    // ... handle request
  } catch (error) {
    logger.error("Payment processing failed", "PaymentAPI", error);
    res.status(500).json({ error: "Payment failed" });
  }
}
```

## Best Practices

1. **Component Logging**

   - Always specify component name
   - Log lifecycle events
   - Include relevant context
   - Use appropriate log levels

2. **Error Logging**

   - Include error stack traces
   - Log error context
   - Use error level appropriately
   - Add recovery attempts

3. **Performance Considerations**

   - Use debug level for verbose logs
   - Include relevant details only
   - Consider log entry size
   - Monitor storage usage

4. **Security**
   - Never log sensitive data
   - Sanitize error messages
   - Restrict logs access
   - Regular log cleanup

## Technical Implementation

### Logger Types

```typescript
interface Logger {
  log(message: string, component?: string, details?: any): void;
  error(message: string, component?: string, details?: any): void;
  warn(message: string, component?: string, details?: any): void;
  info(message: string, component?: string, details?: any): void;
  debug(message: string, component?: string, details?: any): void;
  getLogs(): Promise<LogEntry[]>;
  clearLogs(): Promise<void>;
}
```

### Environment Detection

```typescript
const logger = typeof window === "undefined" ? serverLogger : clientLogger;
```

### Storage Management

- Client: localStorage with entry limit
- Server: Daily rotating log files
- Automatic cleanup of old entries/files
- Buffer system for performance

## Monitoring Interface

The `/dev/logs` page provides:

1. **Filtering Options**

   - By log level (error, warn, info, debug, log)
   - By component name
   - By text content
   - Real-time updates

2. **Visual Features**

   - Dark theme interface
   - Color-coded log levels
   - Formatted JSON details
   - Timestamp display
   - Component highlighting

3. **Controls**
   - Manual refresh
   - Auto-refresh toggle
   - Clear logs option
   - Export capability

# Plasa Profile Management

## Overview

The Plasa profile management system allows users to update their delivery service provider information. This includes personal details, contact information, and required documentation.

## Features

### Profile Information

- Full Name
- Phone Number
- Address
- Transport Mode Selection
  - Car
  - Motorcycle
  - Bicycle
  - On Foot

### Required Documentation

1. Profile Photo

   - Clear photo of the user
   - Required for identification
   - Compressed for optimal storage

2. National ID
   - Photo of valid national identification
   - Required for verification
   - Must be clearly visible

### Transport Mode Specific Requirements

- If transport mode is not "On Foot", additional documentation may be required
- System automatically shows/hides relevant fields based on transport mode

## Update Process

1. **Information Update**

   - Users can update their profile information through the Update Plasa Drawer
   - All changes require review before activation
   - Status changes to "pending" during review

2. **Photo Capture**

   - Built-in camera functionality for profile and ID photos
   - Image compression for optimal storage
   - Preview capability before submission
   - Retake option available

3. **Validation**

   - Required fields validation
   - Photo presence verification
   - Transport mode specific validations

4. **Submission Flow**
   - All updates are sent for review
   - User is logged out after submission
   - Changes take effect after approval

## Technical Details

### Components

- `UpdatePlasaDrawer.tsx`: Main component for profile updates
- Camera integration for photo capture
- Image compression utility
- Form validation system

### State Management

- Form values
- Photo states
- Loading states
- Validation states

### API Integration

- Profile update endpoint
- Photo upload handling
- Status management

### Security

- Session validation
- Required authentication
- Secure photo handling

## UI/UX Features

### Form Elements

- Input validation
- Error messaging
- Loading states
- Success notifications

### Photo Management

- Live camera preview
- Photo capture
- Image compression
- Preview functionality

### Responsive Design

- Mobile-friendly interface
- Adaptive layout
- Touch-friendly controls

## Status Management

### Profile Statuses

- Pending: Under review
- Active: Approved and active
- Inactive: Temporarily disabled

### Update Process

1. User submits updates
2. Status changes to "pending"
3. Admin review
4. Status updates based on review
5. User notified of changes

## Error Handling

- Form validation errors
- Photo capture errors
- API integration errors
- Network issues
- Session management

## Best Practices

1. Always verify photo quality
2. Ensure all required fields are filled
3. Keep information up to date
4. Follow transport mode requirements
5. Maintain valid documentation

## Future Enhancements

- Real-time status updates
- Enhanced photo validation
- Additional transport modes
- Extended documentation options
- Improved mobile experience

# Complex System Logic Documentation

## 1. Profile Management System

### Core Components

- Location: `src/components/shopper/profile/UpdateShopperDrawer.tsx`
- Purpose: Handles Plasa profile updates and document management

### Key Features

1. **Document Management**

   - Profile photo capture and validation
   - National ID verification
   - Image compression and optimization
   - Real-time preview functionality

2. **Form State Management**

   - Multi-step form validation
   - Real-time field validation
   - Error state handling
   - Loading state management

3. **Data Flow**
   - Client-side validation
   - Server-side verification
   - Status updates
   - Error recovery

## 2. Notification System

### Core Components

- Location: `src/components/shopper/NotificationSystem.tsx`
- Purpose: Real-time order notification and management

### Key Features

1. **Schedule Management**

   ```typescript
   interface ShopperSchedule {
     day_of_week: number;
     start_time: string;
     end_time: string;
     is_available: boolean;
   }
   ```

2. **Order Processing**

   - Real-time order notifications
   - Batch assignment system
   - Location-based filtering
   - Priority-based distribution

3. **State Management**
   - Active order tracking
   - Schedule validation
   - Location updates
   - Notification preferences

## 3. Order Management System

### Core Components

- Location: `src/components/shopper/batchDetails.tsx`
- Purpose: Handles order lifecycle and payment processing

### Key Features

1. **Order Lifecycle**

   - Status transitions
   - Payment processing
   - Invoice generation
   - Delivery confirmation

2. **Payment System**

   - OTP verification
   - Refund processing
   - Wallet integration
   - Transaction logging

3. **Document Generation**
   - Invoice creation
   - Receipt generation
   - Order history
   - Payment records

## 4. Dashboard and Map Integration

### Core Components

- Location: `src/components/shopper/dashboard/MapSection.tsx`
- Purpose: Real-time location tracking and order visualization

### Key Features

1. **Location Services**

   - Real-time tracking
   - Geofencing
   - Route optimization
   - Distance calculations

2. **Order Visualization**

   - Map markers
   - Order clustering
   - Route display
   - Status indicators

3. **Integration Points**
   - Google Maps API
   - Location services
   - Real-time updates
   - State management

## 5. Schedule Management

### Core Components

- Location: `src/components/shopper/profile/ShopperProfileComponent.tsx`
- Purpose: Manages Plasa availability and working hours

### Key Features

1. **Schedule Configuration**

   ```typescript
   interface TimeSlot {
     day: string;
     startTime: string;
     endTime: string;
     available: boolean;
   }
   ```

2. **Availability Management**

   - Weekly schedule
   - Time slot validation
   - Break management
   - Status updates

3. **Integration**
   - Calendar sync
   - Notification system
   - Order assignment
   - Status updates

## 6. Payment and Wallet System

### Core Components

- Multiple components across the application
- Purpose: Handles financial transactions and wallet management

### Key Features

1. **Wallet Management**

   - Balance tracking
   - Transaction history
   - Payment processing
   - Refund handling

2. **Payment Processing**

   - OTP verification
   - Transaction validation
   - Error recovery
   - Receipt generation

3. **Security Features**
   - Encryption
   - Token management
   - Session validation
   - Error handling

## 7. Logging and Monitoring System

### Core Components

- Location: `pages/api/logs/read.ts` and `pages/api/queries/system-logs.ts`
- Purpose: System-wide logging and monitoring

### Key Features

1. **Log Management**

   ```typescript
   interface LogEntry {
     type: LogLevel;
     message: string;
     component: string;
     details?: any;
     timestamp: string;
   }
   ```

2. **Monitoring Features**

   - Real-time logging
   - Error tracking
   - Performance monitoring
   - System health checks

3. **Integration Points**
   - API endpoints
   - Client-side logging
   - Server-side logging
   - Error reporting

## 8. API Utilities and Error Handling

### Core Components

- Location: `src/lib/apiUtils.ts`
- Purpose: Centralized API management and error handling

### Key Features

1. **API Management**

   - Request handling
   - Response validation
   - Error recovery
   - Retry logic

2. **Error Handling**

   - Error categorization
   - Recovery strategies
   - User feedback
   - Logging integration

3. **Security Features**
   - Authentication
   - Authorization
   - Token management
   - Session handling

## 9. Order Sorting and Filtering

### Core Components

- Location: `src/components/shopper/dashboard/ShopperDashboard.tsx`
- Purpose: Manages order display and prioritization

### Key Features

1. **Sorting Logic**

   ```typescript
   type SortCriteria = "newest" | "earnings" | "distance" | "priority";
   ```

2. **Filtering System**

   - Multiple criteria
   - Real-time updates
   - Priority management
   - Distance calculations

3. **Performance Optimization**
   - Memoization
   - Caching
   - Lazy loading
   - State management

## 10. Registration and Onboarding

### Core Components

- Location: `src/components/shopper/ShopperRegistrationForm.tsx`
- Purpose: Handles Plasa registration and verification

### Key Features

1. **Registration Process**

   - Multi-step form
   - Document verification
   - Status management
   - Error handling

2. **Verification System**

   - Document validation
   - Identity verification
   - Status updates
   - Notification system

3. **Integration Points**
   - API endpoints
   - Document storage
   - Status management
   - User feedback

## Technical Patterns

### 1. State Management

```typescript
// Example of state management pattern
const [state, setState] = useState<StateType>(initialState);
const stateRef = useRef<StateType>(initialState);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 2. Error Handling

```typescript
// Example of error handling pattern
try {
  // Operation
} catch (error) {
  logger.error("Operation failed", "ComponentName", error);
  // Recovery logic
} finally {
  // Cleanup
}
```

### 3. Real-time Updates

```typescript
// Example of real-time update pattern
useEffect(() => {
  const interval = setInterval(() => {
    // Update logic
  }, updateInterval);
  return () => clearInterval(interval);
}, [dependencies]);
```

### 4. Security

```typescript
// Example of security pattern
const validateSession = async () => {
  const session = await getSession();
  if (!session) {
    redirectToLogin();
    return;
  }
  // Continue with protected operation
};
```

### 5. Performance Optimization

```typescript
// Example of performance optimization pattern
const memoizedComponent = React.memo(({ prop }) => {
  // Component logic
});

const memoizedValue = useMemo(() => {
  return expensiveComputation(prop);
}, [prop]);
```

## Best Practices

1. **Code Organization**

   - Modular components
   - Clear separation of concerns
   - Consistent naming conventions
   - Proper file structure

2. **Error Handling**

   - Comprehensive error catching
   - User-friendly error messages
   - Proper error logging
   - Recovery strategies

3. **Performance**

   - Memoization where appropriate
   - Lazy loading of components
   - Efficient state management
   - Optimized rendering

4. **Security**

   - Input validation
   - Session management
   - Secure API calls
   - Data encryption

5. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests
   - Performance testing

## Future Enhancements

1. **System Improvements**

   - Enhanced error recovery
   - Improved performance
   - Better state management
   - Advanced caching

2. **Feature Additions**

   - Advanced analytics
   - Enhanced reporting
   - Additional payment methods
   - Improved notification system

3. **Technical Upgrades**
   - TypeScript improvements
   - React optimization
   - API enhancements
   - Security upgrades

# Navigation and Vehicle Management System

## Navigation System

### Core Components

- Location: `src/components/shopper/ShopperSidebar.tsx` and `src/components/ui/NavBar/bottomBar.tsx`
- Purpose: Handles navigation between different sections of the Plasa application

### Navigation Features

1. **Desktop Navigation**

   - Sidebar-based navigation
   - Persistent across pages
   - Real-time active state tracking
   - Smooth transitions between pages
   - Cached page loading for better performance

2. **Mobile Navigation**

   - Bottom bar navigation
   - Floating action buttons
   - Quick access to key features
   - Responsive design
   - Touch-friendly interface

3. **Navigation Items**

   - Available Batches
   - Active Batches
   - Earnings (with real-time updates)
   - Settings
   - Profile Management

4. **Performance Optimizations**
   - Shallow routing for instant navigation
   - Page caching to prevent rebuilds
   - State preservation between routes
   - Optimized re-renders

## Vehicle Management System

### Core Components

- Location: `src/components/shopper/profile/VehicleManagement.tsx`
- Purpose: Manages delivery vehicle information and documentation

### Features

1. **Vehicle Information**

   - Vehicle Type Selection
   - License Plate Number
   - Vehicle Photos
   - Documentation Upload
   - Vehicle Status Tracking

2. **Documentation Requirements**

   - Vehicle Registration
   - Insurance Documents
   - License Information
   - Vehicle Photos (multiple angles)
   - Compliance Certificates

3. **Status Management**

   - Pending Review
   - Approved
   - Rejected
   - Under Maintenance
   - Active/Inactive

4. **Ticket System**
   - Raise Support Tickets
   - Track Ticket Status
   - Communication with Support
   - Resolution Tracking
   - History Management

### Ticket Management

1. **Ticket Creation**

   - Subject Line
   - Detailed Description
   - Priority Level
   - Category Selection
   - Attachment Support

2. **Ticket Categories**

   - Vehicle Issues
   - Documentation Problems
   - Technical Support
   - Account Issues
   - General Inquiries

3. **Priority Levels**

   - High Priority
   - Medium Priority
   - Low Priority
   - Urgent

4. **Ticket Flow**
   - Creation
   - Assignment
   - Response
   - Resolution
   - Feedback

### Technical Implementation

1. **State Management**

   ```typescript
   interface VehicleState {
     type: string;
     licensePlate: string;
     photos: string[];
     documents: Document[];
     status: VehicleStatus;
   }

   interface TicketState {
     subject: string;
     description: string;
     priority: Priority;
     category: Category;
     status: TicketStatus;
   }
   ```

2. **API Integration**

   - Vehicle CRUD operations
   - Document upload handling
   - Ticket management
   - Status updates
   - Notification system

3. **UI Components**
   - Vehicle form
   - Document uploader
   - Ticket creation drawer
   - Status indicators
   - Progress tracking

### Best Practices

1. **Vehicle Management**

   - Regular document updates
   - Photo quality verification
   - Status monitoring
   - Compliance checking

2. **Ticket Handling**

   - Clear communication
   - Proper categorization
   - Priority assessment
   - Timely responses

3. **Documentation**
   - Complete information
   - Valid documents
   - Regular updates
   - Compliance verification

### Security Features

1. **Document Security**

   - Secure upload
   - Access control
   - Data encryption
   - Privacy protection

2. **Ticket Security**
   - User authentication
   - Data validation
   - Access restrictions
   - Audit logging

### Future Enhancements

1. **Vehicle Management**

   - Real-time tracking
   - Maintenance scheduling
   - Performance analytics
   - Automated compliance

2. **Ticket System**
   - AI-powered categorization
   - Automated responses
   - Enhanced tracking
   - Integration with CRM

# Grocery Store Application

## Search Functionality

### User Dashboard Search

The application provides a comprehensive search system that allows users to find shops and products efficiently.

#### Features

1. **Category-based Search**

   - Users can filter shops by categories:
     - Super Market
     - Public Markets
     - Bakeries
     - Butchers
     - Delicatessen
     - Organic Shops
     - Specialty Foods
   - Each category has a unique icon for easy identification
   - Categories are displayed in a responsive grid on desktop
   - Mobile users get a dropdown menu for category selection

2. **Search Implementation**

   ```typescript
   const filteredShops = useMemo(() => {
     if (!authReady || role === "shopper") return [];

     return selectedCategory
       ? data.shops?.filter((shop) => shop.category_id === selectedCategory) ||
           []
       : data.shops || [];
   }, [authReady, role, selectedCategory, data.shops]);
   ```

3. **Search Features**

   - Real-time filtering
   - Category-based filtering
   - Responsive design for both mobile and desktop
   - Clear filter option
   - Loading states during search
   - Error handling for failed searches

4. **Mobile Experience**

   - Dropdown menu for category selection
   - Easy-to-use interface
   - Clear visual feedback
   - Smooth transitions

5. **Desktop Experience**
   - Grid layout for categories
   - Visual indicators for selected category
   - Hover effects for better interaction
   - Clear filter button when category is selected

### Usage

1. **Selecting a Category**

   - On desktop: Click on any category card in the grid
   - On mobile: Use the dropdown menu to select a category
   - The selected category will be highlighted
   - Shops will be filtered automatically

2. **Clearing Selection**

   - On desktop: Click the "Clear Filter" button
   - On mobile: Use the "Clear Selection" option in the dropdown
   - All shops will be displayed again

3. **Viewing Results**
   - Filtered shops are displayed in a responsive grid
   - Each shop card shows:
     - Shop image
     - Name
     - Description
     - Distance
     - Estimated delivery time
     - Open/Closed status

### Technical Implementation

1. **State Management**

   ```typescript
   const [selectedCategory, setSelectedCategory] = useState<string | null>(
     null
   );
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   ```

2. **Error Handling**

   ```typescript
   try {
     setSelectedCategory(categoryId);
     setIsLoading(false);
   } catch (err) {
     setError("Failed to filter shops. Please try again.");
     setIsLoading(false);
   }
   ```

3. **Loading States**
   - Skeleton loading for categories
   - Skeleton loading for shop cards
   - Smooth transitions between states

### Best Practices

1. **Performance**

   - Using `useMemo` for filtered results
   - Lazy loading of images
   - Efficient state updates

2. **Accessibility**

   - Clear visual indicators
   - Proper ARIA labels
   - Keyboard navigation support

3. **User Experience**
   - Immediate feedback on actions
   - Clear error messages
   - Smooth transitions
   - Responsive design

### Future Improvements

1. **Planned Features**

   - Advanced search filters
   - Search by shop name
   - Search by product
   - Price range filters
   - Rating filters

2. **Technical Enhancements**
   - Search debouncing
   - Caching of search results
   - Improved error handling
   - Better loading states

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

# Grocery Delivery App

## Delivery Photo Upload Feature

### Overview

The delivery photo upload feature ensures that delivery confirmation photos are properly captured, uploaded, and stored in the database. The system includes safeguards to prevent data loss during the upload process.

### Key Features

#### 1. Photo Capture

- Camera integration for direct photo capture
- Support for file upload as an alternative
- Real-time preview of captured photos
- Image compression and validation

#### 2. Upload Process

- Automatic upload to server after capture
- Progress tracking during upload
- Error handling and retry capabilities
- Validation of file types and sizes

#### 3. Persistence

- Upload state is preserved across page refreshes
- Modal remains open until upload completes
- Prevents accidental closure during upload
- Automatic state recovery after page refresh

### Technical Implementation

#### State Management

```typescript
// Local storage keys
const UPLOAD_STATE_KEY = `delivery_upload_${orderId}`;

// States
const [photoUploading, setPhotoUploading] = useState(false);
const [photoUploaded, setPhotoUploaded] = useState(false);
const [forceOpen, setForceOpen] = useState(false);
```

#### Upload Process

1. Photo capture/selection
2. State saved to localStorage
3. Upload to server
4. Database update
5. State cleanup

#### Error Handling

- Network errors
- Invalid file types
- Size limitations
- Server errors

### API Endpoints

#### Upload Delivery Photo

```typescript
POST /api/shopper/uploadDeliveryPhoto
Content-Type: application/json

{
  "orderId": "uuid",
  "file": "base64_image_data"
}
```

### Database Schema

#### Orders Table

```sql
ALTER TABLE orders
ADD COLUMN delivery_photo TEXT;
```

### Usage

1. Open Delivery Confirmation Modal
2. Choose capture method:
   - Take Photo (camera)
   - Upload Photo (file)
3. Preview and confirm photo
4. Wait for upload completion
5. View confirmation

### Safety Features

1. **Upload Protection**

   - Modal cannot be closed during upload
   - State persists across page refreshes
   - Clear upload progress indicators

2. **Data Validation**

   - File type checking
   - Size limitations
   - Image compression

3. **Error Recovery**
   - Automatic retry on failure
   - Clear error messages
   - State preservation

### Best Practices

1. **Photo Capture**

   - Use good lighting
   - Ensure package is clearly visible
   - Include delivery location context

2. **Upload Process**

   - Maintain stable internet connection
   - Don't close browser during upload
   - Wait for confirmation message

3. **Troubleshooting**
   - Check internet connection
   - Verify file size and type
   - Contact support if issues persist

### Technical Requirements

- Modern web browser with camera access
- JavaScript enabled
- Local storage support
- Stable internet connection

### Security Considerations

1. **Data Protection**

   - Secure API endpoints
   - Authentication required
   - Data validation

2. **Privacy**
   - Camera permission handling
   - Secure storage
   - Data cleanup

### Future Improvements

1. **Planned Features**

   - Multiple photo upload
   - Photo editing capabilities
   - Offline support
   - Automatic retry

2. **Performance**
   - Enhanced compression
   - Faster upload speeds
   - Better error handling

### Support

For technical issues or questions, please contact:

- Technical Support: support@example.com
- Bug Reports: bugs@example.com

## Nearby Dasher Notification Logic

The API route at `pages/api/queries/notify-nearby-dashers.ts` is responsible for notifying available dashers (shoppers) about new batches (orders) at nearby shops. This helps dashers quickly claim new work in their area.

**How it works:**

1. **Fetch Recent Batches:**
   - Finds all orders with status `PENDING` created in the last 20 minutes.
2. **Fetch Available Dashers:**
   - Gets all dashers who are currently available, along with their last known location.
3. **Group Batches by Shop:**
   - Groups the available batches by their shop.
4. **Calculate Distance:**
   - For each dasher, calculates the travel time (in minutes) from their last known location to each shop with available batches, using the Google Maps Distance Matrix API.
5. **Find Nearby Batches:**
   - If a shop is within 10 minutes travel time of a dasher, all its batches are considered "nearby" for that dasher.
6. **Create Notification:**
   - If there are any nearby batches for a dasher, a notification is created for that dasher, summarizing how many new batches are available and at which shops.
7. **Insert Notifications:**
   - All notifications are inserted into the database in a single batch.

**Purpose:**

- This endpoint is typically triggered by a scheduled job or backend process every few minutes to proactively alert dashers about new work opportunities close to them.
- Dashers receive a notification if there are new batches at shops within a 10-minute travel distance, so they can act quickly to claim those orders.

# Grocery Delivery App

## Notification System

### Overview

The notification system provides real-time order notifications to shoppers with persistent toast notifications that stay visible until specific conditions are met. The system uses react-hot-toast for reliable toast management and includes advanced features like location-based filtering, notification preferences, and two-stage notification alerts.

### Key Features

#### 1. Persistent Toast Notifications

- **Duration**: Toasts stay visible until manually closed or order expires
- **Replacement**: New notifications replace existing ones for the same order
- **Custom Design**: Beautiful, responsive toast components with action buttons
- **Type Support**: Info, success, warning, and error notification types

#### 2. Two-Stage Notification System

- **Initial Notification**: Shows immediately when order is assigned (60 seconds)
- **Warning Notification**: Shows after 40 seconds if not accepted (20 seconds remaining)
- **Automatic Cleanup**: Toasts are removed when orders expire or are accepted

#### 3. Location-Based Filtering

- **Live Location**: Use current GPS location for notifications
- **Custom Locations**: Up to 2 saved locations for notification preferences
- **Distance Filtering**: Maximum distance setting (default: 10km)
- **Age Filtering**: Only new orders within 10 minutes

#### 4. Notification Preferences

- **Sound Settings**: Enable/disable sound with volume control
- **Notification Types**: Filter by order types (regular, reel, etc.)
- **Schedule Integration**: Respect shopper availability schedules
- **Active Order Check**: Don't notify if shopper has active orders

### Technical Implementation

#### Component Structure

```typescript
// Main notification system component
src / components / shopper / NotificationSystem.tsx;

// Key interfaces
interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
  expiresAt: number;
  warningShown: boolean;
  warningTimeout: NodeJS.Timeout | null;
}
```

#### Toast Management

```typescript
// Toast tracking system
const activeToasts = useRef<Map<string, any>>(new Map());

// Remove existing toast for order
const removeToastForOrder = (orderId: string) => {
  const existingToast = activeToasts.current.get(orderId);
  if (existingToast) {
    toast.dismiss(existingToast);
    activeToasts.current.delete(orderId);
  }
};
```

#### Custom Toast Components

```typescript
// Initial notification toast
const toastKey = toast.custom(
  (t) => (
    <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
      {/* Toast content with action buttons */}
    </div>
  ),
  {
    duration: Infinity, // Never auto-dismiss
    position: "top-right",
  }
);
```

### API Endpoints

#### 1. Check Notifications with Settings

```typescript
POST /api/shopper/check-notifications-with-settings
{
  "user_id": "uuid",
  "current_location": {
    "lat": number,
    "lng": number
  }
}

// Response
{
  "success": true,
  "notifications": [...],
  "settings": {
    "sound_settings": {
      "enabled": boolean,
      "volume": number
    },
    "notification_preferences": {
      "live_location": boolean,
      "custom_locations": [...],
      "max_distance": number,
      "notification_types": [...]
    }
  }
}
```

#### 2. Save Notification Settings

```typescript
POST /api/shopper/save-notification-settings
{
  "user_id": "uuid",
  "settings": {
    "live_location": boolean,
    "custom_locations": [
      {
        "name": string,
        "lat": number,
        "lng": number
      }
    ],
    "max_distance": number,
    "notification_types": string[],
    "sound_settings": {
      "enabled": boolean,
      "volume": number
    }
  }
}
```

### Database Schema

#### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  shop_name VARCHAR(255),
  distance DECIMAL(10,2),
  location_name VARCHAR(255),
  customer_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);
```

#### Shopper Notification Settings Table

```sql
CREATE TABLE shopper_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  live_location BOOLEAN DEFAULT TRUE,
  custom_locations JSONB DEFAULT '[]',
  max_distance INTEGER DEFAULT 10,
  notification_types TEXT[] DEFAULT '{}',
  sound_settings JSONB DEFAULT '{"enabled": true, "volume": 0.7}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Notification Flow

#### 1. Initial Assignment

```
Order Created → Check Shopper Availability → Assign to Shopper → Show Initial Toast
```

#### 2. Warning Stage

```
40 seconds → Show Warning Toast → 20 seconds remaining → Auto-reassign
```

#### 3. Cleanup

```
Order Expires → Remove Toast → Reassign to Next Shopper
```

### Configuration Options

#### Notification Preferences

- **Live Location**: Use current GPS location
- **Custom Locations**: Up to 2 saved locations
- **Max Distance**: Filter orders by distance (1-50km)
- **Notification Types**: Filter by order types
- **Sound Settings**: Enable/disable with volume control

#### Timing Settings

- **Check Interval**: 60 seconds between checks
- **Assignment Timeout**: 60 seconds per assignment
- **Warning Delay**: 40 seconds before warning
- **Age Filter**: Only orders within 10 minutes

### Usage Examples

#### Basic Implementation

```typescript
import NotificationSystem from "../components/shopper/NotificationSystem";

function ShopperDashboard() {
  return (
    <div>
      <NotificationSystem
        currentLocation={userLocation}
        onAcceptBatch={handleAcceptBatch}
        onViewBatchDetails={handleViewDetails}
      />
    </div>
  );
}
```

#### With Custom Settings

```typescript
// Notification settings component
<NotificationTab
  settings={notificationSettings}
  onSave={handleSaveSettings}
  onTest={handleTestNotifications}
/>
```

### Error Handling

#### Common Issues

1. **Location Permission Denied**

   - Fallback to saved locations
   - Show permission request dialog

2. **Network Errors**

   - Retry with exponential backoff
   - Show offline indicator

3. **Toast Dismissal**
   - Proper cleanup of active toasts
   - Remove from tracking system

### Performance Considerations

#### Optimization Strategies

- **Debounced Location Updates**: Prevent excessive API calls
- **Toast Pooling**: Limit concurrent toasts
- **Memory Management**: Clean up expired assignments
- **Caching**: Cache notification settings

#### Monitoring

- **Toast Lifecycle**: Track creation, dismissal, replacement
- **API Performance**: Monitor response times
- **User Engagement**: Track acceptance rates

### Security Features

#### Data Protection

- **Authentication**: All endpoints require valid session
- **Authorization**: Users can only access their own notifications
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse

#### Privacy

- **Location Data**: Encrypted storage and transmission
- **Notification History**: Automatic cleanup of old data
- **User Consent**: Explicit permission for notifications

### Testing

#### Manual Testing

1. **Toast Persistence**: Verify toasts stay visible
2. **Replacement Logic**: Test new notifications replacing old ones
3. **Expiration Cleanup**: Confirm automatic removal
4. **Action Buttons**: Test accept and view details functionality

#### Automated Testing

```typescript
// Example test cases
describe("NotificationSystem", () => {
  test("toast stays visible until order expires", () => {
    // Test implementation
  });

  test("new notification replaces existing toast", () => {
    // Test implementation
  });

  test("warning notification shows after 40 seconds", () => {
    // Test implementation
  });
});
```

### Troubleshooting

#### Common Problems

1. **Toasts Disappearing Too Soon**

   - Check duration settings
   - Verify react-hot-toast configuration
   - Ensure proper cleanup logic

2. **Notifications Not Showing**

   - Check location permissions
   - Verify notification settings
   - Confirm API connectivity

3. **Performance Issues**
   - Monitor toast count
   - Check memory usage
   - Review API response times

### Future Enhancements

#### Planned Features

- **Push Notifications**: Browser push notifications
- **Offline Support**: Queue notifications when offline
- **Advanced Filtering**: More granular notification preferences
- **Analytics**: Detailed notification performance metrics

#### Technical Improvements

- **WebSocket Integration**: Real-time notifications
- **Service Worker**: Background notification handling
- **Progressive Web App**: Native app-like experience

### Support

For technical issues or questions about the notification system:

- **Documentation**: Check this README section
- **Code Examples**: See component implementation
- **API Reference**: Review endpoint documentation
- **Bug Reports**: Contact development team

---

## Delivery Photo Upload Feature

---

# Dynamic Currency System

## Overview

The grocery delivery application implements a dynamic currency system that allows administrators to configure the currency used throughout the application via the `System_configuratioins` table. This ensures consistency across all components and eliminates hardcoded currency values.

## Architecture

### System Configuration Table

The currency is stored in the `System_configuratioins` table:

```sql
System_configuratioins {
  id: uuid (primary key)
  currency: string (e.g., "RWF", "USD", "EUR")
  baseDeliveryFee: string
  serviceFee: string
  deliveryCommissionPercentage: string
  productCommissionPercentage: string
  // ... other configuration fields
}
```

### Currency Utility Functions

The system provides several utility functions for currency formatting:

```typescript
// src/utils/formatCurrency.ts

// Dynamic currency formatter (async)
export const formatCurrency = async (amount: string | number) => {
  const config = await getSystemConfiguration();
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Synchronous version (uses cached config)
export const formatCurrencySync = (amount: string | number) => {
  const config = systemConfigCache || { currency: "RWF" };
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get currency symbol
export const getCurrencySymbol = () => {
  const config = systemConfigCache || { currency: "RWF" };
  return config.currency;
};

// Refresh cache
export const refreshCurrencyCache = () => {
  systemConfigCache = null;
  cacheTimestamp = 0;
};
```

## Caching System

### Cache Management

- **Cache Duration**: 5 minutes
- **Automatic Refresh**: Fetches new config when cache expires
- **Fallback**: Uses default currency (RWF) if fetch fails
- **Manual Refresh**: `refreshCurrencyCache()` function available

### Cache Implementation

```typescript
// Cache for system configuration
let systemConfigCache: { currency: string } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch system configuration
async function getSystemConfiguration() {
  const now = Date.now();

  // Return cached config if still valid
  if (systemConfigCache && now - cacheTimestamp < CACHE_DURATION) {
    return systemConfigCache;
  }

  try {
    const response = await fetch("/api/queries/system-configuration");
    const data = await response.json();

    if (data.success && data.config) {
      systemConfigCache = {
        currency: data.config.currency || "RWF",
      };
      cacheTimestamp = now;
      return systemConfigCache;
    }
  } catch (error) {
    console.warn(
      "Failed to fetch system configuration, using default currency:",
      error
    );
  }

  return { currency: "RWF" };
}
```

## Usage Examples

### Component Implementation

```typescript
import {
  formatCurrencySync,
  getCurrencySymbol,
} from "../../utils/formatCurrency";

// In a React component
function OrderCard({ order }) {
  return (
    <div>
      <p>Total: {formatCurrencySync(order.total)}</p>
      <p>Currency: {getCurrencySymbol()}</p>
    </div>
  );
}
```

### API Response Formatting

```typescript
// In API endpoints
import { formatCurrencySync } from "../../utils/formatCurrency";

export default async function handler(req, res) {
  const order = await getOrder(orderId);

  return res.json({
    success: true,
    order: {
      ...order,
      formattedTotal: formatCurrencySync(order.total),
      formattedEarnings: formatCurrencySync(order.estimatedEarnings),
    },
  });
}
```

## Components Updated

### Shopper Components

- **NotificationSystem**: Dynamic currency in notifications
- **ActiveBatchesCard**: Currency formatting in batch cards
- **PaymentModal**: Dynamic currency display
- **Earnings Components**: All earnings displays use dynamic currency
- **MapSection**: Order markers show dynamic currency

### User Components

- **UserPaymentCards**: Dynamic currency in payment displays
- **PaymentMethodSelector**: Currency formatting in checkout
- **Order Components**: All order displays use dynamic currency

### Admin Components

- **Revenue Reports**: Dynamic currency in reports
- **Analytics**: Currency-aware calculations
- **Settings**: Currency configuration interface

## Configuration

### Setting Currency

1. **Database Update**:

   ```sql
   UPDATE System_configuratioins
   SET currency = 'USD'
   WHERE id = 'your-config-id';
   ```

2. **API Endpoint**:

   ```typescript
   POST /api/admin/update-system-config
   {
     "currency": "USD"
   }
   ```

3. **Cache Refresh**:
   ```typescript
   import { refreshCurrencyCache } from "../../utils/formatCurrency";
   refreshCurrencyCache();
   ```

### Supported Currencies

The system supports all ISO 4217 currency codes:

- **RWF**: Rwandan Franc (default)
- **USD**: US Dollar
- **EUR**: Euro
- **GBP**: British Pound
- **KES**: Kenyan Shilling
- **UGX**: Ugandan Shilling
- **TZS**: Tanzanian Shilling

## Best Practices

### Performance Optimization

1. **Use Synchronous Functions**: Use `formatCurrencySync` for immediate display
2. **Cache Management**: Let the system handle cache automatically
3. **Error Handling**: Always provide fallback values

### Code Examples

```typescript
// ✅ Good: Use synchronous function for immediate display
const displayAmount = formatCurrencySync(order.total);

// ✅ Good: Provide fallback values
const displayAmount = formatCurrencySync(order.total || 0);

// ❌ Bad: Don't hardcode currency
const displayAmount = `RWF ${order.total}`;

// ❌ Bad: Don't use async in render
const displayAmount = await formatCurrency(order.total);
```

### Error Handling

```typescript
// Handle currency formatting errors
try {
  const formattedAmount = formatCurrencySync(amount);
  return formattedAmount;
} catch (error) {
  console.warn("Currency formatting failed:", error);
  return `${amount}`; // Fallback to plain number
}
```

## Migration Guide

### From Hardcoded Currency

1. **Replace Hardcoded Values**:

   ```typescript
   // Before
   const amount = `RWF ${order.total}`;

   // After
   import { formatCurrencySync } from "../../utils/formatCurrency";
   const amount = formatCurrencySync(order.total);
   ```

2. **Update Intl.NumberFormat**:

   ```typescript
   // Before
   new Intl.NumberFormat("en-RW", {
     style: "currency",
     currency: "RWF",
   }).format(amount);

   // After
   formatCurrencySync(amount);
   ```

3. **Update Currency Symbols**:

   ```typescript
   // Before
   <span>RWF</span>;

   // After
   import { getCurrencySymbol } from "../../utils/formatCurrency";
   <span>{getCurrencySymbol()}</span>;
   ```

## Testing

### Unit Tests

```typescript
describe("Currency Formatting", () => {
  test("formats currency correctly", () => {
    const result = formatCurrencySync(1000);
    expect(result).toContain("RWF");
  });

  test("handles zero amounts", () => {
    const result = formatCurrencySync(0);
    expect(result).toBe("RWF 0");
  });

  test("handles string amounts", () => {
    const result = formatCurrencySync("1500");
    expect(result).toBe("RWF 1,500");
  });
});
```

### Integration Tests

```typescript
describe("System Configuration", () => {
  test("fetches currency from API", async () => {
    const response = await fetch("/api/queries/system-configuration");
    const data = await response.json();
    expect(data.config.currency).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **Currency Not Updating**:

   - Check cache duration
   - Call `refreshCurrencyCache()`
   - Verify API response

2. **Formatting Errors**:

   - Check currency code validity
   - Verify amount is numeric
   - Handle edge cases

3. **Performance Issues**:
   - Monitor cache hit rates
   - Check API response times
   - Optimize component rendering

### Debug Tools

```typescript
// Check current currency
console.log("Current currency:", getCurrencySymbol());

// Refresh cache manually
refreshCurrencyCache();

// Check cache status
console.log("Cache timestamp:", cacheTimestamp);
```

## API Reference

### System Configuration API

```typescript
GET /api/queries/system-configuration

Response:
{
  "success": true,
  "config": {
    "currency": "RWF",
    "baseDeliveryFee": "2000",
    "serviceFee": "1000",
    // ... other config fields
  }
}
```

### Currency Utility Functions

| Function                     | Description                        | Usage             |
| ---------------------------- | ---------------------------------- | ----------------- |
| `formatCurrencySync(amount)` | Format amount with cached currency | Immediate display |
| `formatCurrency(amount)`     | Format amount with fresh currency  | Async operations  |
| `getCurrencySymbol()`        | Get current currency symbol        | Display currency  |
| `refreshCurrencyCache()`     | Clear cache and refetch            | Force update      |

## Future Enhancements

### Planned Features

- **Multi-Currency Support**: Support for multiple currencies simultaneously
- **Currency Conversion**: Real-time exchange rates
- **Regional Formatting**: Locale-specific formatting
- **Currency Preferences**: User-specific currency settings

### Technical Improvements

- **WebSocket Updates**: Real-time currency changes
- **Service Worker**: Background currency updates
- **Progressive Enhancement**: Graceful degradation

---

## Delivery Photo Upload Feature

---

# Grocery Delivery System

## Overview

A comprehensive grocery delivery platform with advanced revenue tracking, wallet management, order processing systems, and intelligent delivery time management. The system supports both regular orders and reel-based orders with sophisticated payment, revenue management, and real-time delivery tracking.

## Key Systems

### 1. Revenue Management System

### 2. Wallet Balance System

### 3. Order Processing System

### 4. Payment Management System

### 5. Reel Orders System

### 6. Delivery Time Management System

---

# Delivery Time Management System

## Overview

The delivery time management system calculates estimated delivery times for orders using a sophisticated algorithm that considers distance, altitude, shopping time, and travel time. The system provides real-time countdown timers for active orders and ensures accurate delivery time estimates.

## Delivery Time Calculation Algorithm

### Formula

```
Total Delivery Time = Travel Time + Shopping Time
```

Where:

- **Travel Time**: Calculated from 3D distance (including altitude)
- **Shopping Time**: Configurable system parameter from `System_configuratioins.shoppingTime`

### 3D Distance Calculation

The system uses a 3D distance calculation that includes altitude differences:

```typescript
// Calculate 2D distance using Haversine formula
const distanceKm = getDistanceFromLatLonInKm(
  userLat,
  userLng,
  shopLat,
  shopLng
);

// Calculate altitude difference in kilometers
const altKm = (shopAlt - userAlt) / 1000;

// Calculate 3D distance using Pythagorean theorem
const distance3D = Math.sqrt(distanceKm * distanceKm + altKm * altKm);

// Travel time is 1 minute per kilometer
const travelTime = Math.ceil(distance3D);

// Total delivery time
const totalTimeMinutes = travelTime + shoppingTime;
```

### System Configuration Parameters

The delivery time calculation uses these configurable parameters from the `System_configuratioins` table:

- **`shoppingTime`**: Base shopping time in minutes (default: 40 minutes)
- **`baseDeliveryFee`**: Base delivery fee
- **`distanceSurcharge`**: Additional fee per km beyond base distance
- **`cappedDistanceFee`**: Maximum delivery fee cap

### Delivery Time Calculation Examples

#### Example 1: Short Distance Order

```typescript
// User location: (lat: -1.9441, lng: 30.0619, alt: 1500m)
// Shop location: (lat: -1.9440, lng: 30.0620, alt: 1500m)
// System shopping time: 40 minutes

const distanceKm = 0.1; // 100 meters
const altKm = 0; // No altitude difference
const distance3D = Math.sqrt(0.1 * 0.1 + 0 * 0) = 0.1 km;
const travelTime = Math.ceil(0.1) = 1 minute;
const totalTime = 1 + 40 = 41 minutes;

// Delivery time: 41 minutes from order placement
```

#### Example 2: Long Distance Order

```typescript
// User location: (lat: -1.9441, lng: 30.0619, alt: 1500m)
// Shop location: (lat: -1.9400, lng: 30.0700, alt: 1600m)
// System shopping time: 40 minutes

const distanceKm = 1.2; // 1.2 km
const altKm = (1600 - 1500) / 1000 = 0.1 km;
const distance3D = Math.sqrt(1.2 * 1.2 + 0.1 * 0.1) = 1.204 km;
const travelTime = Math.ceil(1.204) = 2 minutes;
const totalTime = 2 + 40 = 42 minutes;

// Delivery time: 42 minutes from order placement
```

## Real-Time Countdown Timer

### Active Batches Countdown

The system provides real-time countdown timers on active batch cards showing the remaining time until delivery:

```typescript
// Countdown calculation
const now = new Date();
const deliveryTime = new Date(order.delivery_time);
const timeRemaining = deliveryTime.getTime() - now.getTime();

// Format countdown display
const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

if (hours > 0) {
  return `${hours}h ${minutes}m remaining`;
} else {
  return `${minutes}m remaining`;
}
```

### Countdown Features

1. **Real-time Updates**: Countdown updates every second
2. **Color-coded Urgency**:
   - Green: > 30 minutes remaining
   - Yellow: 10-30 minutes remaining
   - Red: < 10 minutes remaining
3. **User-friendly Format**: Shows hours and minutes in readable format
4. **Positioning**: Displayed at the bottom of active batch cards

## Order Creation Process

### Regular Orders

When a user places a regular order through the checkout process:

1. **Address Retrieval**: Get user's delivery address from cookies
2. **Distance Calculation**: Calculate 3D distance between shop and delivery address
3. **Time Calculation**: Apply delivery time formula
4. **Order Creation**: Store delivery time in `Orders.delivery_time` field
5. **Database Storage**: Order is created with estimated delivery timestamp

### Reel Orders

When a user places a reel order:

1. **Location Retrieval**: Get reel creator's location and user's delivery address
2. **Distance Calculation**: Calculate 3D distance between pickup and delivery points
3. **Time Calculation**: Apply delivery time formula
4. **Order Creation**: Store delivery time in `reel_orders.delivery_time` field
5. **Database Storage**: Reel order is created with estimated delivery timestamp

## API Endpoints

### 1. System Configuration API (`/api/queries/system-configuration`)

**GET** - Fetch delivery time parameters

```typescript
GET / api / queries / system - configuration;

// Response
{
  System_configuratioins: [
    {
      shoppingTime: "40",
      baseDeliveryFee: "1000",
      distanceSurcharge: "300",
      cappedDistanceFee: "5000",
      // ... other parameters
    },
  ];
}
```

### 2. Available Orders API (`/api/shopper/availableOrders`)

**GET** - Fetch orders with calculated travel times

```typescript
GET /api/shopper/availableOrders?latitude=1.234&longitude=5.678

// Response includes travel time calculations
{
  orders: [{
    id: "uuid",
    travelTimeMinutes: 15,
    distance: 2.5,
    // ... other order data
  }]
}
```

## Database Schema

### Orders Table

```sql
Orders {
  id: uuid (primary key)
  delivery_time: timestamptz (estimated delivery timestamp)
  created_at: timestamptz
  updated_at: timestamptz
  status: string
  // ... other fields
}
```

### Reel Orders Table

```sql
reel_orders {
  id: uuid (primary key)
  delivery_time: timestamptz (estimated delivery timestamp)
  created_at: timestamptz
  updated_at: timestamptz
  status: string
  // ... other fields
}
```

### System Configuration Table

```sql
System_configuratioins {
  id: uuid (primary key)
  shoppingTime: string (minutes)
  baseDeliveryFee: string
  distanceSurcharge: string
  cappedDistanceFee: string
  // ... other configuration parameters
}
```

## Frontend Components

### Active Batches Card

The `activeBatchesCard.tsx` component displays real-time countdown timers:

```typescript
// Countdown timer implementation
const [timeRemaining, setTimeRemaining] = useState<string>("");

useEffect(() => {
  const updateCountdown = () => {
    const now = new Date();
    const deliveryTime = new Date(order.delivery_time);
    const remaining = deliveryTime.getTime() - now.getTime();

    if (remaining <= 0) {
      setTimeRemaining("Delivered");
      return;
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m`);
    } else {
      setTimeRemaining(`${minutes}m`);
    }
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);

  return () => clearInterval(interval);
}, [order.delivery_time]);
```

## Error Handling

### Missing Delivery Address

- System falls back to default delivery time calculation
- User is prompted to select delivery address

### Invalid Coordinates

- System uses default values for distance calculation
- Logs warning for debugging

### System Configuration Unavailable

- Uses fallback values for shopping time and fees
- Ensures order creation continues with reasonable defaults

## Performance Considerations

### Caching

- System configuration is cached to reduce database queries
- Distance calculations are memoized for repeated calculations

### Real-time Updates

- Countdown timers use efficient intervals (1-second updates)
- Components clean up intervals on unmount to prevent memory leaks

### Database Optimization

- Delivery time calculations are performed at order creation
- Stored timestamps enable efficient querying and sorting

## Future Enhancements

### Planned Improvements

1. **Traffic Integration**

   - Real-time traffic data integration
   - Dynamic delivery time adjustments based on traffic conditions

2. **Weather Considerations**

   - Weather impact on delivery times
   - Seasonal adjustments for delivery estimates

3. **Machine Learning**

   - Historical delivery time analysis
   - Predictive delivery time improvements
   - Shopper performance-based adjustments

4. **Advanced Routing**
   - Multi-stop delivery optimization
   - Route planning for batch orders
   - Real-time route adjustments

---

# Revenue Management System

## Overview

The revenue system uses a **trigger-based approach** with a two-price model for revenue generation. Revenue is calculated and recorded at specific order status changes, not during checkout.

## Revenue Types

### 1. Commission Revenue (Product Profits)

- **Trigger**: Order status changes to "shopping"
- **Calculation**: `(final_price - price) × quantity` for each product
- **Purpose**: Track profit margins from product markups
- **API**: `/api/shopper/calculateCommissionRevenue`

### 2. Plasa Fee Revenue (Platform Earnings)

- **Trigger**: Order status changes to "delivered"
- **Calculation**: `(service_fee + delivery_fee) × (deliveryCommissionPercentage / 100)`
- **Purpose**: Track platform earnings from service fees
- **API**: `/api/shopper/calculatePlasaFeeRevenue`

## Revenue Calculation Flow

```
Order Created → Shopper Accepts → Shopping → Picked → On the Way → Delivered
                                    ↑                    ↑
                              COMMISSION           PLASA FEE
                              REVENUE             REVENUE
                              (Product Profits)   (Platform Earnings)
```

## Example Calculations

### Commission Revenue Example

```typescript
Product: {
  price: 1233,        // Original price
  final_price: 4555,  // Customer price
  quantity: 3         // Units ordered
}

// Calculations
Customer Pays: 4555 × 3 = 13,665 RWF
Shop Gets: 1233 × 3 = 3,699 RWF
Our Revenue: 13,665 - 3,699 = 9,966 RWF
```

### Plasa Fee Revenue Example

```typescript
Service Fee = 2000
Delivery Fee = 2400
Total Fees = 4400
deliveryCommissionPercentage = 10 (10%)

Platform Fee = 4400 × (10/100) = 440
Remaining Earnings = 4400 - 440 = 3960

Revenue Table: 440 (platform earnings)
Shopper Wallet: 3960 (remaining earnings)
```

## API Endpoints

### 1. Commission Revenue API (`/api/shopper/calculateCommissionRevenue`)

**POST** - Calculate and record commission revenue

```typescript
POST /api/shopper/calculateCommissionRevenue
{
  orderId: uuid
}

// Response
{
  success: true,
  message: "Commission revenue calculated and recorded successfully",
  data: {
    commission_revenue: "9966.00",
    product_profits: [...]
  }
}
```

### 2. Plasa Fee Revenue API (`/api/shopper/calculatePlasaFeeRevenue`)

**POST** - Calculate and record plasa fee revenue

```typescript
POST /api/shopper/calculatePlasaFeeRevenue
{
  orderId: uuid
}

// Response
{
  success: true,
  message: "Plasa fee revenue calculated and recorded successfully",
  data: {
    plasa_fee: "440.00",
    commission_percentage: 10
  }
}
```

### 3. Revenue Records API (`/api/revenue`)

**GET** - Fetch all revenue records

```typescript
GET / api / revenue;

// Response
{
  Revenue: [
    {
      id: uuid,
      type: "commission" | "plasa_fee",
      amount: string,
      order_id: uuid,
      shop_id: uuid,
      shopper_id: uuid,
      products: jsonb,
      commission_percentage: string,
      created_at: string,
    },
  ];
}
```

## Database Schema

### Revenue Table

```sql
Revenue {
  id: uuid (primary key)
  type: string ("commission" | "plasa_fee")
  amount: string
  order_id: uuid (nullable, for commission revenue)
  shop_id: uuid (foreign key)
  shopper_id: uuid (foreign key to shoppers table)
  products: jsonb (nullable, for commission revenue)
  commission_percentage: string (nullable)
  created_at: timestamp
}
```

---

# Wallet Balance System

## Overview

The wallet system manages shopper earnings with two balance types: **Available Balance** (earnings) and **Reserved Balance** (pending orders). The system follows a specific flow for balance updates based on order status changes.

## Balance Types

### 1. Available Balance

**Purpose**: Funds that the shopper has earned and can withdraw
**Increases**: When order is delivered (remaining earnings after platform fee)
**Decreases**: When platform fee is deducted

### 2. Reserved Balance

**Purpose**: Funds set aside for pending orders (locked until completion)
**Increases**: When order is accepted (order total)
**Decreases**: When order is delivered (used to pay for goods)

## Wallet Balance Flow

### Order Acceptance ("shopping" status)

```typescript
// Reserved Balance increases by order total
newReservedBalance = currentReservedBalance + orderTotal;

// Available Balance: No change (shopper hasn't earned fees yet)
// Commission Revenue: Added to revenue table
```

### Order Delivery ("delivered" status)

```typescript
// Calculate platform fee and remaining earnings
totalEarnings = serviceFee + deliveryFee
platformFee = totalEarnings × (deliveryCommissionPercentage / 100)
remainingEarnings = totalEarnings - platformFee

// Available Balance: Add remaining earnings
newAvailableBalance = currentAvailableBalance + remainingEarnings

// Reserved Balance: No change (already used for goods)
// Plasa Fee Revenue: Added to revenue table
```

### Order Cancellation ("cancelled" status)

```typescript
// Reserved Balance decreases by order total
newReservedBalance = currentReservedBalance - orderTotal;

// Available Balance: No change
// Refund: Created in Refunds table (not back to available balance)
```

## Example Flow

```
Order Total: $9000
Service Fee: $2000
Delivery Fee: $2400
Platform Commission: 10%

Shopping Status:
- Reserved Balance: +$9000 (set aside for goods)
- Available Balance: No change
- Commission Revenue: Added (product profits)

Delivered Status:
- Reserved Balance: No change (already used for goods)
- Available Balance: +$3960 (remaining earnings after platform fee)
- Plasa Fee Revenue: Added (platform earnings)
```

## API Endpoints

### 1. Wallet Balance API (`/api/queries/wallet-balance`)

**GET/POST** - Get shopper wallet balance

```typescript
GET /api/queries/wallet-balance?shopper_id=uuid

// Response
{
  wallet: {
    id: uuid,
    available_balance: "3960.00",
    reserved_balance: "15000.00",
    last_updated: string
  }
}
```

### 2. Wallet History API (`/api/shopper/walletHistory`)

**GET** - Get wallet transaction history

```typescript
GET /api/shopper/walletHistory

// Response
{
  wallet: {
    availableBalance: 3960,
    reservedBalance: 15000
  },
  transactions: [
    {
      id: uuid,
      amount: number,
      type: "reserve" | "earnings" | "payment" | "platform_fee" | "refund",
      status: "completed",
      description: string,
      date: string,
      time: string
    }
  ]
}
```

### 3. Create Wallet API (`/api/queries/createWallet`)

**POST** - Create new wallet for shopper

```typescript
POST /api/queries/createWallet
{
  shopper_id: uuid
}

// Response
{
  success: true,
  wallet: {
    id: uuid,
    shopper_id: uuid,
    available_balance: "0",
    reserved_balance: "0"
  }
}
```

## Database Schema

### Wallets Table

```sql
Wallets {
  id: uuid (primary key)
  shopper_id: uuid (foreign key to shoppers table)
  available_balance: string
  reserved_balance: string
  last_updated: timestamp
}
```

### Wallet_Transactions Table

```sql
Wallet_Transactions {
  id: uuid (primary key)
  wallet_id: uuid (foreign key to Wallets)
  amount: string
  type: string ("reserve" | "earnings" | "payment" | "platform_fee" | "refund")
  status: string ("completed" | "pending")
  description: string
  related_order_id: uuid (nullable)
  created_at: timestamp
}
```

---

# Order Processing System

## Overview

The order processing system handles order status updates with integrated wallet balance management and revenue calculation triggers.

## Order Status Flow

### 1. "shopping" Status

**Triggers**:

- Reserved balance increases by order total
- Commission revenue is calculated and recorded
- Wallet transaction created for reserved balance

### 2. "delivered" Status

**Triggers**:

- Available balance updated with remaining earnings
- Plasa fee revenue is calculated and recorded
- Wallet transactions created for earnings
- Revenue calculation APIs called

### 3. "cancelled" Status

**Triggers**:

- Reserved balance decreases by order total
- Refund record created in Refunds table
- Wallet transaction created for refund

## API Endpoints

### 1. Update Order Status API (`/api/shopper/updateOrderStatus`)

**POST** - Update order status with wallet balance management

```typescript
POST /api/shopper/updateOrderStatus
{
  orderId: uuid,
  status: "shopping" | "delivered" | "cancelled"
}

// Response
{
  success: true,
  order: {
    id: uuid,
    status: string,
    updated_at: string
  }
}
```

## Database Schema

### Orders Table

```sql
Orders {
  id: uuid (primary key)
  OrderID: string
  user_id: uuid (foreign key to Users)
  shopper_id: uuid (foreign key to Users)
  shop_id: uuid (foreign key to Shops)
  total: string
  service_fee: string
  delivery_fee: string
  status: string
  delivery_photo_url: string (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### Order_Items Table

```sql
Order_Items {
  id: uuid (primary key)
  order_id: uuid (foreign key to Orders)
  product_id: uuid (foreign key to Products)
  quantity: number
  price: string (base price for shopper calculations)
  found: boolean
  foundQuantity: number
}
```

---

# Payment Management System

## Overview

The payment system handles order payments using reserved balance funds with refund capabilities for missing items.

## Payment Flow

### 1. Payment Processing

- Shopper uses reserved balance to pay for found items
- System calculates refund for missing items
- Refund record created if needed
- Reserved balance updated

### 2. Refund Management

- Missing items trigger refund creation
- Refunds go to Refunds table (not back to available balance)
- Refund status tracking

## API Endpoints

### 1. Process Payment API (`/api/shopper/processPayment`)

**POST** - Process order payment from reserved balance

```typescript
POST /api/shopper/processPayment
{
  orderId: uuid,
  orderAmount: number,
  originalOrderTotal?: number,
  momoCode: string,
  privateKey: string
}

// Response
{
  success: true,
  message: "Payment processed successfully",
  data: {
    paymentAmount: number,
    refundAmount: number,
    newReservedBalance: number
  }
}
```

### 2. Record Transaction API (`/api/shopper/recordTransaction`)

**POST** - Record wallet transaction for payment

```typescript
POST /api/shopper/recordTransaction
{
  shopperId: uuid,
  orderId: uuid,
  orderAmount: number,
  originalOrderTotal?: number
}

// Response
{
  success: true,
  message: "Transaction recorded successfully",
  data: {
    transactionResponse: object,
    refund: object,
    newBalance: {
      reserved: number
    }
  }
}
```

## Database Schema

### Refunds Table

```sql
Refunds {
  id: uuid (primary key)
  order_id: uuid (foreign key to Orders)
  amount: string
  status: string ("pending" | "paid")
  reason: string
  user_id: uuid (foreign key to Users)
  generated_by: string
  paid: boolean
  created_at: timestamp
}
```

---

# Reel Orders System

## Overview

The Reel Orders system allows users to place direct orders from reel content without going through the traditional cart system. This creates a seamless shopping experience where users can order items they see in video content immediately.

## Key Features

### 1. Direct Order Placement

- **No Cart Required**: Orders are placed directly from reel content
- **Instant Purchase**: One-click ordering from video content
- **Real-time Pricing**: Dynamic pricing based on quantity and delivery location
- **Promo Code Support**: Apply discount codes during checkout

### 2. Order Management

- **Unified Order Tracking**: Reel orders appear alongside regular orders
- **Status Tracking**: Same delivery status system as regular orders
- **Shopper Assignment**: Automatic shopper assignment when available
- **Delivery Tracking**: Real-time delivery updates

### 3. User Experience

- **Modal Checkout**: Clean, focused checkout experience
- **Quantity Selection**: Adjust quantity with real-time price updates
- **Special Instructions**: Add delivery notes and special requests
- **Payment Integration**: Seamless payment processing

## Technical Architecture

### Database Schema

#### Reel Orders Table

```sql
reel_orders {
  id: uuid (primary key)
  OrderID: string (unique order number)
  user_id: uuid (foreign key to Users)
  reel_id: uuid (foreign key to Reels)
  quantity: string
  total: string
  service_fee: string
  delivery_fee: string
  discount: string (nullable)
  voucher_code: string (nullable)
  delivery_time: string
  delivery_note: string
  status: "PENDING" | "shopping" | "packing" | "on_the_way" | "delivered"
  found: boolean
  shopper_id: uuid (nullable, foreign key to Shoppers)
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### 1. Reel Orders API (`/api/reel-orders`)

**POST** - Create new reel order

```typescript
POST /api/reel-orders
{
  reel_id: uuid,
  quantity: number,
  total: string,
  service_fee: string,
  delivery_fee: string,
  discount?: string,
  voucher_code?: string,
  delivery_time: string,
  delivery_note?: string,
  delivery_address_id: uuid
}

// Response
{
  success: true,
  order_id: uuid,
  order_number: string,
  message: "Reel order placed successfully"
}
```

#### 2. All Orders API (`/api/queries/all-orders`)

**GET** - Fetch both regular and reel orders

```typescript
GET / api / queries / all - orders;

// Response
{
  orders: [
    {
      id: uuid,
      OrderID: string,
      status: string,
      created_at: string,
      total: number,
      orderType: "regular" | "reel",
      // Regular order fields
      shop: object,
      itemsCount: number,
      unitsCount: number,
      // Reel order fields
      reel: object,
      quantity: number,
      delivery_note: string,
    },
  ];
}
```

#### 3. Reel Order Details API (`/api/queries/reel-order-details`)

**GET** - Fetch detailed reel order information

```typescript
GET /api/queries/reel-order-details?id=uuid

// Response
{
  order: {
    id: uuid,
    OrderID: string,
    status: string,
    created_at: string,
    total: number,
    service_fee: number,
    delivery_fee: number,
    discount: number,
    quantity: number,
    delivery_note: string,
    orderType: "reel",
    reel: {
      id: uuid,
      title: string,
      description: string,
      Price: string,
      Product: string,
      type: string,
      video_url: string
    },
    assignedTo?: {
      id: uuid,
      name: string,
      phone: string,
      profile_photo: string,
      transport_mode: string
    }
  }
}
```

## Frontend Components

### 1. Order Modal (`src/components/Reels/OrderModal.tsx`)

**Features:**

- Quantity selection with real-time price updates
- Promo code application
- Special instructions input
- Payment method display
- Order summary with breakdown
- Loading states with placeholders

**Key Functions:**

```typescript
// Calculate order totals
const basePrice = post?.restaurant?.price || post?.product?.price || 0;
const subtotal = basePrice * quantity;
const finalTotal = subtotal - discount + serviceFee + deliveryFee;

// Handle promo code application
const handleApplyPromo = () => {
  const PROMO_CODES = { SAVE10: 0.1, SAVE20: 0.2 };
  const code = promoCode.trim().toUpperCase();
  if (PROMO_CODES[code]) {
    setDiscount(subtotal * PROMO_CODES[code]);
    setAppliedPromo(code);
  }
};

// Place order
const handlePlaceOrder = async () => {
  const payload = {
    reel_id: post.id,
    quantity: quantity,
    total: finalTotal.toString(),
    service_fee: serviceFee.toString(),
    delivery_fee: deliveryFee.toString(),
    discount: discount > 0 ? discount.toString() : null,
    voucher_code: appliedPromo,
    delivery_time: deliveryTimestamp,
    delivery_note: comments || "",
    delivery_address_id: deliveryAddressId,
  };

  const res = await fetch("/api/reel-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
```

### 2. Video Reel Component (`src/components/Reels/VideoReel.tsx`)

**Features:**

- "Order Now" button integration
- Modal trigger functionality
- Reel information display
- Price and delivery information

**Order Button Integration:**

```typescript
// Order button with modal trigger
<button
  onClick={() => setShowOrderModal(true)}
  className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
>
  Order Now
</button>;

// Order modal
{
  showOrderModal && (
    <OrderModal
      open={showOrderModal}
      onClose={() => setShowOrderModal(false)}
      post={post}
      shopLat={shopLat}
      shopLng={shopLng}
      shopAlt={shopAlt}
      shopId={shopId}
    />
  );
}
```

### 3. Order Details Components

#### Regular Order Details (`src/components/UserCarts/orders/UserOrderDetails.tsx`)

- Displays regular shop orders
- Shows shop information and item details
- Green theme styling

#### Reel Order Details (`src/components/UserCarts/orders/UserReelOrderDetails.tsx`)

- Displays reel-specific order information
- Shows reel video thumbnail and details
- Purple theme styling
- Comprehensive shopper information

**Key Differences:**

```typescript
// Regular orders show shop information
{
  order.shop && (
    <div className="shop-info">
      <h3>{order.shop.name}</h3>
      <p>{order.shop.address}</p>
    </div>
  );
}

// Reel orders show reel information
{
  order.reel && (
    <div className="reel-info">
      <video src={order.reel.video_url} />
      <h3>{order.reel.title}</h3>
      <p>{order.reel.description}</p>
    </div>
  );
}
```

## Order Management System

### 1. Unified Order Display (`src/components/userProfile/userRecentOrders.tsx`)

**Features:**

- Displays both regular and reel orders
- Visual distinction between order types
- Consistent filtering and pagination
- Dark theme support

**Order Type Detection:**

```typescript
// Visual distinction
const buttonClass =
  order.orderType === "reel"
    ? "bg-purple-500 hover:bg-purple-600"
    : "bg-green-500 hover:bg-green-600";

// Content display
{
  order.orderType === "reel" ? (
    <div className="reel-order-info">
      <span>{order.quantity} quantity</span>
      <span>{order.reel?.title}</span>
    </div>
  ) : (
    <div className="regular-order-info">
      <span>
        {order.itemsCount} items ({order.unitsCount} units)
      </span>
      <span>{order.shop?.name}</span>
    </div>
  );
}
```

### 2. Order Details Pages

#### Unified Order Details (`pages/CurrentPendingOrders/viewOrderDetails/[orderId].tsx`)

**Smart Order Detection:**

```typescript
// Try regular order first
let res = await fetch(`/api/queries/orderDetails?id=${orderId}`);
if (res.ok) {
  const data = await res.json();
  if (data.order) {
    setOrder(data.order);
    setOrderType("regular");
    return;
  }
}

// Try reel order if regular not found
res = await fetch(`/api/queries/reel-order-details?id=${orderId}`);
if (res.ok) {
  const data = await res.json();
  setOrder(data.order);
  setOrderType("reel");
}

// Render appropriate component
{
  orderType === "reel" ? (
    <UserReelOrderDetails order={order} />
  ) : (
    <UserOrderDetails order={order} />
  );
}
```

## User Experience Flow

### 1. Discovery and Ordering

1. **Browse Reels**: User scrolls through video content
2. **View Details**: Tap on reel to see product information
3. **Order Now**: Click "Order Now" button
4. **Configure Order**: Select quantity, add notes, apply promo codes
5. **Place Order**: Complete checkout process
6. **Confirmation**: Receive order confirmation

### 2. Order Tracking

1. **Order Placed**: Order appears in order history
2. **Shopper Assignment**: Automatic assignment when available
3. **Status Updates**: Real-time status changes
4. **Delivery**: Track delivery progress
5. **Completion**: Order delivered and marked complete

### 3. Order Management

1. **View Orders**: Access order history from main menu
2. **Filter Orders**: Filter by status (pending/completed)
3. **Order Details**: View comprehensive order information
4. **Contact Shopper**: Call or message assigned shopper
5. **Feedback**: Rate and review completed orders

## Examples

### Example 1: Restaurant Reel Order

**Scenario**: User sees a delicious pizza reel from "Pizza Palace"

1. **Reel Content**: Video shows fresh pizza being made
2. **Product Info**: Title: "Margherita Pizza", Price: $15.99
3. **Order Process**:

   ```typescript
   // User clicks "Order Now"
   setShowOrderModal(true);

   // User selects quantity
   setQuantity(2);

   // User adds special instructions
   setComments("Extra cheese, well done");

   // User applies promo code
   handleApplyPromo("SAVE10"); // 10% discount

   // Order is placed
   const order = {
     reel_id: "pizza-reel-123",
     quantity: 2,
     total: "28.78", // $15.99 * 2 - 10% discount + fees
     delivery_note: "Extra cheese, well done",
     voucher_code: "SAVE10",
   };
   ```

### Example 2: Supermarket Reel Order

**Scenario**: User sees a fresh produce showcase from "Fresh Market"

1. **Reel Content**: Video shows fresh vegetables and fruits
2. **Product Info**: Title: "Organic Vegetable Basket", Price: $25.00
3. **Order Process**:

   ```typescript
   // User selects quantity
   setQuantity(1);

   // System calculates delivery fee based on distance
   const deliveryFee = calculateDeliveryFee(userLocation, shopLocation);

   // Order summary
   const orderSummary = {
     subtotal: 25.0,
     service_fee: 2.0,
     delivery_fee: 3.5,
     total: 30.5,
   };
   ```

### Example 3: Chef Recipe Reel Order

**Scenario**: User sees a cooking tutorial for "Homemade Pasta"

1. **Reel Content**: Video shows chef making pasta from scratch
2. **Product Info**: Title: "Fresh Homemade Pasta Kit", Price: $35.00
3. **Order Process**:

   ```typescript
   // User adds special dietary requirements
   setComments("Gluten-free pasta, no dairy");

   // User applies multiple promo codes
   handleApplyPromo("SAVE20"); // 20% discount

   // Final order
   const order = {
     reel_id: "pasta-kit-456",
     quantity: 1,
     total: "30.00", // $35.00 - 20% discount + fees
     delivery_note: "Gluten-free pasta, no dairy",
     voucher_code: "SAVE20",
   };
   ```

## Technical Implementation Details

### 1. Database Relationships

```sql
-- Reel orders reference reels
ALTER TABLE reel_orders
ADD CONSTRAINT fk_reel_orders_reel
FOREIGN KEY (reel_id) REFERENCES reels(id);

-- Reel orders reference users
ALTER TABLE reel_orders
ADD CONSTRAINT fk_reel_orders_user
FOREIGN KEY (user_id) REFERENCES users(id);

-- Reel orders can reference shoppers
ALTER TABLE reel_orders
ADD CONSTRAINT fk_reel_orders_shopper
FOREIGN KEY (shopper_id) REFERENCES shoppers(id);
```

### 2. API Error Handling

```typescript
// Comprehensive error handling
try {
  const response = await fetch("/api/reel-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Order placement failed");
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle specific error types
  if (error.message.includes("delivery_address")) {
    showError("Please select a delivery address");
  } else if (error.message.includes("promo")) {
    showError("Invalid promo code");
  } else {
    showError("Order placement failed. Please try again.");
  }
}
```

### 3. Real-time Updates

```typescript
// Optimistic UI updates
const handlePlaceOrder = async () => {
  // Immediately show loading state
  setIsOrderLoading(true);

  try {
    // Place order
    const response = await placeOrder(payload);

    // Show success message
    showSuccess("Order placed successfully!");

    // Close modal after delay
    setTimeout(() => {
      onClose();
    }, 1500);
  } catch (error) {
    // Handle error
    showError(error.message);
  } finally {
    setIsOrderLoading(false);
  }
};
```

## Best Practices

### 1. For Developers

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show appropriate loading indicators
3. **Validation**: Validate all user inputs before submission
4. **Optimistic Updates**: Update UI immediately, sync with backend
5. **Type Safety**: Use TypeScript interfaces for all data structures

### 2. For Users

1. **Order Placement**: Review order details before confirming
2. **Promo Codes**: Check promo code validity before applying
3. **Delivery Address**: Ensure delivery address is correct
4. **Special Instructions**: Be specific with delivery notes
5. **Order Tracking**: Monitor order status for updates

### 3. For Content Creators

1. **Clear Product Information**: Provide accurate titles and descriptions
2. **Quality Videos**: Ensure good video quality and lighting
3. **Pricing**: Set competitive and accurate prices
4. **Availability**: Keep product availability up to date
5. **Engagement**: Respond to comments and questions

## Troubleshooting

### Common Issues

1. **Order Not Placed**

   - Check internet connection
   - Verify delivery address is selected
   - Ensure all required fields are filled

2. **Promo Code Not Working**

   - Verify promo code is valid
   - Check if discounts are enabled
   - Ensure minimum order requirements are met

3. **Order Not Appearing**

   - Refresh the orders page
   - Check order status filter
   - Contact support if issue persists

4. **Video Not Loading**
   - Check internet connection
   - Try refreshing the page
   - Clear browser cache

### Support

For technical issues or questions about the Reels and Reel Orders system:

- **Technical Support**: support@example.com
- **Bug Reports**: bugs@example.com
- **Feature Requests**: features@example.com

## Future Enhancements

### Planned Features

1. **Advanced Ordering**

   - Multiple item selection from single reel
   - Customization options (size, toppings, etc.)
   - Scheduled delivery times

2. **Enhanced Tracking**

   - Real-time shopper location
   - Estimated arrival times
   - Delivery notifications

3. **Social Features**

   - Share orders with friends
   - Group ordering
   - Order recommendations

4. **Analytics**
   - Order conversion tracking
   - Popular reel analysis
   - Revenue reporting

### Performance Improvements

1. **Caching**

   - Reel content caching
   - Order history caching
   - API response caching

2. **Optimization**

   - Image and video compression
   - Lazy loading
   - Bundle size optimization

3. **Scalability**
   - Database query optimization
   - API rate limiting
   - Load balancing

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Grocery Delivery Application

## Table of Contents

1. [Reels Feature](#reels-feature-documentation)
2. [Reel Orders System](#reel-orders-system)
3. [Delivery Photo Upload Feature](#delivery-photo-upload-feature)
4. [Nearby Dasher Notification Logic](#nearby-dasher-notification-logic)

# Reels Feature Documentation

## Overview

The Reels feature is a TikTok-style video feed system that allows users to create, view, and interact with food-related video content. It supports three types of content: restaurant posts, supermarket posts, and chef/recipe posts.

## Core Features

### 1. Video Types

- **Restaurant Posts**: Food delivery and dining experiences
- **Supermarket Posts**: Product showcases and shopping content
- **Chef Posts**: Recipe tutorials and cooking content

### 2. User Interactions

- **Like/Unlike**: Real-time like functionality with optimistic updates
- **Comments**: Add and interact with comments on reels
- **Share**: Share reels with other users
- **Scroll Navigation**: Smooth vertical scrolling between reels

### 3. Responsive Design

- **Mobile**: Full-screen experience with bottom navigation
- **Desktop**: Integrated layout with sidebar and navigation
- **Auto-play**: Videos play when visible, pause when not

## Technical Architecture

### Database Schema

#### Reels Table

```sql
Reels {
  id: uuid (primary key)
  title: string
  description: string
  video_url: string
  category: string
  type: "restaurant" | "supermarket" | "chef"
  user_id: uuid (foreign key to Users)
  restaurant_id: uuid (optional, foreign key to Restaurants)
  created_on: timestamp
  isLiked: boolean
  likes: string
  delivery_time: string
  Price: string
  Product: jsonb
}
```

#### Reel Likes Table

```sql
reel_likes {
  id: uuid (primary key)
  reel_id: uuid (foreign key to Reels)
  user_id: uuid (foreign key to Users)
  created_at: timestamp
}
```

#### Reel Comments Table

```sql
Reels_comments {
  id: uuid (primary key)
  reel_id: uuid (foreign key to Reels)
  user_id: uuid (foreign key to Users)
  text: string
  created_on: timestamp
  likes: string
  isLiked: boolean
}
```

### API Endpoints

#### 1. Reels API (`/api/queries/reels`)

**GET** - Fetch reels

```typescript
// Get all reels
GET /api/queries/reels

// Get reels by user
GET /api/queries/reels?user_id=uuid

// Get reels by restaurant
GET /api/queries/reels?restaurant_id=uuid

// Filter by type
GET /api/queries/reels?type=restaurant
```

**POST** - Create new reel

```typescript
POST /api/queries/reels
{
  title: string,
  description: string,
  video_url: string,
  category: string,
  type: "restaurant" | "supermarket" | "chef",
  restaurant_id?: uuid,
  Product?: object,
  delivery_time?: string,
  Price?: string
}
```

#### 2. Reel Likes API (`/api/queries/reel-likes`)

**GET** - Get likes for a reel

```typescript
GET /api/queries/reel-likes?reel_id=uuid
```

**POST** - Add like to reel

```typescript
POST / api / queries / reel - likes;
{
  reel_id: uuid;
}
```

**DELETE** - Remove like from reel

```typescript
DELETE / api / queries / reel - likes;
{
  reel_id: uuid;
}
```

#### 3. Reel Comments API (`/api/queries/reel-comments`)

**GET** - Get comments for a reel

```typescript
GET /api/queries/reel-comments?reel_id=uuid
```

**POST** - Add comment to reel

```typescript
POST /api/queries/reel-comments
{
  reel_id: uuid,
  text: string
}
```

**PUT** - Toggle comment like

```typescript
PUT /api/queries/reel-comments
{
  comment_id: uuid,
  action: "toggle_like"
}
```

**DELETE** - Delete comment

```typescript
DELETE / api / queries / reel - comments;
{
  comment_id: uuid;
}
```

## Frontend Components

### 1. Main Reels Component (`pages/Reels/index.tsx`)

**Features:**

- Fetches reels from database
- Handles responsive layout (mobile/desktop)
- Manages like/unlike functionality
- Optimistic UI updates
- Loading states with placeholder content

**Key Functions:**

```typescript
// Fetch reels from database
const fetchReels = async () => {
  const response = await fetch("/api/queries/reels");
  const data = await response.json();
  const convertedPosts = data.reels.map(convertDatabaseReelToFoodPost);
  setPosts(convertedPosts);
};

// Optimistic like updates
const toggleLike = async (postId: string) => {
  // Immediately update UI
  setPosts(
    posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            stats: {
              ...post.stats,
              likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1,
            },
          }
        : post
    )
  );

  // Process backend request in background
  fetch("/api/queries/reel-likes", {
    method: isLiked ? "DELETE" : "POST",
    body: JSON.stringify({ reel_id: postId }),
  });
};
```

### 2. Video Reel Component (`src/components/Reels/VideoReel.tsx`)

**Features:**

- Video player with auto-play/pause
- Like button with visual feedback
- Comment and share buttons
- Type and category badges
- Responsive design

**Visual Elements:**

```typescript
// Type badges with colors
const getPostTypeColor = (type: PostType) => {
  switch (type) {
    case "restaurant":
      return "#ff6b35"; // Orange
    case "supermarket":
      return "#4ade80"; // Green
    case "chef":
      return "#3b82f6"; // Blue
  }
};

// Category badges
const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "shopping":
      return "#8b5cf6"; // Purple
    case "organic":
      return "#10b981"; // Emerald
    case "tutorial":
      return "#f59e0b"; // Amber
    // ... more categories
  }
};
```

### 3. Comments Drawer (`src/components/Reels/CommentsDrawer.tsx`)

**Features:**

- Slide-up drawer for mobile
- Side panel for desktop
- Real-time comment addition
- Like/unlike comments
- Responsive design

## User Experience Features

### 1. Optimistic Updates

- **Instant Feedback**: Like button turns red immediately
- **Background Processing**: API calls don't block UI
- **Smooth Scrolling**: No loading interruptions
- **Error Handling**: Backend errors logged but UI stays updated

### 2. Loading States

- **Placeholder Content**: Shows 3 placeholder reels while loading
- **Smooth Transitions**: Seamless switch from placeholders to real content
- **Error States**: Clear error messages with retry options

### 3. Responsive Design

**Mobile Layout:**

- Full-screen video experience
- Bottom navigation bar
- Slide-up comments drawer
- Touch-optimized interactions

**Desktop Layout:**

- Integrated with main app layout
- Side panel comments
- Keyboard shortcuts support
- Larger video player

### 4. Video Management

- **Auto-play**: Videos play when visible in viewport
- **Auto-pause**: Videos pause when scrolled away
- **Intersection Observer**: Efficient visibility detection
- **Loading States**: Video loading indicators
- **Error Handling**: Fallback for failed video loads

## Data Flow

### 1. Reel Creation

```
User Upload → API Validation → Database Storage → UI Update
```

### 2. Like Interaction

```
User Click → Optimistic UI Update → Background API Call → Database Update
```

### 3. Comment System

```
User Comment → API Call → Database Storage → Real-time UI Update
```

### 4. Data Fetching

```
Component Mount → API Call → Database Query → Data Conversion → UI Render
```

## Security & Authentication

### 1. User Authentication

- All write operations require valid session
- User ID extracted from NextAuth session
- Unauthorized requests return 401 status

### 2. Authorization

- Users can only delete their own comments
- Admin users can delete any comment
- Like operations tied to authenticated user

### 3. Input Validation

- Required fields validation
- Video URL validation
- Comment text sanitization
- Type and category validation

## Performance Optimizations

### 1. Video Optimization

- Preload metadata only
- Lazy loading for off-screen videos
- Efficient video format support
- Background loading

### 2. State Management

- Optimistic updates for better UX
- Efficient re-rendering with React
- Proper cleanup of event listeners
- Memory leak prevention

### 3. API Optimization

- Efficient database queries
- Proper indexing on foreign keys
- Caching strategies
- Error handling and logging

## Configuration

### Environment Variables

```env
# Database
HASURA_GRAPHQL_ENDPOINT=your_hasura_endpoint
HASURA_GRAPHQL_ADMIN_SECRET=your_admin_secret

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# File Storage (for video uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### GraphQL Schema

The reels feature uses the following GraphQL operations:

- `GetAllReels` - Fetch all reels with user and restaurant data
- `AddReels` - Create new reel
- `GetReelsLikes` - Get likes for specific reel
- `AddReelLike` - Add like to reel
- `RemoveReelLike` - Remove like from reel
- `GetComments` - Get comments for reel
- `AddReelComment` - Add comment to reel

## Future Enhancements

### Planned Features

- Video upload functionality
- Advanced filtering and search
- User profiles and following
- Push notifications for new content
- Analytics and insights
- Content moderation tools

### Technical Improvements

- Video compression and optimization
- CDN integration for faster loading
- Real-time notifications
- Advanced caching strategies
- Performance monitoring

## Revenue and Checkout System

### Revenue Calculation Logic

The system uses a two-price model for revenue generation with a **trigger-based approach**:

1. **Price Structure**:

   - `price`: Original shop price (what we pay to shop)
   - `final_price`: Marked up price (what customer pays)

2. **Example Calculation**:

```typescript
// Single Product Example
Product = {
  price: 1233,        // Original price
  final_price: 4555,  // Customer price
  quantity: 3         // Units ordered
}

// Calculations
Customer Pays: 4555 × 3 = 13,665 RWF
Shop Gets: 1233 × 3 = 3,699 RWF
Our Revenue: 13,665 - 3,699 = 9,966 RWF

// Multiple Products Example
Two identical products:
Total Customer Pays: 27,330 RWF (13,665 × 2)
Total Shop Gets: 7,398 RWF (3,699 × 2)
Total Revenue: 19,932 RWF (27,330 - 7,398)
```

### Checkout Process

1. **Cart Calculation**:

   - System calculates total using `final_price` for each item (what customer sees)
   - Calculates actual total using `price` (what we pay to shop)
   - Adds service fee and delivery fee
   - Applies any discounts or vouchers

2. **Order Creation**:

   - Creates order record with actual total (what we pay to shop)
   - Stores order items with base price (for shopper calculations)
   - **No revenue records created yet** (trigger-based approach)

3. **Revenue Calculation Trigger**:

   Revenue is calculated and recorded **only when the order is completed**:

   - **When order status becomes "delivered"**
   - **When delivery photo is uploaded** (if order is already delivered)

4. **Payment Flow**:
   - Customer pays the total with final_price + fees
   - Shop receives their original price amount (stored in Orders table)
   - System calculates and records revenue when order is completed

### Revenue Calculation Triggers

#### 1. Order Status Update Trigger

When a shopper updates order status to "delivered":

```typescript
// In pages/api/shopper/updateOrderStatus.ts
if (status === "delivered" && !isReelOrder) {
  // Trigger revenue calculation
  await fetch("/api/shopper/calculateRevenue", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}
```

#### 2. Delivery Photo Upload Trigger

When a delivery photo is uploaded for a delivered order:

```typescript
// In pages/api/shopper/uploadDeliveryPhoto.ts
if (orderStatus === "delivered") {
  // Trigger revenue calculation
  await fetch("/api/shopper/calculateRevenue", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}
```

### Revenue Calculation Process

When triggered, the system:

1. **Retrieves all products from the order**
2. **Calculates profit for commission-based revenue**:
   ```typescript
   Profit = (final_price - price) × quantity
   ```
3. **Calculates plasa fee**:
   ```typescript
   Plasa Fee = (Service Fee + Delivery Fee) × (deliveryCommissionPercentage)
   ```
4. **Creates revenue records**:
   - Commission revenue (product profits)
   - Plasa fee revenue (service + delivery fees)

### Technical Implementation

1. **Revenue Calculator** (`src/lib/revenueCalculator.ts`):

```typescript
export class RevenueCalculator {
  public static calculateRevenue(items: CartItem[]): {
    actualTotal: string; // What we pay to shop (stored in Orders)
    customerTotal: string; // What customer pays (used for checkout)
    revenue: string; // Our profit
  } {
    const customerTotal = this.calculateTotal(items, "final_price");
    const actualTotal = this.calculateTotal(items, "price");
    const revenue = customerTotal - actualTotal;

    return {
      actualTotal: actualTotal.toFixed(2),
      customerTotal: customerTotal.toFixed(2),
      revenue: revenue.toFixed(2),
    };
  }

  public static calculatePlasaFee(
    serviceFee: number,
    deliveryFee: number,
    deliveryCommissionPercentage: number
  ): number {
    return (serviceFee + deliveryFee) * (deliveryCommissionPercentage / 100);
  }
}
```

2. **Revenue Calculation API** (`pages/api/shopper/calculateRevenue.ts`):

```typescript
// Triggered when order is completed
export default async function handler(req, res) {
  // 1. Get order details with items
  const orderData = await hasuraClient.request(GET_ORDER_WITH_ITEMS, {
    orderId,
  });

  // 2. Calculate revenue using RevenueCalculator
  const revenueData = RevenueCalculator.calculateRevenue(cartItems);
  const productProfits = RevenueCalculator.calculateProductProfits(cartItems);

  // 3. Calculate plasa fee
  const plasaFee = RevenueCalculator.calculatePlasaFee(
    serviceFee,
    deliveryFee,
    deliveryCommissionPercentage
  );

  // 4. Create revenue records
  await hasuraClient.request(CREATE_REVENUE, {
    type: "commission",
    order_id: orderId,
    amount: revenueData.revenue,
    products: JSON.stringify(productProfits),
  });

  await hasuraClient.request(CREATE_REVENUE, {
    type: "plasa_fee",
    amount: plasaFee.toFixed(2),
    commission_percentage: deliveryCommissionPercentage.toString(),
  });
}
```

3. **Checkout Process** (`pages/api/checkout.ts`):

```typescript
// Create order (no revenue yet)
const orderRes = await hasuraClient.request(CREATE_ORDER, {
  total: actualTotal.toFixed(2), // Store what we pay to shop
  // ... other order details
});

// Note: Revenue records will be created when the order is completed (delivered)
// This matches the described trigger-based approach
```

### Revenue Types

1. **Commission Revenue**:

   - Type: `"commission"`
   - Amount: Product profit (final_price - price) × quantity
   - Linked to specific order
   - Includes product-level details in JSONB format

2. **Plasa Fee Revenue**:
   - Type: `"plasa_fee"`
   - Amount: (Service Fee + Delivery Fee) × deliveryCommissionPercentage
   - Not tied to specific order
   - Includes commission percentage used

### System Configuration

Revenue calculations use settings from `System_configuratioins` table:

- `deliveryCommissionPercentage`: Used for plasa fee calculation
- `productCommissionPercentage`: Available for future use

### Revenue Table Structure

```typescript
interface Revenue {
  id: string;
  amount: string;
  type: "commission" | "plasa_fee";
  created_at: string;
  order_id: string | null;
  shop_id: string;
  shopper_id: string | null;
  products: any; // JSONB for product details
  commission_percentage: string | null;
}
```

### Important Notes

- Customers only see and interact with `final_price`
- Original `price` is used for backend calculations and stored in Orders table
- Revenue is automatically calculated and stored per order
- All monetary values are stored in RWF (Rwandan Francs)
- The system uses fixed-point arithmetic with 2 decimal places for all calculations
- All monetary values are stored as strings to preserve precision
- Product-level profit tracking enables detailed revenue analytics

# Grocery Delivery Notification System

## Overview

The notification system manages real-time order notifications for shoppers in the grocery delivery application. It implements a sophisticated batch distribution system with multiple checks to ensure appropriate and timely notifications.

## Notification Settings

### Location Preferences

Shoppers can configure their notification preferences through the Settings page:

- **Live Location (Default)**: Receive notifications based on current GPS location
- **Custom Locations**: Choose up to 2 specific locations for notifications
- **Location Toggle**: When custom locations are enabled, live location is automatically disabled
- **Sequential Notifications**: Notifications are shown one by one per location, not simultaneously
- **Maximum Distance**: Set distance limit (5-30 km) for order notifications per location
- **Notification Types**: Configure which notifications to receive:
  - New Orders
  - Batch Orders
  - Earnings Updates
  - System Notifications

### Settings Management

- **API Endpoints**:
  - `GET /api/queries/shopper-notification-settings` - Fetch current settings
  - `POST /api/mutations/shopper-notification-settings` - Save settings
  - `POST /api/shopper/check-notifications-with-settings` - Check notifications with settings
  - `GET /api/test/notification-settings-integration` - Test integration

### System Integration

The notification settings are fully integrated with the entire notification system:

1. **NotificationSystem Component**: Updated to use settings-aware API
2. **Location-Based Filtering**: Respects live location vs custom locations
3. **Distance Filtering**: Only shows notifications within configured distance
4. **Type Filtering**: Only shows notifications for enabled types
5. **Real-time Updates**: Settings changes take effect immediately

### Database Schema

```sql
shopper_notification_settings {
  id: uuid (primary key)
  user_id: uuid (foreign key to Users)
  use_live_location: boolean (default: true)
  custom_locations: jsonb (array of location objects)
  max_distance: string (default: "10")
  notification_types: jsonb (object with boolean flags)
  created_at: timestamp
  updated_at: timestamp
}
```

### Location Object Structure

```typescript
interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}
```

### Notification Types Configuration

```typescript
interface NotificationTypes {
  orders: boolean; // Individual orders
  batches: boolean; // Batch/reel orders
  earnings: boolean; // Earnings updates
  system: boolean; // System notifications
}

interface SoundSettings {
  enabled: boolean; // Enable/disable sound notifications
  volume: number; // Volume level (0.0 to 1.0)
}
```

### Integration Flow

1. **Settings Configuration**: Shopper configures preferences in Settings → Notifications
2. **Settings Storage**: Preferences saved to `shopper_notification_settings` table
3. **Location Management**:
   - When custom locations are added, live location is automatically disabled
   - When live location is enabled, custom locations are cleared
   - Maximum 2 custom locations allowed
4. **Notification Check**: `NotificationSystem` calls `/api/shopper/check-notifications-with-settings`
5. **Age Filtering**: Only NEW orders/batches (created within last 10 minutes) are shown
6. **Sequential Location Processing**:
   - Each location is checked one by one
   - First location with matching orders gets notifications
   - Other locations are skipped to avoid duplicate notifications
7. **Distance Filtering**: Only orders within `max_distance` from each location are considered
8. **Type Filtering**: Only enabled notification types are processed
9. **Sound Settings**: Sound notifications respect user preferences (enabled/disabled, volume)
10. **Notification Display**: Filtered notifications shown to shopper

### Existing APIs Updated

- **`/api/queries/check-new-orders`**:

  - Updated to use 10-minute age filter (was 3 minutes)
  - Added notification settings integration
  - Added sound settings respect
  - Added scheduler integration (via shopper availability)
  - **Fixed**: Now uses `max_distance` from notification settings instead of hardcoded values

- **`/api/queries/notify-nearby-dashers`**:

  - Updated to use 10-minute age filter (was 20 minutes)
  - Added notification settings integration
  - Added scheduler integration (checks shopper availability)
  - Added sound settings respect
  - **Fixed**: Now uses `max_distance` from notification settings instead of hardcoded values
  - **Enhanced**: Added sequential location processing - checks each location one by one
  - **Enhanced**: Added support for custom locations vs live location toggle

- **`/api/shopper/check-notifications-with-settings`**:

  - Already includes age filtering and sound settings
  - Added `sound_settings` field to response
  - **Enhanced**: Now includes scheduler checks, shopper status, and active order checks
  - **Optimized**: Moved all logic to backend to reduce frontend complexity
  - **Enhanced**: Added sequential location processing for both regular and reel orders

- **`/api/queries/shopper-notification-settings`**:
  - Added `sound_settings` field to query response

### Frontend Components Updated

- **`NotificationTab.tsx`**:
  - **Enhanced**: Added automatic live location toggle when custom locations are added
  - **Enhanced**: Added automatic custom location clearing when live location is enabled
  - **Enhanced**: Added validation for maximum 2 custom locations
  - **Enhanced**: Added Google Maps autocomplete for address selection

### API Response Format

```typescript
interface NotificationResponse {
  success: boolean;
  notifications: Array<{
    id: string;
    type: "order" | "batch";
    shopName: string;
    distance: number;
    createdAt: string;
    customerAddress: string;
    locationName: string;
    // Additional fields based on type
  }>;
  settings: {
    use_live_location: boolean;
    max_distance: string;
    notification_types: NotificationTypes;
  };
}
```

## Core Features

### 1. Notification Conditions

Before showing any notifications, the system checks:

- **Shopper Schedule**

  - Verifies current time is within shopper's scheduled hours
  - Schedule is defined per day (e.g., Monday 9:00-18:00)
  - No notifications outside scheduled hours
  - Handles day of week conversion (Sunday = 7)

- **Active Orders**

  - One batch per shopper at a time
  - No new notifications while shopper has an active order
  - Resumes notifications after order completion/delivery

- **Shopper Status**
  - Only shows notifications if shopper is marked as active
  - Status must be explicitly enabled
  - Automatically disables notifications when inactive

### 2. Batch Distribution Logic

- **Order Processing**

  - Orders are sorted by creation time (oldest first)
  - Each order becomes a batch
  - System tracks batch assignments for 60 seconds
  - Prevents duplicate notifications for the same batch

- **Assignment Rules**
  - One batch per shopper
  - 60-second acceptance window
  - Batch expires if not accepted within time limit
  - Shopper becomes eligible for new batches after:
    - Current batch expires
    - Active order is completed
    - Previous batch is rejected

### 3. Notification Types

- **In-App Toast Notifications**

  ```
  New Batch!
  [Customer Address]
  [Store Name] (Distance in km)

  [Accept Batch] [View Details]
  ```

- **Desktop Notifications**
  - Requires browser permission
  - Shows same information as toast
  - Clicking opens batch details
  - Includes notification sound

### 4. Time Management

- **Schedule Checks**

  - Validates against shopper's defined schedule
  - Checks current day and time
  - Prevents notifications outside working hours
  - Handles timezone considerations

- **Notification Timing**

  - 60-second cooldown between notifications
  - 60-second acceptance window per batch
  - Automatic cleanup of expired assignments
  - Logging of all timing-related events

- **Age-Based Filtering**
  - Only shows NEW orders/batches (created within last 10 minutes)
  - Prevents notifications for old/stale orders
  - Ensures shoppers only see fresh opportunities
  - Applies to both regular orders and reel orders (batches)

### 5. Sound Settings

- **Sound Configuration**

  - Enable/disable sound notifications per user preference
  - Configurable volume level (0-100%)
  - Settings stored in `sound_settings` object
  - Real-time application of sound preferences

- **Sound Integration**
  - Sound only plays when enabled in user settings
  - Volume respects user configuration
  - Fallback to default settings if not configured
  - Logging of sound-related events

## Technical Implementation

### API Endpoints Required

1. `/api/shopper/schedule`

   - Returns shopper's availability schedule

2. `/api/queries/check-new-orders`

   - Main API for checking NEW orders (10-minute age filter)
   - Includes sound notifications and travel time calculations
   - Usage: `GET /api/queries/check-new-orders?latitude=<lat>&longitude=<lng>`

3. `/api/shopper/check-notifications-with-settings`

   - Settings-aware notification API with age filtering
   - Respects user notification preferences and sound settings
   - Usage: `GET /api/shopper/check-notifications-with-settings?user_id=<uuid>`

4. `/api/test/notification-settings-integration`

   - Test endpoint to verify notification settings integration

- **`/api/test/check-orders-in-zone`**: Test endpoint to check what orders are in the shopper's zone based on their notification preferences
  - Tests settings retrieval and notification API integration
  - Usage: `GET /api/test/notification-settings-integration`
  - Format: `{ schedule: Array<{ day_of_week: number, start_time: string, end_time: string, is_available: boolean }> }`

2. `/api/shopper/activeOrders`

   - Returns shopper's current active orders
   - Format: `{ orders: Array<Order> }`

3. `/api/shopper/status`

   - Returns shopper's active status
   - Format: `{ isActive: boolean }`

4. `/api/shopper/availableOrders`
   - Returns available orders for assignment
   - Includes location-based filtering
   - Format: `Array<Order>`

### Key Interfaces

```typescript
interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
}

interface ShopperSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}
```

### Error Handling

- Schedule check failures default to no notifications
- Active order check failures assume shopper is busy
- Status check failures default to inactive
- All errors are logged for debugging
- Graceful degradation of features

## Usage Example

1. **Shopper Setup**

   ```typescript
   // Set schedule
   POST / api / shopper / schedule;
   {
     schedule: [
       {
         day_of_week: 1,
         start_time: "09:00",
         end_time: "18:00",
         is_available: true,
       },
       // ... other days
     ];
   }

   // Enable active status
   POST / api / shopper / status;
   {
     isActive: true;
   }
   ```

2. **Component Integration**
   ```typescript
   <NotificationSystem
     onAcceptBatch={(orderId) => {
       // Handle batch acceptance
     }}
     onViewBatchDetails={(orderId) => {
       // Show batch details modal
     }}
     currentLocation={userLocation}
   />
   ```

## Best Practices

1. **Schedule Management**

   - Set realistic working hours
   - Update schedule regularly
   - Consider break times

2. **Order Handling**

   - Complete current order before accepting new ones
   - Check batch details before accepting
   - Maintain active status during working hours

3. **System Monitoring**
   - Monitor notification logs
   - Track acceptance rates
   - Review schedule adherence

## Troubleshooting

Common issues and solutions:

1. **No Notifications**

   - Check shopper status is active
   - Verify current time is within schedule
   - Ensure no active orders exist
   - Check browser notification permissions

2. **Multiple Notifications**

   - Check batch assignment cleanup
   - Verify cooldown period
   - Review assignment tracking

3. **Timing Issues**
   - Validate timezone settings
   - Check schedule format
   - Review server-client time sync

# Logging System

## Overview

The logging system provides comprehensive logging capabilities for both client and server-side operations, with a web interface for real-time monitoring and filtering.

## Features

### 1. Dual Environment Support

- **Client-side Logging**

  - Uses localStorage for temporary storage
  - Maintains last 1000 log entries
  - Automatic cleanup of old entries
  - Console mirroring for development

- **Server-side Logging**
  - Daily log file creation
  - Automatic cleanup after 24 hours
  - Buffer system (100 entries before flush)
  - File-based persistent storage

### 2. Log Levels

```typescript
type LogLevel = "log" | "error" | "warn" | "info" | "debug";
```

Each level has distinct color coding:

- Error: Red (#FF4D4F)
- Warning: Orange (#FAAD14)
- Info: Blue (#1890FF)
- Debug: Purple (#722ED1)
- Log: Green (#52C41A)

### 3. Log Entry Structure

```typescript
interface LogEntry {
  timestamp: string;
  type: LogLevel;
  message: string;
  component?: string;
  details?: any;
}
```

### 4. Web Interface (/dev/logs)

- Real-time log viewing
- Type-based filtering
- Component-based filtering
- Text search capability
- Auto-refresh (60-second intervals)
- Dark theme interface
- JSON details formatting
- Clear logs functionality

## Usage Examples

### 1. Basic Logging

```typescript
import { logger } from "@/utils/logger";

// Basic log
logger.log("Order processed successfully");

// With component
logger.info("Payment received", "PaymentSystem");

// With details
logger.debug("Order details", "OrderSystem", {
  orderId: "123",
  total: 1500,
  items: ["item1", "item2"],
});

// Error logging
try {
  // ... some operation
} catch (error) {
  logger.error("Failed to process order", "OrderSystem", error);
}
```

### 2. Component Integration

```typescript
function PaymentComponent() {
  useEffect(() => {
    logger.info("Payment component mounted", "PaymentSystem");
    return () => {
      logger.info("Payment component unmounted", "PaymentSystem");
    };
  }, []);
}
```

### 3. API Route Logging

```typescript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("Processing payment", "PaymentAPI", {
      method: req.method,
      body: req.body,
    });
    // ... handle request
  } catch (error) {
    logger.error("Payment processing failed", "PaymentAPI", error);
    res.status(500).json({ error: "Payment failed" });
  }
}
```

## Best Practices

1. **Component Logging**

   - Always specify component name
   - Log lifecycle events
   - Include relevant context
   - Use appropriate log levels

2. **Error Logging**

   - Include error stack traces
   - Log error context
   - Use error level appropriately
   - Add recovery attempts

3. **Performance Considerations**

   - Use debug level for verbose logs
   - Include relevant details only
   - Consider log entry size
   - Monitor storage usage

4. **Security**
   - Never log sensitive data
   - Sanitize error messages
   - Restrict logs access
   - Regular log cleanup

## Technical Implementation

### Logger Types

```typescript
interface Logger {
  log(message: string, component?: string, details?: any): void;
  error(message: string, component?: string, details?: any): void;
  warn(message: string, component?: string, details?: any): void;
  info(message: string, component?: string, details?: any): void;
  debug(message: string, component?: string, details?: any): void;
  getLogs(): Promise<LogEntry[]>;
  clearLogs(): Promise<void>;
}
```

### Environment Detection

```typescript
const logger = typeof window === "undefined" ? serverLogger : clientLogger;
```

### Storage Management

- Client: localStorage with entry limit
- Server: Daily rotating log files
- Automatic cleanup of old entries/files
- Buffer system for performance

## Monitoring Interface

The `/dev/logs` page provides:

1. **Filtering Options**

   - By log level (error, warn, info, debug, log)
   - By component name
   - By text content
   - Real-time updates

2. **Visual Features**

   - Dark theme interface
   - Color-coded log levels
   - Formatted JSON details
   - Timestamp display
   - Component highlighting

3. **Controls**
   - Manual refresh
   - Auto-refresh toggle
   - Clear logs option
   - Export capability

# Plasa Profile Management

## Overview

The Plasa profile management system allows users to update their delivery service provider information. This includes personal details, contact information, and required documentation.

## Features

### Profile Information

- Full Name
- Phone Number
- Address
- Transport Mode Selection
  - Car
  - Motorcycle
  - Bicycle
  - On Foot

### Required Documentation

1. Profile Photo

   - Clear photo of the user
   - Required for identification
   - Compressed for optimal storage

2. National ID
   - Photo of valid national identification
   - Required for verification
   - Must be clearly visible

### Transport Mode Specific Requirements

- If transport mode is not "On Foot", additional documentation may be required
- System automatically shows/hides relevant fields based on transport mode

## Update Process

1. **Information Update**

   - Users can update their profile information through the Update Plasa Drawer
   - All changes require review before activation
   - Status changes to "pending" during review

2. **Photo Capture**

   - Built-in camera functionality for profile and ID photos
   - Image compression for optimal storage
   - Preview capability before submission
   - Retake option available

3. **Validation**

   - Required fields validation
   - Photo presence verification
   - Transport mode specific validations

4. **Submission Flow**
   - All updates are sent for review
   - User is logged out after submission
   - Changes take effect after approval

## Technical Details

### Components

- `UpdatePlasaDrawer.tsx`: Main component for profile updates
- Camera integration for photo capture
- Image compression utility
- Form validation system

### State Management

- Form values
- Photo states
- Loading states
- Validation states

### API Integration

- Profile update endpoint
- Photo upload handling
- Status management

### Security

- Session validation
- Required authentication
- Secure photo handling

## UI/UX Features

### Form Elements

- Input validation
- Error messaging
- Loading states
- Success notifications

### Photo Management

- Live camera preview
- Photo capture
- Image compression
- Preview functionality

### Responsive Design

- Mobile-friendly interface
- Adaptive layout
- Touch-friendly controls

## Status Management

### Profile Statuses

- Pending: Under review
- Active: Approved and active
- Inactive: Temporarily disabled

### Update Process

1. User submits updates
2. Status changes to "pending"
3. Admin review
4. Status updates based on review
5. User notified of changes

## Error Handling

- Form validation errors
- Photo capture errors
- API integration errors
- Network issues
- Session management

## Best Practices

1. Always verify photo quality
2. Ensure all required fields are filled
3. Keep information up to date
4. Follow transport mode requirements
5. Maintain valid documentation

## Future Enhancements

- Real-time status updates
- Enhanced photo validation
- Additional transport modes
- Extended documentation options
- Improved mobile experience

# Complex System Logic Documentation

## 1. Profile Management System

### Core Components

- Location: `src/components/shopper/profile/UpdateShopperDrawer.tsx`
- Purpose: Handles Plasa profile updates and document management

### Key Features

1. **Document Management**

   - Profile photo capture and validation
   - National ID verification
   - Image compression and optimization
   - Real-time preview functionality

2. **Form State Management**

   - Multi-step form validation
   - Real-time field validation
   - Error state handling
   - Loading state management

3. **Data Flow**
   - Client-side validation
   - Server-side verification
   - Status updates
   - Error recovery

## 2. Notification System

### Core Components

- Location: `src/components/shopper/NotificationSystem.tsx`
- Purpose: Real-time order notification and management

### Key Features

1. **Schedule Management**

   ```typescript
   interface ShopperSchedule {
     day_of_week: number;
     start_time: string;
     end_time: string;
     is_available: boolean;
   }
   ```

2. **Order Processing**

   - Real-time order notifications
   - Batch assignment system
   - Location-based filtering
   - Priority-based distribution

3. **State Management**
   - Active order tracking
   - Schedule validation
   - Location updates
   - Notification preferences

## 3. Order Management System

### Core Components

- Location: `src/components/shopper/batchDetails.tsx`
- Purpose: Handles order lifecycle and payment processing

### Key Features

1. **Order Lifecycle**

   - Status transitions
   - Payment processing
   - Invoice generation
   - Delivery confirmation

2. **Payment System**

   - OTP verification
   - Refund processing
   - Wallet integration
   - Transaction logging

3. **Document Generation**
   - Invoice creation
   - Receipt generation
   - Order history
   - Payment records

## 4. Dashboard and Map Integration

### Core Components

- Location: `src/components/shopper/dashboard/MapSection.tsx`
- Purpose: Real-time location tracking and order visualization

### Key Features

1. **Location Services**

   - Real-time tracking
   - Geofencing
   - Route optimization
   - Distance calculations

2. **Order Visualization**

   - Map markers
   - Order clustering
   - Route display
   - Status indicators

3. **Integration Points**
   - Google Maps API
   - Location services
   - Real-time updates
   - State management

## 5. Schedule Management

### Core Components

- Location: `src/components/shopper/profile/ShopperProfileComponent.tsx`
- Purpose: Manages Plasa availability and working hours

### Key Features

1. **Schedule Configuration**

   ```typescript
   interface TimeSlot {
     day: string;
     startTime: string;
     endTime: string;
     available: boolean;
   }
   ```

2. **Availability Management**

   - Weekly schedule
   - Time slot validation
   - Break management
   - Status updates

3. **Integration**
   - Calendar sync
   - Notification system
   - Order assignment
   - Status updates

## 6. Payment and Wallet System

### Core Components

- Multiple components across the application
- Purpose: Handles financial transactions and wallet management

### Key Features

1. **Wallet Management**

   - Balance tracking
   - Transaction history
   - Payment processing
   - Refund handling

2. **Payment Processing**

   - OTP verification
   - Transaction validation
   - Error recovery
   - Receipt generation

3. **Security Features**
   - Encryption
   - Token management
   - Session validation
   - Error handling

## 7. Logging and Monitoring System

### Core Components

- Location: `pages/api/logs/read.ts` and `pages/api/queries/system-logs.ts`
- Purpose: System-wide logging and monitoring

### Key Features

1. **Log Management**

   ```typescript
   interface LogEntry {
     type: LogLevel;
     message: string;
     component: string;
     details?: any;
     timestamp: string;
   }
   ```

2. **Monitoring Features**

   - Real-time logging
   - Error tracking
   - Performance monitoring
   - System health checks

3. **Integration Points**
   - API endpoints
   - Client-side logging
   - Server-side logging
   - Error reporting

## 8. API Utilities and Error Handling

### Core Components

- Location: `src/lib/apiUtils.ts`
- Purpose: Centralized API management and error handling

### Key Features

1. **API Management**

   - Request handling
   - Response validation
   - Error recovery
   - Retry logic

2. **Error Handling**

   - Error categorization
   - Recovery strategies
   - User feedback
   - Logging integration

3. **Security Features**
   - Authentication
   - Authorization
   - Token management
   - Session handling

## 9. Order Sorting and Filtering

### Core Components

- Location: `src/components/shopper/dashboard/ShopperDashboard.tsx`
- Purpose: Manages order display and prioritization

### Key Features

1. **Sorting Logic**

   ```typescript
   type SortCriteria = "newest" | "earnings" | "distance" | "priority";
   ```

2. **Filtering System**

   - Multiple criteria
   - Real-time updates
   - Priority management
   - Distance calculations

3. **Performance Optimization**
   - Memoization
   - Caching
   - Lazy loading
   - State management

## 10. Registration and Onboarding

### Core Components

- Location: `src/components/shopper/ShopperRegistrationForm.tsx`
- Purpose: Handles Plasa registration and verification

### Key Features

1. **Registration Process**

   - Multi-step form
   - Document verification
   - Status management
   - Error handling

2. **Verification System**

   - Document validation
   - Identity verification
   - Status updates
   - Notification system

3. **Integration Points**
   - API endpoints
   - Document storage
   - Status management
   - User feedback

## Technical Patterns

### 1. State Management

```typescript
// Example of state management pattern
const [state, setState] = useState<StateType>(initialState);
const stateRef = useRef<StateType>(initialState);
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

### 2. Error Handling

```typescript
// Example of error handling pattern
try {
  // Operation
} catch (error) {
  logger.error("Operation failed", "ComponentName", error);
  // Recovery logic
} finally {
  // Cleanup
}
```

### 3. Real-time Updates

```typescript
// Example of real-time update pattern
useEffect(() => {
  const interval = setInterval(() => {
    // Update logic
  }, updateInterval);
  return () => clearInterval(interval);
}, [dependencies]);
```

### 4. Security

```typescript
// Example of security pattern
const validateSession = async () => {
  const session = await getSession();
  if (!session) {
    redirectToLogin();
    return;
  }
  // Continue with protected operation
};
```

### 5. Performance Optimization

```typescript
// Example of performance optimization pattern
const memoizedComponent = React.memo(({ prop }) => {
  // Component logic
});

const memoizedValue = useMemo(() => {
  return expensiveComputation(prop);
}, [prop]);
```

## Best Practices

1. **Code Organization**

   - Modular components
   - Clear separation of concerns
   - Consistent naming conventions
   - Proper file structure

2. **Error Handling**

   - Comprehensive error catching
   - User-friendly error messages
   - Proper error logging
   - Recovery strategies

3. **Performance**

   - Memoization where appropriate
   - Lazy loading of components
   - Efficient state management
   - Optimized rendering

4. **Security**

   - Input validation
   - Session management
   - Secure API calls
   - Data encryption

5. **Testing**
   - Unit tests
   - Integration tests
   - End-to-end tests
   - Performance testing

## Future Enhancements

1. **System Improvements**

   - Enhanced error recovery
   - Improved performance
   - Better state management
   - Advanced caching

2. **Feature Additions**

   - Advanced analytics
   - Enhanced reporting
   - Additional payment methods
   - Improved notification system

3. **Technical Upgrades**
   - TypeScript improvements
   - React optimization
   - API enhancements
   - Security upgrades

# Navigation and Vehicle Management System

## Navigation System

### Core Components

- Location: `src/components/shopper/ShopperSidebar.tsx` and `src/components/ui/NavBar/bottomBar.tsx`
- Purpose: Handles navigation between different sections of the Plasa application

### Navigation Features

1. **Desktop Navigation**

   - Sidebar-based navigation
   - Persistent across pages
   - Real-time active state tracking
   - Smooth transitions between pages
   - Cached page loading for better performance

2. **Mobile Navigation**

   - Bottom bar navigation
   - Floating action buttons
   - Quick access to key features
   - Responsive design
   - Touch-friendly interface

3. **Navigation Items**

   - Available Batches
   - Active Batches
   - Earnings (with real-time updates)
   - Settings
   - Profile Management

4. **Performance Optimizations**
   - Shallow routing for instant navigation
   - Page caching to prevent rebuilds
   - State preservation between routes
   - Optimized re-renders

## Vehicle Management System

### Core Components

- Location: `src/components/shopper/profile/VehicleManagement.tsx`
- Purpose: Manages delivery vehicle information and documentation

### Features

1. **Vehicle Information**

   - Vehicle Type Selection
   - License Plate Number
   - Vehicle Photos
   - Documentation Upload
   - Vehicle Status Tracking

2. **Documentation Requirements**

   - Vehicle Registration
   - Insurance Documents
   - License Information
   - Vehicle Photos (multiple angles)
   - Compliance Certificates

3. **Status Management**

   - Pending Review
   - Approved
   - Rejected
   - Under Maintenance
   - Active/Inactive

4. **Ticket System**
   - Raise Support Tickets
   - Track Ticket Status
   - Communication with Support
   - Resolution Tracking
   - History Management

### Ticket Management

1. **Ticket Creation**

   - Subject Line
   - Detailed Description
   - Priority Level
   - Category Selection
   - Attachment Support

2. **Ticket Categories**

   - Vehicle Issues
   - Documentation Problems
   - Technical Support
   - Account Issues
   - General Inquiries

3. **Priority Levels**

   - High Priority
   - Medium Priority
   - Low Priority
   - Urgent

4. **Ticket Flow**
   - Creation
   - Assignment
   - Response
   - Resolution
   - Feedback

### Technical Implementation

1. **State Management**

   ```typescript
   interface VehicleState {
     type: string;
     licensePlate: string;
     photos: string[];
     documents: Document[];
     status: VehicleStatus;
   }

   interface TicketState {
     subject: string;
     description: string;
     priority: Priority;
     category: Category;
     status: TicketStatus;
   }
   ```

2. **API Integration**

   - Vehicle CRUD operations
   - Document upload handling
   - Ticket management
   - Status updates
   - Notification system

3. **UI Components**
   - Vehicle form
   - Document uploader
   - Ticket creation drawer
   - Status indicators
   - Progress tracking

### Best Practices

1. **Vehicle Management**

   - Regular document updates
   - Photo quality verification
   - Status monitoring
   - Compliance checking

2. **Ticket Handling**

   - Clear communication
   - Proper categorization
   - Priority assessment
   - Timely responses

3. **Documentation**
   - Complete information
   - Valid documents
   - Regular updates
   - Compliance verification

### Security Features

1. **Document Security**

   - Secure upload
   - Access control
   - Data encryption
   - Privacy protection

2. **Ticket Security**
   - User authentication
   - Data validation
   - Access restrictions
   - Audit logging

### Future Enhancements

1. **Vehicle Management**

   - Real-time tracking
   - Maintenance scheduling
   - Performance analytics
   - Automated compliance

2. **Ticket System**
   - AI-powered categorization
   - Automated responses
   - Enhanced tracking
   - Integration with CRM

# Grocery Store Application

## Search Functionality

### User Dashboard Search

The application provides a comprehensive search system that allows users to find shops and products efficiently.

#### Features

1. **Category-based Search**

   - Users can filter shops by categories:
     - Super Market
     - Public Markets
     - Bakeries
     - Butchers
     - Delicatessen
     - Organic Shops
     - Specialty Foods
   - Each category has a unique icon for easy identification
   - Categories are displayed in a responsive grid on desktop
   - Mobile users get a dropdown menu for category selection

2. **Search Implementation**

   ```typescript
   const filteredShops = useMemo(() => {
     if (!authReady || role === "shopper") return [];

     return selectedCategory
       ? data.shops?.filter((shop) => shop.category_id === selectedCategory) ||
           []
       : data.shops || [];
   }, [authReady, role, selectedCategory, data.shops]);
   ```

3. **Search Features**

   - Real-time filtering
   - Category-based filtering
   - Responsive design for both mobile and desktop
   - Clear filter option
   - Loading states during search
   - Error handling for failed searches

4. **Mobile Experience**

   - Dropdown menu for category selection
   - Easy-to-use interface
   - Clear visual feedback
   - Smooth transitions

5. **Desktop Experience**
   - Grid layout for categories
   - Visual indicators for selected category
   - Hover effects for better interaction
   - Clear filter button when category is selected

### Usage

1. **Selecting a Category**

   - On desktop: Click on any category card in the grid
   - On mobile: Use the dropdown menu to select a category
   - The selected category will be highlighted
   - Shops will be filtered automatically

2. **Clearing Selection**

   - On desktop: Click the "Clear Filter" button
   - On mobile: Use the "Clear Selection" option in the dropdown
   - All shops will be displayed again

3. **Viewing Results**
   - Filtered shops are displayed in a responsive grid
   - Each shop card shows:
     - Shop image
     - Name
     - Description
     - Distance
     - Estimated delivery time
     - Open/Closed status

### Technical Implementation

1. **State Management**

   ```typescript
   const [selectedCategory, setSelectedCategory] = useState<string | null>(
     null
   );
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   ```

2. **Error Handling**

   ```typescript
   try {
     setSelectedCategory(categoryId);
     setIsLoading(false);
   } catch (err) {
     setError("Failed to filter shops. Please try again.");
     setIsLoading(false);
   }
   ```

3. **Loading States**
   - Skeleton loading for categories
   - Skeleton loading for shop cards
   - Smooth transitions between states

### Best Practices

1. **Performance**

   - Using `useMemo` for filtered results
   - Lazy loading of images
   - Efficient state updates

2. **Accessibility**

   - Clear visual indicators
   - Proper ARIA labels
   - Keyboard navigation support

3. **User Experience**
   - Immediate feedback on actions
   - Clear error messages
   - Smooth transitions
   - Responsive design

### Future Improvements

1. **Planned Features**

   - Advanced search filters
   - Search by shop name
   - Search by product
   - Price range filters
   - Rating filters

2. **Technical Enhancements**
   - Search debouncing
   - Caching of search results
   - Improved error handling
   - Better loading states

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

# Grocery Delivery App

## Delivery Photo Upload Feature

### Overview

The delivery photo upload feature ensures that delivery confirmation photos are properly captured, uploaded, and stored in the database. The system includes safeguards to prevent data loss during the upload process.

### Key Features

#### 1. Photo Capture

- Camera integration for direct photo capture
- Support for file upload as an alternative
- Real-time preview of captured photos
- Image compression and validation

#### 2. Upload Process

- Automatic upload to server after capture
- Progress tracking during upload
- Error handling and retry capabilities
- Validation of file types and sizes

#### 3. Persistence

- Upload state is preserved across page refreshes
- Modal remains open until upload completes
- Prevents accidental closure during upload
- Automatic state recovery after page refresh

### Technical Implementation

#### State Management

```typescript
// Local storage keys
const UPLOAD_STATE_KEY = `delivery_upload_${orderId}`;

// States
const [photoUploading, setPhotoUploading] = useState(false);
const [photoUploaded, setPhotoUploaded] = useState(false);
const [forceOpen, setForceOpen] = useState(false);
```

#### Upload Process

1. Photo capture/selection
2. State saved to localStorage
3. Upload to server
4. Database update
5. State cleanup

#### Error Handling

- Network errors
- Invalid file types
- Size limitations
- Server errors

### API Endpoints

#### Upload Delivery Photo

```typescript
POST /api/shopper/uploadDeliveryPhoto
Content-Type: application/json

{
  "orderId": "uuid",
  "file": "base64_image_data"
}
```

### Database Schema

#### Orders Table

```sql
ALTER TABLE orders
ADD COLUMN delivery_photo TEXT;
```

### Usage

1. Open Delivery Confirmation Modal
2. Choose capture method:
   - Take Photo (camera)
   - Upload Photo (file)
3. Preview and confirm photo
4. Wait for upload completion
5. View confirmation

### Safety Features

1. **Upload Protection**

   - Modal cannot be closed during upload
   - State persists across page refreshes
   - Clear upload progress indicators

2. **Data Validation**

   - File type checking
   - Size limitations
   - Image compression

3. **Error Recovery**
   - Automatic retry on failure
   - Clear error messages
   - State preservation

### Best Practices

1. **Photo Capture**

   - Use good lighting
   - Ensure package is clearly visible
   - Include delivery location context

2. **Upload Process**

   - Maintain stable internet connection
   - Don't close browser during upload
   - Wait for confirmation message

3. **Troubleshooting**
   - Check internet connection
   - Verify file size and type
   - Contact support if issues persist

### Technical Requirements

- Modern web browser with camera access
- JavaScript enabled
- Local storage support
- Stable internet connection

### Security Considerations

1. **Data Protection**

   - Secure API endpoints
   - Authentication required
   - Data validation

2. **Privacy**
   - Camera permission handling
   - Secure storage
   - Data cleanup

### Future Improvements

1. **Planned Features**

   - Multiple photo upload
   - Photo editing capabilities
   - Offline support
   - Automatic retry

2. **Performance**
   - Enhanced compression
   - Faster upload speeds
   - Better error handling

### Support

For technical issues or questions, please contact:

- Technical Support: support@example.com
- Bug Reports: bugs@example.com

## Nearby Dasher Notification Logic

The API route at `pages/api/queries/notify-nearby-dashers.ts` is responsible for notifying available dashers (shoppers) about new batches (orders) at nearby shops. This helps dashers quickly claim new work in their area.

**How it works:**

1. **Fetch Recent Batches:**
   - Finds all orders with status `PENDING` created in the last 20 minutes.
2. **Fetch Available Dashers:**
   - Gets all dashers who are currently available, along with their last known location.
3. **Group Batches by Shop:**
   - Groups the available batches by their shop.
4. **Calculate Distance:**
   - For each dasher, calculates the travel time (in minutes) from their last known location to each shop with available batches, using the Google Maps Distance Matrix API.
5. **Find Nearby Batches:**
   - If a shop is within 10 minutes travel time of a dasher, all its batches are considered "nearby" for that dasher.
6. **Create Notification:**
   - If there are any nearby batches for a dasher, a notification is created for that dasher, summarizing how many new batches are available and at which shops.
7. **Insert Notifications:**
   - All notifications are inserted into the database in a single batch.

**Purpose:**

- This endpoint is typically triggered by a scheduled job or backend process every few minutes to proactively alert dashers about new work opportunities close to them.
- Dashers receive a notification if there are new batches at shops within a 10-minute travel distance, so they can act quickly to claim those orders.

# Grocery Delivery App

## Notification System

### Overview

The notification system provides real-time order notifications to shoppers with persistent toast notifications that stay visible until specific conditions are met. The system uses react-hot-toast for reliable toast management and includes advanced features like location-based filtering, notification preferences, and two-stage notification alerts.

### Key Features

#### 1. Persistent Toast Notifications

- **Duration**: Toasts stay visible until manually closed or order expires
- **Replacement**: New notifications replace existing ones for the same order
- **Custom Design**: Beautiful, responsive toast components with action buttons
- **Type Support**: Info, success, warning, and error notification types

#### 2. Two-Stage Notification System

- **Initial Notification**: Shows immediately when order is assigned (60 seconds)
- **Warning Notification**: Shows after 40 seconds if not accepted (20 seconds remaining)
- **Automatic Cleanup**: Toasts are removed when orders expire or are accepted

#### 3. Location-Based Filtering

- **Live Location**: Use current GPS location for notifications
- **Custom Locations**: Up to 2 saved locations for notification preferences
- **Distance Filtering**: Maximum distance setting (default: 10km)
- **Age Filtering**: Only new orders within 10 minutes

#### 4. Notification Preferences

- **Sound Settings**: Enable/disable sound with volume control
- **Notification Types**: Filter by order types (regular, reel, etc.)
- **Schedule Integration**: Respect shopper availability schedules
- **Active Order Check**: Don't notify if shopper has active orders

### Technical Implementation

#### Component Structure

```typescript
// Main notification system component
src / components / shopper / NotificationSystem.tsx;

// Key interfaces
interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
  expiresAt: number;
  warningShown: boolean;
  warningTimeout: NodeJS.Timeout | null;
}
```

#### Toast Management

```typescript
// Toast tracking system
const activeToasts = useRef<Map<string, any>>(new Map());

// Remove existing toast for order
const removeToastForOrder = (orderId: string) => {
  const existingToast = activeToasts.current.get(orderId);
  if (existingToast) {
    toast.dismiss(existingToast);
    activeToasts.current.delete(orderId);
  }
};
```

#### Custom Toast Components

```typescript
// Initial notification toast
const toastKey = toast.custom(
  (t) => (
    <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
      {/* Toast content with action buttons */}
    </div>
  ),
  {
    duration: Infinity, // Never auto-dismiss
    position: "top-right",
  }
);
```

### API Endpoints

#### 1. Check Notifications with Settings

```typescript
POST /api/shopper/check-notifications-with-settings
{
  "user_id": "uuid",
  "current_location": {
    "lat": number,
    "lng": number
  }
}

// Response
{
  "success": true,
  "notifications": [...],
  "settings": {
    "sound_settings": {
      "enabled": boolean,
      "volume": number
    },
    "notification_preferences": {
      "live_location": boolean,
      "custom_locations": [...],
      "max_distance": number,
      "notification_types": [...]
    }
  }
}
```

#### 2. Save Notification Settings

```typescript
POST /api/shopper/save-notification-settings
{
  "user_id": "uuid",
  "settings": {
    "live_location": boolean,
    "custom_locations": [
      {
        "name": string,
        "lat": number,
        "lng": number
      }
    ],
    "max_distance": number,
    "notification_types": string[],
    "sound_settings": {
      "enabled": boolean,
      "volume": number
    }
  }
}
```

### Database Schema

#### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  shop_name VARCHAR(255),
  distance DECIMAL(10,2),
  location_name VARCHAR(255),
  customer_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
);
```

#### Shopper Notification Settings Table

```sql
CREATE TABLE shopper_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  live_location BOOLEAN DEFAULT TRUE,
  custom_locations JSONB DEFAULT '[]',
  max_distance INTEGER DEFAULT 10,
  notification_types TEXT[] DEFAULT '{}',
  sound_settings JSONB DEFAULT '{"enabled": true, "volume": 0.7}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Notification Flow

#### 1. Initial Assignment

```
Order Created → Check Shopper Availability → Assign to Shopper → Show Initial Toast
```

#### 2. Warning Stage

```
40 seconds → Show Warning Toast → 20 seconds remaining → Auto-reassign
```

#### 3. Cleanup

```
Order Expires → Remove Toast → Reassign to Next Shopper
```

### Configuration Options

#### Notification Preferences

- **Live Location**: Use current GPS location
- **Custom Locations**: Up to 2 saved locations
- **Max Distance**: Filter orders by distance (1-50km)
- **Notification Types**: Filter by order types
- **Sound Settings**: Enable/disable with volume control

#### Timing Settings

- **Check Interval**: 60 seconds between checks
- **Assignment Timeout**: 60 seconds per assignment
- **Warning Delay**: 40 seconds before warning
- **Age Filter**: Only orders within 10 minutes

### Usage Examples

#### Basic Implementation

```typescript
import NotificationSystem from "../components/shopper/NotificationSystem";

function ShopperDashboard() {
  return (
    <div>
      <NotificationSystem
        currentLocation={userLocation}
        onAcceptBatch={handleAcceptBatch}
        onViewBatchDetails={handleViewDetails}
      />
    </div>
  );
}
```

#### With Custom Settings

```typescript
// Notification settings component
<NotificationTab
  settings={notificationSettings}
  onSave={handleSaveSettings}
  onTest={handleTestNotifications}
/>
```

### Error Handling

#### Common Issues

1. **Location Permission Denied**

   - Fallback to saved locations
   - Show permission request dialog

2. **Network Errors**

   - Retry with exponential backoff
   - Show offline indicator

3. **Toast Dismissal**
   - Proper cleanup of active toasts
   - Remove from tracking system

### Performance Considerations

#### Optimization Strategies

- **Debounced Location Updates**: Prevent excessive API calls
- **Toast Pooling**: Limit concurrent toasts
- **Memory Management**: Clean up expired assignments
- **Caching**: Cache notification settings

#### Monitoring

- **Toast Lifecycle**: Track creation, dismissal, replacement
- **API Performance**: Monitor response times
- **User Engagement**: Track acceptance rates

### Security Features

#### Data Protection

- **Authentication**: All endpoints require valid session
- **Authorization**: Users can only access their own notifications
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse

#### Privacy

- **Location Data**: Encrypted storage and transmission
- **Notification History**: Automatic cleanup of old data
- **User Consent**: Explicit permission for notifications

### Testing

#### Manual Testing

1. **Toast Persistence**: Verify toasts stay visible
2. **Replacement Logic**: Test new notifications replacing old ones
3. **Expiration Cleanup**: Confirm automatic removal
4. **Action Buttons**: Test accept and view details functionality

#### Automated Testing

```typescript
// Example test cases
describe("NotificationSystem", () => {
  test("toast stays visible until order expires", () => {
    // Test implementation
  });

  test("new notification replaces existing toast", () => {
    // Test implementation
  });

  test("warning notification shows after 40 seconds", () => {
    // Test implementation
  });
});
```

### Troubleshooting

#### Common Problems

1. **Toasts Disappearing Too Soon**

   - Check duration settings
   - Verify react-hot-toast configuration
   - Ensure proper cleanup logic

2. **Notifications Not Showing**

   - Check location permissions
   - Verify notification settings
   - Confirm API connectivity

3. **Performance Issues**
   - Monitor toast count
   - Check memory usage
   - Review API response times

### Future Enhancements

#### Planned Features

- **Push Notifications**: Browser push notifications
- **Offline Support**: Queue notifications when offline
- **Advanced Filtering**: More granular notification preferences
- **Analytics**: Detailed notification performance metrics

#### Technical Improvements

- **WebSocket Integration**: Real-time notifications
- **Service Worker**: Background notification handling
- **Progressive Web App**: Native app-like experience

### Support

For technical issues or questions about the notification system:

- **Documentation**: Check this README section
- **Code Examples**: See component implementation
- **API Reference**: Review endpoint documentation
- **Bug Reports**: Contact development team

---

## Delivery Photo Upload Feature

---

# Dynamic Currency System

## Overview

The grocery delivery application implements a dynamic currency system that allows administrators to configure the currency used throughout the application via the `System_configuratioins` table. This ensures consistency across all components and eliminates hardcoded currency values.

## Architecture

### System Configuration Table

The currency is stored in the `System_configuratioins` table:

```sql
System_configuratioins {
  id: uuid (primary key)
  currency: string (e.g., "RWF", "USD", "EUR")
  baseDeliveryFee: string
  serviceFee: string
  deliveryCommissionPercentage: string
  productCommissionPercentage: string
  // ... other configuration fields
}
```

### Currency Utility Functions

The system provides several utility functions for currency formatting:

```typescript
// src/utils/formatCurrency.ts

// Dynamic currency formatter (async)
export const formatCurrency = async (amount: string | number) => {
  const config = await getSystemConfiguration();
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Synchronous version (uses cached config)
export const formatCurrencySync = (amount: string | number) => {
  const config = systemConfigCache || { currency: "RWF" };
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Get currency symbol
export const getCurrencySymbol = () => {
  const config = systemConfigCache || { currency: "RWF" };
  return config.currency;
};

// Refresh cache
export const refreshCurrencyCache = () => {
  systemConfigCache = null;
  cacheTimestamp = 0;
};
```

## Caching System

### Cache Management

- **Cache Duration**: 5 minutes
- **Automatic Refresh**: Fetches new config when cache expires
- **Fallback**: Uses default currency (RWF) if fetch fails
- **Manual Refresh**: `refreshCurrencyCache()` function available

### Cache Implementation

```typescript
// Cache for system configuration
let systemConfigCache: { currency: string } | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch system configuration
async function getSystemConfiguration() {
  const now = Date.now();

  // Return cached config if still valid
  if (systemConfigCache && now - cacheTimestamp < CACHE_DURATION) {
    return systemConfigCache;
  }

  try {
    const response = await fetch("/api/queries/system-configuration");
    const data = await response.json();

    if (data.success && data.config) {
      systemConfigCache = {
        currency: data.config.currency || "RWF",
      };
      cacheTimestamp = now;
      return systemConfigCache;
    }
  } catch (error) {
    console.warn(
      "Failed to fetch system configuration, using default currency:",
      error
    );
  }

  return { currency: "RWF" };
}
```

## Usage Examples

### Component Implementation

```typescript
import {
  formatCurrencySync,
  getCurrencySymbol,
} from "../../utils/formatCurrency";

// In a React component
function OrderCard({ order }) {
  return (
    <div>
      <p>Total: {formatCurrencySync(order.total)}</p>
      <p>Currency: {getCurrencySymbol()}</p>
    </div>
  );
}
```

### API Response Formatting

```typescript
// In API endpoints
import { formatCurrencySync } from "../../utils/formatCurrency";

export default async function handler(req, res) {
  const order = await getOrder(orderId);

  return res.json({
    success: true,
    order: {
      ...order,
      formattedTotal: formatCurrencySync(order.total),
      formattedEarnings: formatCurrencySync(order.estimatedEarnings),
    },
  });
}
```

## Components Updated

### Shopper Components

- **NotificationSystem**: Dynamic currency in notifications
- **ActiveBatchesCard**: Currency formatting in batch cards
- **PaymentModal**: Dynamic currency display
- **Earnings Components**: All earnings displays use dynamic currency
- **MapSection**: Order markers show dynamic currency

### User Components

- **UserPaymentCards**: Dynamic currency in payment displays
- **PaymentMethodSelector**: Currency formatting in checkout
- **Order Components**: All order displays use dynamic currency

### Admin Components

- **Revenue Reports**: Dynamic currency in reports
- **Analytics**: Currency-aware calculations
- **Settings**: Currency configuration interface

## Configuration

### Setting Currency

1. **Database Update**:

   ```sql
   UPDATE System_configuratioins
   SET currency = 'USD'
   WHERE id = 'your-config-id';
   ```

2. **API Endpoint**:

   ```typescript
   POST /api/admin/update-system-config
   {
     "currency": "USD"
   }
   ```

3. **Cache Refresh**:
   ```typescript
   import { refreshCurrencyCache } from "../../utils/formatCurrency";
   refreshCurrencyCache();
   ```

### Supported Currencies

The system supports all ISO 4217 currency codes:

- **RWF**: Rwandan Franc (default)
- **USD**: US Dollar
- **EUR**: Euro
- **GBP**: British Pound
- **KES**: Kenyan Shilling
- **UGX**: Ugandan Shilling
- **TZS**: Tanzanian Shilling

## Best Practices

### Performance Optimization

1. **Use Synchronous Functions**: Use `formatCurrencySync` for immediate display
2. **Cache Management**: Let the system handle cache automatically
3. **Error Handling**: Always provide fallback values

### Code Examples

```typescript
// ✅ Good: Use synchronous function for immediate display
const displayAmount = formatCurrencySync(order.total);

// ✅ Good: Provide fallback values
const displayAmount = formatCurrencySync(order.total || 0);

// ❌ Bad: Don't hardcode currency
const displayAmount = `RWF ${order.total}`;

// ❌ Bad: Don't use async in render
const displayAmount = await formatCurrency(order.total);
```

### Error Handling

```typescript
// Handle currency formatting errors
try {
  const formattedAmount = formatCurrencySync(amount);
  return formattedAmount;
} catch (error) {
  console.warn("Currency formatting failed:", error);
  return `${amount}`; // Fallback to plain number
}
```

## Migration Guide

### From Hardcoded Currency

1. **Replace Hardcoded Values**:

   ```typescript
   // Before
   const amount = `RWF ${order.total}`;

   // After
   import { formatCurrencySync } from "../../utils/formatCurrency";
   const amount = formatCurrencySync(order.total);
   ```

2. **Update Intl.NumberFormat**:

   ```typescript
   // Before
   new Intl.NumberFormat("en-RW", {
     style: "currency",
     currency: "RWF",
   }).format(amount);

   // After
   formatCurrencySync(amount);
   ```

3. **Update Currency Symbols**:

   ```typescript
   // Before
   <span>RWF</span>;

   // After
   import { getCurrencySymbol } from "../../utils/formatCurrency";
   <span>{getCurrencySymbol()}</span>;
   ```

## Testing

### Unit Tests

```typescript
describe("Currency Formatting", () => {
  test("formats currency correctly", () => {
    const result = formatCurrencySync(1000);
    expect(result).toContain("RWF");
  });

  test("handles zero amounts", () => {
    const result = formatCurrencySync(0);
    expect(result).toBe("RWF 0");
  });

  test("handles string amounts", () => {
    const result = formatCurrencySync("1500");
    expect(result).toBe("RWF 1,500");
  });
});
```

### Integration Tests

```typescript
describe("System Configuration", () => {
  test("fetches currency from API", async () => {
    const response = await fetch("/api/queries/system-configuration");
    const data = await response.json();
    expect(data.config.currency).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

1. **Currency Not Updating**:

   - Check cache duration
   - Call `refreshCurrencyCache()`
   - Verify API response

2. **Formatting Errors**:

   - Check currency code validity
   - Verify amount is numeric
   - Handle edge cases

3. **Performance Issues**:
   - Monitor cache hit rates
   - Check API response times
   - Optimize component rendering

### Debug Tools

```typescript
// Check current currency
console.log("Current currency:", getCurrencySymbol());

// Refresh cache manually
refreshCurrencyCache();

// Check cache status
console.log("Cache timestamp:", cacheTimestamp);
```

## API Reference

### System Configuration API

```typescript
GET /api/queries/system-configuration

Response:
{
  "success": true,
  "config": {
    "currency": "RWF",
    "baseDeliveryFee": "2000",
    "serviceFee": "1000",
    // ... other config fields
  }
}
```

### Currency Utility Functions

| Function                     | Description                        | Usage             |
| ---------------------------- | ---------------------------------- | ----------------- |
| `formatCurrencySync(amount)` | Format amount with cached currency | Immediate display |
| `formatCurrency(amount)`     | Format amount with fresh currency  | Async operations  |
| `getCurrencySymbol()`        | Get current currency symbol        | Display currency  |
| `refreshCurrencyCache()`     | Clear cache and refetch            | Force update      |

## Future Enhancements

### Planned Features

- **Multi-Currency Support**: Support for multiple currencies simultaneously
- **Currency Conversion**: Real-time exchange rates
- **Regional Formatting**: Locale-specific formatting
- **Currency Preferences**: User-specific currency settings

### Technical Improvements

- **WebSocket Updates**: Real-time currency changes
- **Service Worker**: Background currency updates
- **Progressive Enhancement**: Graceful degradation

---

## Delivery Photo Upload Feature
