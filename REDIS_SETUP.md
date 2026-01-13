# 🔴 Redis Setup - Quick Guide

## ✅ Add to your `.env` file:

```bash
REDIS_URL=redis://default:toaOhhMEuhIkVJjPZVWERT8qJq353A6c@redis-15805.c245.us-east-1-3.ec2.cloud.redislabs.com:15805
```

That's it! Just **one line** in your `.env` file.

## 🧪 Test the Connection

```bash
node scripts/test-redis.js
```

Expected output:

```
✅ Connected!
✅ PING response: PONG (5ms)
✅ SET/GET working
✅ Location storage working
🎉 All Redis tests passed!
```

## 🚀 Restart Your Dev Server

```bash
npm run dev
```

You should see:

```
✅ Redis connected successfully
```

## 📖 Connection String Format

```
redis://[username]:[password]@[host]:[port]
```

- **Protocol:** `redis://` (no TLS) or `rediss://` (with TLS)
- **Username:** Usually `default` for Redis Cloud
- **Password:** From your Redis Cloud dashboard
- **Host:** Your Redis Cloud hostname
- **Port:** Usually 15805 or similar

## ⚠️ Important Notes

1. **Use `redis://`** (not `rediss://`) - Your Redis Cloud instance doesn't use TLS
2. The password is visible in `.env` - **never commit** `.env` to git
3. Redis is **optional** - the app works in degraded mode without it

## 🔧 Troubleshooting

### "WRONGPASS" Error

→ Password is incorrect. Get the correct password from Redis Cloud dashboard.

### "Connection timeout"

→ Check if the host and port are correct.

### "SSL/TLS error"

→ Make sure you're using `redis://` (not `rediss://`)

## ✨ What Redis Does

When Redis is connected:

- ✅ Stores shopper GPS locations (TTL: 45 seconds)
- ✅ Tracks online status in real-time
- ✅ Enables distance-based order assignment
- ✅ Logs offer skip events for debugging

When Redis is unavailable:

- ⚠️ App falls back to client-provided location
- ⚠️ Still works, just without real-time location tracking
