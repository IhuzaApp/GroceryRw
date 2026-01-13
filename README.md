# Grocery Delivery System

## Overview

A comprehensive grocery delivery platform with advanced revenue tracking, wallet management, order processing systems, and intelligent delivery time management. The system supports three order types: regular orders, reel-based orders, and restaurant orders with sophisticated payment, revenue management, and real-time delivery tracking.

## Key Systems

### 1. Revenue Management System

### 2. Wallet Balance System

### 3. Order Processing System

### 4. Payment Management System

### 5. Reel Orders System

### 6. Delivery Time Management System

### 7. Smart Notification & Assignment System

### 8. Firebase Cloud Messaging (FCM) System

### 9. PlasBusiness Management System

### 10. Landing Page & Desktop User Dashboard System

### 11. Combined Order System

### 12. **Order Offers & Nearby Assignment System** ⭐ NEW

---

# 🚀 Order Offers & Nearby Assignment System

## Overview

Professional dispatch system following the DoorDash/Uber Eats model with exclusive offers, distance gating, and automatic rotation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Orders Table (Business Truth)                     │
│  ✓ Is the order assigned? status, shopper_id                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: order_offers Table (Dispatch Truth)               │
│  ✓ Who can see this order right now?                        │
│  ✓ Exclusive lock with expiration                           │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Redis (Volatile State)                            │
│  ✓ GPS locations (TTL: 45s)                                 │
│  ✓ Online status (TTL-based)                                │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: FCM (Transport Only)                              │
│  ✓ Delivers notifications, no logic                         │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Server is the source of truth** - Client never decides eligibility
2. **One order = one shopper at a time** - Exclusive offers with expiration
3. **Location is volatile** - Redis for GPS, database for offers
4. **Distance gating** - Only offer to nearby shoppers
5. **Round-based expansion** - Radius grows if no acceptance (3km → 5km → 8km)
6. **Everything is auditable** - All skips logged for fairness

## Installation & Setup

### 1. Install Dependencies

```bash
# Redis is already in package.json (ioredis)
yarn install
```

### 2. Set up Redis

**Option A: Local Redis**
```bash
brew install redis
redis-server
```

**Option B: Redis Cloud (Recommended for Production)**
- Sign up at https://redis.com/try-free/
- Get your connection URL
- Add to `.env`:

```env
REDIS_URL=redis://username:password@host:port
```

### 3. Create order_offers Table

Run this in Hasura Console:

```sql
CREATE TABLE order_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Polymorphic order reference
  order_id UUID REFERENCES Orders(id),
  reel_order_id UUID REFERENCES reel_orders(id),
  restaurant_order_id UUID REFERENCES restaurant_orders(id),
  business_order_id UUID REFERENCES business_product_orders(id),
  
  -- Offer details
  shopper_id UUID NOT NULL REFERENCES Shoppers(id),
  order_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OFFERED', 'ACCEPTED', 'EXPIRED', 'DECLINED')),
  
  -- Timing
  offered_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  round_number INTEGER NOT NULL DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  done_on TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_order_offers_active 
ON order_offers(status, expires_at) 
WHERE status = 'OFFERED' AND expires_at > NOW();

CREATE INDEX idx_order_offers_expired 
ON order_offers(status, expires_at) 
WHERE status = 'OFFERED' AND expires_at <= NOW();

CREATE INDEX idx_order_offers_shopper 
ON order_offers(shopper_id, status);
```

### 4. Configure Hasura Relationships

Add these relationships in Hasura Console:

**Orders table:**
```yaml
orderOffers:
  type: array
  remote_table: order_offers
  using:
    foreign_key_constraint_on:
      column: order_id
      table: order_offers
```

**reel_orders, restaurant_orders** (similar):
```yaml
orderOffers:
  type: array
  remote_table: order_offers
  using:
    foreign_key_constraint_on:
      column: reel_order_id  # or restaurant_order_id
      table: order_offers
```

### 5. Set up Cron Job

The rotation API must run every 10-15 seconds to handle expired offers.

**Option A: Vercel Cron (if on Vercel)**

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/shopper/rotate-expired-offers",
      "schedule": "*/10 * * * * *"
    }
  ]
}
```

**Option B: External Cron Service**
- Use EasyCron, cron-job.org, or similar
- URL: `https://yourapp.com/api/shopper/rotate-expired-offers`
- Method: POST
- Interval: Every 10-15 seconds

## API Endpoints

### 1. Location Heartbeat

**Endpoint:** `POST /api/shopper/location-heartbeat`

Stores shopper's real-time location in Redis.

**Request:**
```json
{
  "userId": "shopper-uuid",
  "lat": 12.345,
  "lng": 67.890,
  "accuracy": 10
}
```

**Call Frequency:** Every 10-15 seconds when shopper is "Go-Live"

**TTL:** 45 seconds (if not refreshed, shopper is offline)

### 2. Smart Assignment (Create Offer)

**Endpoint:** `POST /api/shopper/smart-assign-order`

Finds best order for shopper with distance gating.

**Request:**
```json
{
  "user_id": "shopper-uuid",
  "current_location": {
    "lat": 12.345,
    "lng": 67.890
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "shopName": "Shop Name",
    "distance": 2.5,
    "estimatedEarnings": 150,
    "expiresIn": 60000
  },
  "offerId": "offer-uuid"
}
```

### 3. Accept Offer

**Endpoint:** `POST /api/shopper/accept-batch`

Accepts an offer with distance re-validation.

**Request:**
```json
{
  "orderId": "order-uuid",
  "userId": "shopper-uuid"
}
```

**Error Codes:**
- `NO_VALID_OFFER` - Offer expired or doesn't exist
- `ALREADY_ASSIGNED` - Another shopper got it first
- `TOO_FAR` - Distance re-validation failed

### 4. Decline Offer

**Endpoint:** `POST /api/shopper/decline-offer`

Explicitly skip an order (triggers immediate rotation).

### 5. Rotate Expired Offers

**Endpoint:** `POST /api/shopper/rotate-expired-offers`

Cron job that rotates expired offers to next shoppers.

## Distance & Radius Configuration

### Round-Based Expansion

Prevents order starvation by gradually expanding radius:

| Round | Max Distance | Max ETA | Duration |
|-------|-------------|---------|----------|
| 1     | 3 km        | 15 min  | 60s      |
| 2     | 5 km        | 25 min  | 60s      |
| 3     | 8 km        | 40 min  | 90s      |

### Urgent Orders

Orders older than 30 minutes immediately use 10km radius.

## Shopper App Integration

### 1. Location Heartbeat

Add to shopper app when "Go-Live" is active:

```typescript
// Send location every 10-15 seconds
useEffect(() => {
  if (!isGoLive) return;
  
  const interval = setInterval(async () => {
    const location = await getCurrentLocation();
    
    await fetch('/api/shopper/location-heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: shopperId,
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy
      })
    });
  }, 12000); // 12 seconds
  
  return () => clearInterval(interval);
}, [isGoLive, shopperId]);
```

### 2. Handle New Offers

FCM notifications now include `expiresIn` from database:

```typescript
// In FCM notification handler
if (notification.data.type === 'new_order') {
  const expiresIn = parseInt(notification.data.expiresIn); // milliseconds
  
  // Show countdown timer
  showOrderNotification({
    orderId: notification.data.orderId,
    expiresAt: Date.now() + expiresIn
  });
}
```

### 3. Accept with Error Handling

```typescript
try {
  const response = await fetch('/api/shopper/accept-batch', {
    method: 'POST',
    body: JSON.stringify({ orderId, userId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.code) {
      case 'NO_VALID_OFFER':
        toast.error('Offer expired. Refreshing orders...');
        break;
      case 'ALREADY_ASSIGNED':
        toast.error('Another shopper got this order');
        break;
      case 'TOO_FAR':
        toast.error(`You are ${error.distance}km away (max: ${error.maxDistance}km)`);
        break;
    }
  }
} catch (error) {
  toast.error('Failed to accept order');
}
```

## Monitoring & Debugging

### Check Redis Health

```bash
# In your app
GET /api/shopper/redis-health

Response:
{
  "connected": true,
  "latency": 5,
  "onlineShoppers": 12
}
```

### View Skip Logs

Skip logs are stored in Redis for 24 hours:

```typescript
// Get skip logs for an order
import { getOrderSkipLogs } from './src/lib/redisClient';

const logs = await getOrderSkipLogs(orderId);
console.log(logs);

// Example output:
[
  {
    orderId: "...",
    shopperId: "...",
    reason: "DISTANCE_TOO_FAR",
    distance: 7.5,
    round: 2,
    timestamp: 1234567890,
    metadata: { maxDistanceKm: 5 }
  }
]
```

### Analytics Queries

```sql
-- Orders taking too long
SELECT 
  o.id,
  o.created_at,
  COUNT(of.id) as rotation_count,
  MAX(of.round_number) as max_round
FROM Orders o
LEFT JOIN order_offers of ON of.order_id = o.id
WHERE o.status = 'PENDING'
GROUP BY o.id
HAVING COUNT(of.id) > 5;

-- Shopper acceptance rates
SELECT 
  s.full_name,
  COUNT(*) FILTER (WHERE of.status = 'ACCEPTED') as accepted,
  COUNT(*) FILTER (WHERE of.status = 'DECLINED') as declined,
  COUNT(*) FILTER (WHERE of.status = 'EXPIRED') as expired,
  ROUND(
    COUNT(*) FILTER (WHERE of.status = 'ACCEPTED')::numeric / 
    COUNT(*) * 100, 
    2
  ) as acceptance_rate
FROM order_offers of
JOIN Shoppers s ON s.id = of.shopper_id
WHERE of.created_at > NOW() - INTERVAL '7 days'
GROUP BY s.id, s.full_name
ORDER BY acceptance_rate DESC;
```

## Troubleshooting

### Issue: Shoppers not receiving offers

**Check:**
1. Is location heartbeat working?
   ```bash
   # Check Redis for location
   redis-cli
   > KEYS shopper:location:*
   > GET shopper:location:{shopper-id}
   ```

2. Is shopper within radius?
   - Round 1: 3km
   - Round 2: 5km
   - Round 3: 8km

3. Check skip logs to see why they were filtered out

### Issue: Multiple shoppers seeing same order

**This should never happen.** If it does:

```sql
-- Find orders with multiple active offers
SELECT 
  COALESCE(order_id, reel_order_id, restaurant_order_id) as order_id,
  COUNT(*) as active_count
FROM order_offers
WHERE status = 'OFFERED' 
  AND expires_at > NOW()
GROUP BY COALESCE(order_id, reel_order_id, restaurant_order_id)
HAVING COUNT(*) > 1;
```

### Issue: Redis connection failing

System gracefully degrades:
- Uses client location instead of Redis location
- Skips distance re-validation on accept
- Logs to console instead of Redis

Fix Redis and system will auto-recover.

## Configuration Options

Edit constants in `smart-assign-order.ts`:

```typescript
// Offer duration
const OFFER_DURATION_MS = 60000; // 60 seconds

// Round configurations
const ROUND_CONFIGS = [
  { round: 1, maxDistanceKm: 3, maxEtaMinutes: 15, offerDurationMs: 60000 },
  { round: 2, maxDistanceKm: 5, maxEtaMinutes: 25, offerDurationMs: 60000 },
  { round: 3, maxDistanceKm: 8, maxEtaMinutes: 40, offerDurationMs: 90000 },
];

// Urgent orders (old orders)
const URGENT_ORDER_AGE_MINUTES = 30;
const URGENT_MAX_DISTANCE_KM = 10;
```

Edit in `accept-batch.ts`:

```typescript
// Max distance for acceptance
const MAX_ACCEPTANCE_DISTANCE_KM = 10;
```

Edit in `redisClient.ts`:

```typescript
// Location TTL
const LOCATION_TTL = 45; // seconds

// Skip log retention
const SKIP_LOG_TTL = 86400; // 24 hours
```

## Performance Optimization

### Database Indexes

Already created above. Monitor query performance:

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%order_offers%'
ORDER BY mean_exec_time DESC;
```

### Redis Optimization

```bash
# Check Redis memory usage
redis-cli INFO memory

# Check key count
redis-cli DBSIZE

# Monitor commands
redis-cli MONITOR
```

### Scaling

- **Redis**: Use Redis Cluster for horizontal scaling
- **Database**: Partition `order_offers` by `created_at`
- **Cron**: Run multiple instances with leader election

## Security Considerations

1. **Location Spoofing Prevention**
   - Redis location required for offers
   - Distance re-validation on accept
   - Logged for audit

2. **Offer Hijacking Prevention**
   - Shopper ID verification on accept
   - Expiration checks
   - Atomic transactions

3. **Rate Limiting**
   - Location heartbeat: max 1/10s per shopper
   - Smart assignment: max 1/5s per shopper
   - Accept: max 10/min per shopper

## Migration from Old System

The new system coexists with old code. To migrate:

1. ✅ Create `order_offers` table
2. ✅ Deploy new APIs
3. ✅ Set up Redis
4. ✅ Set up cron job
5. ⏳ Update shopper app to send heartbeats
6. ⏳ Update shopper app to use new accept flow
7. ⏳ Monitor for 48 hours
8. ⏳ Remove old notification cache

## Support

For issues:
1. Check logs in API routes
2. Check Redis connection
3. Check skip logs for why shoppers are filtered
4. Review analytics queries
5. Check cron job is running

For detailed implementation, see:
- `src/lib/redisClient.ts` - Redis operations
- `pages/api/shopper/location-heartbeat.ts` - Location storage
- `pages/api/shopper/smart-assign-order.ts` - Offer creation
- `pages/api/shopper/accept-batch.ts` - Offer acceptance
- `pages/api/shopper/rotate-expired-offers.ts` - Rotation logic
- `pages/api/shopper/decline-offer.ts` - Explicit decline

---

# Landing Page & Desktop User Dashboard System

## Overview

The Landing Page and Desktop User Dashboard System provides a seamless user experience for both logged-in and non-logged-in users. The system features a Glovo-style landing page for desktop users who haven't logged in, with location selection, category browsing, and smooth transition to the full shopping experience. Once a location and category are selected, users are automatically directed to the Desktop User Dashboard where they can explore shops and stores.

## Key Features

### Landing Page Features

- **Glovo-Style Design**: Modern, clean landing page with green color scheme (#00D9A5)
- **Location Selection**: Google Maps Places Autocomplete for address input
- **Current Location Support**: One-click location detection using browser geolocation
- **Animated Illustrations**: Rotating product illustrations with fade/zoom effects
- **Category Preview**: Display of active categories after location selection
- **Sticky Header**: Dynamic header that changes appearance on scroll
- **Cookie-Based Location Storage**: Saves selected location for session persistence
- **Guest Access**: Allows non-logged-in users to browse and explore

### Desktop User Dashboard Features

- **Category Browsing**: Horizontal scrollable category list with upside-down avocado-shaped containers
- **Shop Grid Display**: 4-column grid layout showing shop cards with images
- **Category Filtering**: Click categories to filter shops by type
- **Shop Cards**: Image-focused cards with logo, pricing, delivery time, and ratings
- **Guest Mode**: Non-logged-in users can browse shops after selecting location
- **Responsive Design**: Optimized for desktop viewing experience

## System Architecture

```mermaid
graph TB
    A[User Visits Home Page] --> B{Is Logged In?}
    B -->|No & Desktop| C[Show Landing Page]
    B -->|Yes| D[Show Dashboard]

    C --> E[User Selects Location]
    E --> F[Categories Loaded]
    F --> G[User Clicks Category]
    G --> H[Redirect to Dashboard with Category]

    H --> I[Desktop User Dashboard]
    D --> I

    I --> J[Display Filtered Shops]
    J --> K[User Browses Shops]
```

## Components

### 1. Landing Page (`LandingPage.tsx`)

**Location**: `src/components/ui/LandingPage.tsx`

**Key Features**:

- Sticky header with dynamic styling on scroll
- Google Maps Places Autocomplete integration
- Geolocation API for current location
- Animated illustrations component
- Category display after location selection
- Address display in header

**State Management**:

- `address`: Current address string
- `displayAddress`: Short address for header display
- `categories`: Array of active categories
- `isScrolled`: Boolean for header styling
- `autocomplete`: Google Places Autocomplete instance

**Key Functions**:

- `handleUseCurrentLocation()`: Gets user's current location via geolocation API
- `handleAddressSubmit()`: Processes address selection
- `fetchCategories()`: Fetches active categories from API
- Cookie management for location persistence

### 2. Desktop User Dashboard (`DesktopUserDashboard.tsx`)

**Location**: `src/components/user/dashboard/DesktopUserDashboard.tsx`

**Key Features**:

- Category grid with horizontal scrolling
- Upside-down avocado-shaped category containers
- 4-column shop grid layout
- Category filtering
- Shop card display with images

**Layout Structure**:

```
┌─────────────────────────────────────┐
│  Groceries (Heading)                │
│  [Category Scroll Row]              │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │ 🛒│ │ 🥖│ │ 🥩│ │ 🍽│ ...       │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
│  All Stores (Heading)               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Shop│ │Shop│ │Shop│ │Shop│      │
│  │Card│ │Card│ │Card│ │Card│      │
│  └────┘ └────┘ └────┘ └────┘      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │Shop│ │Shop│ │Shop│ │Shop│      │
│  │Card│ │Card│ │Card│ │Card│      │
│  └────┘ └────┘ └────┘ └────┘      │
└─────────────────────────────────────┘
```

### 3. User Dashboard Logic (`UserDashboardLogic.tsx`)

**Location**: `src/components/user/dashboard/shared/UserDashboardLogic.tsx`

**Key Features**:

- Category selection from URL query parameters
- Shop filtering by category
- Guest user support (non-logged-in users)
- Data fetching and caching
- Location-based shop dynamics

**Key Functions**:

- `handleCategoryClick()`: Filters shops by selected category
- `filteredShops`: Computed memoized array of filtered shops
- URL query parameter reading for category selection
- Guest mode support (doesn't require authentication)

### 4. Shop Card (`ShopCard.tsx`)

**Location**: `src/components/user/dashboard/ShopCard.tsx`

**Key Features**:

- Image-focused design with 160px height
- Logo positioned at bottom-left of image
- Price, delivery time, and rating display
- Promo badges for stores
- Open/Closed status indicators

**Card Structure**:

```
┌─────────────────────┐
│   [Shop Image]      │
│   [Logo] [Status]   │
├─────────────────────┤
│ Shop Name           │
│ Price • Time • Rating│
└─────────────────────┘
```

## User Flow

### For Non-Logged-In Users (Desktop)

1. **Initial Visit**: User sees landing page with hero section

   - Animated illustrations on left
   - "Grocery delivery" heading
   - Address input field
   - "Use current location" button

2. **Location Selection**: User selects location via:

   - Google Maps Autocomplete
   - Current location button
   - Location stored in cookies (`temp_address`, `user_latitude`, `user_longitude`)

3. **Category Display**: After location selection:

   - Hero content replaced with category grid
   - Categories displayed in green section
   - "What can we get you?" heading

4. **Category Selection**: User clicks a category:

   - URL updates: `/?category={categoryId}`
   - Page redirects to dashboard view
   - Dashboard shows filtered shops

5. **Shop Browsing**: User can:
   - Browse shops in selected category
   - Click shops to view details
   - Change category by clicking another
   - Clear filter to see all shops

### For Logged-In Users

1. **Direct Access**: User goes directly to dashboard
2. **Full Features**: Access to all dashboard features
3. **Personalization**: User-specific data and preferences

## Routing Logic

**File**: `pages/index.tsx`

The routing logic determines what to show:

```typescript
// Check if user has location and category
const hasLocationAndCategory = categoryParam && hasAddress;

// Show landing page for non-logged-in desktop users without location/category
if (!isLoggedIn && !isMobile && !hasLocationAndCategory) {
  return <LandingPage />;
}

// Show dashboard for all other cases
return <ResponsiveUserDashboard />;
```

## Location Management

### Cookie Storage

Location data is stored in cookies:

- `temp_address`: Full formatted address string
- `user_latitude`: Latitude coordinate
- `user_longitude`: Longitude coordinate

### Google Maps Integration

**API Requirements**:

- Google Maps Places API key
- Autocomplete library enabled
- Geocoding API for reverse geocoding

**Configuration**:

- Restricted to Rwanda (`country: "rw"`)
- Address type filtering
- Custom styled dropdown

## Category System

### Category Display

Categories are displayed with:

- **Shape**: Upside-down avocado (wider at top, narrower at bottom)
- **Background**: Gray-50 (light) / Gray-700 (dark)
- **Icons**: CategoryIcon component with SVG icons
- **Layout**: Horizontal scrollable row
- **Selection**: Visual feedback on selected category

### Category Filtering

When a category is selected:

1. URL updates with `?category={id}` parameter
2. Dashboard filters shops by category
3. Selected category highlighted
4. "Clear Filter" button appears

## Shop Card Design

### Visual Elements

- **Image Height**: 160px (h-40)
- **Logo Position**: Bottom-left of image
- **Promo Badge**: Yellow badge for stores (top-left)
- **Status Badge**: Green (Open) / Red (Closed) (top-right)
- **Details Format**: "Price • Delivery Time • Rating"

### Data Display

- **Price**: Delivery fee or "Free"
- **Time**: Estimated delivery time
- **Rating**: Percentage with review count (e.g., "96% (39)")

## Styling & Design

### Color Scheme

- **Primary Green**: `#00D9A5` (Plas green)
- **Light Green**: `#A8E6CF`
- **Dark Green**: `#00A67E`
- **Category Background**: Gray-50 / Gray-700

### Typography

- **Font Family**: Nunito (body), Poppins (headings)
- **Headings**: Bold, large sizes (3xl, 4xl, 5xl)
- **Category Labels**: Small (xs), medium weight

### Animations

