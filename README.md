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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Grocery Delivery Application

## Revenue and Checkout System

### Revenue Calculation Logic

The system uses a two-price model for revenue generation:

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
   - Stores order items with final_price
   - Creates revenue record with commission amount

3. **Revenue Record**:
   - Stores the difference between customer payment and shop payment
   - Links to the original order
   - Tracks commission as revenue

4. **Payment Flow**:
   - Customer pays the total with final_price + fees
   - Shop receives their original price amount (stored in Orders table)
   - System keeps the difference as revenue

### Technical Implementation

1. **Revenue Calculator** (`src/lib/revenueCalculator.ts`):
```typescript
export class RevenueCalculator {
  public static calculateRevenue(items: CartItem[]): {
    actualTotal: string;    // What we pay to shop (stored in Orders)
    customerTotal: string;  // What customer pays (used for checkout)
    revenue: string;        // Our profit
  } {
    const customerTotal = this.calculateTotal(items, 'final_price');
    const actualTotal = this.calculateTotal(items, 'price');
    const revenue = customerTotal - actualTotal;

    return {
      actualTotal: actualTotal.toFixed(2),
      customerTotal: customerTotal.toFixed(2),
      revenue: revenue.toFixed(2)
    };
  }
}
```

2. **Checkout Process** (`pages/api/checkout.ts`):
```typescript
// Calculate revenue
const revenueData = RevenueCalculator.calculateRevenue(items);

// Create order
const orderRes = await hasuraClient.request(CREATE_ORDER, {
  total: revenueData.actualTotal,  // Store what we pay to shop
  // ... other order details
});

// Create revenue record
await hasuraClient.request(CREATE_REVENUE, {
  order_id: orderId,
  amount: revenueData.revenue,  // Our profit
  type: "commission"
});
```

3. **Database Tables**:
   - `Orders`: Stores order details with actual total (what we pay to shop)
   - `Order_Items`: Stores items with final_price (what customer paid)
   - `Revenue`: Stores commission amount and links to order

### Important Notes

- Customers only see and interact with `final_price`
- Original `price` is used for backend calculations and stored in Orders table
- Revenue is automatically calculated and stored per order
- All monetary values are stored in RWF (Rwandan Francs)
- The system uses fixed-point arithmetic with 2 decimal places for all calculations
- All monetary values are stored as strings to preserve precision
