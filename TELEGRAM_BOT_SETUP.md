# Telegram Bot Integration for Plasera

This document explains how to set up and use the Telegram bot integration for the Plasera grocery app.

## Overview

The Telegram bot allows shoppers to:
- Connect their Telegram account to receive notifications
- Get instructions for managing their online/offline status
- Receive order notifications and updates

## Features

### ✅ Implemented
- **Account Connection**: Shoppers can connect their Telegram account using a unique shopper ID
- **Session-Based Status**: Online/offline status is managed through the web interface (not via Telegram commands)
- **Today's Summary**: View today's orders, earnings, and hourly chart
- **Weekly Summary**: View this week's orders, earnings, and daily chart
- **Monthly Summary**: View this month's orders, earnings, and weekly chart
- **Available Orders**: View orders not picked up for 40+ minutes with web dashboard button
- **Order Notifications**: Shoppers receive notifications about new orders and updates
- **Help System**: Built-in help commands and user guidance

### 🔄 How It Works

1. **Connection Process**:
   - Shopper clicks "Connect Telegram" in the web dashboard
   - A unique shopper ID is generated/retrieved
   - Telegram opens with a deep link containing the shopper ID
   - Bot receives the `/start [shopperId]` command and stores the Telegram chat ID

2. **Status Management**:
   - Online/offline status is managed through the web interface
   - Telegram commands provide instructions but don't change database status
   - This ensures location tracking and session state remain synchronized

3. **Notifications**:
   - System can send notifications to connected shoppers
   - Notifications include order details, updates, and important alerts

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Connect your account (without shopper ID) |
| `/start [shopperId]` | Connect with specific shopper ID |
| `/online` | Get instructions to go online via web interface |
| `/offline` | Get instructions to go offline via web interface |
| `/today` | View today's orders, earnings, and chart |
| `/week` | View this week's orders, earnings, and daily chart |
| `/month` | View this month's orders, earnings, and weekly chart |
| `/orders` | View available orders (not picked up for 40+ minutes) |
| `/help` | Show all available commands |
| `/status` | Check your current connection status |

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
API_BASE_URL=http://localhost:3000

# For production (Vercel)
TELEGRAM_BOT_TOKEN=your_bot_token_here
API_BASE_URL=https://your-domain.vercel.app
```

### 2. Install Dependencies

```bash
npm install node-telegram-bot-api
# or
yarn add node-telegram-bot-api
```

### 3. Database Schema

Ensure your `shoppers` table has the following fields:

```sql
CREATE TABLE shoppers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  transport_mode VARCHAR(50),
  telegram_id VARCHAR(50), -- NEW: Store Telegram chat ID
  status VARCHAR(20) DEFAULT 'offline',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Local Development

#### Start the Bot

```bash
# Start the bot with polling (for local development)
node bot.js
```

#### Start the Full Stack

```bash
# Start Next.js development server
yarn dev

# In another terminal, start the bot
node bot.js
```

### 5. Production Deployment (Vercel)

#### Webhook Setup

1. Deploy your app to Vercel
2. Set up the webhook URL: `https://your-domain.vercel.app/api/telegram/webhook`
3. Update the bot configuration for webhook mode

#### Environment Variables

Set these in your Vercel dashboard:
- `TELEGRAM_BOT_TOKEN`
- `API_BASE_URL` (your Vercel domain)

## API Endpoints

### Bot-Specific Endpoints (No Authentication Required)

#### `POST /api/telegram/bot-update`

Handles bot operations without authentication:

```javascript
// Update Telegram ID
{
  "action": "update_telegram_id",
  "shopperId": "uuid",
  "telegramId": "chat_id"
}

// Get shopper by Telegram ID
{
  "action": "get_by_telegram_id", 
  "telegramId": "chat_id"
}
```

### User-Facing Endpoints (Authentication Required)

#### `POST /api/telegram/ensure-shopper`

Ensures a shopper record exists for the authenticated user:

```javascript
// Response
{
  "success": true,
  "shopper": {
    "id": "uuid",
    "full_name": "John Doe",
    "telegram_id": "chat_id"
  }
}
```

## Testing

### Test API Endpoints

```bash
# Test bot API
node test-bot-api.js

# Test shopper creation workflow
node test-shopper-creation.js

# Test today's earnings API
node test-today-command.js

# Test week's earnings API
node test-week-command.js

# Test month's earnings API
node test-month-command.js

# Test available orders API
node test-orders-command.js

# Test bot commands
node test-bot-commands.js
```

### Manual Testing

1. **Connection Test**:
   - Click "Connect Telegram" in the web dashboard
   - Verify the bot receives the `/start [shopperId]` command
   - Check that the `telegram_id` is saved in the database

2. **Status Instructions Test**:
   - Send `/online` to the bot
   - Verify it provides instructions to use the web interface
   - Send `/offline` to the bot
   - Verify it provides instructions to use the web interface

3. **Today's Summary Test**:
   - Send `/today` to the bot
   - Verify it shows today's earnings, order count, and chart
   - Check that the hourly chart displays correctly

4. **Weekly Summary Test**:
   - Send `/week` to the bot
   - Verify it shows this week's earnings, order count, and daily chart
   - Check that the daily chart displays correctly

5. **Monthly Summary Test**:
   - Send `/month` to the bot
   - Verify it shows this month's earnings, order count, and weekly chart
   - Check that the weekly chart displays correctly

6. **Available Orders Test**:
   - Send `/orders` to the bot
   - Verify it shows available orders (40+ minutes old)
   - Check that the web dashboard button appears
   - Test clicking the button to go to the web interface

7. **Help Test**:
   - Send `/help` to the bot
   - Verify all commands are listed correctly

## Troubleshooting

### Common Issues

1. **Bot Not Responding**:
   - Check if the bot is running: `ps aux | grep bot.js`
   - Verify the bot token is correct
   - Check for error messages in the bot console

2. **Database Connection Issues**:
   - Verify Hasura is running and accessible
   - Check environment variables for database connection
   - Test API endpoints manually

3. **Webhook Issues (Production)**:
   - Verify webhook URL is correct and accessible
   - Check Vercel function logs
   - Ensure HTTPS is properly configured

### Debug Commands

```bash
# Check bot status
ps aux | grep bot.js

# View bot logs
tail -f logs/bot.log

# Test API connectivity
curl -X POST http://localhost:3000/api/telegram/bot-update \
  -H "Content-Type: application/json" \
  -d '{"action":"get_by_telegram_id","telegramId":"test"}'
```

## Security Considerations

1. **Bot Token Security**: Never commit bot tokens to version control
2. **API Security**: Bot endpoints don't require authentication but should be rate-limited
3. **Data Privacy**: Telegram chat IDs are stored securely and only used for notifications
4. **Session Management**: Online/offline status is managed through secure web sessions

## Future Enhancements

- [ ] Push notifications for new orders
- [ ] Order status updates via Telegram
- [ ] Earnings notifications
- [ ] Chat support integration
- [ ] Multi-language support
- [ ] Advanced notification preferences

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the bot logs for error messages
3. Test individual components using the provided test scripts
4. Verify database connectivity and API endpoints 