- **Category Hover**: Scale and shadow effects
- **Shop Card Hover**: Translate up with shadow
- **Image Hover**: Scale effect
- **Illustrations**: Fade and zoom transitions

## API Integration

### Categories API

**Endpoint**: `/api/queries/categories`

**Response**:

```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "image": "string",
      "is_active": boolean
    }
  ]
}
```

### Shops API

**Endpoint**: `/api/queries/shops`

**Response**:

```json
{
  "shops": [
    {
      "id": "string",
      "name": "string",
      "image": "string",
      "logo": "string",
      "category_id": "string",
      "latitude": number,
      "longitude": number
    }
  ]
}
```

## Guest User Support

The system allows non-logged-in users to:

- Browse categories
- View shops
- Select locations
- Filter by category

**Limitations for Guests**:

- Cannot place orders (redirected to login)
- Limited personalization
- No saved addresses

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
NEXT_PUBLIC_GOOGLE_MAP_API=your_api_key
```

### Google Maps Setup

1. Enable Places API
2. Enable Geocoding API
3. Add API key to environment variables
4. Configure API restrictions (optional)

## Files Structure

```
src/components/
├── ui/
│   ├── LandingPage.tsx          # Main landing page component
│   └── AnimatedIllustrations.tsx # Rotating product illustrations
└── user/dashboard/
    ├── DesktopUserDashboard.tsx # Desktop dashboard layout
    ├── ShopCard.tsx             # Individual shop card component
    └── shared/
        ├── UserDashboardLogic.tsx # Business logic hook
        └── SharedComponents.tsx   # Shared UI components

pages/
└── index.tsx                    # Main routing logic
```

## Key Dependencies

- `next/router`: URL routing and query parameters
- `google.maps.places.Autocomplete`: Address autocomplete
- `js-cookie`: Cookie management
- `lucide-react`: Icons
- `next/image`: Optimized images

## Future Enhancements

- [ ] Add actual rating data from shops
- [ ] Implement search functionality
- [ ] Add filters (price range, delivery time)
- [ ] Save favorite categories
- [ ] Recent searches
- [ ] Location history

---

# Smart Notification & Assignment System

## Overview

The Smart Notification & Assignment System provides real-time order distribution to shoppers using WebSocket technology, intelligent assignment algorithms, and optimized batch processing. The system supports three order types: regular orders, reel orders, and restaurant orders, ensuring efficient order allocation while preventing conflicts and providing instant notifications.

## Key Features

- **Real-Time WebSocket Notifications**: Instant order updates instead of polling
- **Smart Assignment Algorithm**: Prioritizes orders based on age, shopper performance, and proximity
- **Age-Based Priority System**: Heavily prioritizes older orders while tracking new ones to prevent lateness
- **Personalized Notifications**: Each shopper receives recommendations tailored to their location and performance
- **Assignment Locking**: Prevents multiple shoppers from being assigned the same order
- **Optimized Batch Processing**: Groups orders by location for efficient distribution
- **Dual Display System**: Dashboard shows all orders, map shows aged orders (30+ minutes) to reduce clutter
- **Travel Time Display**: Shows estimated minutes away instead of raw distance
- **Multi-Order Type Support**: Handles regular orders, reel orders, and restaurant orders
- **Restaurant Order Workflow**: Special handling for restaurant confirmation process
- **Comprehensive Order Pool**: ALL pending orders are eligible for notifications regardless of age
- **Order-Specific Earnings**: Different calculation methods for regular, reel, and restaurant orders

## System Architecture

```mermaid
graph TB
    A[Order Created] --> B[Add to Available Orders Pool]
    B --> C[ALL Orders Eligible for Assignment]

    C --> D[Shopper's App Polls Smart Assignment API]
    D --> E[Calculate Age-Based Priority Score]
    E --> F{Order Age}
    F -->|30+ minutes| G[Priority: -5 URGENT]
    F -->|15-30 minutes| H[Priority: -2 WARNING]
    F -->|5-15 minutes| I[Priority: 0 NORMAL]
    F -->|0-5 minutes| J[Priority: +2 NEW]

    G & H & I & J --> K[Combine with Distance & Performance]
    K --> L[Find Best Order for THIS Shopper]
    L --> M[Send Personalized FCM Notification]
    M --> N[Shopper Receives Toast]
    N --> O{Shopper Action}
    O -->|Accept| P[Assign Order]
    O -->|Skip| Q[Order Remains in Pool]
    O -->|Timeout 90s| Q

    C --> R[Map Display Filters]
    R -->|Show only 30+ min| S[Aged Orders on Map]
    C --> T[Dashboard Display]
    T -->|Show ALL orders| U[Complete Order List]
```

## Restaurant Orders Integration

### Order Workflow

Restaurant orders follow a unique workflow that differs from regular and reel orders:

```mermaid
graph TB
    A[Customer Places Order] --> B[Status: WAITING_FOR_CONFIRMATION]
    B --> C{Restaurant Accepts?}
    C -->|Yes| D[Status: PENDING + updated_at set]
    C -->|No| E[Order Remains Unavailable]
    D --> F[Available for Shopper Assignment]
    F --> G[WebSocket Notification Sent]
    G --> H[Shopper Sees Order on Map/Dashboard]
    H --> I{Shopper Action}
    I -->|Accept| J[Order Assigned to Shopper]
    I -->|Skip| K[Order Goes to Next Shopper]
    J --> L[Status: shopping → delivered]
```

### Key Differences

1. **Two-Phase Process**:

   - Phase 1: `WAITING_FOR_CONFIRMATION` (restaurant hasn't accepted)
   - Phase 2: `PENDING` (restaurant accepted, available for shoppers)

2. **Time Filtering**:

   - Uses `updated_at` field instead of `created_at` for age calculation
   - ALL orders are eligible for notifications regardless of age
   - Age affects priority score (older = higher priority)
   - Falls back to `created_at` if `updated_at` is null

3. **Earnings Calculation**:

   - **Regular Orders**: `service_fee + delivery_fee`
   - **Reel Orders**: `service_fee + delivery_fee`
   - **Restaurant Orders**: `delivery_fee` only (no `service_fee`)
   - Restaurant sets final price (no markup model)

4. **UI Styling**:
   - Orange color scheme for restaurant orders
   - "🍽️ RESTAURANT ORDER" indicator
   - "X dishes" instead of "X items"

### Database Queries

```sql
-- Get all available restaurant orders (no time restriction)
SELECT * FROM restaurant_orders
WHERE status = 'PENDING'
  AND shopper_id IS NULL
ORDER BY updated_at ASC NULLS LAST, created_at ASC;
-- Note: Ordered by oldest first for priority processing
```

### Earnings Calculation System

The system uses different earnings calculation methods based on order type:

1. **Regular Orders**:

   - **Formula**: `service_fee + delivery_fee`
   - **Reason**: Platform charges both service and delivery fees
   - **Example**: Service fee (RF 200) + Delivery fee (RF 300) = RF 500

2. **Reel Orders**:

   - **Formula**: `service_fee + delivery_fee`
   - **Reason**: Platform charges both service and delivery fees
   - **Example**: Service fee (RF 200) + Delivery fee (RF 300) = RF 500

3. **Restaurant Orders**:
   - **Formula**: `delivery_fee` only
   - **Reason**: Restaurant sets final price, no platform service fee
   - **Example**: Delivery fee (RF 250) = RF 250

### Notification Timing System

The system uses an age-based priority approach for ALL orders:

1. **All Orders Eligible**:

   - ALL pending/unassigned orders are in the notification pool
   - No time-based exclusions
   - Every order gets assigned eventually
   - Age affects priority, not eligibility

2. **Age-Based Priority Scoring**:

   - **30+ minutes old**: Priority score -5 (HIGHEST PRIORITY)
   - **15-30 minutes old**: Priority score -2 (HIGH PRIORITY)
   - **5-15 minutes old**: Priority score 0 (NORMAL PRIORITY)
   - **Under 5 minutes**: Priority score +2 (LOWER PRIORITY - but still tracked!)

3. **Display Strategy**:
   - **Dashboard**: Shows ALL available orders (shoppers can browse everything)
   - **Map**: Shows only aged orders (30+ minutes) to reduce visual clutter
   - **Notifications**: Personalized to each shopper based on location and order priority

### API Integration

All notification and assignment APIs support restaurant orders:

- **`/api/shopper/availableOrders`**: Fetches ALL pending orders (regular, reel, restaurant)
- **`/api/shopper/smart-assign-order`**: Personalized order recommendation with age-based priority
- **`/api/websocket/distribute-order`**: Sends restaurant orders via WebSocket
- **`/api/shopper/process-orders-batch`**: Includes restaurant orders in batch processing
- **`/api/shopper/todayCompletedOrders`**: Fetches shopper's completed deliveries for the day

## Personalized Notification System

### How It Works

Each shopper receives **personalized order recommendations** based on their unique situation:

1. **Individual Polling**:

   - Each shopper's app independently calls the smart assignment API
   - Polling interval: 30 seconds (or 2 minutes with FCM active)

2. **Personalized Calculation**:

   - API calculates priority for EACH order relative to THIS shopper
   - Considers: shopper's location, performance history, and order characteristics
   - Returns the BEST order for this specific shopper

3. **Targeted Notifications**:

   - FCM notification sent ONLY to the specific shopper
   - No broadcast notifications to all users
   - Each shopper sees orders most relevant to them

4. **Cache & Rate Limiting**:
   ```typescript
   // Prevents spam - same order not sent to same shopper within 90 seconds
   const cacheKey = `${shopperId}:${orderId}`;
   if (!lastSent || now - lastSent > 90000) {
     sendNotification(shopperId, order);
   }
   ```

### Example Scenario

**3 Shoppers Online, 1 Order Available:**

```
Order: "Shop A to Customer X" (Location: Downtown)

Shopper 1 (Downtown, 2km from order):
  → Distance: 2km
  → Priority Score: -2.8 (close + order is 35 min old)
  → 📱 Gets notified immediately ✅

Shopper 2 (Suburb, 10km from order):
  → Distance: 10km
  → Priority Score: +2.2 (far away)
  → ⏸️ Won't be notified unless Shopper 1 skips

Shopper 3 (Airport, 25km from order):
  → Distance: 25km
  → Priority Score: +7.5 (too far)
  → ❌ Won't be notified about this order
  → But might get notified about a different order closer to airport
```

**Result**: System naturally distributes orders to the most appropriate shoppers!

## Components

### 1. Notification System (`NotificationSystem.tsx`)

**Purpose**: Frontend component that manages order notifications, batch assignments, and user interactions.

**Key Features**:

- WebSocket integration for real-time updates
- Toast notifications with SVG icons
- Travel time calculation and display
- Batch acceptance/skipping functionality
- Firebase push notifications

**Flow**:

```mermaid
sequenceDiagram
    participant NS as NotificationSystem
    participant WS as WebSocket
    participant API as Smart Assignment API
    participant DB as Database

    NS->>WS: Connect to WebSocket
    WS-->>NS: Connection established
    NS->>API: Request smart assignment
    API->>DB: Query available orders
    DB-->>API: Return orders with priority scores
    API-->>NS: Return best order for review
    NS->>NS: Display toast notification
    NS->>WS: Send location updates
    WS-->>NS: Receive real-time order updates
```

### 2. Smart Assignment API (`/api/shopper/smart-assign-order`)

**Purpose**: Implements the intelligent assignment algorithm that finds the best order for a shopper.

**Algorithm**:

1. **Fetch Available Orders**: Get unassigned orders from database
2. **Calculate Priority Score**: For each order, calculate score based on:
   - Shopper performance (rating, completion rate, response time)
   - Distance from shopper location
   - Order age and priority
3. **Return Best Order**: Return the highest-scoring order for shopper review

**Priority Score Calculation** (Lower = Higher Priority):

```typescript
// Calculate order age in minutes
const ageInMinutes = (Date.now() - orderTimestamp) / 60000;

// Age-based priority boost (MOST IMPORTANT FACTOR - 50% weight)
let ageFactor;
if (ageInMinutes >= 30) {
  ageFactor = -5; // URGENT: Oldest orders get highest priority
} else if (ageInMinutes >= 15) {
  ageFactor = -2; // WARNING: Moderately old orders
} else if (ageInMinutes >= 5) {
  ageFactor = 0; // NORMAL: Recent orders
} else {
  ageFactor = +2; // NEW: Very new orders (lower priority but still tracked)
}

// Final priority score (lower = better)
const priorityScore =
  distance * 0.3 + // 30% - Distance from shopper
  (5 - avgRating) * 1.5 + // 15% - Shopper performance (inverted)
  (100 - completionRate) * 0.01 + // 5% - Completion rate
  ageFactor + // 50% - Order age (DOMINANT FACTOR)
  Math.random() * 0.3; // 5% - Fairness randomization

// Orders are sorted by priority score (lowest first)
// Result: Old orders get shown first, but new orders are tracked
```

**Why This Works**:

- 🔴 Old orders (30+ min) get massive priority boost → Accepted quickly
- 🟡 Moderately old orders (15-30 min) get good priority → Won't become late
- 🟢 Recent orders (5-15 min) get neutral priority → Gradually increase
- 🆕 New orders (0-5 min) get lower priority → But won't be forgotten
- 📍 Location still matters → Closer shoppers preferred
- ⭐ Performance counts → Better shoppers get better orders

### 3. WebSocket System

**Components**:

- **Server** (`server.js`): Custom Node.js server hosting both Next.js and Socket.IO
- **Manager** (`websocketManager.ts`): Client-side connection management
- **Hook** (`useWebSocket.ts`): React hook for WebSocket integration

**Events**:

- `shopper-register`: Shopper connects and registers
- `location-update`: Real-time location tracking
- `new-order`: New order available for assignment
- `order-expired`: Order removed from available pool
- `accept-order`: Shopper accepts an order
- `reject-order`: Shopper skips an order

### 4. Batch Processing (`/api/shopper/process-orders-batch`)

**Purpose**: Optimized batch processing that groups shoppers and orders by location.

**Process**:

1. **Cluster Shoppers**: Group nearby shoppers by location
2. **Find Nearby Orders**: For each cluster, find orders within radius
3. **Send Batch Notifications**: Send grouped orders to shopper clusters
4. **WebSocket Distribution**: Use WebSocket to notify clusters in real-time

### 5. Map Integration (`MapSection.tsx`)

**Purpose**: Displays aged, unassigned orders on an interactive map.

**Features**:

- **Aged Order Filtering**: Shows only orders 30+ minutes old with `shopper_id = null`
- **WebSocket Integration**: Real-time updates when orders are added/removed
- **Visual Markers**: Custom markers for different order types
- **Interactive Popups**: Order details and acceptance buttons

**Map Filtering Logic** (Map only shows aged orders to reduce clutter):

```typescript
const filterAgedUnassignedOrders = (orders) => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  return orders.filter((order) => {
    // For restaurant orders, check updated_at; for others, check created_at
    const referenceTimestamp =
      order.orderType === "restaurant" && order.updatedAt
        ? order.updatedAt
        : order.createdAt;

    const orderTimestamp = new Date(referenceTimestamp);
    const isAged = orderTimestamp <= thirtyMinutesAgo;
    const isUnassigned = !order.shopper_id || order.shopper_id === null;

    return isAged && isUnassigned; // Map shows only aged orders
  });
};
```

**Dashboard Display Logic** (Dashboard shows ALL orders):

```typescript
const getAllAvailableOrders = (orders) => {
  return orders.filter((order) => {
    const isUnassigned = !order.shopper_id || order.shopper_id === null;
    return isUnassigned; // Show ALL unassigned orders
  });
};
```

## Assignment Flow

### 1. Order Creation

```mermaid
flowchart TD
    A[Order Created] --> B[Add to Available Orders]
    B --> C[Trigger Smart Assignment]
    C --> D[Calculate Priority Scores]
    D --> E[Find Best Shopper]
    E --> F[Send WebSocket Notification]
```

### 2. Shopper Response

```mermaid
flowchart TD
    A[Shopper Receives Notification] --> B{Action}
    B -->|Accept| C[Assign Order Atomically]
    B -->|Skip| D[Find Next Best Shopper]
    B -->|Timeout| E[Reassign to Others]

    C --> F[Update Order Status]
    F --> G[Remove from Available Pool]
    G --> H[Send Confirmation]

    D --> I[Send to Next Shopper]
    E --> I
```

### 3. Real-time Updates

```mermaid
sequenceDiagram
    participant O as Order System
    participant WS as WebSocket Server
    participant C1 as Shopper 1
    participant C2 as Shopper 2
    participant M as Map Section

    O->>WS: New order created
    WS->>C1: Send notification
    WS->>M: Update map display

    C1->>WS: Skip order
    WS->>C2: Send to next shopper
    WS->>M: Update map

    C2->>WS: Accept order
    WS->>O: Confirm assignment
    WS->>M: Remove from map
```

## Database Schema

### Orders Table

```sql
CREATE TABLE Orders (
  id UUID PRIMARY KEY,
  shopper_id UUID NULL,           -- NULL = unassigned
  assigned_at TIMESTAMP NULL,     -- When order was assigned
  created_at TIMESTAMP,           -- Order creation time
  status VARCHAR(50),             -- Order status
  -- ... other fields
);
```

### Reel Orders Table

```sql
CREATE TABLE reel_orders (
  id UUID PRIMARY KEY,
  shopper_id UUID NULL,           -- NULL = unassigned
  assigned_at TIMESTAMP NULL,     -- When order was assigned
  created_at TIMESTAMP,           -- Order creation time
  -- ... other fields
);
```

### Restaurant Orders Table

```sql
CREATE TABLE restaurant_orders (
  id UUID PRIMARY KEY,
  OrderID INTEGER,
  user_id UUID,                   -- Customer who placed the order
  restaurant_id UUID,             -- Foreign key to Restaurants
  shopper_id UUID NULL,           -- NULL = unassigned
  assigned_at TIMESTAMP NULL,     -- When order was assigned
  created_at TIMESTAMP,           -- Order creation time
  updated_at TIMESTAMP NULL,      -- When restaurant accepted (used for filtering)
  status VARCHAR(50),             -- "WAITING_FOR_CONFIRMATION" | "PENDING" | "shopping" | "delivered"
  total STRING,                   -- Order total
  delivery_fee STRING,            -- Delivery fee (no service_fee)
  delivery_time TIMESTAMP,        -- Expected delivery time
  delivery_notes TEXT,            -- Delivery instructions
  delivery_address_id UUID,       -- Foreign key to Addresses
  -- ... other fields
);
```

## Configuration

### WebSocket Settings

```typescript
// Server configuration
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
  },
  allowEIO3: true,
  transports: ["polling", "websocket"],
});

// Client configuration
const socket = io(
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000",
  {
    transports: ["polling", "websocket"],
    forceNew: false,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);
```

### Assignment Parameters

```typescript
const ASSIGNMENT_CONFIG = {
  MAX_DISTANCE_KM: 10, // Maximum distance for assignment
  TIMEOUT_MINUTES: 2, // Timeout for shopper response
  BATCH_SIZE: 5, // Maximum orders per batch
  CLUSTER_RADIUS_KM: 2, // Radius for location clustering
  AGED_ORDER_MINUTES: 30, // Age threshold for map display
};
```

## Performance Optimizations

### 1. Polling Reduction

- **Before**: 30-second polling for all orders
- **After**: WebSocket real-time updates + 2-minute fallback polling

### 2. Batch Processing

- Groups orders by location to reduce database queries
- Sends notifications to shopper clusters instead of individuals
- Reduces server load and improves response times

### 3. Smart Caching

- Caches shopper performance data
- Reuses distance calculations
- Optimizes database queries with proper indexing

## Error Handling

### WebSocket Connection Issues

- Automatic reconnection with exponential backoff
- Fallback to polling when WebSocket fails
- Graceful degradation of real-time features

### Assignment Conflicts

- Atomic database operations prevent double-assignment
- Locking mechanism ensures only one shopper can accept an order
- Automatic cleanup of stale assignments

### Network Failures

- Retry logic for failed API calls
- Offline mode with local state management
- Queue system for pending operations

## Monitoring & Analytics

### Key Metrics

- **Assignment Success Rate**: Percentage of successful order assignments
- **Response Time**: Average time for shopper response
- **WebSocket Uptime**: Connection stability metrics
- **Order Age Distribution**: How long orders wait before assignment

### Logging

- WebSocket connection events
- Assignment attempts and results
- Performance metrics and bottlenecks
- Error tracking and debugging information

---

# Firebase Cloud Messaging (FCM) System

## Overview

The Firebase Cloud Messaging system provides push notifications for real-time communication between shoppers, customers, and the platform. It enables background notifications when the app is not active and supports multi-platform messaging.

## Current Status

✅ **Chat messaging is working**  
✅ **Sound notifications are working**  
✅ **Real-time WebSocket notifications are working**  
❌ **Push notifications are disabled** (missing Firebase credentials)

## Features Implemented

- **FCM Token Management**: Save and manage user FCM tokens
- **Push Notifications**: Send notifications when messages are received
- **Background Notifications**: Handle notifications when app is not active
- **Notification Actions**: Click to open chat or close notification
- **Token Cleanup**: Remove invalid tokens automatically
- **Multi-platform Support**: Support for web, Android, and iOS
- **Real-time Chat**: WebSocket-based messaging with FCM fallback

## Setup Guide

### Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to Project Settings > Cloud Messaging
4. Generate a new Web Push certificate (VAPID key)
5. Copy the VAPID key for later use

### Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
```

### Step 3: Firebase Admin SDK Setup

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values and add them to your environment variables

### Step 4: Update Service Worker

Update the `public/firebase-messaging-sw.js` file with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID",
};
```

### Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Open the browser console
3. Look for FCM initialization logs
4. Send a test message in the chat
5. Check if notifications appear

## System Architecture

```mermaid
graph TB
    A[User Sends Message] --> B[WebSocket Server]
    B --> C[Real-time Delivery]
    C --> D[Recipient Online?]
    D -->|Yes| E[WebSocket Notification]
    D -->|No| F[FCM Push Notification]

    E --> G[Sound + Toast Notification]
    F --> H[Background Push Notification]

    H --> I[User Clicks Notification]
    I --> J[Open Chat Interface]

    G --> K[User Sees Message]
    J --> K
