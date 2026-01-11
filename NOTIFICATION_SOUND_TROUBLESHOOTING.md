# Notification Sound Troubleshooting Guide

## Issue: Notification Shows But No Sound Plays

If you're seeing notifications but not hearing any sound, follow these steps:

## ✅ Quick Checklist

### 1. **Browser Permissions**
- [ ] Notifications are allowed for the site
- [ ] Site is not muted in browser settings
- [ ] Sound is not blocked by browser

**How to check (Chrome/Edge):**
1. Click the padlock/info icon in address bar
2. Check "Notifications" permission
3. Ensure "Sound" is not muted

### 2. **System Settings**

**Windows:**
1. Settings → System → Notifications
2. Check "Get notifications from apps and other senders" is ON
3. Check notification sounds are enabled
4. Check your app/browser is allowed notifications

**Mac:**
1. System Preferences → Notifications
2. Find your browser (Chrome/Firefox/Edge)
3. Ensure "Allow Notifications" is checked
4. Check "Play sound for notifications" is enabled

**Linux:**
1. System Settings → Notifications
2. Ensure notifications and sounds are enabled

### 3. **Volume Settings**
- [ ] System volume is not at 0%
- [ ] System is not muted
- [ ] "Do Not Disturb" mode is OFF

### 4. **Browser-Specific Issues**

**Chrome/Edge:**
```
chrome://settings/content/notifications
```
- Check site is in "Allowed" list
- Not in "Muted" list

**Firefox:**
```
about:preferences#privacy
```
- Scroll to "Permissions" → Notifications
- Check your site is allowed

**Safari:**
- Safari → Preferences → Websites → Notifications
- Check permission for your site

## 🔧 Advanced Troubleshooting

### Check Browser Console Logs

1. Open DevTools (F12)
2. Go to Console tab
3. Look for these messages when notification arrives:
   ```
   🔔 [Service Worker] Notification options:
   {
     silent: false,
     renotify: true,
     requireInteraction: false
   }
   ✅ [Service Worker] Notification shown successfully
   ```

### Verify Notification Configuration

The notification MUST have these settings for sound:
```javascript
{
  silent: false,      // CRITICAL: Must be false
  renotify: true,     // CRITICAL: Allows repeated sounds
  requireInteraction: false  // Recommended for better system behavior
}
```

### Test System Notifications

Test if your system can play notification sounds at all:

**Windows:**
- Settings → System → Notifications → Test notification sound

**Mac:**
- Send a test notification from another app (Messages, Mail)

**Linux:**
- Run: `notify-send "Test" "Testing notification sound"`

## 🐛 Common Issues & Solutions

### Issue 1: "Silent" is True
**Problem:** Code sets `silent: true` somewhere
**Solution:** Check service worker and client code, ensure `silent: false`

### Issue 2: Browser Autoplay Policy
**Problem:** Browser blocks sound until user interaction
**Solution:** Click anywhere on the page first, then test notification

### Issue 3: Duplicate Tag
**Problem:** Using same tag prevents sound on similar notifications
**Solution:** Use unique tags with timestamp: `tag: 'fcm-${Date.now()}'`

### Issue 4: Missing renotify
**Problem:** `renotify: false` or missing
**Solution:** Add `renotify: true` to notification options

### Issue 5: Do Not Disturb Mode
**Problem:** System DND blocks notification sounds
**Solution:** Disable DND or configure exceptions

## 🧪 Testing Steps

1. **Test with another site:**
   - Visit https://tests.peter.sh/notification-generator/
   - Generate a test notification
   - If this plays sound, issue is with your app config
   - If this doesn't play sound, issue is with system/browser

2. **Test with Chrome DevTools:**
   ```javascript
   // In console, run:
   Notification.requestPermission().then(() => {
     new Notification("Test", {
       body: "Testing sound",
       silent: false,
       renotify: true,
       tag: 'test-' + Date.now()
     });
   });
   ```

3. **Check Service Worker:**
   - Chrome DevTools → Application → Service Workers
   - Check if service worker is active
   - Click "Update" to reload service worker

4. **Hard Refresh:**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)
   - This ensures latest service worker is loaded

## 📝 Current Configuration

Our notifications are configured as:

**Service Worker (Background):**
```javascript
{
  silent: false,
  renotify: true,
  requireInteraction: false,
  vibrate: [200, 100, 200, 100, 200],
  tag: `fcm-${type}-${Date.now()}`
}
```

**Client (Foreground):**
```javascript
registration.showNotification(title, {
  silent: false,
  renotify: true,
  requireInteraction: false,
  vibrate: [200, 100, 200],
  tag: `fcm-${type}-${Date.now()}`
});
```

## 🎯 Expected Behavior

When working correctly:
1. ✅ Notification appears on screen
2. ✅ System notification sound plays
3. ✅ Device vibrates (mobile)
4. ✅ Notification appears in system notification center
5. ✅ Action buttons are clickable

## 🆘 Still Not Working?

If you've tried everything above and sound still doesn't play:

1. **Try a different browser** - Test in Chrome, Firefox, Edge
2. **Test on different device** - Mobile vs Desktop
3. **Check browser console** for errors
4. **Check service worker console** (DevTools → Application → Service Workers → Console)
5. **Restart browser completely**
6. **Restart system** (to clear any audio service issues)

## 📞 Browser-Specific Sound Requirements

### Chrome/Edge (Chromium)
- Uses system notification sound by default
- Requires `silent: false`
- Supports `renotify: true`
- ✅ Best support

### Firefox
- Uses custom notification sound on some systems
- Requires `silent: false`
- Limited `renotify` support on some platforms
- ✅ Good support

### Safari
- Uses macOS notification sound only
- Limited configuration options
- ⚠️ Some restrictions

## 🔍 Debug Commands

Run these in browser console to check notification support:

```javascript
// Check if notifications are supported
console.log("Notification support:", "Notification" in window);

// Check permission
console.log("Permission:", Notification.permission);

// Check service worker
navigator.serviceWorker.ready.then(reg => {
  console.log("Service Worker ready:", reg.active?.state);
});

// Test notification with sound
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    new Notification("Debug Test", {
      body: "If you hear this, sound works!",
      silent: false,
      tag: 'debug-' + Date.now(),
      renotify: true
    });
  }
});
```

## 📚 References

- [MDN: Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- [MDN: ServiceWorkerRegistration.showNotification()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)
