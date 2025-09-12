# Route Protection System Guide

## Overview

This document explains the comprehensive route protection system implemented for the grocery app. The system provides fine-grained control over which users can access which pages and perform which actions.

## Architecture

### 1. RouteProtectionContext (`src/context/RouteProtectionContext.tsx`)

The main context that manages route access rules and provides protection utilities.

**Key Features:**

- Centralized route protection rules
- Support for different access levels: `public`, `protected`, `shopper-only`, `conditional`
- Automatic redirects for unauthorized access
- Higher-order component for page protection

**Access Levels:**

- `public`: No authentication required (home, reels, shops)
- `protected`: Authentication required (profile, messages, orders)
- `shopper-only`: Shopper role required (Plasa pages)
- `conditional`: Can view but actions require auth (cart)

### 2. Middleware (`middleware.ts`)

Updated middleware that works with the protection context to handle route-level protection.

**Key Features:**

- Public path bypassing
- Conditional path handling
- Shopper-only path protection
- Role-based redirects

### 3. Protection Components

#### ProtectedCart (`src/components/auth/ProtectedCart.tsx`)

Protects cart-related actions like adding items or checkout.

#### ProtectedShopAction (`src/components/auth/ProtectedShopAction.tsx`)

Protects shop-related actions like adding items to cart.

## Route Configuration

### Public Routes (No Authentication Required)

- `/` - Home page
- `/Reels` - Reels page
- `/shops` - Shops listing
- `/shops/[id]` - Individual shop pages
- `/Auth/Login` - Login page
- `/Auth/Register` - Registration page

### Conditional Routes (Guest View Allowed, Auth Required for Actions)

- `/Cart` - Can view cart but need auth to add items or checkout

### Protected Routes (Authentication Required)

- `/Myprofile` - User profile
- `/Messages` - Messages
- `/CurrentPendingOrders` - Current orders
- `/Recipes` - Recipes
- `/restaurant` - Restaurant pages

### Shopper-Only Routes (Shopper Role Required)

- `/Plasa/*` - All Plasa pages (shopper dashboard)

## Implementation Examples

### 1. Protecting a Page with HOC

```tsx
import { withRouteProtection } from "../../../src/context/RouteProtectionContext";

function MyProtectedPage() {
  return <div>Protected content</div>;
}

export default withRouteProtection(MyProtectedPage, {
  requireAuth: true,
  requireRole: "shopper", // optional
});
```

### 2. Protecting Cart Actions

```tsx
import { ProtectedCart } from "../../src/components/auth/ProtectedCart";

function CartPage() {
  return (
    <div>
      <h1>Your Cart</h1>
      <ProtectedCart action="checkout">
        <CheckoutButton />
      </ProtectedCart>
    </div>
  );
}
```

### 3. Protecting Shop Actions

```tsx
import { ProtectedShopAction } from "../../src/components/auth/ProtectedShopAction";

function ShopPage() {
  return (
    <div>
      <h1>Shop Products</h1>
      <ProtectedShopAction action="addToCart" shopId="123">
        <AddToCartButton />
      </ProtectedShopAction>
    </div>
  );
}
```

### 4. Using Protection Hooks

```tsx
import { useCartProtection } from "../../src/components/auth/ProtectedCart";

function CartComponent() {
  const { canPerform, requiresAuth, handleProtectedAction } =
    useCartProtection("addToCart");

  const handleAddToCart = () => {
    handleProtectedAction(() => {
      // Add to cart logic
      console.log("Adding to cart...");
    });
  };

  return (
    <button onClick={handleAddToCart} disabled={!canPerform}>
      Add to Cart
    </button>
  );
}
```

## User Experience Flow

### Guest User (Not Signed In)

1. **Can Access:**

   - Home page (`/`)
   - Reels page (`/Reels`)
   - Shops listing (`/shops`)
   - Individual shop pages (`/shops/[id]`)
   - Cart page (`/Cart`) - view only

2. **Cannot Access:**

   - Profile pages (`/Myprofile`)
   - Messages (`/Messages`)
   - Orders (`/CurrentPendingOrders`)
   - Plasa pages (`/Plasa/*`)
   - Other protected pages

3. **Actions Requiring Sign-in:**
   - Adding items to cart
   - Checkout process
   - Any cart modifications

### Signed-in User (Customer Role)

1. **Can Access:**

   - All guest-accessible pages
   - Profile pages (`/Myprofile`)
   - Messages (`/Messages`)
   - Orders (`/CurrentPendingOrders`)
   - Recipes (`/Recipes`)
   - Restaurant pages (`/restaurant`)

2. **Cannot Access:**

   - Plasa pages (`/Plasa/*`) - redirected to home

3. **Can Perform:**
   - All cart actions
   - Checkout process
   - Order management

### Signed-in Shopper

1. **Can Access:**

   - All customer-accessible pages
   - All Plasa pages (`/Plasa/*`)

2. **Cannot Access:**
   - Some user-specific pages (handled by role-based redirects)

## Middleware Behavior

The middleware handles route protection at the server level:

1. **Public Paths**: Bypassed entirely
2. **Conditional Paths**: Allowed through, protection handled in components
3. **Protected Paths**: Authentication checked
4. **Shopper-Only Paths**: Role verification

## Error Handling

- **Unauthorized Access**: Redirects to login with callback URL
- **Role Mismatch**: Redirects to appropriate page (usually home)
- **Authentication Errors**: Redirects to login

## Testing the System

To test the route protection system:

1. **Test as Guest:**

   - Visit public pages (should work)
   - Try to access protected pages (should redirect to login)
   - Try to add items to cart (should show auth prompt)

2. **Test as Customer:**

   - Access customer pages (should work)
   - Try to access Plasa pages (should redirect to home)
   - Perform cart actions (should work)

3. **Test as Shopper:**
   - Access all pages including Plasa (should work)
   - Switch between roles (should work with proper redirects)

## Configuration

To modify route protection rules, update the `ROUTE_PROTECTION_RULES` array in `RouteProtectionContext.tsx`:

```tsx
const ROUTE_PROTECTION_RULES: RouteProtectionRule[] = [
  { path: "/new-route", accessLevel: "protected", requiresAuth: true },
  // ... other rules
];
```

## Best Practices

1. **Use HOCs for Page Protection**: Wrap page components with `withRouteProtection`
2. **Use Components for Action Protection**: Wrap action buttons/components with protection components
3. **Use Hooks for Conditional Logic**: Use protection hooks for complex conditional logic
4. **Test All User States**: Always test with different authentication states
5. **Provide Clear Feedback**: Show appropriate messages when actions require authentication

## Troubleshooting

### Common Issues

1. **Infinite Redirects**: Check middleware configuration and route rules
2. **Protection Not Working**: Ensure RouteProtectionProvider is wrapped around the app
3. **Role Switching Issues**: Check role change handling in middleware
4. **Cart Actions Not Protected**: Ensure ProtectedCart components are properly implemented

### Debug Mode

Enable debug logging by uncommenting the log statements in:

- `middleware.ts`
- `RouteProtectionContext.tsx`
- `AuthContext.tsx`

This will provide detailed information about authentication and route protection decisions.