```

## Components

### 1. FCM Service (`src/services/fcmService.ts`)

**Purpose**: Server-side FCM service for sending push notifications.

**Key Features**:

- Send notifications to specific users
- Handle token management
- Batch notification sending
- Error handling and retry logic

### 2. FCM Client (`src/services/fcmClient.ts`)

**Purpose**: Client-side FCM service for managing tokens and permissions.

**Key Features**:

- Request notification permissions
- Generate and manage FCM tokens
- Handle notification clicks
- Token cleanup on logout

### 3. Service Worker (`public/firebase-messaging-sw.js`)

**Purpose**: Handles background notifications when the app is not active.

**Key Features**:

- Background message handling
- Notification display
- Click action handling
- Firebase configuration

## API Endpoints

### 1. Save FCM Token (`/api/fcm/save-token`)

**POST** - Save user's FCM token for push notifications

```typescript
POST /api/fcm/save-token
{
  token: string,
  userId: string
}
```

### 2. Remove FCM Token (`/api/fcm/remove-token`)

**POST** - Remove user's FCM token

```typescript
POST /api/fcm/remove-token
{
  token: string,
  userId: string
}
```

### 3. Send Notification (`/api/fcm/send-notification`)

**POST** - Send push notification to user

```typescript
POST /api/fcm/send-notification
{
  userId: string,
  title: string,
  body: string,
  data?: object
}
```

## Integration Points

### 1. Chat System Integration

- **Real-time Messaging**: WebSocket for instant delivery
- **FCM Fallback**: Push notifications when user is offline
- **Sound Notifications**: Audio alerts for new messages
- **Visual Indicators**: Toast notifications and UI updates

### 2. Order Notifications

- **New Order Alerts**: Notify shoppers of available orders
- **Order Updates**: Status changes and assignments
- **Batch Notifications**: Grouped order notifications
- **Priority Alerts**: High-priority order notifications

### 3. System Notifications

- **Maintenance Alerts**: System downtime notifications
- **Feature Updates**: New feature announcements
- **Security Alerts**: Account security notifications
- **Earnings Updates**: Payment and earnings notifications

## Testing

### 1. Permission Request

- The app requests notification permission on first load
- Users can enable/disable notifications in browser settings

### 2. Token Generation

- FCM tokens are automatically generated and saved
- Tokens are refreshed when needed
- Invalid tokens are automatically cleaned up

### 3. Message Notifications

- When a message is sent, the recipient gets a push notification
- Notifications work even when the app is not active
- Clicking notifications opens the relevant chat

### 4. Background Notifications

- Notifications appear in the system notification tray
- Click actions open the app to the relevant screen
- Notifications persist until user interaction

## Troubleshooting

### Common Issues

- **No notifications**: Check browser console for errors
- **Permission denied**: User needs to manually enable notifications in browser settings
- **Token errors**: Check Firebase configuration and environment variables
- **Service worker issues**: Ensure the service worker file is accessible at `/firebase-messaging-sw.js`

### Debug Steps

1. Check browser console for FCM initialization errors
2. Verify environment variables are correctly set
3. Test with a simple notification first
4. Check Firebase console for delivery reports
5. Verify service worker is registered correctly

## Files Created/Modified

- `src/services/fcmService.ts` - Server-side FCM service
- `src/services/fcmClient.ts` - Client-side FCM service
- `pages/api/fcm/save-token.ts` - API to save FCM tokens
- `pages/api/fcm/remove-token.ts` - API to remove FCM tokens
- `pages/api/fcm/send-notification.ts` - API to send FCM notifications
- `public/firebase-messaging-sw.js` - Service worker for background notifications
- `src/context/ChatContext.tsx` - Updated to initialize FCM and send notifications
- `pages/Plasa/chat/[orderId].tsx` - Updated to send FCM notifications
- `pages/Messages/[orderId].tsx` - Updated to send FCM notifications
- `src/components/chat/CustomerChatDrawer.tsx` - Updated to send FCM notifications
- `src/components/chat/ShopperChatDrawer.tsx` - Updated to send FCM notifications

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
  user_id: uuid (foreign key to Users) -- Customer who placed the order
  shopper_id: uuid (foreign key to Users) -- Assigned shopper (NULL = unassigned)
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

## Reel Order Types & Workflows

The system supports three distinct types of reel orders based on the `restaurant_id` and `user_id` fields in the `reels` table:

### 1. Regular Reel Orders

**Condition**: Both `restaurant_id` AND `user_id` are `null`

**Workflow**:

- ✅ **Full Shopping Flow**: Shopper must collect items from store
- ✅ **Payment Required**: Shopper pays for items using wallet/MoMo
- ✅ **Invoice Generation**: Full invoice is generated upon delivery
- ✅ **Complete Order Process**: Shopping → Payment → Delivery → Invoice

**Use Cases**: Independent creators, personal recommendations, general product showcases

### 2. Restaurant/User Reel Orders

**Condition**: Either `restaurant_id` OR `user_id` is NOT `null` (or both)

**Workflow**:

- ❌ **Skip Shopping**: No item collection required
- ❌ **Skip Payment**: No payment processing needed
- ❌ **Skip Invoice**: No invoice generation
- ✅ **Direct Delivery**: Go straight to delivery confirmation
- ✅ **Transaction Recording**: Wallet transactions still recorded

**Use Cases**:

- **Restaurant Reels** (`restaurant_id` not null): Restaurant-prepared items
- **User Reels** (`user_id` not null): User-prepared items, homemade products

### 3. Order Flow Logic

```typescript
// Button Logic
const isRestaurantUserReel = order.reel?.restaurant_id || order.reel?.user_id;

if (order.status === "accepted") {
  if (isRestaurantUserReel) {
    // Show "Start Delivery" button
    handleUpdateStatus("on_the_way");
  } else {
    // Show "Start Shopping" button
    handleUpdateStatus("shopping");
  }
}

// Invoice Generation Logic
if (isRestaurantUserReel) {
  // Skip invoice generation, show delivery confirmation modal
  handleReelDeliveryConfirmation();
} else {
  // Generate full invoice
  generateInvoiceAndRedirect(order.id);
}
```

### 4. UI/UX Differences

| Feature            | Regular Reels                                          | Restaurant/User Reels                       |
| ------------------ | ------------------------------------------------------ | ------------------------------------------- |
| Initial Button     | "Start Shopping"                                       | "Start Delivery"                            |
| Progress Steps     | 4 steps (Accepted → Shopping → On The Way → Delivered) | 3 steps (Accepted → On The Way → Delivered) |
| Payment Modal      | Required                                               | Skipped                                     |
| Invoice Generation | Full invoice                                           | Delivery confirmation only                  |
| Order Summary      | Shows item total + fees                                | Shows item total excluding fees             |

### 5. Database Considerations

```sql
-- Reel orders with restaurant_id or user_id are treated as "prepared" orders
SELECT * FROM reel_orders ro
JOIN reels r ON ro.reel_id = r.id
WHERE r.restaurant_id IS NOT NULL OR r.user_id IS NOT NULL;

-- These orders skip shopping and payment steps
-- They behave similarly to restaurant orders in the workflow
```

### 6. Implementation Details

**Frontend Components**:

- `batchDetails.tsx`: Handles button logic and order flow
- `activeBatchesCard.tsx`: Shows appropriate button text based on order type
- `DeliveryConfirmationModal.tsx`: Handles both invoice and delivery confirmation

**Backend APIs**:

- `/api/shopper/activeBatches.ts`: Fetches order data with restaurant_id/user_id
- `/api/shopper/orderDetails.ts`: Returns order details with reel information
- `/api/invoices/generate.ts`: Handles invoice generation with null checks

**Key Logic Points**:

1. **Button Display**: `order.reel?.restaurant_id || order.reel?.user_id` determines button text
2. **Payment Skipping**: Same condition skips payment modal
3. **Invoice Skipping**: Same condition skips invoice generation
4. **Step Progression**: Restaurant/user reels start at step 1 (delivery) instead of step 0 (shopping)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Grocery Delivery Application

## Table of Contents

1. [Reels Feature](#reels-feature-documentation)
2. [Reel Orders System](#reel-orders-system)
3. [Delivery Photo Upload Feature](#delivery-photo-upload-feature)
4. [Nearby Dasher Notification Logic](#nearby-dasher-notification-logic)
5. [Telegram Bot Integration](#telegram-bot-integration)
6. [Barcode Scanner System](#barcode-scanner-system)

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

### 2. Login System

#### Login Methods

The system supports multiple login methods for enhanced user experience:

- **Email Login**: Traditional email and password authentication
- **Username Login**: Users can login with their username
- **Phone Number Login**: Phone number-based authentication
- **Google OAuth**: Social login integration

#### Login Implementation

```typescript
// Login form supports multiple identifier types
const handleLogin = async (identifier: string, password: string) => {
  const res = await signIn("credentials", {
    redirect: false,
    identifier, // Can be email, username, or phone
    password,
  });
};
```

#### Login Features

- **Smart Identifier Detection**: Automatically detects if input is email, phone, or username
- **Theme-Aware UI**: Login page adapts to light/dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Form Validation**: Real-time validation with user feedback
- **Remember Me**: Optional persistent login sessions

### 3. Logout System

#### Logout Implementation

The logout system uses a custom API approach to avoid NextAuth redirect loops:

```typescript
// Custom logout API endpoint
const handleLogout = async () => {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/Auth/Login");
  }
};
```

#### Logout Features

- **Complete Session Clearing**: Removes all authentication data
- **Cookie Management**: Properly clears NextAuth cookies on server-side
- **Local Storage Cleanup**: Clears all client-side stored data
- **Safe Redirect**: Prevents redirect loops and ensures clean logout
- **User Feedback**: Success/error notifications for logout status

#### Logout API Endpoint

```typescript
// /api/logout.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Clear NextAuth cookies using Set-Cookie headers
  res.setHeader("Set-Cookie", [
    "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
    "next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
    "next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax",
  ]);

  res.status(200).json({ success: true, message: "Logged out successfully" });
}
```

### 4. Session Management

#### Session Context

The application uses a custom AuthContext for session management:

```typescript
interface AuthContextType {
  isLoggedIn: boolean;
  authReady: boolean;
  login: () => void;
  logout: () => void;
  role: "user" | "shopper";
  toggleRole: () => void;
  user: User | null;
}
```

#### Session Features

- **Role-Based Access**: Supports user and shopper roles
- **Session Persistence**: Maintains login state across page refreshes
- **Role Switching**: Users can switch between user and shopper modes
- **Session Refresh**: Automatic session validation and refresh

### 5. Authorization

- Users can only delete their own comments
- Admin users can delete any comment
- Like operations tied to authenticated user
- Role-based access control for different features

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

### Restaurant Order Calculation Logic

Restaurant orders use a **single-price model** with **tax inclusion**:

1. **Price Structure**:

   - `price`: Individual dish price (what customer pays per item)
   - `quantity`: Number of items ordered
   - `delivery_fee`: Fixed delivery fee
   - `total`: Final amount customer paid (includes dishes + tax + delivery fee)

2. **Calculation Breakdown**:

```typescript
// Example Restaurant Order
const orderData = {
  total: "21000",        // What customer paid (final amount)
  delivery_fee: "2500",  // Delivery fee
  dishes: [
    { price: "4000", quantity: "1" },  // Chocolate Lava Cake
    { price: "4500", quantity: "2" },  // Classic Cheeseburger
    { price: "6000", quantity: "1" }   // Beef Brochette
  ]
}

// Step 1: Calculate dishes total (excluding delivery fee)
const dishesTotal = 21000 - 2500 = 18500

// Step 2: Calculate tax (18% of dishes total)
const tax = 18500 * 0.18 = 3330

// Step 3: Calculate pre-tax subtotal (dishes total - tax)
const subtotal = 18500 - 3330 = 15170

// Final breakdown:
// Subtotal (pre-tax): 15170 RWF
// Tax (18%): 3330 RWF
// Delivery Fee: 2500 RWF
// Total (what customer paid): 21000 RWF

// Verification: 15170 + 3330 + 2500 = 21000 ✅
```

3. **Order Summary Display**:

```typescript
// Order summary shows:
{
  subtotal: 15170,     // Pre-tax dishes amount
  tax: 3330,           // 18% of dishes total
  delivery_fee: 2500,  // Delivery fee
  total: 21000         // Final amount (what customer paid)
}
```

4. **Key Differences from Regular Orders**:

   - **Single Price**: No markup model (restaurant sets final price)
   - **Tax Inclusive**: Tax is calculated and included in total
   - **Direct Payment**: Customer pays restaurant directly (no revenue sharing)
   - **Fixed Structure**: Tax rate is always 18% of dishes total

5. **API Implementation** (`pages/api/queries/restaurant-order-details.ts`):

```typescript
// Calculate order breakdown
const baseTotal = parseFloat(restaurantOrder.total || "0");
const deliveryFee = parseFloat(restaurantOrder.delivery_fee || "0");

// Calculate subtotal (dishes total excluding delivery fee)
const dishesTotal = baseTotal - deliveryFee;
// Calculate tax (18% of dishes total)
const tax = dishesTotal * 0.18;
// Calculate pre-tax subtotal (dishes total - tax)
const subtotal = dishesTotal - tax;
// The total is what customer paid (already includes everything)
const grandTotal = baseTotal;
```

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
  - System tracks batch assignments for 90 seconds
  - Prevents duplicate notifications for the same batch

- **Assignment Rules**
  - One batch per shopper
  - 90-second acceptance window
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
   - **Filtering Logic:**
     - Regular Orders: `status = "PENDING" AND shopper_id IS NULL`
     - Reel Orders: `status = "PENDING" AND shopper_id IS NULL`
     - **Note:** `user_id` is the customer who placed the order, `shopper_id` is the assigned shopper
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

## 3.1. Delivery Confirmation Flow

### Overview

The delivery confirmation system ensures proper photo documentation and order status management before marking orders as delivered. This two-step process prevents premature order completion and ensures delivery proof is captured.

### Core Components

- Location: `src/components/shopper/DeliveryConfirmationModal.tsx`
- Purpose: Handles delivery photo upload and order status confirmation

### Flow Process

#### Step 1: Photo Upload (Required)

1. **Modal Opens** - Order status remains unchanged
2. **Photo Capture/Upload** - User takes photo via camera or uploads file
3. **Photo Validation** - File type, size, and format validation
4. **Photo Upload** - Image uploaded to server via `/api/shopper/uploadDeliveryPhoto`
5. **Upload Confirmation** - `photoUploaded` state becomes `true`

#### Step 2: Delivery Confirmation (Optional)

1. **Button Appears** - "Confirm Delivery" button only shows after photo upload
2. **User Confirmation** - User clicks "Confirm Delivery" button
3. **Status Update** - Order status changes to "delivered" via `/api/shopper/updateOrderStatus`
4. **Success Feedback** - Success message displayed
5. **Automatic Redirect** - Redirects to active batches page after 1.5 seconds

### Key Features

#### 1. **Two-Step Process**

```typescript
// Step 1: Photo Upload (Required)
const handleUpdateDatabase = async (imageData: string) => {
  // Upload photo to server
  // Set photoUploaded = true
};

// Step 2: Delivery Confirmation (Optional)
const handleConfirmDelivery = async () => {
  // Update order status to "delivered"
  // Show success message
  // Redirect to active batches
};
```

#### 2. **Conditional Button Display**

```typescript
{
  photoUploaded && !deliveryConfirmed && (
    <Button onClick={handleConfirmDelivery}>Confirm Delivery</Button>
  );
}
```

#### 3. **State Management**

- `photoUploading`: Prevents modal closure during upload
- `photoUploaded`: Enables delivery confirmation button
- `confirmingDelivery`: Shows loading state during status update
- `deliveryConfirmed`: Prevents duplicate confirmations

#### 4. **Safety Features**

- **Modal Lock**: Cannot close during critical operations
- **Upload Protection**: State persists across page refreshes
- **Error Handling**: Clear error messages and retry options
- **Validation**: File type and size validation

### API Endpoints

#### 1. Photo Upload API (`/api/shopper/uploadDeliveryPhoto`)

```typescript
POST /api/shopper/uploadDeliveryPhoto
{
  orderId: string,
  file: string (base64),
  updatedAt: string,
  orderType: "regular" | "reel"
}
```

#### 2. Order Status Update API (`/api/shopper/updateOrderStatus`)

```typescript
POST /api/shopper/updateOrderStatus
{
  orderId: string,
  status: "delivered"
}
```

### User Experience Flow

```
Modal Opens
    ↓
Take/Upload Photo
    ↓
Photo Uploading... (Loading)
    ↓
Photo Uploaded Successfully
    ↓
"Confirm Delivery" Button Appears
    ↓
Click "Confirm Delivery"
    ↓
Updating Order Status... (Loading)
    ↓
Delivery Confirmed Successfully
    ↓
Redirecting to Active Batches...
```

### Technical Requirements

- **Photo Validation**: JPEG, PNG, JPG, HEIC formats up to 5MB
- **Camera Access**: Device camera for photo capture
- **Internet Connection**: Stable connection for upload
- **Authentication**: User must be authenticated
- **Order Assignment**: User must be assigned to the order

### Error Handling

1. **Upload Failures**

   - Retry mechanism
   - Clear error messages
   - State preservation

2. **Network Issues**

   - Connection validation
   - Automatic retry
   - Offline detection

3. **Permission Issues**
   - Camera access handling
   - File system permissions
   - User guidance

### Best Practices

1. **Photo Quality**

   - Good lighting conditions
   - Clear package visibility
   - Include delivery context

2. **Upload Process**

   - Stable internet connection
   - Don't close browser during upload
   - Wait for confirmation messages

3. **Confirmation Process**

   - Verify photo quality before confirming
   - Ensure all requirements are met
   - Follow proper delivery protocols

4. **Payment System**

   - OTP verification
   - Refund processing
   - Wallet integration
   - Transaction logging

5. **Document Generation**
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

#### 2. Single Notification System

- **Initial Notification**: Shows immediately when order is assigned (90 seconds to respond)
- **Automatic Cleanup**: Toasts are removed when orders expire or are accepted
- **Simplified UX**: No warning notifications - shoppers have full 90 seconds to decide

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

#### 2. Cleanup

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
- **Assignment Timeout**: 90 seconds per assignment (1 minute 30 seconds)
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

A comprehensive grocery delivery platform with advanced revenue tracking, wallet management, order processing systems, and intelligent delivery time management. The system supports three order types: regular orders, reel-based orders, and restaurant orders with sophisticated payment, revenue management, and real-time delivery tracking.

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
GET /api/shopper/availableOrders?latitude=1.234&longitude=5.678&maxTravelTime=15

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

**Database Query Logic:**

- **Regular Orders:** `WHERE status = 'PENDING' AND shopper_id IS NULL`
- **Reel Orders:** `WHERE status = 'PENDING' AND shopper_id IS NULL`
- **Field Clarification:**
  - `user_id`: Customer who placed the order (always present)
  - `shopper_id`: Assigned shopper (NULL for unassigned orders)
- **Location Filtering:** Orders filtered by travel time from shopper location to shop

**⚠️ Common Mistake:**

- **Incorrect:** `WHERE user_id IS NULL` (would find orders with no customer)
- **Correct:** `WHERE shopper_id IS NULL` (finds orders with no assigned shopper)

**Troubleshooting:**

- **Issue:** "No orders showing on dashboard despite pending orders in database"
- **Cause:** Querying for `user_id IS NULL` instead of `shopper_id IS NULL`
- **Solution:** Update GraphQL query to use `shopper_id: { _is_null: true }`
- **Verification:** Check that `user_id` is populated (customer) and `shopper_id` is NULL (unassigned)

### 3. Shopper Performance Metrics API (`/api/shopper/performance-metrics`)

**GET** - Calculate comprehensive shopper performance metrics

```typescript
GET /api/shopper/performance-metrics?shopperId=uuid

// Response includes comprehensive performance data
{
  customerRating: 4.5,           // 1-5 stars
  ratingCount: 25,               // Number of ratings received
  onTimeDelivery: 97,            // Percentage (0-100)
  responseTime: 180,             // Average response time in seconds
  acceptanceRate: 85,            // Percentage (0-100)
  cancellationRate: 3,           // Percentage (0-100)
  orderAccuracy: 99,             // Percentage (0-100)
  totalOrders: 50,               // Total assigned orders
  completedOrders: 42,           // Completed orders with delivery photos
  performanceScore: 93,          // Overall performance score (0-100)
  recentPerformance: {
    last7Days: 8,                // Orders completed in last 7 days
    last30Days: 35               // Orders completed in last 30 days
  },
  breakdown: {
    deliveryExperience: 4.8,     // Delivery experience rating
    packagingQuality: 4.6,       // Packaging quality rating
    professionalism: 4.9         // Professionalism rating
  }
}
```

**Performance Calculation Logic:**

The system calculates comprehensive performance metrics that include **both regular orders and reel orders**:

#### **Overall Performance Score (0-100):**

```typescript
const weights = {
  customerRating: 0.3, // 30% weight
  onTimeDelivery: 0.25, // 25% weight
  orderAccuracy: 0.2, // 20% weight
  acceptanceRate: 0.25, // 25% weight
};

const score =
  customerRating * 20 * 0.3 + // 1-5 stars → 20-100 points
  onTimeDelivery * 0.25 + // 0-100%
  orderAccuracy * 0.2 + // 0-100%
  acceptanceRate * 0.25; // 0-100%
