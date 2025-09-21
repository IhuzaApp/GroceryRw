# Firebase Cloud Messaging (FCM) Setup Guide

## Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to Project Settings > Cloud Messaging
4. Generate a new Web Push certificate (VAPID key)
5. Copy the VAPID key for later use

## Step 2: Environment Variables

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

## Step 3: Firebase Admin SDK Setup

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values and add them to your environment variables

## Step 4: Update Service Worker

Update the `public/firebase-messaging-sw.js` file with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Open the browser console
3. Look for FCM initialization logs
4. Send a test message in the chat
5. Check if notifications appear

## Features Implemented

✅ **FCM Token Management**: Save and manage user FCM tokens
✅ **Push Notifications**: Send notifications when messages are received
✅ **Background Notifications**: Handle notifications when app is not active
✅ **Notification Actions**: Click to open chat or close notification
✅ **Token Cleanup**: Remove invalid tokens automatically
✅ **Multi-platform Support**: Support for web, Android, and iOS

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

## Testing

1. **Permission Request**: The app will request notification permission on first load
2. **Token Generation**: FCM tokens are automatically generated and saved
3. **Message Notifications**: When a message is sent, the recipient gets a push notification
4. **Background Notifications**: Notifications work even when the app is not active
5. **Click Actions**: Clicking notifications opens the chat

## Troubleshooting

- **No notifications**: Check browser console for errors
- **Permission denied**: User needs to manually enable notifications in browser settings
- **Token errors**: Check Firebase configuration and environment variables
- **Service worker issues**: Ensure the service worker file is accessible at `/firebase-messaging-sw.js`

