# FCM Setup Guide

This guide explains the consolidated Firebase Cloud Messaging (FCM) setup for desktop notifications.

## Overview

We now have a single consolidated service worker that handles all types of notifications:

1. **`firebase-messaging-sw.js`** - Handles all notifications including chat/messaging and batch/order notifications

## Files Modified

### Modified Files
- `public/firebase-messaging-sw.js` - Consolidated service worker handling all notifications
- `src/services/fcmClient.ts` - Updated to register single service worker
- `src/components/shopper/ShopperLayout.tsx` - Updated FCM setup for shoppers
- `pages/api/test-batch-fcm.ts` - Test endpoint for batch notifications

## How It Works

### 1. Service Worker Registration
The single service worker is automatically registered when FCM is initialized:
- Main messaging service worker: `/firebase-messaging-sw.js`

### 2. Notification Handling
The consolidated service worker handles different notification types:
- Batch notifications: `payload.data.type === "batch_notification"`
- Chat notifications: `payload.data.type === "chat_message"`
- Other notifications: Default handling

### 3. Desktop Notifications
Batch notifications will show desktop notifications with:
- Title: "🚀 New Batch Available!"
- Body: Contains distance, units, and earnings info
- Actions: Accept Batch, View Details, Dismiss
- Icon: Uses the app's logo

### 4. Click Handling
When users click on batch notifications:
- **Accept Batch**: Navigates to `/Plasa/active-batches/batch/{orderId}`
- **View Details**: Same as Accept Batch
- **Dismiss**: Just closes the notification

## Integration Points

### ShopperLayout Component
The `ShopperLayout` component automatically initializes batch FCM when a shopper is authenticated. It:
- Registers both service workers
- Sets up batch notification listeners
- Handles batch notification events
- Triggers UI updates when batch notifications are received

### FCM Client Service
New functions added to `fcmClient.ts`:
- `initializeBatchFCM()` - Initialize FCM specifically for batch notifications
- Both service workers are registered during token generation

## Testing

### Manual Testing
1. Ensure you're logged in as a shopper
2. Navigate to any Plasa page (e.g., `/Plasa/active-batches`)
3. Send a batch notification via the API endpoint `/api/fcm/send-batch-notification`
4. Check browser console for service worker logs
5. Verify desktop notification appears

### Browser Console Logs
Look for these log messages:
- `[Batch SW] Received background message:` - Service worker received notification
- `[Batch SW] Opening URL:` - User clicked notification
- `Batch FCM initialized successfully` - FCM setup completed

## Troubleshooting

### Notifications Not Appearing
1. Check browser notification permissions
2. Verify service worker registration in DevTools > Application > Service Workers
3. Check console for FCM initialization errors
4. Ensure you're on a secure context (HTTPS or localhost)

### Service Worker Issues
1. Clear browser cache and reload
2. Check DevTools > Application > Service Workers for errors
3. Verify both service workers are registered and active

### FCM Token Issues
1. Check browser console for FCM errors
2. Verify Firebase configuration
3. Check network requests to `/api/fcm/save-token`

## API Integration

The batch notification API (`/api/fcm/send-batch-notification`) sends notifications with this structure:

```json
{
  "notification": {
    "title": "🚀 New Batch Available!",
    "body": "5.4km • 2 units • 4500 RWF"
  },
  "data": {
    "type": "batch_notification",
    "orderId": "65224d76-76a9-45ba-9f02-477ec545d9c6",
    "distance": "5.4",
    "units": "2",
    "earnings": "4500",
    "click_action": "view_batch",
    "action_url": "/shopper/batch/65224d76-76a9-45ba-9f02-477ec545d9c6/details",
    "notification_id": "batch_65224d76-76a9-45ba-9f02-477ec545d9c6_1698123456789"
  }
}
```

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support  
- **Safari**: Limited support (iOS Safari has restrictions)
- **Edge**: Full support

## Security Notes

- Service workers run in a secure context
- FCM tokens are validated server-side
- Notification permissions are required
- HTTPS is required for production use
