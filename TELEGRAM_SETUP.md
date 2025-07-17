# Telegram Bot Integration Setup

## 🎯 Overview

This setup allows shoppers to connect their Telegram accounts to receive real-time notifications about orders, deliveries, and earnings.

## ✅ What's Been Set Up

### 1. Telegram Bot Test (`bot.js`)
- **Status**: ✅ Running
- **Purpose**: Listens for `/start` messages and logs user information
- **Bot Token**: `8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU`
- **Bot Username**: `@PlaseraBot`

### 2. Telegram Connect Button Component (`TelegramConnectButton.tsx`)
- **Status**: ✅ Created
- **Purpose**: Reusable button component for connecting Telegram
- **Features**: Configurable size, variant, and styling

### 3. API Endpoint (`pages/api/telegram/connect.ts`)
- **Status**: ✅ Created
- **Purpose**: Handles storing shopper ID to chat ID mappings
- **Security**: Validates user authentication and authorization

### 4. Telegram Service (`src/lib/telegramService.ts`)
- **Status**: ✅ Created
- **Purpose**: Sends various types of notifications to shoppers
- **Features**: Order notifications, delivery updates, earnings updates

## 🧪 Testing Instructions

### Step 1: Verify Bot is Running
```bash
# Check if bot is running
ps aux | grep "node bot.js"

# If not running, start it:
node bot.js
```

### Step 2: Test Basic Connection
1. Open Telegram
2. Search for `@PlaseraBot`
3. Click "Start" or send `/start`
4. Check the terminal running `bot.js` for logs

### Step 3: Test Deep Link with Shopper ID
1. Use this link: `https://t.me/PlaseraBot?start=test-shopper-123`
2. The bot should receive the shopper ID and log it
3. You should receive a confirmation message

### Step 4: Test API Integration
```bash
# Test the API endpoint (replace with actual shopper ID and chat ID)
curl -X POST http://localhost:3000/api/telegram/connect \
  -H "Content-Type: application/json" \
  -d '{"chatId": "123456789", "shopperId": "test-shopper-123"}'
```

## 🔧 How It Works

### 1. Shopper Clicks "Connect Telegram"
- Button opens: `https://t.me/PlaseraBot?start={shopperId}`
- Telegram opens with the bot and sends `/start {shopperId}`

### 2. Bot Receives the Command
- `bot.js` listens for `/start` messages
- Extracts shopper ID from the command
- Logs user information (name, chat ID, shopper ID)

### 3. Store the Connection
- In production, save `shopperId -> chatId` mapping to database
- Currently using in-memory Map for testing

### 4. Send Notifications
- Use `TelegramService` to send messages
- Supports order notifications, delivery updates, earnings updates

## 📱 Usage Examples

### Send Order Notification
```typescript
import TelegramService from '@/lib/telegramService';

await TelegramService.sendOrderNotification(chatId, {
  orderId: "ORD-123",
  shopName: "Fresh Market",
  total: 45.99,
  status: "Assigned"
});
```

### Send Delivery Update
```typescript
await TelegramService.sendDeliveryUpdate(chatId, {
  orderId: "ORD-123",
  status: "Out for delivery",
  estimatedTime: "15-20 minutes"
});
```

### Send Earnings Notification
```typescript
await TelegramService.sendEarningsNotification(chatId, {
  amount: 125.50,
  period: "This week",
  orderCount: 8
});
```

## 🚀 Next Steps

### 1. Database Integration
- Create a `telegram_connections` table
- Store `shopper_id`, `chat_id`, `created_at`, `is_active`

### 2. Production Bot
- Move bot logic to a proper service
- Add error handling and retry logic
- Implement webhook instead of polling

### 3. Notification Triggers
- Integrate with order status changes
- Add earnings calculation triggers
- Implement delivery time updates

### 4. Security Enhancements
- Validate shopper ID format
- Add rate limiting
- Implement connection verification

## 🔍 Troubleshooting

### Bot Not Responding
- Check if `bot.js` is running
- Verify bot token is correct
- Check internet connection

### API Errors
- Verify user is authenticated
- Check shopper ID matches session
- Ensure all required fields are provided

### Message Not Sending
- Verify chat ID is correct
- Check bot has permission to send messages
- Ensure message format is valid

## 📞 Support

If you encounter issues:
1. Check the `bot.js` terminal for error logs
2. Verify the bot token is valid
3. Test with the provided test scripts
4. Check Telegram bot settings in @BotFather 