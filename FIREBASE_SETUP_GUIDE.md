# Firebase Push Notifications Setup Guide

## Current Status
✅ Chat messaging is working  
✅ Sound notifications are working  
❌ Push notifications are disabled (missing Firebase credentials)

## To Enable Push Notifications

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Cloud Messaging in the project

### Step 2: Generate Service Account Key
1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file

### Step 3: Add Environment Variables
Add these to your `.env.local` file:

```bash
# Firebase Admin SDK Credentials (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### Step 4: Get VAPID Key
1. Go to Project Settings → Cloud Messaging
2. Generate a new key pair for Web Push
3. Copy the key and add it to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`

### Step 5: Update Service Worker
Update `public/firebase-messaging-sw.js` with your Firebase config:

```javascript
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
```

### Step 6: Test Notifications
1. Restart your development server
2. Send a message in chat
3. Check browser console for FCM success messages
4. Check if push notifications appear

## Current Working Features
- ✅ Real-time chat messaging
- ✅ Sound notifications for new messages
- ✅ Message history and persistence
- ✅ User authentication and authorization
- ✅ Mobile-responsive design

## What's Missing
- ❌ Push notifications (requires Firebase setup)
- ❌ Background notifications when app is closed

## Troubleshooting
- If you see "Firebase credentials not found" - you need to add the environment variables
- If you see "Permission denied" - check browser notification permissions
- If you see "VAPID key missing" - add the VAPID key to your environment variables