```

#### **Example Calculation:**

```typescript
// Shopper with these metrics:
customerRating: 4.5/5 stars
onTimeDelivery: 97%
orderAccuracy: 99%
acceptanceRate: 100%

// Calculation:
(4.5 * 20) * 0.30 +    // 90 * 0.30 = 27 points
97 * 0.25 +            // 97 * 0.25 = 24.25 points
99 * 0.20 +            // 99 * 0.20 = 19.8 points
100 * 0.25             // 100 * 0.25 = 25 points
= 96.05 → 96/100
```

#### **Key Metrics Explained:**

1. **Customer Rating (1-5 stars)**

   - Based on ratings from both regular and reel orders
   - Weighted 30% in overall performance score

2. **On-Time Delivery (0-100%)**

   - **Regular Orders**: Compares `delivery_time` vs `updated_at` (within 15 minutes)
   - **Reel Orders**: Assumes on-time if delivered (no delivery_time field)
   - Weighted 25% in overall performance score

3. **Order Accuracy (0-100%)**

   - **Formula**: `(Completed Orders with Photos / Total Assigned Orders) × 100`
   - **"Offered Orders"**: Orders with `delivery_photo_url IS NOT NULL`
   - **Includes**: Both regular and reel orders with delivery photos
   - Weighted 20% in overall performance score

4. **Acceptance Rate (0-100%)**
   - **Formula**: `(Completed Orders with Photos / Total Assigned Orders) × 100`
   - **Purpose**: Measures reliability and commitment
   - **Includes**: Both regular and reel orders with delivery photos
   - Weighted 25% in overall performance score

#### **Database Queries:**

The API performs comprehensive queries to gather data from both order types:

```sql
-- Regular Orders
SELECT * FROM Orders WHERE shopper_id = ?;

-- Reel Orders
SELECT * FROM reel_orders WHERE shopper_id = ?;

-- Completed Orders with Photos (Regular)
SELECT COUNT(*) FROM Orders
WHERE shopper_id = ? AND status = 'delivered'
AND delivery_photo_url IS NOT NULL;

-- Completed Orders with Photos (Reel)
SELECT COUNT(*) FROM reel_orders
WHERE shopper_id = ? AND status = 'delivered'
AND delivery_photo_url IS NOT NULL;

-- Ratings (covers both order types)
SELECT AVG(rating), COUNT(*) FROM Ratings WHERE shopper_id = ?;
```

#### **Performance Score Interpretation:**

| Score Range | Performance Level | Description                                  |
| ----------- | ----------------- | -------------------------------------------- |
| 90-100      | 🟢 Excellent      | Top performers get priority in notifications |
| 80-89       | 🟡 Good           | Above average performance                    |
| 70-79       | 🟡 Fair           | Average performance                          |
| 60-69       | 🔴 Poor           | Below average, needs improvement             |
| 0-59        | 🔴 Critical       | Poor performance, may need support           |

#### **Integration with Notification System:**

High-performing shoppers (90+ score) receive **priority** for new order notifications:

```typescript
// Future notification system will sort like this:
const sortedShoppers = shoppers.sort((a, b) => {
  // Primary: Overall Performance Score (higher = better)
  if (a.performanceScore !== b.performanceScore) {
    return b.performanceScore - a.performanceScore;
  }

  // Secondary: Distance (closer = better)
  return a.distance - b.distance;
});
```

### 4. Shopper Earnings Stats API (`/api/shopper/earningsStats`)

**GET** - Fetch comprehensive earnings and performance statistics

```typescript
GET /api/shopper/earningsStats?shopperId=uuid

// Response includes earnings data with performance metrics
{
  earnings: {
    today: 4500,
    thisWeek: 32000,
    thisMonth: 125000,
    total: 450000
  },
  performance: {
    customerRating: 4.92,
    onTimeDelivery: 97,
    orderAccuracy: 99,
    acceptanceRate: 85,
    performanceScore: 96    // Overall performance score
  },
  orders: {
    today: 3,
    thisWeek: 18,
    thisMonth: 72,
    total: 285
  },
  goals: {
    weekly: {
      current: 32000,
      target: 40000,
      percentage: 80
    },
    monthly: {
      current: 125000,
      target: 150000,
      percentage: 83
    }
  }
}
```

**Key Features:**

- **Combined Metrics**: Includes both regular and reel orders
- **Performance Integration**: Uses the same calculation logic as performance-metrics API
- **Real-time Updates**: Reflects current performance in earnings display
- **Goal Tracking**: Weekly and monthly earnings targets

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

# Food Cart Preparation Time System

## Overview

The Food Cart Preparation Time System calculates realistic preparation time estimates for restaurant orders by considering multiple dishes that are prepared simultaneously. The system uses a sophisticated algorithm that accounts for the longest dish (bottleneck) plus the efficiency gained from preparing other dishes at the same time.

## Preparation Time Calculation Algorithm

### Formula

```
Preparation Time = Highest Dish Time + (Average of Lower Times × Efficiency Factor)
```

### Efficiency Factors

- **Short Preparation Times (≤30 minutes)**: 100% efficiency (full average added)
- **Long Preparation Times (>30 minutes)**: 70% efficiency (conservative estimate)

### Maximum Cap

- **Preparation time is capped at 90 minutes (1.5 hours)**
- **Dishes above 1 hour can have exceptions but never exceed 1.5 hours**

## Calculation Examples

### Example 1: Pizza + Salad

```
Pizza: 20min, Salad: 10min
Highest: 20min, Lower times: [10min]
Average of lower: 10min
Since maxTime ≤ 30min: 20 + 10 = 30min
Total: 30min prep + 15min delivery = 45min total
```

### Example 2: Burger + Fries + Drink

```
Burger: 25min, Fries: 15min, Drink: 5min
Highest: 25min, Lower times: [15min, 5min]
Average of lower: (15 + 5) ÷ 2 = 10min
Since maxTime ≤ 30min: 25 + 10 = 35min
Total: 35min prep + 15min delivery = 50min total
```

### Example 3: Long Preparation Times

```
Steak: 75min, Pasta: 45min, Salad: 15min
Highest: 75min, Lower times: [45min, 15min]
Average of lower: (45 + 15) ÷ 2 = 30min
Since maxTime > 30min: 75 + (30 × 0.7) = 75 + 21 = 96min
Capped at 90min: 90min (1.5 hours)
Total: 90min prep + 15min delivery = 105min total
```

## Implementation Details

### Core Components

- **Location**: `src/components/UserCarts/checkout/checkoutCard.tsx`
- **Function**: `parsePreparationTimeString()` - Parses time strings from database
- **Logic**: Weighted calculation with efficiency factors

### Time String Parsing

The system handles various time formats from the database:

- **Minutes**: "15min", "30min" → 15, 30 minutes
- **Hours**: "1hr", "2hr" → 60, 120 minutes
- **Mixed**: "2hr30min", "1hr15min" → 150, 75 minutes
- **Empty**: "" → 0 minutes (immediately available)
- **Numbers**: "15", "30" → 15, 30 minutes

### API Integration

- **Endpoint**: `/api/food-checkout`
- **Data**: Includes `preparingTime` for each dish
- **Display**: Shows preparation + delivery time breakdown

## Delivery Time Display

### Food Orders

```
"Estimated delivery: 45 minutes (prep: 30min + delivery: 15min)"
```

### Regular Shop Orders

```
"Will be delivered in 45 minutes"
```

## Benefits

1. **Realistic Estimates**: Accounts for simultaneous preparation
2. **Bottleneck Awareness**: Never underestimates the longest dish
3. **Efficiency Calculation**: Considers kitchen workflow optimization
4. **User Experience**: Clear preparation time expectations
5. **Scalable**: Works for any number of dishes

## Future Enhancements

1. **Restaurant-Specific Factors**: Different efficiency rates per restaurant
2. **Time-of-Day Adjustments**: Rush hour vs. off-peak preparation times
3. **Dish Complexity Scoring**: Weighted preparation times based on dish complexity
4. **Historical Data**: Machine learning for more accurate estimates

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
  user_id: uuid (foreign key to Users) -- Customer who placed the order
  shopper_id: uuid (foreign key to Users) -- Assigned shopper (NULL = unassigned)
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

---

# Invoice Management System

## Overview

The Invoice Management System provides comprehensive invoice generation, viewing, and download functionality for both shoppers and customers. The system supports both regular orders and reel orders with professional PDF generation, QR code integration, and dynamic currency formatting.

## Key Features

### 1. Invoice Generation

- **Professional PDF Design**: Clean, branded invoice layout with company logo
- **Dynamic Currency**: Automatic currency formatting based on system configuration
- **QR Code Integration**: Invoice verification QR codes with embedded data
- **Watermark Security**: "ORIGINAL" watermark for document authenticity
- **Multi-Order Support**: Handles both regular orders and reel orders

### 2. Invoice Viewing

- **Unified Interface**: Single interface for viewing all invoice types
- **Order Type Detection**: Automatic detection of regular vs reel orders
- **Real-time Data**: Live invoice data from database
- **Mobile Responsive**: Optimized for both mobile and desktop viewing

### 3. PDF Download

- **Server-Side Generation**: High-quality PDF generation on the server
- **Client-Side Fallback**: Basic PDF generation for client-side compatibility
- **Automatic Download**: Seamless download experience across devices
- **Professional Styling**: Branded invoice design with proper formatting

## Technical Architecture

### Database Schema

#### Invoices Table

```sql
Invoices {
  id: uuid (primary key)
  invoice_number: string (unique invoice number)
  order_id: uuid (foreign key to Orders, nullable)
  reel_order_id: uuid (foreign key to reel_orders, nullable)
  customer_id: uuid (foreign key to Users)
  total_amount: decimal
  subtotal: decimal
  service_fee: decimal
  delivery_fee: decimal
  tax: decimal
  discount: decimal
  status: string (paid, pending, overdue)
  created_at: timestamp
  invoice_items: jsonb (for reel orders)
  Proof: string (payment proof URL)
}
```

### API Endpoints

#### 1. Shopper Invoices API (`/api/shopper/invoices`)

**Purpose**: Fetch paginated list of invoices for a shopper

**Method**: `GET`

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response**:

```json
{
  "success": true,
  "invoices": [
    {
      "id": "uuid",
      "invoice_number": "INV-10-853938",
      "order_id": "uuid",
      "order_type": "regular" | "reel",
      "total_amount": 6500,
      "subtotal": 6000,
      "delivery_fee": 300,
      "service_fee": 200,
      "status": "paid",
      "created_at": "2025-01-10T00:00:00Z",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "shop_name": "Fresh Market",
      "items_count": 5
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "totalCount": 95
}
```

#### 2. Invoice Details API (`/api/invoices/[id]`)

**Purpose**: Fetch detailed invoice information and generate PDF

**Method**: `GET`

**Query Parameters**:

- `id`: Invoice ID
- `pdf`: Set to `true` to download PDF

**Response** (JSON):

```json
{
  "invoice": {
    "id": "uuid",
    "invoiceNumber": "INV-10-853938",
    "orderType": "reel",
    "status": "paid",
    "dateCreated": "1/10/2025",
    "customer": "John Doe",
    "customerEmail": "john@example.com",
    "shop": "Fresh Market",
    "items": [...],
    "subtotal": 6000,
    "serviceFee": 200,
    "deliveryFee": 300,
    "total": 6500
  }
}
```

**Response** (PDF): Binary PDF file with proper headers

### Frontend Components

#### 1. Invoices List Page (`/pages/Plasa/invoices/index.tsx`)

**Features**:

- Paginated invoice listing
- Search and filter functionality
- Order type indicators
- Mobile-responsive design
- Direct PDF download for mobile
- Desktop invoice viewing

**Key Functions**:

```typescript
// Fetch invoices with pagination
const fetchInvoices = async (page: number = 1) => {
  const response = await fetch(`/api/shopper/invoices?page=${page}`);
  // Handle response and update state
};

// Handle invoice viewing/download
const handleViewDetails = (invoiceId: string, orderType: string) => {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  if (isMobile) {
    // Direct PDF download for mobile
    const pdfUrl = `${baseUrl}/api/invoices/${invoiceId}?pdf=true`;
    window.open(pdfUrl, "_blank");
  } else {
    // Desktop invoice page
    const invoiceUrl = `${baseUrl}/Plasa/invoices/${invoiceId}#${orderType}`;
    window.open(invoiceUrl, "_blank");
  }
};
```

#### 2. Invoice Details Page (`/pages/Plasa/invoices/[id]/index.tsx`)

**Features**:

- Detailed invoice information display
- Order type-specific formatting
- PDF download functionality
- Real-time data loading
- Error handling and loading states

**Key Functions**:

```typescript
// Fetch invoice details
const fetchInvoiceData = async () => {
  const response = await fetch(`/api/invoices/${actualId}`);
  const data = await response.json();
  setInvoiceData(data.invoice);
};

// Download PDF
const handleDownload = async () => {
  const response = await fetch(`/api/invoices/${invoiceData.id}?pdf=true`);
  const blob = await response.blob();
  // Create download link and trigger download
};
```

### PDF Generation Logic

#### Server-Side PDF Generation (`/pages/api/invoices/[id].ts`)

**Features**:

- Professional invoice design
- Logo image integration
- QR code generation
- Dynamic currency formatting
- Watermark security
- Multi-page support

**Key Functions**:

```typescript
// Generate PDF with logo and QR code
async function generateInvoicePdf(invoiceData: any): Promise<Buffer> {
  const doc = new jsPDF();

  // Add logo image
  const logoBase64 = await loadImageAsBase64("assets/logos/PlasLogoPNG.png");
  doc.addImage(logoBase64, "PNG", margin, yPos - 10, 40, 20);

  // Add invoice content with proper formatting
  // Add items table with alternating row colors
  // Add summary section with totals
  // Add QR code for verification

  return Buffer.from(doc.output("arraybuffer"));
}

// Load image as base64
async function loadImageAsBase64(imagePath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), "public", imagePath);
  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}
```

#### Client-Side PDF Generation (`/src/lib/invoiceUtils.ts`)

**Features**:

- Basic PDF generation for client-side compatibility
- Text-based logo fallback
- Professional formatting
- Currency formatting integration

### QR Code Integration

#### QR Code Data Structure

```json
{
  "invoiceId": "uuid",
  "invoiceNumber": "INV-10-853938",
  "total": 6500,
  "date": "1/10/2025",
  "type": "reel"
}
```

#### QR Code Generation

```typescript
// Generate QR code with invoice data
const qrData = JSON.stringify({
  invoiceId: invoiceData.id,
  invoiceNumber: invoiceData.invoiceNumber,
  total: invoiceData.total,
  date: invoiceData.dateCreated,
  type: invoiceData.orderType,
});

const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
  width: 100,
  margin: 1,
  color: {
    dark: "#000000",
    light: "#FFFFFF",
  },
});
```

### Currency Formatting

#### Dynamic Currency System

```typescript
// Use formatCurrencySync for immediate formatting
import { formatCurrencySync } from "../utils/formatCurrency";

// Format currency values
doc.text(formatCurrencySync(item.unitPrice), margin + 110, yPos);
doc.text(formatCurrencySync(invoiceData.total), pageWidth - margin - 10, yPos);
```

#### Currency Configuration

- **Default**: RWF (Rwandan Franc)
- **Configurable**: System-wide currency setting
- **Cached**: Performance-optimized currency formatting
- **Consistent**: Same formatting across all invoice components

### Security Features

#### 1. Authentication

- **Session Validation**: All invoice endpoints require valid user session
- **Authorization**: Users can only access their own invoices
- **Role-based Access**: Different access levels for shoppers vs customers

#### 2. Document Security

- **Watermark**: "ORIGINAL" watermark on all PDFs
- **QR Code Verification**: Embedded invoice data for verification
- **Document ID**: Unique document identifier for tracking
- **Timestamp**: Generation timestamp for audit trail

#### 3. Error Handling

- **Graceful Fallbacks**: Text-based logo if image loading fails
- **Error Logging**: Comprehensive error logging through logger utility
- **User Feedback**: Clear error messages for users
- **Retry Logic**: Automatic retry for failed operations

### Performance Optimizations

#### 1. Caching

- **Currency Cache**: Cached currency configuration for 5 minutes
- **Image Caching**: Logo images cached in memory
- **Query Optimization**: Efficient database queries with proper indexing

#### 2. Lazy Loading

- **Pagination**: Large invoice lists loaded in pages
- **On-demand PDF**: PDFs generated only when requested
- **Progressive Loading**: Invoice details loaded as needed

#### 3. Mobile Optimization

- **Direct PDF Download**: Mobile users get direct PDF download
- **Responsive Design**: Optimized for mobile viewing
- **Touch-friendly**: Large buttons and touch targets

### Error Handling

#### Common Error Scenarios

1. **Invoice Not Found**: 404 error with clear message
2. **Unauthorized Access**: 401 error with redirect to login
3. **PDF Generation Failure**: Fallback to basic PDF or error message
4. **Image Loading Failure**: Text-based logo fallback
5. **Database Connection Issues**: Proper error logging and user feedback

#### Error Recovery

- **Automatic Retry**: Failed operations retry automatically
- **Fallback Options**: Alternative approaches when primary methods fail
- **User Guidance**: Clear instructions for resolving issues
- **Logging**: Comprehensive error logging for debugging

---

# Chat System & Message Logic

## Overview

The chat system enables real-time communication between shoppers and customers during order fulfillment. The system supports both mobile chat pages and desktop chat drawers with consistent message handling and UI.

## Message Architecture

### Message Storage

- **Firebase Firestore**: All messages are stored in Firestore collections
- **Real-time Updates**: Messages sync across all chat interfaces in real-time
- **Message Metadata**: Each message includes sender information and timestamps

### Message Structure

```typescript
interface Message {
  id: string;
  text: string;
  senderId: string; // User ID of sender
  senderType: "customer" | "shopper";
  orderId: string; // Associated order
  timestamp: Date;
  isRead: boolean;
}
```

## Chat Components

### 1. Mobile Chat Page (`pages/Plasa/chat/[orderId].tsx`)

- **Purpose**: Full-screen chat interface for mobile devices
- **Features**:
  - Real-time message fetching from Firebase
  - Message sending with form validation
  - Professional UI with message bubbles
  - Customer address display in header
  - Bottom padding for mobile navigation

### 2. Chat Drawers (`src/components/chat/`)

- **Purpose**: Slide-out chat interface for desktop
- **Features**:
  - Same message logic as mobile chat
  - Responsive design
  - Real-time message updates
  - Consistent styling with mobile chat

### 3. Messages Page (`pages/Messages/[orderId].tsx`)

- **Purpose**: Alternative chat interface
- **Features**:
  - Same message handling logic
  - Unified message alignment

## Message Alignment Logic

### Current User Detection

```typescript
// All chat components use this logic
const isCurrentUser = message.senderId === currentUserId;
```

### Message Styling

```typescript
// Shopper messages (current user)
className={`rounded-2xl px-4 py-1 shadow-sm bg-green-700 text-white`}

