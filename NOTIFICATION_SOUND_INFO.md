# FCM Notification System

## Overview
The FCM notification system uses **native device/system notifications** for both foreground and background scenarios. All notifications look and behave exactly like native system notifications from other apps (WhatsApp, Messenger, etc.).

## How It Works

### 1. **Foreground Notifications** (when app is open)
   - Uses Service Worker's `showNotification()` API
   - Native system notification UI and sound
   - System-controlled vibration
   - Appears in system notification center

### 2. **Background Notifications** (when app is closed/minimized)
   - Uses Service Worker's `showNotification()` API
   - Native system notification UI and sound
   - System-controlled vibration
   - Appears in system notification center

### Key Benefits
   - ✅ **Native look & feel** - Matches system notifications exactly
   - ✅ **System sounds** - Uses device's default notification sound
   - ✅ **Notification history** - Appears in system notification center
   - ✅ **Better battery** - No custom audio playback needed
   - ✅ **Consistent UX** - Same experience as other apps

## Sound Behavior

Notifications use the **device's system notification sound**, which is controlled by:
- System settings (Windows/Mac/Android/iOS)
- Browser notification settings
- "Do Not Disturb" mode

### No custom sounds needed!
The system automatically:
- ✅ Plays the default notification sound
- ✅ Respects user's sound preferences
- ✅ Works with Do Not Disturb mode
- ✅ Uses appropriate volume levels

### To change the notification sound:
Users can change it in their:
- **Windows**: Settings → System → Notifications
- **Mac**: System Preferences → Notifications
- **Android**: Settings → Apps → Notifications
- **iOS**: Settings → Notifications

## Browser Compatibility

### Desktop
- ✅ Chrome/Edge: Full support with sound
- ✅ Firefox: Full support with sound
- ✅ Safari: System notification sound only
- ⚠️ Opera: System notification sound only

### Mobile
- ✅ Android Chrome: Full support
- ⚠️ iOS Safari: Limited (iOS restrictions)
- ✅ Android Firefox: Full support

## Troubleshooting

### Notifications not appearing?

1. **Check browser permissions:**
   - Ensure notification permissions are granted
   - Go to browser settings and check site permissions

2. **Check system settings:**
   - Ensure system notifications are enabled
   - Check "Do Not Disturb" is off (if you want sound)

3. **Check browser notification settings:**
   - Some browsers have per-site notification settings
   - Verify the site is not blocked

### Sound not playing?

1. **Check system volume:**
   - Ensure system volume is not muted
   - Check notification volume specifically (if separate)

2. **Check "Do Not Disturb" mode:**
   - Disable DND mode if sound is desired
   - Or configure DND to allow certain notifications

3. **Browser notification settings:**
   - Some browsers allow muting specific site notifications
   - Check browser settings → Notifications

### Testing

To test notifications with sound:
1. Open the app in your browser
2. Ensure notifications are enabled
3. Have someone send you a message or wait for a new order
4. You should hear the sound and see the notification

## Technical Details

### Notification Options
```javascript
{
  silent: false,              // Enables system sound
  requireInteraction: false,  // Auto-dismiss per system settings
  vibrate: [200, 100, 200],   // System vibration pattern
  renotify: true,             // Allows sound on duplicate notifications
  badge: "/assets/logos/PlasIcon.png",  // App icon badge
  icon: "/assets/logos/PlasIcon.png",   // Notification icon
}
```

### Service Worker API
```javascript
// Both foreground and background notifications use this
registration.showNotification(title, options);
```

## Notes

- All notifications use native system notifications (both foreground and background)
- Sound is controlled by device/OS settings, not by the app
- Notifications appear in the system notification center
- Users can customize sound, vibration, and behavior in system settings
- Respects system "Do Not Disturb" mode
- Better battery life - no custom audio playback
- Consistent with other apps on the device
