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
