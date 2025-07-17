require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Use the same token as the main bot
const token = '8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU';
const bot = new TelegramBot(token);

async function testBot() {
  try {
    console.log('🧪 Testing Telegram Bot...');
    
    // Get bot info
    const botInfo = await bot.getMe();
    console.log('✅ Bot Info:', botInfo);
    
    console.log('\n📋 Test Instructions:');
    console.log('1. Open Telegram');
    console.log('2. Search for @PlaseraBot');
    console.log('3. Click "Start" or send /start');
    console.log('4. Check the bot.js terminal for logs');
    console.log('\n🔗 Or use this deep link with a test shopper ID:');
    console.log('https://t.me/PlaseraBot?start=test-shopper-123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBot(); 