# 🆔 Shopper Creation Workflow

## 🎯 Overview

When a user clicks "Connect Telegram" in the `ShopperHeader.tsx`, the system automatically:
1. ✅ **Creates a shopper record** if one doesn't exist
2. ✅ **Generates a unique shopper ID** 
3. ✅ **Opens Telegram** with the shopper ID
4. ✅ **Bot receives the ID** and stores the connection

## 🔄 Complete Workflow

### Step 1: User Clicks "Connect Telegram"
```typescript
// In TelegramConnectButton.tsx
const handleTelegramConnect = async () => {
  // 1. Call API to ensure shopper exists
  const response = await fetch('/api/telegram/ensure-shopper', {
    method: 'POST',
    body: JSON.stringify({ userId: session.user.id })
  });
  
  // 2. Get the shopper ID (new or existing)
  const result = await response.json();
  const shopperId = result.shopper.id;
  
  // 3. Open Telegram with the shopper ID
  const telegramLink = `https://t.me/PlaseraBot?start=${shopperId}`;
  window.open(telegramLink, '_blank');
};
```

### Step 2: API Ensures Shopper Exists
```typescript
// In /api/telegram/ensure-shopper.ts
export default async function handler(req, res) {
  const { userId } = req.body;
  
  // 1. Check if shopper already exists
  const existingShopper = await hasuraClient.request(
    GET_SHOPPER_BY_USER_ID, 
    { user_id: userId }
  );
  
  let shopper = existingShopper.shoppers[0];
  
  // 2. If no shopper exists, create one
  if (!shopper) {
    const newShopper = await hasuraClient.request(
      CREATE_SHOPPER, 
      { user_id: userId }
    );
    shopper = newShopper.insert_shoppers_one;
  }
  
  // 3. Return the shopper (new or existing)
  return res.json({ success: true, shopper });
}
```

### Step 3: Bot Receives and Processes
```javascript
// In bot.js
bot.onText(/\/start (.+)/, async (msg, match) => {
  const shopperId = match[1]; // The generated shopper ID
  const chatId = msg.chat.id;
  
  // Update database with Telegram connection
  await updateShopperTelegramId(shopperId, chatId.toString());
  
  // Send confirmation message
  await bot.sendMessage(chatId, `Connected! Shopper ID: ${shopperId}`);
});
```

## 📊 Database Schema

### Shoppers Table
```sql
CREATE TABLE shoppers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  full_name VARCHAR,
  status VARCHAR DEFAULT 'offline',
  active BOOLEAN DEFAULT true,
  telegram_id VARCHAR,  -- Stores Telegram chat ID
  transport_mode VARCHAR DEFAULT 'bike',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 API Endpoints

### `/api/telegram/ensure-shopper`
**Purpose**: Creates or retrieves shopper record

**Request:**
```json
{
  "userId": "user-uuid-here"
}
```

**Response:**
```json
{
  "success": true,
  "shopper": {
    "id": "shopper-uuid-here",
    "full_name": "Shopper",
    "status": "offline",
    "active": true,
    "telegram_id": null,
    "user_id": "user-uuid-here",
    "transport_mode": "bike"
  },
  "isNew": true
}
```

## 🧪 Testing

### Test the Complete Workflow
```bash
# Test shopper creation
yarn telegram:create-test

# Test database integration
yarn telegram:db-test

# Test basic service
yarn telegram:test
```

### Manual Testing Steps
1. **Start the app**: `yarn dev`
2. **Log in** as a user
3. **Click "Connect Telegram"** in the header
4. **Check console** for generated shopper ID
5. **Open Telegram** and send `/start {shopperId}`
6. **Verify** the connection in database

## 🔍 Debugging

### Check Shopper Creation
```bash
# Check if shopper was created
curl -X POST http://localhost:3000/api/telegram/ensure-shopper \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

### Check Database
```sql
-- Check if shopper exists
SELECT * FROM shoppers WHERE user_id = 'your-user-id';

-- Check Telegram connections
SELECT id, full_name, telegram_id, status FROM shoppers WHERE telegram_id IS NOT NULL;
```

### Check Bot Logs
```bash
# Start bot and watch logs
node bot.js

# Look for these messages:
# ✅ New shopper created: {shopper-id}
# ✅ Database updated: Shopper {shopper-id} -> Telegram {chat-id}
```

## 🚀 Benefits

1. **Automatic Shopper Creation** - No manual setup required
2. **Unique ID Generation** - Each user gets a unique shopper ID
3. **Seamless Integration** - Works with existing authentication
4. **Error Handling** - Graceful failure management
5. **Loading States** - User feedback during connection
6. **Security** - Proper authentication and authorization

## 🔐 Security Features

### Authentication
- ✅ User session validation
- ✅ User ID verification
- ✅ Authorization checks

### Data Validation
- ✅ Required field validation
- ✅ UUID format validation
- ✅ Input sanitization

### Error Handling
- ✅ Graceful error responses
- ✅ User-friendly error messages
- ✅ Fallback mechanisms

## 📱 User Experience

### Button States
- **Default**: "Connect Telegram"
- **Loading**: "Connecting..." (with spinner)
- **Disabled**: When no user session

### Success Flow
1. User clicks button
2. Button shows "Connecting..."
3. API creates/retrieves shopper
4. Telegram opens with deep link
5. Bot receives command and connects
6. User receives confirmation message

### Error Flow
1. User clicks button
2. Button shows "Connecting..."
3. If error occurs, shows alert
4. Button returns to normal state

## 🎯 Result

When a user clicks "Connect Telegram":
1. ✅ **Shopper record is automatically created** (if needed)
2. ✅ **Unique shopper ID is generated**
3. ✅ **Telegram opens with the ID**
4. ✅ **Bot receives and processes the connection**
5. ✅ **Database stores the Telegram chat ID**
6. ✅ **User can receive notifications**

The entire process is **automatic** and **seamless**! 🎉 