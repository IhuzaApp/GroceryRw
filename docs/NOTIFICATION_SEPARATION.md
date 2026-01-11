# Notification System Separation

## Overview
The notification system has been updated to ensure batch notifications and regular app notifications use completely separate toast containers. This allows batch notifications to be positioned and aligned independently according to their own terms.

## Changes Made

### 1. Separate Toast Instances
- **Created** a dedicated `batchToast` instance in `NotificationSystem.tsx` for batch notifications
- **Regular `toast`** is still used for success/error/info feedback messages throughout the app

### 2. Dual Toaster System
Two separate `<Toaster>` components now exist:

#### Main Toaster (in `_app.tsx`)
- **Configuration**: `<Toaster />` (no props - all styling done via CSS)
- **Position**: `top-center` on mobile, `bottom-center` on desktop (CSS-controlled)
- **Purpose**: Handles all regular app notifications (success, error, info, loading)
- **Examples**: "Order accepted successfully!", "Failed to load data", etc.

#### Batch Toaster (in `NotificationSystem.tsx`)
- **Position**: `top-right` (customized via CSS per device)
- **Container Class**: `batch-notification-container`
- **Purpose**: Handles ONLY batch order notifications
- **Types**: 
  - `batch-notification-toast` - New order cards
  - `batch-warning-toast` - Expiring order warnings

### 3. CSS-Based Configuration (in `globals.css`)

All toast positioning and styling is now handled purely through CSS, keeping the component files clean:

**Main Toast Positioning:**
```css
/* Targets the default react-hot-toast container */
[data-react-hot-toast] > div:not(.batch-notification-container) {
  /* Mobile: top-center */
  top: 1rem !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
}

/* Desktop: bottom-center */
@media (min-width: 768px) {
  [data-react-hot-toast] > div:not(.batch-notification-container) {
    top: auto !important;
    bottom: 2rem !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
  }
}
```

**Separation Rules:**
```css
/* Hide batch notifications from main container */
[data-react-hot-toast] > div:not(.batch-notification-container) .batch-notification-toast,
[data-react-hot-toast] > div:not(.batch-notification-container) .batch-warning-toast {
  display: none !important;
}

/* Hide regular notifications from batch container */
.batch-notification-container > div:not([class*="batch-notification-toast"]) {
  display: none !important;
}
```

### 4. Device-Specific Positioning

#### Mobile (< 768px)
- **Main toasts**: Top-center (nav feedback)
- **Batch notifications**: Bottom of screen, full width, covering nav bar
  - Uses `position: fixed`, `bottom: 0`, full width
  - Includes safe area insets for notched devices

#### Desktop (≥ 768px)
- **Main toasts**: Bottom-center
- **Batch notifications**: Top-right corner
  - Fixed position at `top: 1rem`, `right: 1rem`

## Benefits

1. **Independent Positioning**: Batch notifications can be positioned at the bottom on mobile without affecting regular toasts
2. **No Conflicts**: Regular app toasts won't interfere with batch notification cards
3. **Better UX**: Order notifications are prominent and immersive on mobile (full-width at bottom)
4. **Customizable**: Each toast system can be styled and positioned independently

## File Changes

- **Modified**: `pages/_app.tsx`
  - Simplified main `<Toaster />` component (removed all props)
  - All configuration now handled via CSS

- **Modified**: `src/components/shopper/NotificationSystem.tsx`
  - Imported `Toaster` component
  - Created `batchToast` reference
  - Replaced all batch notification `toast` calls with `batchToast`
  - Added separate `<Toaster>` component for batch notifications

- **Modified**: `styles/globals.css`
  - Added CSS-based positioning for main toast container using `[data-react-hot-toast]` selector
  - Added separation rules to prevent toast mixing between containers
  - Configured responsive positioning (mobile: top-center, desktop: bottom-center for regular toasts)
  - Ensured proper z-index and positioning for batch container

## Testing Checklist

- [ ] Regular success/error toasts appear in main container (top-center mobile, bottom-center desktop)
- [ ] Batch order notifications appear ONLY in batch container (bottom mobile, top-right desktop)
- [ ] No duplicate notifications appear in both containers
- [ ] Mobile: Batch notifications cover nav bar at bottom
- [ ] Desktop: Batch notifications appear at top-right without overlapping main toasts
- [ ] Warning notifications for expiring orders work correctly
- [ ] Accept/Skip actions properly dismiss batch notifications

## Future Enhancements

- Consider adding animation differences between the two toast systems
- Add separate sound notifications for batch vs regular toasts
- Implement batch notification grouping if multiple orders arrive simultaneously
