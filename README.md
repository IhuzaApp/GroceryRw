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
}
```

2. **Checkout Process** (`pages/api/checkout.ts`):

```typescript
// Calculate revenue
const revenueData = RevenueCalculator.calculateRevenue(items);

// Create order
const orderRes = await hasuraClient.request(CREATE_ORDER, {
  total: revenueData.actualTotal, // Store what we pay to shop
  // ... other order details
});

// Create revenue record
await hasuraClient.request(CREATE_REVENUE, {
  order_id: orderId,
  amount: revenueData.revenue, // Our profit
  type: "commission",
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

# Grocery Delivery Notification System

## Overview

The notification system manages real-time order notifications for shoppers in the grocery delivery application. It implements a sophisticated batch distribution system with multiple checks to ensure appropriate and timely notifications.

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

## Technical Implementation

### API Endpoints Required

1. `/api/shopper/schedule`

   - Returns shopper's availability schedule
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
