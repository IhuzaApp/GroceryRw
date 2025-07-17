# 🤖 Automatic Telegram Bot Integration

## 🎯 Overview

This setup provides **automatic Telegram bot integration** that works seamlessly with:
- ✅ **Local Development** (`yarn dev`)
- ✅ **Vercel Deployment** (Production)
- ✅ **No manual bot management needed**

## 🚀 Quick Start

### For Local Development

**Option 1: Start everything together**
```bash
yarn dev:full
```
This starts both Next.js and the Telegram bot automatically.

**Option 2: Start separately**
```bash
# Terminal 1: Start Next.js
yarn dev

# Terminal 2: Start Telegram bot (for testing)
node bot.js
```

### For Production (Vercel)

The bot automatically works via webhook when deployed to Vercel. No additional setup needed!

## 🔧 How It Works

### Local Development Mode
- Uses **polling** to receive messages
- Bot runs alongside Next.js
- Perfect for testing and development

### Production Mode (Vercel)
- Uses **webhook** to receive messages
- Bot runs as API endpoint: `/api/telegram/webhook`
- Automatically handles Telegram messages

## 📁 Files Created

### 1. **Webhook API** (`pages/api/telegram/webhook.ts`)
- Handles incoming Telegram messages
- Stores shopper-chat ID mappings
- Responds to `/start` commands

### 2. **Connections API** (`pages/api/telegram/connections.ts`)
- Retrieves stored connections
- Used by TelegramService

### 3. **Updated Service** (`src/lib/telegramService.ts`)
- Works with both local and production
- Sends messages by shopper ID
- Automatic chat ID lookup

### 4. **Setup Scripts**
- `scripts/setup-telegram-webhook.js` - Set webhook URL
- `scripts/dev-with-telegram.js` - Start dev environment
- `vercel.json` - Production configuration

## 🧪 Testing

### Test Local Development
```bash
# Start everything
yarn dev:full

# In another terminal, test the service
yarn telegram:test
```

### Test Production Webhook
```bash
# Set webhook URL (replace with your domain)
WEBHOOK_URL=https://your-app.vercel.app/api/telegram/webhook yarn telegram:setup
```

## 📱 Usage Examples

### Send Notification to Shopper
```typescript
import TelegramService from '@/lib/telegramService';

// Send order notification
await TelegramService.sendOrderNotification(shopperId, {
  orderId: "ORD-123",
  shopName: "Fresh Market",
  total: 45.99,
  status: "Assigned"
});

// Send delivery update
await TelegramService.sendDeliveryUpdate(shopperId, {
  orderId: "ORD-123",
  status: "Out for delivery",
  estimatedTime: "15-20 minutes"
});

// Send earnings notification
await TelegramService.sendEarningsNotification(shopperId, {
  amount: 125.50,
  period: "This week",
  orderCount: 8
});
```

## 🔄 Environment Modes

### Development Mode
- **Bot**: Polling mode (`bot.js`)
- **Storage**: In-memory Map
- **Start**: `yarn dev:full` or `yarn dev` + `node bot.js`

### Production Mode
- **Bot**: Webhook mode (`/api/telegram/webhook`)
- **Storage**: In-memory Map (ready for database)
- **Start**: Automatic with Vercel deployment

## 🚀 Deployment Steps

### 1. Deploy to Vercel
```bash
vercel --prod
```

### 2. Set Webhook URL
```bash
# Replace with your actual domain
WEBHOOK_URL=https://your-app.vercel.app/api/telegram/webhook yarn telegram:setup
```

### 3. Test the Bot
- Go to `@PlaseraBot` on Telegram
- Send `/start` or use deep link: `https://t.me/PlaseraBot?start=test-shopper-123`

## 🔍 Troubleshooting

### Bot Not Responding (Local)
```bash
# Check if bot is running
ps aux | grep "node bot.js"

# Restart bot
node bot.js
```

### Bot Not Responding (Production)
```bash
# Check webhook status
curl https://api.telegram.org/bot8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU/getWebhookInfo

# Re-set webhook
yarn telegram:setup
```

### Messages Not Sending
```bash
# Test service
yarn telegram:test

# Check connections
curl http://localhost:3000/api/telegram/connections
```

## 📊 Monitoring

### Local Development
- Bot logs appear in terminal
- API logs in Next.js console
- Real-time message handling

### Production
- Vercel function logs
- Telegram webhook responses
- Error tracking via Vercel dashboard

## 🔐 Security

- ✅ User authentication required for API access
- ✅ Shopper ID validation
- ✅ Secure webhook handling
- ✅ Rate limiting (via Vercel)

## 🎉 Benefits

1. **Zero Manual Management** - Bot runs automatically
2. **Seamless Development** - Works locally and in production
3. **Scalable** - Ready for database integration
4. **Secure** - Proper authentication and validation
5. **Maintainable** - Clean separation of concerns

## 🚀 Next Steps

1. **Database Integration** - Replace in-memory storage
2. **Advanced Notifications** - Add more message types
3. **Analytics** - Track message delivery rates
4. **User Preferences** - Allow users to customize notifications

---

**🎯 Result**: Your Telegram bot now runs automatically with your Next.js app, both locally and on Vercel! 