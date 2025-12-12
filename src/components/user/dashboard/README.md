# User Dashboard Components

This directory contains the responsive user dashboard components for the grocery app.

## Structure

### Components

- **`ResponsiveUserDashboard.tsx`** - Main wrapper component that detects screen size and renders the appropriate dashboard
- **`MobileUserDashboard.tsx`** - Mobile-optimized dashboard with touch-friendly UI
- **`DesktopUserDashboard.tsx`** - Desktop-optimized dashboard with detailed layouts
- **`UserDashboard.tsx`** - Original component (kept for reference, can be removed later)

### Shared Components

- **`shared/UserDashboardLogic.tsx`** - Custom hook containing all business logic shared between mobile and desktop
- **`shared/SharedComponents.tsx`** - Reusable UI components and helper functions

## Features

### Mobile Dashboard

- Touch-friendly category dropdown
- Compact 2-column grid layout
- Simplified navigation
- Optimized for small screens

### Desktop Dashboard

- Full category grid with icons
- 6-column shop grid layout
- Refresh button
- More detailed information display
- Sidebar integration

## Usage

```tsx
import ResponsiveUserDashboard from "@components/user/dashboard/ResponsiveUserDashboard";

// In your page component
<ResponsiveUserDashboard initialData={data} />;
```

## Benefits

1. **Performance** - Only loads components needed for current device
2. **UX** - Tailored experience for each platform
3. **Maintainability** - Separate concerns for mobile vs desktop
4. **Scalability** - Easy to add platform-specific features

## Breakpoints

- Mobile: < 768px (md breakpoint)
- Desktop: ≥ 768px

The responsive wrapper automatically detects screen size and renders the appropriate component.

## Store Integration

### Overview

Stores are business entities that sell products directly to customers through the platform. They are integrated into the dashboard alongside shops and restaurants, providing a unified browsing experience. Stores have a distinct product-based ordering system with a dedicated checkout flow.

### Store Data Structure

Stores are fetched from the `business_stores` table with the following key fields:
- `id`: Unique store identifier
- `name`: Store name
- `description`: Store description
- `image`: Store image/logo
- `category_id`: Store category
- `latitude` / `longitude`: Store location coordinates
- `operating_hours`: JSON object containing operating hours by day
- `is_active`: Boolean indicating if store is active
- `business_id`: Reference to business account
- `business_account`: Nested relationship containing:
  - `account_type`: "personal" or "business"
  - `business_name`: Business name (if applicable)
  - `Users`: Owner information (for personal businesses)

### Store Data Fetching

1. **Initial Fetch (`pages/index.tsx`)**
   - Stores are fetched via `/api/queries/all-stores`
   - Only active stores (`is_active: true`) are retrieved
   - Stores are added to the `Data` interface as `stores: []`

2. **Data Transformation (`UserDashboardLogic.tsx`)**
   - Stores are transformed into a shop-like format for consistent rendering:
     ```typescript
     const storesAsShops = stores.map((store) => ({
       ...store,
       id: store.id,
       name: store.name,
       description: store.description || "Store",
       image: store.image,
       category_id: store.category_id || "store-category",
       latitude: store.latitude,
       longitude: store.longitude,
       operating_hours: store.operating_hours,
       is_store: true, // Identifier flag
       address: null,
       logo: store.image,
     }));
     ```

3. **Category Filtering**
   - Stores can be filtered by category like shops
   - Special "store-category" exists for store-only filtering
   - When a category is selected, stores matching that category are included
   - When "store-category" is selected, only stores are shown

4. **Distance Calculation**
   - Stores are included in the `shopsWithoutDynamics` array
   - Distance is calculated using Haversine formula between user location and store coordinates
   - Stores support "Nearby" filtering functionality
   - Transportation fees and delivery times are calculated based on distance

### Store Display in Dashboard

1. **ShopCard Component (`ShopCard.tsx`)**
   - Stores are rendered using the same `ShopCard` component as shops
   - Stores are identified by the `is_store: true` flag
   - Stores display with a "Store" badge to differentiate from shops
   - Navigation: Clicking a store navigates to `/stores/[id]` (not `/shops/[id]`)
   - Stores use a default placeholder image if no image is provided

2. **Search Integration (`SearchBar.tsx`)**
   - Stores are included in the main navbar search
   - Search query searches store names via `business_stores` table
   - Search results show stores with a "Store" badge
   - Clicking a store in search results navigates to `/stores/[id]`

3. **Sorting and Filtering**
   - Stores participate in all sorting options (name, distance, etc.)
   - Stores are included in category-based filtering
   - Stores work with the "Nearby" functionality
   - Stores respect all dashboard filters and sorting preferences

### Store Page (`/stores/[id]`)

The store page provides a dedicated product browsing and ordering experience:

1. **Page Structure (`pages/stores/[id].tsx`)**
   - Server-side rendered with `getServerSideProps`
   - Fetches store details including business account and owner info
   - Fetches all active products for the store from `PlasBusinessProductsOrSerive`
   - Passes data to `StorePage` component