// Customer messages (other user)
className={`rounded-2xl px-4 py-1 shadow-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-white`}
```

## Message Flow

### 1. Message Sending

```typescript
// Form submission with validation
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!message.trim()) return;

  // Send message to Firebase
  await sendMessage(orderId, message, currentUserId, "shopper");
  setMessage("");
};
```

### 2. Message Fetching

```typescript
// Real-time listener setup
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(
      collection(db, "messages"),
      where("orderId", "==", orderId),
      orderBy("timestamp", "asc")
    ),
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    }
  );

  return () => unsubscribe();
}, [orderId]);
```

### 3. Message Display

```typescript
// Message bubble rendering
{
  messages.map((message) => {
    const isCurrentUser = message.senderId === currentUserId;

    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-1 shadow-sm ${
            isCurrentUser
              ? "bg-green-700 text-white"
              : "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
          }`}
        >
          {message.text}
        </div>
      </div>
    );
  });
}
```

## Key Features

### Real-time Synchronization

- All chat interfaces update simultaneously
- Messages appear instantly across devices
- No page refresh required

### Message Persistence

- All messages stored in Firebase Firestore
- Messages survive app restarts
- Order-specific message collections

### Responsive Design

- Mobile-optimized chat pages
- Desktop-friendly chat drawers
- Consistent UI across platforms

### Error Handling

- Form validation for empty messages
- Network error handling
- Graceful fallbacks for missing data

## API Integration

### Message Service (`src/services/chatService.ts`)

```typescript
// Send message to Firebase
export const sendMessage = async (
  orderId: string,
  text: string,
  senderId: string,
  senderType: "customer" | "shopper"
) => {
  const messageRef = collection(db, "messages");
  await addDoc(messageRef, {
    orderId,
    text,
    senderId,
    senderType,
    timestamp: new Date(),
    isRead: false,
  });
};
```

### Chat Context (`src/context/ChatContext.tsx`)

- Provides chat state management
- Handles real-time message updates
- Manages chat session state

## Best Practices

### Message Alignment

- Always use `message.senderId === currentUserId` for alignment
- Ensure consistent sender metadata across all components
- Test message alignment in both mobile and desktop views

### Performance

- Use real-time listeners efficiently
- Clean up listeners on component unmount
- Implement message pagination for large conversations

### User Experience

- Show loading states during message sending
- Provide clear visual feedback for message status
- Maintain consistent styling across all chat interfaces

## Troubleshooting

### Common Issues

1. **Messages not aligning correctly**

   - Check if `senderId` is properly set in message metadata
   - Verify `currentUserId` is correctly identified
   - Ensure message fetching includes all required fields

2. **Messages not sending**

   - Validate form submission handling
   - Check Firebase connection and permissions
   - Verify message structure matches expected format

3. **Real-time updates not working**
   - Ensure Firebase listeners are properly set up
   - Check for listener cleanup on component unmount
   - Verify Firestore security rules allow read/write access

### Debug Steps

1. Check browser console for errors
2. Verify Firebase configuration
3. Test message sending in different chat interfaces
4. Confirm message metadata is consistent

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

# Telegram Bot Integration

## Overview

The Telegram bot allows shoppers to connect their Telegram account to receive notifications, manage their online/offline status, and get real-time updates about orders and earnings. The integration is designed for both local development (polling) and production (webhook on Vercel).

## Key Features

- Shopper connects Telegram via web dashboard (deep link with unique shopper ID)
- Bot receives `/start [shopperId]` and stores Telegram chat ID
- Shoppers receive notifications for new orders, earnings, and status updates
- Online/offline status is managed via the web interface (not via Telegram commands)
- Admins can send notifications to shoppers via TelegramService

## Setup Instructions

### 1. Environment Variables

Add to your `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
API_BASE_URL=http://localhost:3000 # or your production URL
```

### 2. Install Dependencies

```bash
yarn add node-telegram-bot-api
```

### 3. Database Schema

Ensure your `shoppers` table includes:

```sql
CREATE TABLE shoppers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  transport_mode VARCHAR(50),
  telegram_id VARCHAR(50), -- Telegram chat ID
  status VARCHAR(20) DEFAULT 'offline',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Local Development

- Start Next.js: `yarn dev`
- Start the bot: `node bot.js` (uses polling)

### 5. Production Deployment (Vercel)

- Deploy to Vercel
- Set webhook URL: `https://your-domain.vercel.app/api/telegram/webhook`
- Set environment variables in Vercel dashboard

## API Endpoints

### Bot Endpoints (No Auth)

- `POST /api/telegram/bot-update` — Update Telegram ID, get shopper by Telegram ID
- `POST /api/telegram/ensure-shopper` — Ensure a shopper record exists for the authenticated user

### Example Payloads

```json
// Update Telegram ID
{
  "action": "update_telegram_id",
  "shopperId": "uuid",
  "telegramId": "chat_id"
}
// Get shopper by Telegram ID
{
  "action": "get_by_telegram_id",
  "telegramId": "chat_id"
}
```

## Bot Commands

| Command       | Description                                      |
| ------------- | ------------------------------------------------ |
| `/start`      | Connect your account (no shopper ID)             |
| `/start [id]` | Connect with specific shopper ID                 |
| `/online`     | Get instructions to go online via web interface  |
| `/offline`    | Get instructions to go offline via web interface |
| `/today`      | View today's orders, earnings, and chart         |
| `/week`       | View this week's orders, earnings, and chart     |
| `/month`      | View this month's orders, earnings, and chart    |
| `/orders`     | View available orders (40+ min old)              |
| `/batches`    | View assigned batches/orders                     |
| `/help`       | Show all available commands                      |
| `/status`     | Check your current connection status             |

## Connection Workflow

1. Shopper clicks "Connect Telegram" in the web dashboard
2. System ensures a shopper record exists (API call)
3. Telegram opens with a deep link: `https://t.me/PlaseraBot?start={shopperId}`
4. Bot receives `/start {shopperId}` and stores the Telegram chat ID
5. Shopper receives a confirmation message

## Implementation Logic

- Shopper ID is generated and stored automatically when connecting
- Bot updates the database with Telegram chat ID via API
- All status changes (online/offline) are managed via the web, not Telegram
- Bot can send notifications by querying the database for Telegram chat IDs
- Admins can trigger notifications using TelegramService

## Best Practices

- Never commit bot tokens to version control
- Use web interface for status/session management
- Use webhook in production, polling in development
- Handle errors gracefully and log all bot/database operations
- Rate-limit unauthenticated bot endpoints

## Example: Ensuring Shopper Record

```typescript
// /api/telegram/ensure-shopper.ts
export default async function handler(req, res) {
  const { userId } = req.body;
  // 1. Check if shopper exists
  // 2. If not, create one
  // 3. Return shopper (new or existing)
}
```

## Example: Bot `/start` Command

```javascript
bot.onText(/\/start (.+)/, async (msg, match) => {
  const shopperId = match[1];
  const chatId = msg.chat.id;
  await updateShopperTelegramId(shopperId, chatId.toString());
  await bot.sendMessage(chatId, `Connected! Shopper ID: ${shopperId}`);
});
```

---

For more details, see the bot implementation in `bot.js` and the API endpoints in `/pages/api/telegram/`.

# Barcode Scanner System

## Overview

The barcode scanner system is a critical component for shoppers to verify products during the shopping process. It is designed to be robust, simple, and prevent common issues like accidental multiple scans from a single camera view.

## Core Logic & Design Philosophy

The primary challenge with in-browser barcode scanning is managing the lifecycle of the camera stream and the scanner's detection loop. A naive implementation can easily lead to race conditions where the scanner detects a barcode multiple times before the component has a chance to unmount or stop the process, leading to an unstoppable loop.

To solve this, the system uses a clean, state-free (as much as possible) approach centered on React's `useEffect` hook for lifecycle management.

### Key Principles:

1.  **One-Time Scan, One-Time Cleanup**: The scanner is designed for a single successful scan. Once a barcode is detected, the component's entire lifecycle is torn down, ensuring no lingering processes.
2.  **`useEffect` for Lifecycle**: The `useEffect` hook is the single source of truth for starting and stopping the scanner. Its cleanup function is guaranteed to run on unmount.
3.  **Guard Flag for Race Conditions**: A `useRef` flag (`isScannedRef`) is used to "lock" the component after the first successful scan, preventing the detection callback from firing multiple times in quick succession.
4.  **Official ZXing Controls**: The system uses the official `IScannerControls` object provided by the `@zxing/browser` library to stop the scanner, which is the recommended and most reliable method.

## Component Implementation (`src/components/shopper/BarcodeScanner.tsx`)

### State Management

- `videoRef`: A `useRef` to hold the `<video>` element.
- `controlsRef`: A `useRef` to hold the `IScannerControls` object from ZXing. This is used to programmatically stop the scanner.
- `isScannedRef`: A `useRef` boolean flag that acts as a **guard**. It is set to `true` the instant a barcode is detected to prevent the callback from processing any subsequent detections.
- `error`: A `useState` string to display any user-facing errors (e.g., camera permission denied).

### Lifecycle (`useEffect`)

```typescript
useEffect(() => {
  // 1. Reset the guard flag on each new mount.
  isScannedRef.current = false;

  // 2. Define an async function to start the scanner.
  const startScanner = async () => {
    // ...
  };

  startScanner();

  // 3. The cleanup function is the key. It runs when the component unmounts.
  return () => {
    stopScanner();
  };
}, [onBarcodeDetected, onClose, stopScanner]);
```

### Scanning and Cleanup Logic

1.  **`startScanner()`**:

    - Requests camera access using `navigator.mediaDevices.getUserMedia`.
    - Initializes the `BrowserMultiFormatReader` from ZXing.
    - Calls `reader.decodeFromStream(...)`, which starts the video feed and the detection loop. The controls for this process are stored in `controlsRef`.

2.  **Detection Callback**: The callback function passed to `decodeFromStream` contains the core logic:

    ```typescript
    (result, err) => {
      // Guard: Immediately exit if a scan has already been processed.
      if (isScannedRef.current) {
        return;
      }

      if (result) {
        // Lock: Set the guard flag IMMEDIATELY.
        isScannedRef.current = true;

        console.log("📷 Barcode detected:", result.getText());

        // Teardown:
        stopScanner();
        onBarcodeDetected(result.getText());
        onClose();
      }
      // ... error handling ...
    };
    ```

3.  **`stopScanner()`**: A `useCallback`-memoized function that:
    - Checks if `controlsRef.current` exists.
    - Calls `controlsRef.current.stop()`, which correctly stops the ZXing decoding loop and releases the camera stream.
    - Sets `controlsRef.current` to `null`.

### Why This Design is Robust

- **No Race Condition**: The `isScannedRef` flag immediately prevents the callback's logic from running more than once. This is more reliable than trying to manage complex state transitions.
- **Guaranteed Cleanup**: By tying the `stopScanner` call to the `useEffect` cleanup function, React ensures that the camera and scanner are turned off when the component unmounts, preventing resource leaks.
- **Simplicity**: The component avoids complex state flags (`isLoading`, `isProcessing`, `isDestroyed`, etc.), which were the source of previous issues. The logic is linear and easy to follow: mount -> start -> scan -> stop -> unmount.

---

# Progressive Web App (PWA) Features

## Overview

This grocery app includes Progressive Web App capabilities, allowing users to install it on their desktop and mobile devices for a native app-like experience.

## Features Implemented

### 1. PWA Configuration

- **Manifest File**: `/public/manifest.json` with app metadata, icons, and display settings
- **Service Worker**: Automatically generated by `next-pwa` for offline functionality and caching
- **Next.js Integration**: Updated `next.config.js` with PWA support and caching strategies

### 2. Native Browser Install Prompts

- **Browser Native**: Uses browser's built-in install prompts (address bar button, install banners)
- **Automatic Detection**: Browsers automatically detect PWA eligibility and show install options
- **No Custom Prompts**: Relies on browser's native install experience
- **Install Guide**: Manual access via download button in sidebar for instructions

### 3. Cross-Platform Support

#### Desktop (Chrome, Edge, Firefox)

- Install button appears in address bar
- One-click installation
- App appears in applications menu
- Can be pinned to taskbar

#### Mobile iOS (Safari)

- Step-by-step instructions for "Add to Home Screen"
- Share button → Add to Home Screen → Confirm
- App icon appears on home screen

#### Mobile Android (Chrome)

- Automatic install banner appears
- One-tap installation
- App icon appears on home screen

### 4. PWA Benefits

- **Offline Functionality**: Basic app functionality works without internet
- **Faster Loading**: Cached resources load instantly
- **Native Feel**: Full-screen experience without browser UI
- **Push Notifications**: Ready for notification implementation
- **App-like Experience**: Smooth animations and interactions

## Files Added/Modified

### New Files

- `src/components/ui/InstallPrompt.tsx` - Automatic install prompt component
- `src/components/ui/PWAInstallGuide.tsx` - Manual install guide modal
- `src/lib/pwa.ts` - PWA utility functions
- `public/manifest.json` - PWA manifest configuration
- `scripts/generate-icons.js` - Icon generation script

### Modified Files

- `next.config.js` - Added PWA configuration with caching strategies
- `pages/_app.tsx` - Added PWA meta tags and install prompt
- `src/components/ui/sidebar.tsx` - Added install guide button

## How It Works

1. **Browser Detection**: Browsers automatically detect PWA eligibility based on manifest and service worker
2. **Native Prompts**: Browsers show their own install buttons/banners when criteria are met
3. **User Choice**: Users can install via browser's native install experience
4. **Post-Install**: App runs in standalone mode with enhanced performance

## Testing

To test the PWA features:

1. **Development**: Run `yarn dev` and open in Chrome/Edge
2. **Production**: Run `yarn build && yarn start` for full PWA experience
3. **Mobile**: Test on actual devices for best results

## Browser Support

- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (iOS)
- ✅ Firefox (Desktop)
- ⚠️ Safari (Desktop) - Limited PWA support

---

# Enhanced Database Integration with Telegram Bot

## Overview

This integration connects your Telegram bot directly to your database, allowing:

- ✅ **Automatic shopper registration** via Telegram
- ✅ **Real-time status updates** (online/offline)
- ✅ **Persistent connections** stored in database
- ✅ **Secure authentication** and authorization

## Database Schema

### Shoppers Table

Your existing `shoppers` table includes:

```sql
telegram_id: String  -- Stores Telegram chat ID
status: String       -- Stores online/offline status
```

## GraphQL Operations

### Mutations Created

#### 1. Update Shopper Telegram ID

```graphql
mutation UpdateShopperTelegramId($shopper_id: uuid!, $telegram_id: String!) {
  update_shoppers_by_pk(
    pk_columns: { id: $shopper_id }
    _set: { telegram_id: $telegram_id }
  ) {
    id
    telegram_id
    full_name
    status
    active
  }
}
```

#### 2. Update Shopper Status

```graphql
mutation UpdateShopperStatus($shopper_id: uuid!, $status: String!) {
  update_shoppers_by_pk(
    pk_columns: { id: $shopper_id }
    _set: { status: $status }
  ) {
    id
    status
    full_name
    telegram_id
  }
}
```

### Queries Created

#### 1. Get Shopper by Telegram ID

```graphql
query GetShopperByTelegramId($telegram_id: String!) {
  shoppers(where: { telegram_id: { _eq: $telegram_id } }) {
    id
    full_name
    status
    active
    telegram_id
    user_id
    phone_number
    address
    transport_mode
    created_at
    updated_at
  }
}
```

## Enhanced Bot Commands

### New Commands Available

#### `/start [shopperId]`

- Connects shopper account to Telegram
- Updates database with Telegram chat ID
- Sends confirmation message

#### `/online`

- Sets shopper status to "online"
- Updates database
- Confirms status change

#### `/offline`

- Sets shopper status to "offline"
- Updates database
- Confirms status change

#### `/status`

- Shows current shopper information
- Displays ID, name, status, transport mode, location

#### `/help`

- Shows all available commands

## Enhanced Telegram Service

### New Methods

#### `getShopperByTelegramId(telegramId)`

```typescript
const shopper = await TelegramService.getShopperByTelegramId("7871631863");
```

#### `sendStatusUpdate(shopperId, status)`

```typescript
await TelegramService.sendStatusUpdate(shopperId, "online");
```

#### `sendOrderAssignment(shopperId, orderDetails)`

```typescript
await TelegramService.sendOrderAssignment(shopperId, {
  orderId: "ORD-123",
  shopName: "Fresh Market",
  total: 45.99,
  pickupAddress: "123 Main St",
  deliveryAddress: "456 Oak Ave",
});
```

## Workflow

### 1. Shopper Connects via Telegram

```
Shopper clicks "Connect Telegram"
→ Opens: https://t.me/PlaseraBot?start={shopperId}
→ Bot receives: /start {shopperId}
→ Bot updates database: shoppers.telegram_id = chatId
→ Bot sends confirmation message
```

### 2. Shopper Updates Status

```
Shopper sends: /online or /offline
→ Bot looks up shopper by telegram_id
→ Bot updates database: shoppers.status = "online"/"offline"
→ Bot sends confirmation message
```

### 3. System Sends Notifications

```
Order assigned to shopper
→ System looks up shopper.telegram_id
→ System sends message via Telegram API
→ Shopper receives notification
```

## Security Features

### Authentication

- ✅ User session validation
- ✅ Shopper ID verification
- ✅ Authorization checks

### Data Validation

- ✅ Required field validation
- ✅ UUID format validation
- ✅ Status value validation

### Error Handling

- ✅ Graceful error responses
- ✅ Detailed error logging
- ✅ Fallback mechanisms

## Benefits

1. **Persistent Connections** - Telegram IDs stored in database
2. **Real-time Status** - Instant online/offline updates
3. **Secure Integration** - Proper authentication and validation
4. **Scalable Architecture** - Ready for production use
5. **Comprehensive Logging** - Full audit trail
6. **Error Handling** - Graceful failure management

---

# Authentication System

## Overview

The application uses a simple and reliable authentication system based on NextAuth.js with client-side route protection.

## Key Features

- ✅ **Simple Authentication**: Direct NextAuth.js integration
- ✅ **Role-based Access**: User and Shopper roles
- ✅ **Client-side Protection**: AuthGuard component for route protection
- ✅ **Automatic Redirects**: Seamless login/logout flow
- ✅ **Session Management**: Persistent sessions with automatic refresh

## Authentication Components

### 1. AuthGuard Component

```typescript
<AuthGuard requireAuth={true} requireRole="shopper">
  <YourPageContent />
</AuthGuard>
```

**Props:**

- `requireAuth`: Boolean - Whether authentication is required
- `requireRole`: 'user' | 'shopper' - Specific role requirement
- `fallback`: React.ReactNode - Custom loading component

### 2. useAuth Hook

```typescript
const { isLoggedIn, isLoading, user, role, requireAuth, requireRole } =
  useAuth();
```

**Methods:**

- `requireAuth()`: Redirects to login if not authenticated
- `requireRole(role)`: Redirects if user doesn't have required role

## Route Protection

### Public Routes

- `/` - Home page (shows different content based on role)
- `/Auth/Login` - Login page
- `/Auth/Register` - Registration page
- `/Reels` - Public content (actions require auth)
- `/Recipes` - Public recipes
- `/shops` - Public shop browsing

### Protected Routes

- `/Myprofile` - User profile (requires auth)
- `/Cart` - Shopping cart (viewing public, checkout requires auth)
- `/CurrentPendingOrders` - Order management (requires auth)
- `/Messages` - Chat system (requires auth)
- `/Plasa/*` - Shopper dashboard (requires shopper role)

## Form Accessibility

All authentication forms include proper accessibility attributes:

- ✅ **Autocomplete attributes**: `username`, `current-password`, `new-password`, `email`, `tel`
- ✅ **Password managers**: Compatible with 1Password, LastPass, etc.
- ✅ **Screen readers**: Proper labeling and structure
- ✅ **Mobile keyboards**: Better input suggestions

## Session Management

- **Automatic refresh**: Sessions refresh every 5 minutes
- **Window focus**: Refreshes when window gains focus
- **Role switching**: Seamless role changes with proper redirects
- **Secure cookies**: HTTP-only cookies for session storage

## Security Features

- **CSRF Protection**: Built-in NextAuth.js protection
- **Secure cookies**: HTTP-only, secure, same-site cookies
- **Session validation**: Server-side session verification
- **Role verification**: Database-level role checking
- **Input validation**: Comprehensive form validation

## Development

### Environment Variables

```bash
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECURE_COOKIES=false  # true for production
```

### Testing Authentication

1. **Login flow**: Test with valid/invalid credentials
2. **Role switching**: Test user ↔ shopper role changes
3. **Route protection**: Verify protected routes redirect properly
4. **Session persistence**: Test session across browser refreshes
5. **Logout**: Verify complete session clearing

## Troubleshooting

### Common Issues

1. **Redirect loops**: Usually caused by incorrect route protection logic
2. **Session not persisting**: Check NEXTAUTH_SECRET and cookie settings
3. **Role switching fails**: Verify database role updates
4. **Protected routes not working**: Check AuthGuard implementation

### Debug Tools

- Browser DevTools → Application → Cookies
- Network tab for authentication requests
- Console logs for authentication flow
- NextAuth.js debug mode (set `debug: true` in auth options)

---

# Wallet Operations API

## Overview

The Wallet Operations API (`/api/shopper/walletOperations`) is a dedicated endpoint that handles all wallet balance operations for specific order statuses. This API is called by the Order Status Update API to ensure proper wallet management.

## API Endpoint

### Wallet Operations API (`/api/shopper/walletOperations`)

**POST** - Handle wallet balance operations for specific order statuses

```typescript
POST /api/shopper/walletOperations
{
  orderId: uuid,
  operation: "shopping" | "delivered" | "cancelled",
  isReelOrder: boolean
}

// Response
{
  success: true,
  operation: string,
  orderId: uuid,
  newAvailableBalance?: string,
  newReservedBalance: string,
  earningsAdded?: number,
  platformFeeDeducted?: number,
  refundAmount?: number,
  message: string
}
```

## Operations

### 1. "shopping" Operation

**Purpose**: Reserve funds when shopper starts shopping

**Actions**:

- Reserved balance increases by order total
- Commission revenue calculated and recorded
- Wallet transaction created for reserved balance

**Response Fields**:

- `newReservedBalance`: Updated reserved balance
- `reservedBalanceChange`: Amount added to reserved balance
- `message`: "Reserved balance updated for shopping"

### 2. "delivered" Operation

**Purpose**: Process earnings and handle reserved balance when order is delivered

**Actions**:

- Available balance updated with remaining earnings (after platform fee deduction)
- Reserved balance properly handled (never goes negative)
- Refund logic for excess reserved amounts
- Plasa fee revenue calculated and recorded
- Wallet transactions created for earnings, expenses, and refunds

**Response Fields**:

- `newAvailableBalance`: Updated available balance
- `newReservedBalance`: Updated reserved balance
- `earningsAdded`: Amount added to available balance
- `platformFeeDeducted`: Platform fee amount deducted
- `refundAmount`: Refund amount if applicable
- `message`: "Wallet updated for delivered order"

### 3. "cancelled" Operation

**Purpose**: Process refunds when order is cancelled

**Actions**:

- Reserved balance decreases by order total
- Refund record created in Refunds table
- Wallet transaction created for refund

**Response Fields**:

- `newReservedBalance`: Updated reserved balance
- `refundAmount`: Refund amount processed
- `message`: "Refund processed for cancelled order"

## Integration with Order Status Updates

The Wallet Operations API is automatically called by the Order Status Update API (`/api/shopper/updateOrderStatus`) for the following statuses:

- **"shopping"**: Calls wallet operations with `operation: "shopping"`
- **"delivered"**: Calls wallet operations with `operation: "delivered"`
- **"cancelled"**: Calls wallet operations with `operation: "cancelled"`

This ensures that wallet operations are properly handled whenever order status changes occur.

---

# MTN MoMo Wallet Integration

## Overview

This section covers the integration with MTN Mobile Money (MoMo) API for payment processing in the grocery delivery system.

## 📌 MTN MoMo Wallet Types

### Collection Wallet

- **Purpose**: Used by merchants/shops to collect money from customers (customer → you)
- **Use Case**: Payment collection during checkout
- **API Endpoint**: `/collection/v1_0/requesttopay`

### Disbursement Wallet

- **Purpose**: Used by businesses to pay out money (you → customer/agent/supplier)
- **Use Case**: Refunds, payouts to shoppers
- **API Endpoint**: `/disbursement/v1_0/transfer`

### Remittance Wallet

- **Purpose**: Used for cross-border transactions
- **Use Case**: International money transfers

## 🚨 Important Notes

### Collection vs Disbursement

- **To receive money from customers**: Use Collection API (`requesttopay`)
- **To send money to users**: Use Disbursement API (`transfer`)
- **You cannot use Disbursement API to receive money from customers**

### Disbursement API Only Supports:

- `transfer` → send money to user (MSISDN)
- `refund` → return money
- `deposit` → put money into another wallet
- **❌ There is no "request money" in Disbursement**

## ✅ Payment Collection (Checkout)

### Use Collection API → RequestToPay Endpoint

**Endpoint:**

```
POST https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay
```

**Headers:**

```
Authorization: Bearer {{access_token}} (from collection/token/)
X-Reference-Id: {{$guid}}
X-Target-Environment: sandbox
Ocp-Apim-Subscription-Key: {{COLLECTION_SUBSCRIPTION_KEY}}
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": "500",
  "currency": "EUR",
  "externalId": "ORDER-1001",
  "payer": {
    "partyIdType": "MSISDN",
    "partyId": "250788123456"
  },
  "payerMessage": "Checkout at MyShop",
  "payeeNote": "Thanks for shopping with us"
}
```

**Response:**

- `202 Accepted` - Request initiated, user will approve in MoMo app/USSD

**Check Payment Status:**

```
GET /collection/v1_0/requesttopay/{{referenceId}}
```

## 🔑 Token Management

### Collection Tokens (for receiving payments)

```
POST /collection/token/
```

- Use Collection wallet credentials
- Only works with `/collection/...` endpoints

### Disbursement Tokens (for sending payments)

```
POST /disbursement/token/
```

- Use Disbursement wallet credentials
- Only works with `/disbursement/...` endpoints

## ⚠️ Critical Rules

1. **Cannot mix wallet types**: Collection wallet credentials only work on `/collection/...` endpoints
2. **Cannot mix wallet types**: Disbursement wallet credentials only work on `/disbursement/...` endpoints
3. **For checkout/payment collection**: Always use Collection API
4. **For refunds/payouts**: Always use Disbursement API

## Implementation in Grocery System

### Payment Collection Flow

1. Customer initiates checkout
2. System calls Collection API `requesttopay`
3. Customer approves payment in MoMo app
4. System checks payment status
5. Order confirmed upon successful payment

### Refund Flow

1. Missing items detected during shopping
2. System calculates refund amount
3. System calls Disbursement API `transfer`
4. Refund sent to customer's MoMo account

---

# Order Types and Fetching Logic Documentation

## Overview

The grocery delivery system supports three distinct order types, each with different aging logic, fetching criteria, and visual representation. This documentation details the implementation differences and how each order type is handled throughout the system.

## Order Types

### 1. Regular Orders

- **Database Table**: `Orders`
- **Aging Logic**: Based on `created_at` timestamp
- **Fetching Criteria**: Orders 30+ minutes old since creation
- **Visual Representation**: Green markers on map (`#10b981`)
- **Order Card Color**: Green background
- **Query Filter**: `created_at <= thirtyMinutesAgo`
- **Assignment**: Direct assignment to shoppers

### 2. Reel Orders

- **Database Table**: `reel_orders`
- **Aging Logic**: Based on `created_at` timestamp
- **Fetching Criteria**: Orders 30+ minutes old since creation
- **Visual Representation**: Purple markers on map (`#8b5cf6`)
- **Order Card Color**: Purple background
- **Query Filter**: `created_at <= thirtyMinutesAgo`
- **Assignment**: Direct assignment to shoppers

### 3. Restaurant Orders

- **Database Table**: `restaurant_orders`
- **Aging Logic**: Based on `updated_at` timestamp (NOT `created_at`)
- **Fetching Criteria**: Orders 30+ minutes old since last update
- **Visual Representation**: Orange markers on map (`#f97316`)
- **Order Card Color**: Orange background
- **Query Filter**: `updated_at <= thirtyMinutesAgo`
- **Assignment**: Requires restaurant confirmation workflow

## Key Implementation Differences

### Database Queries

#### Regular Orders Query

```sql
SELECT * FROM Orders
WHERE created_at <= thirtyMinutesAgo
AND shopper_id IS NULL
AND status = 'PENDING'
ORDER BY created_at DESC
```

#### Reel Orders Query

```sql
SELECT * FROM reel_orders
WHERE created_at <= thirtyMinutesAgo
AND shopper_id IS NULL
AND status = 'PENDING'
ORDER BY created_at DESC
```

#### Restaurant Orders Query

```sql
SELECT * FROM restaurant_orders
WHERE updated_at <= thirtyMinutesAgo  -- Different timestamp field!
AND shopper_id IS NULL
AND status = 'PENDING'
AND assigned_at IS NULL  -- Additional check for restaurant orders
ORDER BY updated_at DESC
```

### Frontend Filtering Logic

The `MapSection.tsx` component uses different timestamp fields based on order type:

```typescript
// MapSection.tsx - filterAgedUnassignedOrders function
const filtered = orders.filter((order) => {
  let referenceTimestamp;

  if (order.orderType === "restaurant") {
    // Restaurant orders use updatedAt for aging
    const updatedAt = order.updatedAt;
    referenceTimestamp =
      updatedAt && updatedAt !== "null" && updatedAt !== ""
        ? updatedAt
        : order.createdAt; // Fallback to createdAt if updatedAt is invalid
  } else {
    // Regular and reel orders use rawCreatedAt (ISO timestamp)
    referenceTimestamp = order.rawCreatedAt || order.createdAt;
  }

  const orderTimestamp = new Date(referenceTimestamp);

  // Check if the date is valid to prevent RangeError
  if (isNaN(orderTimestamp.getTime())) {
    console.error(
      `❌ Invalid timestamp for order ${order.id}:`,
      referenceTimestamp
    );
    return false;
  }

  const isAged = orderTimestamp <= thirtyMinutesAgo;
  const isUnassigned = !order.shopper_id;

  return isAged && isUnassigned;
});
```

### Data Pipeline

#### 1. API Layer (`/api/shopper/availableOrders.ts`)

- Fetches all three order types with different GraphQL queries
- Transforms data to include `updatedAt` for restaurant orders
- Returns unified format with `orderType` field
- Handles timestamp validation and error logging

#### 2. Dashboard Layer (`ShopperDashboard.tsx`)

- Receives unified order data from API
- Formats display properties (relative time, earnings, etc.)
- Passes `rawCreatedAt` for regular/reel orders and `updatedAt` for restaurant orders
- Ensures all required fields are available for map rendering

#### 3. Map Layer (`MapSection.tsx`)

- Uses different timestamp fields based on order type
- Applies appropriate color coding for markers
- Handles coordinate validation and marker creation
- Implements fallback logic for invalid timestamps

### Visual Distinctions

| Order Type | Map Marker Color | Order Card Background | Icon         | Hex Color |
| ---------- | ---------------- | --------------------- | ------------ | --------- |
| Regular    | Green            | Green gradient        | Shopping bag | `#10b981` |
| Reel       | Purple           | Purple gradient       | Video reel   | `#8b5cf6` |
| Restaurant | Orange           | Orange gradient       | Restaurant   | `#f97316` |

### Marker Creation Implementation

```typescript
// MapSection.tsx - createOrderMarkerIcon function
const createOrderMarkerIcon = (
  earnings: string,
  orderType: "regular" | "reel" | "restaurant" = "regular"
) => {
  const simplifiedEarnings = formatEarningsDisplay(earnings);
  const bgColor =
    orderType === "reel"
      ? theme === "dark"
        ? "#7c3aed"
        : "#8b5cf6"
      : orderType === "restaurant"
      ? theme === "dark"
        ? "#ea580c"
        : "#f97316" // Orange for restaurant
      : theme === "dark"
      ? "#065f46"
      : "#10b981"; // Green for regular

  const borderColor =
    orderType === "reel"
      ? theme === "dark"
        ? "#6d28d9"
        : "#7c3aed"
      : orderType === "restaurant"
      ? theme === "dark"
        ? "#c2410c"
        : "#ea580c" // Orange border
      : theme === "dark"
      ? "#047857"
      : "#059669"; // Green border

  // Returns styled div icon with appropriate colors
};
```

## Special Considerations

### Restaurant Orders

- **Critical Difference**: Use `updated_at` instead of `created_at` for aging logic
- **Additional Field**: Require `assigned_at` to be null for unassigned status
- **Timestamp Validation**: Must validate `updated_at` is a valid ISO string
- **Fallback Logic**: Fall back to `created_at` if `updated_at` is invalid

### Timestamp Validation

- All timestamps must be valid ISO strings to prevent `RangeError: Invalid time value`
- Implement validation checks before creating Date objects
- Log errors for debugging invalid timestamp issues
- Provide fallback mechanisms for invalid data

### Assignment Workflow

- **Regular/Reel Orders**: Direct assignment to shoppers
- **Restaurant Orders**: May require restaurant confirmation process
- All order types check for `shopper_id` being null for unassigned status

### Error Handling

- Implement comprehensive error logging for debugging
- Handle invalid timestamps gracefully
- Provide fallback mechanisms for missing data
- Validate coordinates before marker creation

## Debugging and Monitoring

### Console Logs

The system includes extensive logging for debugging:

- API query results and parameters
- Order processing in dashboard layer
- Map filtering and marker creation
- Timestamp validation and error handling

### Key Log Messages

- `🔍 Restaurant orders query result:` - API query debugging
- `🍽️ Processing restaurant order:` - Dashboard processing
- `🗺️ MapSection received orders:` - Map data reception
- `❌ Invalid timestamp for order:` - Error handling

This documentation ensures developers understand the differences between order types and can maintain the system effectively.

## Restaurant Order Management System

### 1. Restaurant Order Assignment (`pages/api/shopper/assignOrder.ts`)

**Features:**

- Support for restaurant order assignment to shoppers
- Validation for restaurant order types
- GraphQL mutations for restaurant order updates
- Proper error handling and response formatting

**API Endpoint:**

- Accepts POST requests to `/api/shopper/assignOrder`
- Requires orderId, orderType set to "restaurant", and shopperId
- Returns success status with complete order information including restaurant details and dish list

**Order Type Validation:**

- Validates that orderType is one of: "regular", "reel", or "restaurant"
- Returns 400 error for invalid order types
- Ensures proper restaurant order assignment flow

### 2. Restaurant Order Display (`src/components/shopper/activeBatchesCard.tsx`)

**Features:**

- Visual distinction for restaurant orders
- Restaurant-specific styling and icons
- Dish count and restaurant information display
- Orange/red gradient styling for restaurant orders

**Restaurant Order Styling:**

- Orange and red gradient badge with restaurant icon to identify restaurant orders
- Special card styling with orange borders and gradient backgrounds
- Visual distinction from regular and reel orders
- Restaurant icon and "Restaurant Order" text indicator

### 3. Restaurant Order Details (`pages/Plasa/active-batches/batch/[id]/index.tsx`)

**Features:**

- Complete restaurant order information display
- Restaurant and customer details
- Dish-by-dish breakdown
- Delivery instructions and timing
- Shopper assignment information

**Restaurant Order Data Structure:**

- Order ID and type identification
- Complete restaurant information including name, location, phone, and logo
- Customer details with name, phone, and delivery address
- Array of dishes with individual quantities, prices, descriptions, and images
- Delivery fee, total amount, and estimated delivery time
- Delivery notes and special instructions
- Order status tracking from pending to delivered

### 4. Restaurant Order API (`pages/api/shopper/orderDetails.ts`)

**Features:**

- Complete restaurant order fetching
- Restaurant-specific GraphQL queries
- Proper data formatting for frontend
- Support for all restaurant order fields

**GraphQL Query:**

- Fetches complete restaurant order details by order ID
- Retrieves restaurant information, customer details, and delivery address
- Includes all dish orders with individual dish information
- Returns assigned shopper details and order status
- Handles all restaurant-specific fields and relationships

### 5. Map Integration for Restaurant Orders

**Features:**

- Restaurant orders appear on shopper map
- Restaurant location markers
- Customer delivery location markers
- Route optimization for restaurant deliveries
- Real-time order status updates

**Map Component Integration:**

- Restaurant orders appear as special markers on the shopper map
- Each marker shows restaurant location with custom restaurant icon
- Popup displays restaurant name, dish count, and potential earnings
- One-click order acceptance directly from map interface
- Real-time updates when orders are accepted or completed

### 6. Restaurant Order Workflow

**Complete Flow:**

1. **Order Creation**: Customer places restaurant order
2. **Shopper Assignment**: Order appears on shopper dashboard and map
3. **Order Acceptance**: Shopper accepts restaurant order
4. **Restaurant Pickup**: Shopper goes to restaurant location
5. **Order Collection**: Shopper collects prepared dishes
6. **Delivery**: Shopper delivers to customer
7. **Completion**: Order marked as delivered

**Status Progression:**

- PENDING: Order created and waiting for shopper assignment
- shopping: Shopper accepted and heading to restaurant
- packing: Restaurant preparing the order
- on_the_way: Shopper collected order and en route to customer
- delivered: Order successfully delivered to customer

### 7. Restaurant Order Benefits

**For Shoppers:**

- Additional earning opportunities
- Restaurant-specific delivery experience
- Higher delivery fees (no service fee deduction)
- Clear restaurant and customer information

**For Customers:**

- Access to restaurant food delivery
- Real-time order tracking
- Professional delivery service
- Contact with assigned shopper

**For Restaurants:**

- Expanded delivery reach
- Professional delivery service
- Real-time order tracking
- Customer feedback system

### 8. Database Schema for Restaurant Orders

**Restaurant Orders Table:**

- Primary key with unique order ID
- Links to user who placed the order and restaurant
- Stores delivery fee, total amount, and delivery timing
- Tracks order status and assigned shopper
- Includes delivery notes and timestamps

**Restaurant Dishes Orders Table:**

- Links each dish to specific restaurant orders
- Tracks quantity and individual dish pricing
- Maintains relationship between orders and restaurant menu items
- Stores creation timestamps for order tracking

### 9. Implementation Status

**✅ Completed Features:**

- Restaurant order assignment API
- Restaurant order display in active batches
- Restaurant order details page
- Restaurant order API for fetching details
- Visual styling and indicators
- GraphQL queries and mutations
- Error handling and validation

**🔄 In Progress:**

- Map integration for restaurant orders
- Real-time status updates
- Notification system for restaurant orders

**📋 Planned Features:**

- Restaurant order analytics
- Performance metrics for restaurant deliveries
- Advanced filtering and search
- Restaurant order history and reporting

## Restaurant Order Workflow Improvements (Latest Updates)

### Recent System Enhancements

The restaurant order system has been significantly improved to provide a seamless workflow from order placement to delivery completion. The following enhancements ensure restaurant orders operate with optimal efficiency and reliability.

### 1. Streamlined Order Status Flow

**Previous Issue**: Restaurant orders were following the same workflow as regular grocery orders, including an unnecessary "shopping" phase.

**Solution Implemented**: Restaurant orders now follow a direct pickup-and-delivery workflow:

```
Order Status Flow for Restaurant Orders:
accepted → on_the_way → delivered

(No "shopping" phase - restaurants prepare food, shoppers only pick up and deliver)
```

**Technical Implementation**:

- Modified `batchDetails.tsx` to show "Start Delivery" instead of "Start Shopping" for restaurant orders
- Updated `updateOrderStatus.ts` to prevent restaurant orders from being updated to "shopping" status
- Added validation to skip wallet operations for restaurant orders during shopping phase

### 2. Wallet Operations Integration

**Previous Issue**: Restaurant orders were not properly integrated with the wallet system, causing foreign key constraint violations.

**Solution Implemented**: Complete wallet transaction support for restaurant orders:

**Wallet Transaction Structure**:

```typescript
// Restaurant Order Wallet Transaction
{
  wallet_id: "shopper-wallet-id",
  amount: "2500.00",                    // Delivery fee only
  type: "earnings",
  status: "completed",
  related_order_id: null,               // Explicitly null
  related_reel_orderId: null,           // Explicitly null
  related_restaurant_order_id: "order-id", // Restaurant order reference
  description: "Delivery fee earnings after platform fee deduction"
}
```

**Key Improvements**:

- Restaurant orders only earn delivery fees (no service fees)
- Proper foreign key field usage (`related_restaurant_order_id`)
- Explicit null values for unused foreign key fields
- Consistent wallet transaction creation across all order types

### 3. Delivery Confirmation System

**Previous Issue**: Restaurant orders were attempting to generate invoices during delivery confirmation, which was unnecessary for restaurant orders.

**Solution Implemented**: Streamlined delivery confirmation for restaurant orders:

**Delivery Confirmation Flow**:

1. **Photo Upload**: Shopper takes delivery confirmation photo
2. **Wallet Processing**: Delivery fee is added to shopper's wallet
3. **Status Update**: Order status changes to "delivered"
4. **No Invoice Generation**: Restaurant orders skip invoice creation (restaurants handle their own billing)

**Technical Implementation**:

- Modified `DeliveryConfirmationModal.tsx` to handle restaurant orders appropriately
- Updated `batchDetails.tsx` to show delivery photo modal without invoice generation
- Ensured proper status update timing (only after photo upload completion)

### 4. Payment Processing Improvements

**Previous Issue**: Payment processing was failing due to foreign key constraint violations and duplicate refund creation.

**Solution Implemented**: Robust payment processing with proper error handling:

**Payment Flow Enhancements**:

- **Foreign Key Management**: All wallet transactions explicitly set foreign key fields
- **Duplicate Prevention**: Check for existing refunds before creating new ones
- **Error Recovery**: Graceful handling of partial payment completions
- **Transaction Integrity**: Consistent wallet transaction structure across all APIs

**Files Updated**:

- `pages/api/shopper/walletOperations.ts` - Complete wallet operations for all order types
- `pages/api/shopper/processPayment.ts` - Payment processing with duplicate refund prevention
- `pages/api/shopper/recordTransaction.ts` - Transaction recording with proper foreign keys
- `src/lib/walletTransactions.ts` - Wallet transaction utilities with foreign key support

### 5. Database Schema Optimization

**Schema Updates**:

- **Foreign Key Fields**: Added `related_restaurant_order_id` field to `Wallet_Transactions` table
- **Constraint Management**: Proper foreign key constraints for all order types
- **Data Integrity**: Unique constraints on refund records to prevent duplicates

**GraphQL Schema**:

- Regenerated GraphQL types to include new foreign key fields
- Updated all wallet transaction mutations to support restaurant orders
- Consistent schema across all order types

### 6. User Experience Improvements

**UI/UX Enhancements**:

- **Clear Status Indicators**: Restaurant orders show appropriate status transitions
- **Proper Button Labels**: "Start Delivery" instead of "Start Shopping" for restaurant orders
- **Modal Behavior**: Clean delivery confirmation modal without premature "uploading" messages
- **Error Handling**: Clear error messages and proper error recovery

**Visual Distinctions**:

- Orange color scheme for restaurant orders
- Restaurant-specific icons and indicators
- Clear order type identification throughout the system

### 7. System Reliability

**Error Prevention**:

- **Foreign Key Violations**: Eliminated through proper field management
- **Duplicate Records**: Prevented through existence checks
- **Status Conflicts**: Resolved through order-type-specific validation
- **Transaction Failures**: Minimized through comprehensive error handling

**Performance Optimizations**:

- **Efficient Queries**: Optimized GraphQL queries for restaurant orders
- **Reduced API Calls**: Streamlined wallet operations
- **Better Caching**: Improved data fetching and state management

### 8. Testing and Validation

**Comprehensive Testing**:

- **Order Flow Testing**: Verified complete restaurant order workflow
- **Wallet Integration**: Tested all wallet operations for restaurant orders
- **Payment Processing**: Validated payment and refund creation
- **Error Scenarios**: Tested error handling and recovery mechanisms

**Quality Assurance**:

- **Type Safety**: Full TypeScript support for all restaurant order operations
- **Data Validation**: Proper input validation and error handling
- **Consistency Checks**: Ensured consistent behavior across all order types

### 9. Future Enhancements

**Planned Improvements**:

- **Advanced Analytics**: Restaurant-specific performance metrics
- **Dynamic Pricing**: Restaurant-specific delivery fee calculations
- **Integration APIs**: Direct integration with restaurant POS systems
- **Real-time Updates**: Enhanced WebSocket support for restaurant orders

**Scalability Considerations**:

- **Database Optimization**: Index optimization for restaurant order queries
- **API Performance**: Caching strategies for frequently accessed data
- **Load Balancing**: Distribution strategies for high-volume restaurant orders

### 10. Technical Architecture

**System Components**:

```
Restaurant Order System
├── Order Management
│   ├── Status Updates (updateOrderStatus.ts)
│   ├── Order Details (orderDetails.ts)
│   └── Batch Processing (batchDetails.tsx)
├── Wallet Operations
│   ├── Transaction Creation (walletOperations.ts)
│   ├── Payment Processing (processPayment.ts)
│   └── Transaction Recording (recordTransaction.ts)
├── Delivery Confirmation
│   ├── Photo Upload (uploadDeliveryPhoto.ts)
│   ├── Modal Management (DeliveryConfirmationModal.tsx)
│   └── Status Updates (batchDetails.tsx)
└── Database Integration
    ├── GraphQL Queries
    ├── Foreign Key Management
    └── Constraint Handling
```

**Key Benefits**:

- **Streamlined Workflow**: Direct pickup-and-delivery process
- **Reliable Payments**: Robust wallet integration and payment processing
- **Data Integrity**: Proper foreign key management and constraint handling
- **User Experience**: Clear status indicators and smooth delivery confirmation
- **System Reliability**: Comprehensive error handling and recovery mechanisms

This comprehensive update ensures that restaurant orders operate with the same reliability and efficiency as regular grocery orders, while maintaining their unique workflow requirements.

---

# PlasBusiness Management System

## Overview

The PlasBusiness Management System is a comprehensive B2B platform that enables businesses to create accounts, manage stores, list products, create and respond to RFQs (Request for Quotations), and interact with suppliers. The system supports both buyers (creating RFQs) and suppliers (submitting quotes) with a complete workflow from RFQ creation to quote acceptance.

## Key Features

- **Business Account Management**: Create and manage business accounts (business or personal types)
- **Store Management**: Create and manage multiple stores per business
- **Product Management**: Add, edit, and manage products with unique verification IDs
- **RFQ Creation**: Create detailed RFQs with requirements, budgets, and deadlines
- **RFQ Opportunities**: Browse and respond to open RFQ opportunities
- **Quote Submission**: Submit detailed quotes with attachments, terms, and pricing
- **Response Management**: View and manage responses to your RFQs
- **Supplier Directory**: Browse all businesses (excluding personal accounts)
- **Quote Tracking**: Track submitted quotes and their status

## System Architecture

```mermaid
graph TB
    A[User] --> B[Business Account Creation]
    B --> C{Account Type}
    C -->|Business| D[Create Stores]
    C -->|Personal| E[Personal Account]
    D --> F[Add Products]
    D --> G[Create RFQs]
    G --> H[RFQ Opportunities]
    H --> I[Suppliers Submit Quotes]
    I --> J[View Responses]
    J --> K[Accept/Reject Quotes]

    E --> L[Browse RFQ Opportunities]
    L --> M[Submit Quotes]
    M --> N[Track Submitted Quotes]
```

## Database Schema

### Core Tables

#### 1. `business_accounts`

Stores business account information.

**Key Fields**:

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to Users)
- `account_type` (String: "business" or "personal")
- `business_name` (String)
- `business_email` (String)
- `business_phone` (String)
- `business_location` (String)
- `status` (String: "pending_review", "approved", "rejected")
- `face_image` (String, base64)
- `id_image` (String, base64)
- `rdb_certificate` (String, base64)

#### 2. `business_stores`

Stores store information for businesses.

**Key Fields**:

- `id` (uuid, primary key)
- `business_id` (uuid, foreign key to business_accounts)
- `name` (String)
- `description` (String)
- `image` (String, base64)
- `category_id` (uuid, optional)
- `latitude` (String)
- `longitude` (String)
- `operating_hours` (json)
- `is_active` (Boolean)

#### 3. `PlasBusinessProductsOrSerive`

Stores products/services for stores.

**Key Fields**:

- `id` (uuid, primary key)
- `store_id` (uuid, foreign key to business_stores)
- `Plasbusiness_id` (uuid, foreign key to business_accounts)
- `user_id` (uuid, foreign key to Users)
- `name` (String)
- `Description` (String)
- `Image` (String, base64)
- `price` (String)
- `unit` (String)
- `status` (String: "active", "inactive")
- `query_id` (String, unique verification ID format: PB######)
- `minimumOrders` (String)
- `maxOrders` (String)
- `delveryArea` (String)
- `speciality` (String)

#### 4. `bussines_RFQ`

Stores RFQ (Request for Quotation) information.

**Key Fields**:

- `id` (uuid, primary key)
- `business_id` (uuid, foreign key to business_accounts)
- `user_id` (uuid, foreign key to Users)
- `title` (String)
- `description` (String)
- `category` (String)
- `min_budget` (String)
- `max_budget` (String)
- `location` (String)
- `response_date` (String, deadline)
- `urgency_level` (String)
- `estimated_quantity` (String)
- `expected_delivery_date` (String)
- `payment_terms` (String)
- `requirements` (json)
- `notes` (String)
- `contact_name` (String)
- `email` (String)
- `phone` (String)
- `attachment` (String, base64)
- `open` (Boolean)

#### 5. `BusinessQoute`

Stores quotes submitted by suppliers for RFQs.

**Key Fields**:

- `id` (uuid, primary key)
- `businessRfq_id` (uuid, foreign key to bussines_RFQ)
- `respond_business_id` (uuid, foreign key to business_accounts)
- `qouteAmount` (String)
- `currency` (String, default from System_configuratioins)
- `delivery_time` (String)
- `quote_validity` (String)
- `message` (String)
- `PaymentTerms` (String)
- `DeliveryTerms` (String)
- `warrantly` (String)
- `cancellatioinTerms` (String)
- `attachement` (String, base64)
- `attachment_1` (String, base64)
- `attachment_2` (String, base64)
- `status` (String: "pending", "accepted", "rejected")

#### 6. `business_wallet`

Stores wallet information for businesses.

**Key Fields**:

- `id` (uuid, primary key)
- `business_id` (uuid, foreign key to business_accounts)
- `amount` (String)

## Workflows

### 1. Business Account Creation

**Flow**:

1. User navigates to business dashboard
2. Creates business account with type selection (business or personal)
3. Uploads required documents (ID, face image, RDB certificate for business type)
4. Account status set to "pending_review"
5. Admin reviews and approves/rejects

**API Endpoint**: `/api/mutations/create-business-account`

**Key Features**:

- Account type validation
- Document upload (base64 encoding)
- Automatic wallet creation
- Status management

### 2. Store Creation

**Flow**:

1. Business owner navigates to store management
2. Clicks "Create Store"
3. Fills store details (name, description, location, category)
4. Uploads store image
5. Sets operating hours
6. Store created with `is_active: false` by default
7. Wallet automatically created for business if not exists

**API Endpoint**: `/api/mutations/create-business-store`

**Key Features**:

- Google Maps integration for location
- Operating hours as JSON
- Automatic wallet creation
- Category association

### 3. Product Management

**Flow**:

1. Business owner opens store details page
2. Clicks "Add Product"
3. System generates unique verification ID (format: PB######)
4. User fills product details:
   - Name, description, price, unit
   - Minimum/maximum orders
   - Delivery area
   - Speciality
   - Image (with client-side compression)
5. Product saved to `PlasBusinessProductsOrSerive` table

**API Endpoints**:

- Create: `/api/mutations/create-business-product`
- Update: `/api/mutations/update-business-product`
- Generate ID: `/api/queries/generate-product-query-id`

**Key Features**:

- Unique verification ID generation (PB + 6 alphanumeric characters)
- Image compression before upload
- Product editing capability
- Search and pagination (18 products per page)
- Responsive grid layout (1 col mobile, 3 cols small, 4 cols medium+)

### 4. RFQ Creation (Buyer Workflow)

**Flow**:

1. Business owner navigates to "My RFQs" section
2. Clicks "Create New RFQ"
3. Multi-step form:
   - Step 1: Basic info (title, description, category)
   - Step 2: Budget and timeline
   - Step 3: Requirements and attachments
   - Step 4: Contact information
4. RFQ created with `open: true`
5. Appears in "RFQ Opportunities" for suppliers

**API Endpoint**: `/api/mutations/create-business-rfq`

**Key Features**:

- Multi-step form with validation
- Requirements as JSON array
- Attachment support (base64)
- Budget range (min/max)
- Deadline management
- Urgency levels

### 5. RFQ Opportunities (Supplier Workflow)

**Flow**:

1. Supplier navigates to "RFQ Opportunities" tab
2. Views all RFQs where `open = true`
3. Filters by category, searches by keyword
4. Views RFQ details
5. Checks if already submitted quote
6. If not submitted: Opens quote submission form
7. If submitted: Views submitted quote details

**API Endpoint**: `/api/queries/rfq-opportunities`

**Key Features**:

- Filters out current user's own RFQs
- Shows RFQ status (Open/Closed based on deadline)
- Posted by information (business name or contact name)
- Category filtering
- Search functionality

### 6. Quote Submission (Supplier Workflow)

**Flow**:

1. Supplier clicks "Submit Quote" on an RFQ
2. Fills quote form:
   - Quote amount and currency (default from system config)
   - Delivery time (dropdown)
   - Quote validity (dropdown)
   - Message
   - Payment terms (dropdown)
   - Delivery terms (dropdown)
   - Warranty (dropdown)
   - Cancellation terms (dropdown)
   - Up to 3 attachments (with compression)
3. Quote submitted with `status: "pending"`
4. Currency defaults from `System_configuratioins` table
5. Prevents duplicate submissions (checks existing quotes)

**API Endpoint**: `/api/mutations/submit-rfq-quote`

**Key Features**:

- Client-side image compression (max 2.5MB per image, compressed to 1.5MB)
- Total payload limit: 4MB after base64 encoding
- Dynamic currency from system configuration
- Duplicate prevention
- Multiple attachment support (3 max)

### 7. Viewing RFQ Responses (Buyer Workflow)

**Flow**:

1. Business owner navigates to "My RFQs"
2. Clicks "View Responses" on an RFQ
3. System fetches:
   - Complete RFQ details
   - All submitted quotes/responses
   - Supplier information for each quote
4. Displays:
   - RFQ overview (title, description, budget, location, deadline, requirements)
   - All responses with:
     - Supplier details (name, company, location, contact)
     - Quote amount and currency
     - Delivery time and validity
     - Terms and conditions
     - Attachments
     - Status
5. Buyer can:
   - Filter responses by status
   - Sort by price, rating, or submission date
   - Search suppliers
   - Accept/Reject quotes
   - Assign contracts

**API Endpoint**: `/api/queries/rfq-details-and-responses`

**Key Features**:

- Complete RFQ information display
- All responses with full supplier details
- Filtering and sorting
- Attachment download
- Status management

### 8. Viewing Submitted Quotes (Supplier Workflow)

**Flow**:

1. Supplier navigates to "Quotes" section
2. Views all quotes submitted by their business
3. Each quote shows:
   - RFQ title and category
   - Posting business information
   - Quote amount and currency
   - Delivery time and validity
   - Status
   - Submission date
4. Click "View Details" to see:
   - Complete RFQ details
   - RFQ requester company information
   - Full quote details
   - Terms and conditions
   - Attachments

**API Endpoint**: `/api/queries/business-submitted-quotes`

**Key Features**:

- Shows all quotes where `respond_business_id` = current business
- Includes RFQ and requester information
- Complete quote details with attachments
- Status tracking

### 9. Suppliers Directory

**Flow**:

1. User navigates to "Suppliers" section
2. Views all businesses (excluding personal accounts and current user's business)
3. Filters by category and location
4. Searches suppliers
5. Views supplier details
6. Contacts suppliers

**API Endpoint**: `/api/queries/all-businesses`

**Key Features**:

- Excludes personal businesses (`account_type != "personal"`)
- Excludes current user's business
- Shows business name, location, account type
- Verified status based on approval
- Search and filter functionality

## API Endpoints

### Business Account Management

#### Create Business Account

- **Endpoint**: `POST /api/mutations/create-business-account`
- **Description**: Creates a new business account
- **Body**: Account type, business details, documents (base64)
- **Returns**: Created account with ID

### Store Management

#### Create Store

- **Endpoint**: `POST /api/mutations/create-business-store`
- **Description**: Creates a new store for a business
- **Body**: Store details, location, category, operating hours
- **Returns**: Created store with ID
- **Side Effects**: Creates wallet if not exists

#### Get Store Details

- **Endpoint**: `GET /api/queries/business-store?storeId={id}`
- **Description**: Fetches store details by ID
- **Returns**: Complete store information

#### Get Business Stores

- **Endpoint**: `GET /api/queries/business-stores`
- **Description**: Fetches all stores for current business
- **Returns**: Array of stores

### Product Management

#### Generate Product Query ID

- **Endpoint**: `GET /api/queries/generate-product-query-id`
- **Description**: Generates unique verification ID (PB######)
- **Returns**: Unique ID string

#### Create Product

- **Endpoint**: `POST /api/mutations/create-business-product`
- **Description**: Creates a new product for a store
- **Body**: Product details, image (base64), verification ID
- **Returns**: Created product

#### Update Product

- **Endpoint**: `PUT /api/mutations/update-business-product`
- **Description**: Updates existing product
- **Body**: Product ID and updated fields
- **Returns**: Updated product

#### Get Store Products

- **Endpoint**: `GET /api/queries/business-products?storeId={id}`
- **Description**: Fetches all products for a store
- **Returns**: Array of products

### RFQ Management

#### Create RFQ

- **Endpoint**: `POST /api/mutations/create-business-rfq`
- **Description**: Creates a new RFQ
- **Body**: RFQ details, requirements (JSON), attachments
- **Returns**: Created RFQ with ID

#### Get Business RFQs

- **Endpoint**: `GET /api/queries/business-rfqs`
- **Description**: Fetches all RFQs created by current business/user
- **Returns**: Array of RFQs

#### Get RFQ Opportunities

- **Endpoint**: `GET /api/queries/rfq-opportunities`
- **Description**: Fetches all open RFQs (for suppliers)
- **Filters**: `open = true`, excludes current user's RFQs
- **Returns**: Array of open RFQs with business account info

#### Get RFQ Details and Responses

- **Endpoint**: `GET /api/queries/rfq-details-and-responses?rfq_id={id}`
- **Description**: Fetches complete RFQ details and all responses
- **Returns**: RFQ details and array of quotes/responses

### Quote Management

#### Submit Quote

- **Endpoint**: `POST /api/mutations/submit-rfq-quote`
- **Description**: Submits a quote for an RFQ
- **Body**: Quote details, terms, attachments (up to 3, base64)
- **Side Effects**: Sets default currency from system config
- **Returns**: Created quote with ID

#### Get User RFQ Quote

- **Endpoint**: `GET /api/queries/user-rfq-quote?rfqId={id}`
- **Description**: Checks if user has already submitted a quote for an RFQ
- **Returns**: Quote if exists, null otherwise

#### Get Business Submitted Quotes

- **Endpoint**: `GET /api/queries/business-submitted-quotes`
- **Description**: Fetches all quotes submitted by current business
- **Filters**: `respond_business_id` = current business ID
- **Returns**: Array of quotes with RFQ and requester info

### Suppliers

#### Get All Businesses

- **Endpoint**: `GET /api/queries/all-businesses`
- **Description**: Fetches all businesses (excluding personal and current user's)
- **Filters**: `account_type != "personal"`, `id != current_business_id`
- **Returns**: Array of business accounts

### System Configuration

#### Get System Configuration

- **Endpoint**: `GET /api/queries/system-configuration`
- **Description**: Fetches system-wide settings
- **Returns**: Configuration including default currency

## Components

### Business Dashboard Components

#### BusinessOverview

- **Location**: `src/components/business/BusinessOverview.tsx`
- **Purpose**: Main dashboard showing stores, RFQs, and quick actions
- **Features**: Store creation, navigation to stores, RFQ creation

#### CreateProductForm

- **Location**: `src/components/business/CreateProductForm.tsx`
- **Purpose**: Form for adding/editing products
- **Features**: Image upload, verification ID display, unit dropdown, validation

#### Store Details Page

- **Location**: `pages/plasBusiness/store/[storeId].tsx`
- **Purpose**: Store details with product listing
- **Features**: Product grid, search, pagination, add/edit products

#### CreateRFQForm

- **Location**: `src/components/business/CreateRFQForm.tsx`
- **Purpose**: Multi-step form for creating RFQs
- **Features**: Step-by-step wizard, attachment upload, requirements management

#### MyRFQsSection

- **Location**: `src/components/business/MyRFQsSection.tsx`
- **Purpose**: Displays RFQs created by current business
- **Features**: RFQ listing, status display, view responses

#### RFQOpportunitiesSection

- **Location**: `src/components/business/RFQOpportunitiesSection.tsx`
- **Purpose**: Displays open RFQs for suppliers to respond to
- **Features**: Filtering, search, quote submission, duplicate prevention

#### RFQResponsesView

- **Location**: `src/components/business/RFQResponsesView.tsx`
- **Purpose**: Displays all responses to an RFQ
- **Features**: Complete RFQ details, all responses, filtering, sorting, accept/reject

#### QuoteSubmissionForm

- **Location**: `src/components/business/QuoteSubmissionForm.tsx`
- **Purpose**: Form for submitting quotes to RFQs
- **Features**: Terms dropdowns, attachment upload (3 max), image compression

#### QuotesSection

- **Location**: `src/components/business/QuotesSection.tsx`
- **Purpose**: Displays quotes submitted by current business
- **Features**: Quote listing, status tracking, view details

#### SubmittedQuoteDetails

- **Location**: `src/components/business/SubmittedQuoteDetails.tsx`
- **Purpose**: Modal showing details of a submitted quote
- **Features**: Complete quote information, RFQ details, attachments

#### SuppliersSection

- **Location**: `src/components/business/SuppliersSection.tsx`
- **Purpose**: Directory of all businesses/suppliers
- **Features**: Search, filter, business listing, contact options

### UI Components

#### RichTextEditor

- **Location**: `src/components/ui/RichTextEditor.tsx`
- **Purpose**: Rich text editor component for formatted text input
- **Features**:
  - **Toolbar Formatting**: Bold, Italic, Underline buttons
  - **Keyboard Shortcuts**:
    - `Ctrl+B` (or `Cmd+B` on Mac) for Bold
    - `Ctrl+I` for Italic
    - `Ctrl+U` for Underline
  - **Auto-Numbering**: Automatically continues numbered lists (1. → 2. → 3. etc.) when pressing Enter
  - **Auto-Bullets**: Automatically continues bullet points (- or \*) when pressing Enter
  - **Format Preservation**: Preserves formatting (line breaks, bullets, numbers) when pasting text
  - **HTML Storage**: Stores content as HTML in the database
  - **HTML Rendering**: Displays formatted content using `dangerouslySetInnerHTML`
- **Usage**: Used in product/service descriptions and RFQ descriptions throughout the PlasBusiness feature
- **Props**:
  - `value: string` - HTML content value
  - `onChange: (value: string) => void` - Callback when content changes
  - `placeholder?: string` - Placeholder text
  - `rows?: number` - Number of rows (default: 8)
  - `className?: string` - Additional CSS classes

## Key Features & Logic

### 1. Product Verification ID Generation

**Format**: `PB` + 6 alphanumeric characters (0-9, A-Z)

**Example**: `PB0384BD`, `PB59483CF`

**Purpose**: Unique, user-friendly ID for product verification when taking photos

**Implementation**:

- Character set: `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- Random generation with collision checking
- Displayed prominently in product creation form

### 2. Image Compression

**Purpose**: Reduce payload size for API requests

**Implementation**:

- Client-side compression before base64 encoding
- Max dimensions: 1920px width
- Quality: 0.7
- Per-file limits:
  - Images: 2.5MB original, compressed to 1.5MB
  - Non-images: 1.5MB
- Total payload limit: 4MB after base64 encoding

**Location**: `QuoteSubmissionForm.tsx`, `CreateProductForm.tsx`

### 3. Currency Management

**Default Currency**: Fetched from `System_configuratioins` table

**Fallback**: "RWF" if not configured

**Usage**:

- Quote submission default currency
- Currency display throughout the system
- Formatting via `formatCurrencySync()` utility

### 4. Duplicate Quote Prevention

**Logic**:

- Before showing quote submission form, check if quote exists
- Query: `BusinessQoute` where `businessRfq_id = rfqId` AND `respond_business_id = currentBusinessId`
- If exists: Show "View Quote" button instead of "Submit Quote"
- If not exists: Show submission form

**API**: `/api/queries/user-rfq-quote`

### 5. RFQ Status Management

**Open/Closed Logic**:

- `open = true` in database: RFQ is open
- Deadline check: If `response_date < today`, status shows as "Closed"
- Visual indicators: Green badge for "Open", Blue badge for "Closed"

### 6. Quote Status Flow

**Statuses**:

- `pending`: Default when quote is submitted
- `accepted`: Buyer accepts the quote
- `rejected`: Buyer rejects the quote
- `negotiating`: Quote is under negotiation

**Visual Indicators**:

- Pending: Blue badge
- Accepted: Green badge
- Rejected: Red badge
- Negotiating: Yellow badge

### 7. Responsive Design

**Product Grid**:

- Mobile: 1 column
- Small screens: 3 columns
- Medium+ screens: 4 columns

**Store Details Page**:

- Mobile: Full-width cover image, circular logo
- Desktop: Side-by-side layout
- Consistent padding and margins

### 8. Rich Text Editor

**Component**: `RichTextEditor` (`src/components/ui/RichTextEditor.tsx`)

**Purpose**: Provides rich text editing capabilities for descriptions and other text fields

**Features**:

1. **Formatting Tools**:

   - Bold, Italic, Underline via toolbar buttons
   - Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U)
   - Bullet lists and numbered lists via toolbar

2. **Auto-Formatting**:

   - **Auto-Numbering**: When you type `1. ` and press Enter, it automatically creates `2. ` on the next line
   - **Auto-Bullets**: When you type `- ` (or `* `) and press Enter, it automatically creates `- ` on the next line
   - Works with or without spaces after the dash/number

3. **Content Handling**:

   - Preserves formatting when pasting (line breaks, bullets, numbers)
   - Stores content as HTML in the database
   - Renders HTML content using `dangerouslySetInnerHTML` for display

4. **Usage Locations**:
   - Product/Service descriptions in `CreateProductForm`
   - Product descriptions in store pages
   - Service descriptions in `ProductsBidsSection`
   - Anywhere formatted text input is needed

**Example Usage**:

```tsx
<RichTextEditor
  value={description}
  onChange={(html) => setDescription(html)}
  placeholder="Enter description with formatting..."
  rows={8}
/>
```

**Storage**: Content is stored as HTML string in the database (e.g., `"1. Item one<br>2. Item two"`)

**Display**: Content is rendered using `dangerouslySetInnerHTML` to preserve formatting

### 9. Search & Filtering

**Product Search**:

- Searches: name, description, price, unit, query ID, delivery area, speciality
- Real-time filtering
- Client-side pagination (18 products per page)

**RFQ Opportunities Filtering**:

- Category filter
- Search by keyword
- Status filter (Open/Closed)

**Suppliers Filtering**:

- Category filter
- Location filter
- Search by name, category, location

## Data Transformations

### RFQ to Display Format

```typescript
{
  id: rfq.id,
  title: rfq.title,
  category: rfq.category || "Uncategorized",
  budget: `${formatCurrency(min)}-${formatCurrency(max)}`,
  responses: count,
  deadline: rfq.response_date,
  status: deadline < today ? "Closed" : "Open"
}
```

### Quote to Modal Format

```typescript
{
  id: quote.id,
  title: rfq.title,
  totalPrice: formatCurrency(quote.qouteAmount, quote.currency),
  deliveryTime: quote.delivery_time,
  validUntil: quote.quote_validity,
  status: quote.status,
  rfqRequester: {
    name: business_account.business_name,
    email: business_account.business_email,
    phone: business_account.business_phone,
    location: business_account.business_location
  },
  terms: {
    paymentTerms: quote.PaymentTerms,
    deliveryTerms: quote.DeliveryTerms,
    warranty: quote.warrantly,
    cancellationTerms: quote.cancellatioinTerms
  },
  attachments: [attachement, attachment_1, attachment_2]
}
```

## Error Handling

### Common Errors & Solutions

1. **Foreign Key Violations**

   - **Cause**: Missing business_id or incorrect relationships
   - **Solution**: Ensure business_account exists before creating stores/products

2. **Not-NULL Constraint Violations**

   - **Cause**: Required fields not provided
   - **Solution**: Provide defaults for all required fields (empty strings, "0", etc.)

3. **413 Payload Too Large**

   - **Cause**: Image files too large
   - **Solution**: Client-side compression, increased API body limit to 4MB

4. **Duplicate Quote Submissions**
   - **Cause**: User tries to submit multiple quotes
   - **Solution**: Check existing quotes before showing submission form

## Security Considerations

1. **Authentication**: All API endpoints require valid session
2. **Authorization**: Users can only access their own business data
3. **File Upload**: Base64 encoding, size limits, type validation
4. **Data Validation**: Input validation on all forms
5. **SQL Injection**: GraphQL parameterized queries prevent injection

## Performance Optimizations

1. **Image Compression**: Reduces payload size by 60-70%
2. **Pagination**: Client-side pagination for products (18 per page)
3. **Lazy Loading**: Components load data on demand
4. **Caching**: Currency configuration cached
5. **Efficient Queries**: GraphQL queries fetch only needed fields

## Future Enhancements

1. **Rating System**: Supplier ratings and reviews
2. **Contract Management**: Digital contract signing
3. **Messaging System**: Direct communication between buyers and suppliers
4. **Analytics Dashboard**: RFQ performance, quote acceptance rates
5. **Notifications**: Real-time notifications for RFQ updates, new quotes
6. **Advanced Search**: Full-text search across products, RFQs, suppliers
7. **Bulk Operations**: Bulk product upload, bulk RFQ creation
8. **Export Functionality**: Export quotes, RFQs to PDF/Excel

## Testing Checklist

- [ ] Business account creation (business and personal types)
- [ ] Store creation with location and category
- [ ] Product creation with verification ID generation
- [ ] Product editing
- [ ] RFQ creation with all fields
- [ ] RFQ opportunities display
- [ ] Quote submission with attachments
- [ ] Duplicate quote prevention
- [ ] Viewing RFQ responses
- [ ] Viewing submitted quotes
- [ ] Suppliers directory
- [ ] Search and filtering
- [ ] Image compression
- [ ] Currency formatting
- [ ] Responsive design (mobile, tablet, desktop)

## Technical Notes

### File Structure

```
pages/
  api/
    mutations/
      create-business-account.ts
      create-business-store.ts
      create-business-product.ts
      update-business-product.ts
      create-business-rfq.ts
      submit-rfq-quote.ts
    queries/
      business-stores.ts
      business-store.ts
      business-products.ts
      generate-product-query-id.ts
      business-rfqs.ts
      rfq-opportunities.ts
      rfq-details-and-responses.ts
      business-submitted-quotes.ts
      user-rfq-quote.ts
      all-businesses.ts
      system-configuration.ts
  plasBusiness/
    index.tsx
    store/
      [storeId].tsx

src/
  components/
    business/
      BusinessOverview.tsx
      CreateProductForm.tsx
      CreateRFQForm.tsx
      MyRFQsSection.tsx
      RFQOpportunitiesSection.tsx
      RFQResponsesView.tsx
      QuoteSubmissionForm.tsx
      QuotesSection.tsx
      SubmittedQuoteDetails.tsx
      SuppliersSection.tsx
  utils/
    formatCurrency.ts
```

### Dependencies

- Next.js API routes for backend
- GraphQL (Hasura) for database queries
- React hooks for state management
- Tailwind CSS for styling
- react-hot-toast for notifications
- lucide-react for icons

This comprehensive system enables businesses to efficiently manage their operations, connect with suppliers, and streamline the RFQ and quotation process.

---

# Combined Order System

## Overview

The Combined Order System allows users to place multiple orders from different stores simultaneously in a single checkout process. This feature enhances user convenience by enabling them to shop from multiple stores and pay for all orders at once, reducing the friction of multiple separate checkout processes. All orders placed together are linked by a shared Combined Order ID and use a single PIN for delivery verification.

## Key Concepts

### Combined Order ID

A unique identifier (UUID) that groups multiple orders placed together in a single checkout session. All orders within a combined order share this ID, making it easy to track and manage them as a unified transaction.

### Shared PIN

When multiple orders are created as part of a combined order, they all share a single two-digit PIN (00-99) for delivery verification. This simplifies the delivery process by requiring customers to remember only one PIN for all their orders, rather than separate PINs for each store.

### Store Cart

Each store the user shops from maintains its own cart with items, subtotal, service fees, and delivery fees. Users can select which store carts to include in the combined checkout.

## System Architecture

The Combined Order System consists of three main components:

1. **Frontend Combined Checkout Page** - User interface for selecting stores and completing checkout
2. **Combined Order Creation API** - Backend logic for processing multiple orders atomically
3. **Combined Order Query API** - Retrieves all orders associated with a Combined Order ID

## User Flow

### Step 1: Shopping from Multiple Stores

Users browse and add items to their carts from different stores. Each store maintains a separate cart with its own items and pricing.

### Step 2: Combined Checkout Page

When users navigate to the combined checkout page, the system:

- Loads all active carts from different stores
- Calculates individual cart subtotals, service fees, and delivery fees
- Displays all carts with checkboxes for selection
- Shows the grand total for selected carts

### Step 3: Store Selection

Users can select which stores to include in the combined order by checking or unchecking cart checkboxes. Only selected carts will be processed during checkout.

### Step 4: Delivery Information

Users must provide:

- Delivery address (can be selected from saved addresses or use current location)
- Delivery notes (optional comments that apply to all orders)
- Payment method (wallet, card, or mobile money)

### Step 5: Place Combined Order

When the user clicks the checkout button, the system:

- Validates that at least one cart is selected
- Ensures delivery address and payment method are set
- Generates a unique Combined Order ID
- Generates a single shared PIN for all orders
- Creates individual orders for each selected store
- Links all orders with the Combined Order ID and shared PIN
- Removes cart items and deletes processed carts
- Redirects user to the orders page with the Combined Order ID

## Fee Calculations

### Service Fee

Each store's cart incurs a service fee calculated as 5% of the cart subtotal. This fee is rounded up to the nearest whole number.

Formula: `Service Fee = Math.ceil(Subtotal × 0.05)`

### Transportation Fee (Delivery Fee)

Each store has its own delivery fee based on the distance between the store location and the delivery address. Currently set to a default of 1000, but can be calculated dynamically based on geographical distance.

### Cart Total

For each store cart: `Cart Total = Subtotal + Service Fee + Transportation Fee`

### Grand Total

The grand total is the sum of all selected cart totals: `Grand Total = Sum of all selected Cart Totals`

## Backend Processing

### Order Creation Process

When the combined order API receives a request, it processes each store in sequence:

#### 1. Fetch Cart and Items

For each store, the system retrieves the user's active cart and all items in that cart, including:

- Product IDs and quantities
- Current prices (base price and final price)
- Store information (name, location)

#### 2. Validate Stock Availability

Before creating orders, the system checks product stock levels to ensure all requested quantities are available. If any product has insufficient stock, the entire transaction is aborted with an error message.

#### 3. Calculate Order Total

The actual order total is calculated using the base product prices (what the customer pays to the shop) multiplied by quantities, ensuring accuracy regardless of any cart price discrepancies.

#### 4. Create Order Record

For each store, an order record is created with:

- User ID and Shop ID
- Delivery address ID
- Order total (calculated from product prices)
- Service fee and delivery fee from request
- Order status set to "PENDING"
- Combined Order ID (shared across all orders)
- Shared PIN (same for all orders in this combined order)
- Delivery time (estimated delivery timestamp)
- Delivery notes (optional)
- Discount and voucher code (if applicable)

#### 5. Create Order Items

Individual order items are created for each product in the cart, storing:

- Order ID (links to the created order)
- Product ID
- Quantity ordered
- Price at the time of order (base price)

#### 6. Clear Cart

After successful order creation:

- All cart items for that store are deleted
- The cart itself is deleted

#### 7. Track Created Orders

The system maintains a list of all successfully created orders with their IDs, PINs, shop IDs, and totals.

### Transaction Safety

The order creation process operates sequentially for each store. If an error occurs at any store (e.g., insufficient stock, database failure), the process stops and returns an error. Orders created before the failure remain in the database, while subsequent stores are not processed.

**Note**: The current implementation does not use database transactions, meaning partial order creation is possible if an error occurs mid-process.

## API Endpoints

### Create Combined Orders

**Endpoint**: `POST /api/mutations/create-combined-orders`

**Purpose**: Creates multiple orders from different stores in a single transaction with a shared Combined Order ID and PIN.

**Request Body**:

```
{
  stores: [
    {
      store_id: "uuid",
      delivery_fee: "1000",
      service_fee: "50",
      discount: "0" (optional),
      voucher_code: "SAVE10" (optional)
    },
    ...
  ],
  delivery_address_id: "uuid",
  delivery_time: "ISO timestamp",
  delivery_notes: "string" (optional),
  payment_method: "mobile_money" | "card" | "wallet",
  payment_method_id: "uuid" (optional)
}
```

**Response**:

```
{
  success: true,
  combined_order_id: "uuid",
  orders: [
    {
      id: "uuid",
      pin: "42",
      shop_id: "uuid",
      total: 15500
    },
    ...
  ],
  grand_total: 30000,
  message: "Successfully created 2 orders with combined_order_id"
}
```

**Validation Rules**:

- At least one store must be provided
- Delivery address ID and delivery time are required
- Each store must have valid store_id, delivery_fee, and service_fee
- User must have an active cart for each store
- All products must have sufficient stock

### Query Combined Orders

**Endpoint**: `GET /api/queries/combined-orders?combined_order_id={uuid}`

**Purpose**: Retrieves all orders associated with a specific Combined Order ID.

**Query Parameters**:

- `combined_order_id` (required): The UUID of the combined order

**Response**:

```
{
  orders: [
    {
      id: "uuid",
      OrderID: "AUTO123",
      placedAt: "timestamp",
      estimatedDelivery: "timestamp",
      deliveryNotes: "string",
      total: "15500",
      serviceFee: "50",
      deliveryFee: "1000",
      status: "PENDING",
      pin: "42",
      combinedOrderId: "uuid",
      shop: {
        id: "uuid",
        name: "Store Name",
        address: "Store Address",
        image: "url",
        phone: "phone number",
        latitude: "lat",
        longitude: "lng"
      },
      Order_Items: [
        {
          id: "uuid",
          product_id: "uuid",
          quantity: 2,
          price: "5000",
          product: {
            id: "uuid",
            price: "5000",
            final_price: "4500",
            image: "url",
            ProductName: {
              name: "Product Name",
              description: "Description"
            }
          }
        },
        ...
      ],
      address: {
        street: "123 Main St",
        city: "City",
        postal_code: "12345",
        latitude: "lat",
        longitude: "lng"
      }
    },
    ...
  ]
}
```

**Error Responses**:

- 400: Missing combined_order_id parameter
- 404: No orders found for the provided combined_order_id
- 500: Server error during query execution

## Frontend Components

### Combined Checkout Page

**File**: `pages/combined-checkout.tsx`

**Key Features**:

- Displays all user carts from different stores
- Shows itemized products, quantities, and prices for each cart
- Allows selection/deselection of store carts
- Displays fee breakdown (subtotal, service fee, transportation fee)
- Shows grand total for selected carts
- Address selection with modal for saved addresses
- Payment method selector
- Optional delivery notes input
- Processes combined order on checkout

**State Management**:

- `storeCarts`: Array of all user's carts with items and fees
- `userAddress`: Selected delivery address
- `selectedPaymentMethod`: Chosen payment method
- `comment`: Delivery notes
- `isProcessing`: Loading state during checkout

**User Interactions**:

- Toggle cart selection with checkboxes
- View/hide cart items by selecting carts
- Change delivery address via modal
- Select payment method
- Enter delivery notes
- Place combined order

### Payment Method Selector

**Component**: `PaymentMethodSelector`

**Purpose**: Allows users to select their preferred payment method for the combined order.

**Payment Options**:

- Wallet (using platform balance)
- Card (saved credit/debit cards)
- Mobile Money (MTN MoMo, etc.)

### Cart Items Display

Each store cart displays:

- Store name and logo
- Number of items in cart
- Individual product cards with image, name, quantity, and price
- Subtotal, service fee, and transportation fee
- Cart total

## Order Tracking

### Viewing Combined Orders

Users can view all orders from a combined order by navigating to the orders page with the Combined Order ID as a query parameter:

`/user-orders?combined_order_id={uuid}`

This displays all orders grouped together, showing:

- Individual order details for each store
- Shared Combined Order ID
- Same PIN for all orders
- Separate order status for each store (since they may be fulfilled independently)
- Individual tracking for each order

### Order Status Management

Even though orders are created together, each order maintains its own independent status:

- PENDING: Order placed, awaiting shopper assignment
- ACCEPTED: Shopper assigned and confirmed
- SHOPPING: Shopper is collecting items
- DELIVERED: Order delivered to customer
- CANCELLED: Order cancelled

This independence allows stores to fulfill orders at different times while maintaining the logical grouping of the combined order.

## Delivery Verification

### Single PIN System

All orders in a combined order share a single PIN. When shoppers deliver orders:

- They request the same PIN from the customer for each order
- Customer provides the single PIN (e.g., "42") for verification
- Each order is marked as delivered independently using the shared PIN

This simplifies the delivery process significantly, especially when multiple shoppers are delivering orders from the same combined order.

## Benefits

### For Customers

1. **Single Checkout Process**: Shop from multiple stores and pay once
2. **Unified Payment**: One payment transaction for all orders
3. **Simplified Delivery**: Remember one PIN for all orders
4. **Better Organization**: All orders grouped and tracked together
5. **Time Savings**: Avoid multiple checkout processes
6. **Convenient Address Selection**: Set one delivery address for all orders

### For the Platform

1. **Increased Order Volume**: Encourages shopping from multiple stores
2. **Higher Transaction Values**: Combined orders typically have larger totals
3. **Better User Experience**: Reduces checkout friction
4. **Operational Efficiency**: Grouped order management
5. **Revenue Optimization**: Multiple service fees in one transaction

### For Shoppers

1. **Clear Grouping**: Easily identify orders that belong together
2. **Simplified Verification**: One PIN for multiple orders from the same customer
3. **Better Context**: Understanding that multiple orders go to the same address

## Database Schema

### Orders Table

Key fields relevant to combined orders:

- `id`: Unique order identifier (UUID)
- `OrderID`: Human-readable order number (AUTO-generated)
- `user_id`: Customer who placed the order
- `shop_id`: Store fulfilling the order
- `combined_order_id`: Shared identifier for grouped orders (UUID, nullable)
- `pin`: Two-digit verification code (string)
- `total`: Order total amount
- `service_fee`: Platform service fee
- `delivery_fee`: Transportation fee
- `discount`: Discount amount (nullable)
- `voucher_code`: Applied voucher code (nullable)
- `delivery_address_id`: Delivery location
- `delivery_time`: Estimated delivery timestamp
- `delivery_notes`: Customer instructions
- `status`: Order status
- `shopper_id`: Assigned shopper (nullable)
- `created_at`: Order placement timestamp

### Carts Table

Stores user shopping carts:

- `id`: Cart identifier (UUID)
- `user_id`: Cart owner
- `shop_id`: Associated store
- `is_active`: Whether cart is active (boolean)

### Cart_Items Table

Stores items within carts:

- `id`: Item identifier (UUID)
- `cart_id`: Parent cart
- `product_id`: Product reference
- `quantity`: Item quantity
- `price`: Price at time of adding to cart

## Error Handling

### Validation Errors

- **Empty Store List**: Must provide at least one store
- **Missing Required Fields**: Delivery address and time must be provided
- **Invalid Store Data**: Each store must have valid store_id, delivery_fee, and service_fee

### Cart Errors

- **No Active Cart**: User must have an active cart for each store
- **Empty Cart**: Cart must contain at least one item

### Stock Errors

- **Insufficient Stock**: If any product has insufficient stock, the entire operation fails with details about which product and store caused the issue

### Database Errors

All database errors are caught and returned with a 500 status code and descriptive error message.

## Future Enhancements

### Potential Improvements

1. **Transaction Support**: Implement database transactions to ensure all-or-nothing order creation
2. **Partial Order Handling**: Allow orders to proceed even if one store fails
3. **Dynamic Delivery Fees**: Calculate transportation fees based on actual distance
4. **Delivery Time Optimization**: Coordinate delivery times across multiple stores
5. **Bulk Shopper Assignment**: Assign multiple orders to a single shopper when possible
6. **Combined Order Discounts**: Special discounts for placing combined orders
7. **Order Bundling**: Smart bundling of nearby stores for efficient delivery
8. **Split Payment**: Allow different payment methods for different stores
9. **Order Priority**: Priority handling for combined orders
10. **Enhanced Tracking**: Real-time tracking of all orders in a combined order

### Performance Optimizations

1. **Parallel Processing**: Process multiple stores concurrently instead of sequentially
2. **Cart Caching**: Cache cart data to reduce database queries
3. **Batch Operations**: Use batch database operations for order items
4. **Query Optimization**: Optimize GraphQL queries for better performance

## Testing Considerations

### Test Scenarios

1. **Happy Path**: Successfully create combined orders from multiple stores
2. **Single Store**: Create combined order with only one store
3. **Stock Validation**: Test insufficient stock error handling
4. **Empty Cart**: Test error when cart has no items
5. **Missing Address**: Test validation of required delivery address
6. **Invalid Store**: Test error when store doesn't exist
7. **Payment Method**: Test different payment method selections
8. **Cart Deletion**: Verify carts are properly cleared after order creation
9. **Combined Order Query**: Test retrieving orders by combined_order_id
10. **PIN Generation**: Verify all orders share the same PIN

### Edge Cases

1. **Concurrent Checkout**: Multiple users checking out simultaneously
2. **Stock Changes**: Stock levels changing during checkout process
3. **Network Failures**: Handling partial order creation due to network issues
4. **Large Orders**: Testing with many items and stores
5. **Address Without ID**: Creating new delivery address during checkout

## Security Considerations

1. **Authentication**: All endpoints require valid user session
2. **Authorization**: Users can only create orders for their own carts
3. **Input Validation**: All request parameters are validated
4. **SQL Injection**: GraphQL parameterized queries prevent injection
5. **Price Integrity**: Order totals calculated server-side using current product prices
6. **Cart Ownership**: Verify user owns the carts being processed

## Monitoring and Analytics

### Key Metrics to Track

1. **Combined Order Rate**: Percentage of orders that are part of combined orders
2. **Average Stores per Combined Order**: Number of stores typically included
3. **Combined Order Value**: Average transaction size for combined orders
4. **Completion Rate**: Percentage of successful combined order creations
5. **Error Rate**: Frequency and types of errors during combined checkout
6. **Time to Checkout**: How long users spend in combined checkout process

### Business Insights

1. **Store Affinity**: Which stores are commonly shopped together
2. **User Behavior**: How often users shop from multiple stores
3. **Revenue Impact**: Additional revenue generated through combined orders
4. **Cart Abandonment**: Rate of abandoned combined checkouts

## Technical Implementation Notes

### Key Technologies

- **Next.js API Routes**: Backend endpoints for order processing
- **GraphQL (Hasura)**: Database queries and mutations
- **UUID v4**: Unique identifier generation for combined order ID
- **React Hooks**: Frontend state management
- **Cookies**: Session storage for delivery address
- **Next-Auth**: User authentication and session management

### Code Organization

```
pages/
  api/
    mutations/
      create-combined-orders.ts    # Combined order creation
    queries/
      combined-orders.ts            # Combined order retrieval
  combined-checkout.tsx             # Checkout page

src/
  components/
    UserCarts/
      checkout/
        PaymentMethodSelector.tsx   # Payment selection
        checkoutCard.tsx           # Cart display component
```

### Dependencies

- `graphql-request`: GraphQL client for Hasura
- `uuid`: UUID generation
- `next-auth`: Authentication
- `js-cookie`: Cookie management
- `react-hot-toast`: User notifications
- `lucide-react`: UI icons

## Conclusion

The Combined Order System provides a seamless multi-store shopping experience that benefits customers, the platform, and shoppers. By grouping orders with a shared Combined Order ID and PIN, the system maintains simplicity while enabling powerful cross-store functionality. The architecture is designed for scalability and can be enhanced with additional features like transaction safety, parallel processing, and intelligent order optimization.
