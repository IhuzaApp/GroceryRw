# 🗄️ Database Integration with Telegram Bot

## 🎯 Overview

This integration connects your Telegram bot directly to your database, allowing:
- ✅ **Automatic shopper registration** via Telegram
- ✅ **Real-time status updates** (online/offline)
- ✅ **Persistent connections** stored in database
- ✅ **Secure authentication** and authorization

## 📊 Database Schema

### Shoppers Table
Your existing `shoppers` table already includes:
```sql
telegram_id: String  -- Stores Telegram chat ID
status: String       -- Stores online/offline status
```

## 🔧 GraphQL Operations

### Mutations Created

#### 1. Update Shopper Telegram ID
```graphql
mutation UpdateShopperTelegramId($shopper_id: uuid!, $telegram_id: String!) {
  update_shoppers_by_pk(
    pk_columns: { id: $shopper_id }
    _set: { telegram_id: $telegram_id }
  ) {
    id
    telegram_id
    full_name
    status
    active
  }
}
```

#### 2. Update Shopper Status
```graphql
mutation UpdateShopperStatus($shopper_id: uuid!, $status: String!) {
  update_shoppers_by_pk(
    pk_columns: { id: $shopper_id }
    _set: { status: $status }
  ) {
    id
    status
    full_name
    telegram_id
  }
}
```

### Queries Created

#### 1. Get Shopper by Telegram ID
```graphql
query GetShopperByTelegramId($telegram_id: String!) {
  shoppers(where: { telegram_id: { _eq: $telegram_id } }) {
    id
    full_name
    status
    active
    telegram_id
    user_id
    phone_number
    address
    transport_mode
    created_at
    updated_at
  }
}
```

## 🚀 API Endpoints

### 1. Update Shopper (`/api/telegram/update-shopper`)

**Actions:**
- `update_telegram_id` - Store Telegram chat ID
- `update_status` - Update online/offline status
- `get_by_telegram_id` - Get shopper by Telegram ID

**Example Usage:**
```bash
# Update Telegram ID
curl -X POST http://localhost:3000/api/telegram/update-shopper \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_telegram_id",
    "shopperId": "36672ccc-5f44-465a-b2f6-7ff23f4f643f",
    "telegramId": "7871631863"
  }'

# Update Status
curl -X POST http://localhost:3000/api/telegram/update-shopper \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update_status",
    "shopperId": "36672ccc-5f44-465a-b2f6-7ff23f4f643f",
    "status": "online"
  }'
```

## 🤖 Enhanced Bot Commands

### New Commands Available

#### `/start [shopperId]`
- Connects shopper account to Telegram
- Updates database with Telegram chat ID
- Sends confirmation message

#### `/online`
- Sets shopper status to "online"
- Updates database
- Confirms status change

#### `/offline`
- Sets shopper status to "offline"
- Updates database
- Confirms status change

#### `/status`
- Shows current shopper information
- Displays ID, name, status, transport mode, location

#### `/help`
- Shows all available commands

## 📱 Enhanced Telegram Service

### New Methods

#### `getShopperByTelegramId(telegramId)`
```typescript
const shopper = await TelegramService.getShopperByTelegramId('7871631863');
```

#### `sendStatusUpdate(shopperId, status)`
```typescript
await TelegramService.sendStatusUpdate(shopperId, 'online');
```

#### `sendOrderAssignment(shopperId, orderDetails)`
```typescript
await TelegramService.sendOrderAssignment(shopperId, {
  orderId: "ORD-123",
  shopName: "Fresh Market",
  total: 45.99,
  pickupAddress: "123 Main St",
  deliveryAddress: "456 Oak Ave"
});
```

## 🧪 Testing

### Test Database Integration
```bash
# Test the complete database integration
yarn telegram:db-test
```

### Test Individual Components
```bash
# Test basic Telegram service
yarn telegram:test

# Test bot with database
node bot.js
```

## 🔄 Workflow

### 1. Shopper Connects via Telegram
```
Shopper clicks "Connect Telegram" 
→ Opens: https://t.me/PlaseraBot?start={shopperId}
→ Bot receives: /start {shopperId}
→ Bot updates database: shoppers.telegram_id = chatId
→ Bot sends confirmation message
```

### 2. Shopper Updates Status
```
Shopper sends: /online or /offline
→ Bot looks up shopper by telegram_id
→ Bot updates database: shoppers.status = "online"/"offline"
→ Bot sends confirmation message
```

### 3. System Sends Notifications
```
Order assigned to shopper
→ System looks up shopper.telegram_id
→ System sends message via Telegram API
→ Shopper receives notification
```

## 🔐 Security Features

### Authentication
- ✅ User session validation
- ✅ Shopper ID verification
- ✅ Authorization checks

### Data Validation
- ✅ Required field validation
- ✅ UUID format validation
- ✅ Status value validation

### Error Handling
- ✅ Graceful error responses
- ✅ Detailed error logging
- ✅ Fallback mechanisms

## 📊 Monitoring

### Database Logs
- Telegram ID updates
- Status changes
- Connection attempts

### Bot Logs
- Command processing
- Database operations
- Error handling

### API Logs
- Request/response tracking
- Authentication attempts
- Performance metrics

## 🚀 Deployment

### Local Development
```bash
# Start everything together
yarn dev:full

# Or start separately
yarn dev          # Next.js
node bot.js       # Telegram bot
```

### Production (Vercel)
```bash
# Deploy to Vercel
vercel --prod

# Set webhook URL
WEBHOOK_URL=https://your-app.vercel.app/api/telegram/webhook yarn telegram:setup
```

## 🔍 Troubleshooting

### Common Issues

#### Bot Not Updating Database
```bash
# Check API endpoint
curl -X POST http://localhost:3000/api/telegram/update-shopper \
  -H "Content-Type: application/json" \
  -d '{"action": "get_by_telegram_id", "telegramId": "test"}'
```

#### Database Connection Issues
```bash
# Check Hasura client
curl -X POST http://localhost:8080/v1/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { shoppers { id } }"}'
```

#### Authentication Errors
```bash
# Check session
curl -X GET http://localhost:3000/api/auth/session
```

## 🎉 Benefits

1. **Persistent Connections** - Telegram IDs stored in database
2. **Real-time Status** - Instant online/offline updates
3. **Secure Integration** - Proper authentication and validation
4. **Scalable Architecture** - Ready for production use
5. **Comprehensive Logging** - Full audit trail
6. **Error Handling** - Graceful failure management

## 🚀 Next Steps

1. **Add Real-time Updates** - WebSocket integration
2. **Advanced Notifications** - Custom message templates
3. **Analytics Dashboard** - Connection statistics
4. **Bulk Operations** - Mass status updates
5. **Backup System** - Connection data backup

---

**🎯 Result**: Your Telegram bot is now fully integrated with your database, providing persistent connections and real-time status updates! 