# Notification System Architecture

This document clarifies the responsibilities of each notification-related file to avoid duplication and confusion.

## File Responsibilities

### 1. `send-batch-notification.ts`
**Purpose**: Send FCM to a SINGLE specific shopper
- **Use cases**: 
  - Manual notifications to specific users
  - Individual batch assignments
  - Custom notifications
- **Payload**: Individual shopper with click actions
- **Trigger**: Manual API calls or specific user targeting
- **Notification type**: `batch_notification` with actions

### 2. `send-batch-to-nearby-shoppers.ts`
**Purpose**: Send FCM to ALL nearby available shoppers (mass notifications)
- **Use cases**:
  - Automatic batch distribution when new batches are available
  - Mass notifications to nearby shoppers
- **Payload**: Background notifications without click actions
- **Trigger**: Called automatically from NotificationSystem
- **Notification type**: `batch_notification` with `background_notification: "true"`

### 3. `send-warning-notification.ts`
**Purpose**: Send FCM warnings to specific shoppers
- **Use cases**:
  - Batch expiration warnings
  - Time-sensitive notifications
- **Payload**: Warning notifications with urgency
- **Trigger**: Called from NotificationSystem for warnings
- **Notification type**: `batch_notification` with warning data

### 4. `NotificationSystem.tsx`
**Purpose**: In-app notification coordinator
- **Use cases**:
  - Poll for new batches every 60 seconds
  - Show in-app toast notifications
  - Trigger mass FCM distribution
  - Handle warning notifications
- **Responsibilities**:
  - ✅ Show in-app toasts to current user
  - ✅ Trigger mass FCM via `send-batch-to-nearby-shoppers.ts`
  - ✅ Handle warning notifications via `send-warning-notification.ts`
  - ❌ Does NOT send individual FCM notifications

### 5. `notify-nearby-dashers.ts`
**Purpose**: Database notifications (legacy system)
- **Use cases**:
  - Create database notification records
  - Legacy notification system
- **Payload**: Database records only
- **Trigger**: Manual/cron job
- **Note**: Does NOT send FCM notifications

## Notification Flow

### Normal Batch Flow:
1. **NotificationSystem** polls for new batches every 60 seconds
2. **NotificationSystem** shows in-app toast to current user
3. **NotificationSystem** calls `send-batch-to-nearby-shoppers.ts`
4. **send-batch-to-nearby-shoppers.ts** finds nearby shoppers
5. **send-batch-to-nearby-shoppers.ts** sends FCM to all nearby shoppers
6. **Service Worker** shows background notifications without actions

### Warning Flow:
1. **NotificationSystem** detects batch expiration (40 seconds)
2. **NotificationSystem** shows warning toast
3. **NotificationSystem** calls `send-warning-notification.ts`
4. **send-warning-notification.ts** sends urgent FCM to specific shopper
5. **Service Worker** shows warning notification with actions

### Manual Flow:
1. External system calls `send-batch-notification.ts`
2. **send-batch-notification.ts** sends FCM to specific shopper
3. **Service Worker** shows notification with actions

## Key Differences

| File | Target | Actions | Trigger | Use Case |
|------|--------|---------|---------|----------|
| `send-batch-notification.ts` | Single shopper | ✅ Yes | Manual | Individual notifications |
| `send-batch-to-nearby-shoppers.ts` | Multiple shoppers | ❌ No | Automatic | Mass distribution |
| `send-warning-notification.ts` | Single shopper | ✅ Yes | Automatic | Warnings |
| `NotificationSystem.tsx` | Current user | ✅ In-app | Automatic | Coordination |
| `notify-nearby-dashers.ts` | Database | ❌ N/A | Manual | Legacy system |

## Service Worker Behavior

The service worker (`firebase-messaging-sw.js`) handles notifications based on payload:

- **Background notifications** (`background_notification: "true"`):
  - No click actions
  - Don't require user interaction
  - Auto-dismiss after time

- **Foreground notifications** (no background flag):
  - Show click actions (Accept, View, Dismiss)
  - Require user interaction
  - Navigate on click

## Testing

### Test Individual Notifications:
```bash
curl -X POST /api/fcm/send-batch-notification \
  -H "Content-Type: application/json" \
  -d '{"shopperId": "user-id", "orderId": "order-id", ...}'
```

### Test Mass Notifications:
```bash
curl -X POST /api/fcm/send-batch-to-nearby-shoppers \
  -H "Content-Type: application/json" \
  -d '{"orderId": "order-id", "shopName": "Shop", ...}'
```

### Test Background Notifications:
```bash
curl -X POST /api/test-background-fcm \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-id"}'
```

## No Duplication

Each file has a distinct purpose:
- ❌ **No overlap** between individual and mass notifications
- ❌ **No duplicate** FCM sending in NotificationSystem
- ❌ **No confusion** between database and FCM notifications
- ✅ **Clear separation** of responsibilities
- ✅ **Coordinated workflow** between all components
