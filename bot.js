require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Try to get token from environment, fallback to direct token for testing
let token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.log('⚠️  TELEGRAM_BOT_TOKEN not found in environment variables');
  console.log('Using direct token for testing...');
  token = '8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU';
}

const bot = new TelegramBot(token, { polling: true });

// API base URL (for local development)
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

console.log('🤖 Telegram Bot is starting...');
console.log('📝 Listening for /start messages...');
console.log('🔗 API Base URL:', API_BASE_URL);

/**
 * Update shopper's Telegram ID in database
 */
async function updateShopperTelegramId(shopperId, telegramId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_telegram_id',
        shopperId,
        telegramId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Database updated: Shopper ${shopperId} -> Telegram ${telegramId}`);
      return true;
    } else {
      console.error(`❌ Database update failed:`, result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    return false;
  }
}



/**
 * Get shopper by Telegram ID
 */
async function getShopperByTelegramId(telegramId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_by_telegram_id',
        telegramId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return result.shopper;
    } else {
      console.error(`❌ Failed to get shopper:`, result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting shopper:', error.message);
    return null;
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'NoUsername';
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
  const userId = msg.from.id;

  console.log('✅ /start received!');
  console.log('👤 User Info:');
  console.log(`   Name: ${name}`);
  console.log(`   Username: @${username}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Chat ID: ${chatId}`);
  console.log('---');

  // Check if user is already connected
  const existingShopper = await getShopperByTelegramId(chatId.toString());
  
  if (existingShopper) {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nYou're already connected to PlaseraBot!\n\nYour Chat ID: ${chatId}\nShopper: ${existingShopper.full_name}\nStatus: ${existingShopper.status}\n\nUse /online or /offline to update your status.`
    );
  } else {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nYou're now connected to PlaseraBot!\n\nYour Chat ID: ${chatId}\n\nTo complete the connection, please use the link from your shopper dashboard.`
    );
  }
});

bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'NoUsername';
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
  const userId = msg.from.id;
  const shopperId = match[1]; // This is the shopper ID from the deep link

  console.log('✅ /start with shopper ID received!');
  console.log('👤 User Info:');
  console.log(`   Name: ${name}`);
  console.log(`   Username: @${username}`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Chat ID: ${chatId}`);
  console.log(`   Shopper ID: ${shopperId}`);
  console.log('---');

  // Update database with Telegram connection
  const dbUpdateSuccess = await updateShopperTelegramId(shopperId, chatId.toString());

  if (dbUpdateSuccess) {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nYou're now connected to PlaseraBot!\n\nYour Chat ID: ${chatId}\nShopper ID: ${shopperId}\n\nThis connection will be used to send you order notifications.\n\nUse /online or /offline to update your status.`
    );
  } else {
    await bot.sendMessage(
      chatId, 
      `Hi ${name}! 🎉\n\nThere was an issue connecting your account. Please try again or contact support.\n\nYour Chat ID: ${chatId}\nShopper ID: ${shopperId}`
    );
  }
});

// Handle online/offline status updates (session-based, not database)
bot.onText(/\/online/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`🟢 /online command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    // Instead of updating database, we'll send a message that the user should use the web interface
    await bot.sendMessage(
      chatId,
      `🟢 ${name}, to go ONLINE, please use the "Start Plas" button in your shopper dashboard.\n\n` +
      `The online/offline status is managed through your web session, not through Telegram commands.\n\n` +
      `This ensures your location and session state are properly synchronized.`
    );
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

bot.onText(/\/offline/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  console.log(`🔴 /offline command from chat ${chatId}`);

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    // Instead of updating database, we'll send a message that the user should use the web interface
    await bot.sendMessage(
      chatId,
      `🔴 ${name}, to go OFFLINE, please use the "Go Offline" button in your shopper dashboard.\n\n` +
      `The online/offline status is managed through your web session, not through Telegram commands.\n\n` +
      `This ensures your location and session state are properly synchronized.`
    );
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `🤖 PlaseraBot Commands:\n\n` +
    `/start - Connect your account\n` +
    `/start [shopperId] - Connect with shopper ID\n` +
    `/online - Get instructions to go online\n` +
    `/offline - Get instructions to go offline\n` +
    `/status - Check your current status\n` +
    `/help - Show this help message`
  );
});

// Handle status check
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const name = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

  const shopper = await getShopperByTelegramId(chatId.toString());
  
  if (shopper) {
    await bot.sendMessage(
      chatId,
      `📊 ${name}, your status:\n\n` +
      `🆔 Shopper ID: ${shopper.id}\n` +
      `📝 Name: ${shopper.full_name}\n` +
      `📱 Status: ${shopper.status}\n` +
      `🚗 Transport: ${shopper.transport_mode}\n` +
      `📍 Location: ${shopper.address}`
    );
  } else {
    await bot.sendMessage(
      chatId,
      `❌ You're not connected as a shopper. Please use /start to connect your account first.`
    );
  }
});

// Handle errors
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});

console.log('✅ Bot is ready! Send /start to @PlaseraBot to test.');
console.log('📊 Database integration: ENABLED');
console.log('🔄 Status updates: ENABLED'); 