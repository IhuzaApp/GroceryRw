# React StrictMode and Development Behavior

## Overview

The application has **React StrictMode enabled** in `next.config.js`:

```javascript
reactStrictMode: true,
```

This is a good practice for catching bugs, but it causes some expected behavior in **development only**.

## What is StrictMode?

React StrictMode is a development-only mode that:
- ✅ Helps identify potential problems
- ✅ Activates additional checks and warnings
- ✅ **Intentionally double-invokes effects** to catch side effects
- ✅ Does NOT affect production builds

## Expected Development Behavior

### 1. Duplicate Console Logs

You may see doubled logs in development:

```javascript
// Development (with StrictMode):
🔧 NotificationSystem mounted { componentId: "abc123" }
🔧 NotificationSystem mounted { componentId: "abc123" }  // ← Duplicate (expected)

// Production (without StrictMode):
🔧 NotificationSystem mounted { componentId: "abc123" }  // ← Only once
```

### 2. Effects Run Twice

All `useEffect` hooks run **twice** in development:

```typescript
useEffect(() => {
  console.log("This will log twice in development");
  // Effect runs
  
  return () => {
    console.log("Cleanup also runs twice");
  };
}, []);
```

### 3. Why This is Good

StrictMode helps catch issues like:
- Memory leaks (missing cleanup)
- Side effects in render
- Unsafe lifecycle usage
- Outdated APIs

### 4. What We Did to Handle It

#### Protected Against Duplicate Initialization

```typescript
// If already running, don't restart
if (checkInterval.current) {
  console.log("⚠️ Notification system already running, skipping restart", {
    message: "This is normal in development (React StrictMode causes double effects)",
  });
  return;
}
```

#### Only Log on Actual Changes

```typescript
// Only update and log if status actually changed
if (online !== isOnline) {
  setIsOnline(online);
  console.log("👤 FCM: Shopper online status changed:", {
    wasOnline: isOnline,
    isNowOnline: online,
  });
}
```

#### Track Active Instances

```typescript
// Detect actual duplicates (not just StrictMode)
if (instances.size > 1) {
  console.error("⚠️ DUPLICATE NotificationSystem DETECTED!", {
    activeInstances: Array.from(instances),
  });
}
```

## Production vs Development

### Development (with StrictMode)
- ✅ Effects run twice
- ✅ More console logs
- ✅ Better bug detection
- ✅ Slower (intentionally)
- ⚠️ May see duplicate initialization attempts (protected against)

### Production (without StrictMode)
- ✅ Effects run once
- ✅ Cleaner console
- ✅ No extra checks
- ✅ Faster
- ✅ No duplicate logs

## Common Questions

### Q: Why am I seeing duplicate API calls in development?

**A:** If you see ACTUAL duplicate calls (not just StrictMode):
1. Check the console for "⚠️ DUPLICATE NotificationSystem DETECTED"
2. Look for multiple "componentId" values
3. Make sure NotificationSystem is only imported once

If you only see double effects from same component ID, that's normal StrictMode behavior.

### Q: Should I disable StrictMode?

**A:** No! Keep it enabled. Benefits:
- ✅ Catches bugs early
- ✅ Prepares for future React features
- ✅ No impact on production
- ✅ Industry best practice

### Q: How do I test without StrictMode?

**A:** Temporarily disable in `next.config.js`:

```javascript
module.exports = {
  reactStrictMode: false, // Only for testing!
};
```

**Remember to re-enable it!**

### Q: Is this causing performance issues?

**A:** Only in development, and that's intentional. Production is not affected.

## Debugging Tips

### Check for Real Duplicates

Look for this error:
```
⚠️ DUPLICATE NotificationSystem DETECTED!
```

If you see this, you have a real problem (not just StrictMode).

### Verify Single Instance

Check that `__notificationSystemInstances.size` is 1:

```javascript
// In browser console:
window.__notificationSystemInstances
// Should have exactly 1 entry
```

### Production Testing

Build and run production to test without StrictMode:

```bash
npm run build
npm run start
```

## References

- [React StrictMode Documentation](https://react.dev/reference/react/StrictMode)
- [Why Effects Run Twice](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)
- [Next.js StrictMode](https://nextjs.org/docs/app/api-reference/next-config-js/reactStrictMode)

## Summary

✅ **StrictMode is good** - keep it enabled  
✅ **Duplicate logs in development are normal** - expected behavior  
✅ **Production is not affected** - no duplicates  
✅ **We've protected against real duplicates** - will show error if detected  
✅ **All safeguards are in place** - lock mechanisms prevent issues