2. **StorePage Component (`src/components/items/StorePage.tsx`)**
   - **Mobile Banner**: Full-width cover image with circular logo, store info, and status badge
   - **Desktop Header**: Traditional header with store name, description, and details
   - **Store Information Display**:
     - Store name, description, and image
     - Operating hours with open/closed status
     - Distance from user location
     - Owner information (for personal businesses)
     - Product count
   - **Product Grid**: 
     - Responsive grid layout (up to 6 columns on desktop, 2 on mobile)
     - Product cards with images, names, prices, and units
     - "Add" button opens quantity selection modal
   - **Selected Products Sidebar** (desktop):
     - Shows all selected products
     - Displays total quantity and total price
     - "Continue to Checkout" button
   - **Mobile Cart Card** (bottom of screen):
     - Expandable/collapsible card
     - Shows selected items count and total
     - Quick access to checkout
   - **Product Search**: Filter products by name
   - **Category Filtering**: Filter products by category

3. **Product Selection Flow**
   - User clicks "Add" button on product card
   - Modal opens for quantity selection
   - Selected products are added to local state
   - Products appear in sidebar (desktop) or cart card (mobile)
   - User can modify quantities or remove products

### Store Checkout Flow (`/stores/[id]/checkout`)

The checkout process handles order creation with delivery and payment:

1. **Checkout Data Storage**
   - Selected products are stored in `localStorage` as `storeCheckoutData`
   - Data structure:
     ```typescript
     {
       storeId: string;
       storeName: string;
       products: SelectedProduct[]; // with quantities
       total: number; // subtotal
       transportationFee: number;
       serviceFee: number;
     }
     ```

2. **Checkout Page Features**
   - **Mobile Banner**: Matches store page design with circular logo
   - **Products Display** (mobile): Shows order items above expandable card
   - **Desktop Layout**: Two-column layout with order summary and payment summary
   - **Delivery Calculation**:
     - Distance-based delivery time: Minimum 1 hour + 1 minute per km
     - Transportation fee: 1000 RWF for first 3km, then 300 RWF per additional km
     - Service fee: 5% of subtotal
   - **Address Management**: Users can select or change delivery address
   - **Payment Method Selection**: 
     - Integration with `PaymentMethodSelector` component
     - Supports wallet balance (refund balance)
     - Supports saved payment methods (cards, MTN MoMo)
   - **Order Comment**: Optional text field for special instructions

3. **Mobile Expandable Card**
   - Fixed at bottom of screen (above navbar)
   - Expandable/collapsible functionality
   - Shows cost breakdown, delivery details, payment method, and comment
   - Does NOT show products (products are in main content area above)
   - "Place Order" button with validation

4. **Order Creation (`/api/mutations/create-business-product-order`)**
   - Creates order in `businessProductOrders` table
   - Product details stored as JSONB:
     ```json
     {
       "name": "Product Name",
       "id": "product-id",
       "price": "1000",
       "quantity": 2,
       "unit": "kg",
       "measurement_type": "weight"
     }
     ```
   - Order includes:
     - `store_id`: Reference to store
     - `allProducts`: JSONB array of product details
     - `total`: Total amount including all fees
     - `transportation_fee`: Calculated delivery fee
     - `service_fee`: 5% service fee
     - `units`: Total units ordered
     - `latitude` / `longitude`: Delivery location
     - `deliveryAddress`: Formatted address string
     - `comment`: Optional order comment
     - `delivered_time`: Estimated delivery time
     - `timeRange`: Delivery time range
     - `payment_method`: Payment method type
     - `payment_method_id`: Payment method ID (if applicable)

### Store vs Shop Differences

| Feature | Stores | Shops |
|---------|--------|-------|
| **Navigation** | `/stores/[id]` | `/shops/[id]` |
| **Product Display** | Dedicated product grid with quantity selection | Menu items (restaurants) or services |
| **Order Type** | Product-based orders with quantities | Service requests or restaurant orders |
| **Checkout Flow** | Custom checkout with product details in JSONB | Different order structure |
| **Badge** | "Store" badge in dashboard | "Shop" or "Restaurant" badge |
| **Order Table** | `businessProductOrders` | Various order tables depending on type |

### Key API Endpoints

- **`/api/queries/all-stores`**: Fetches all active stores (public)
- **`/api/queries/store-details`**: Fetches store details with products (public)
- **`/api/queries/search`**: Includes stores in search results (public)
- **`/api/mutations/create-business-product-order`**: Creates store order (authenticated)

### Store Order Data Model

Orders are stored in `businessProductOrders` table with:
- `id`: UUID primary key
- `store_id`: Foreign key to business_stores
- `allProducts`: JSONB containing array of product objects
- `total`: Total order amount (including fees)
- `transportation_fee`: Delivery fee
- `service_fee`: Service fee (5% of subtotal)
- `units`: Total units ordered across all products
- `latitude` / `longitude`: Delivery coordinates
- `deliveryAddress`: Formatted address
- `comment`: Optional customer comments
- `delivered_time`: Estimated delivery time
- `timeRange`: Delivery time window
- `payment_method`: Payment method string
- `payment_method_id`: Payment method ID if applicable
- `created_at`: Order timestamp

### Best Practices

1. **Store Identification**: Always check `is_store: true` flag when handling stores
2. **Navigation**: Use `/stores/[id]` for store pages, never `/shops/[id]`
3. **Product Handling**: Store product quantities and details properly in checkout data
4. **Distance Calculation**: Include stores in `shopsWithoutDynamics` for accurate distance/time calculations
5. **Mobile UX**: Provide expandable cards for better mobile checkout experience
6. **Payment Integration**: Always use `PaymentMethodSelector` for consistent payment handling
