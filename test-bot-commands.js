const TelegramBot = require('node-telegram-bot-api');

// Test bot token (you can use the same one for testing)
const token = '8108990584:AAEYZ6mqRIAxYCPdT8Ax74k7Fuglzy4kKsU';
const bot = new TelegramBot(token, { polling: false }); // No polling for testing

async function testBotCommands() {
  console.log('🧪 Testing Bot Commands...\n');

  const testChatId = '7871631863'; // Your Telegram chat ID

  try {
    // Test 1: /online command
    console.log('1️⃣ Testing /online command...');
    await bot.sendMessage(testChatId, '/online');
    console.log('✅ /online command sent\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: /offline command
    console.log('2️⃣ Testing /offline command...');
    await bot.sendMessage(testChatId, '/offline');
    console.log('✅ /offline command sent\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: /help command
    console.log('3️⃣ Testing /help command...');
    await bot.sendMessage(testChatId, '/help');
    console.log('✅ /help command sent\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: /today command
    console.log('4️⃣ Testing /today command...');
    await bot.sendMessage(testChatId, '/today');
    console.log('✅ /today command sent\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 5: /week command
    console.log('5️⃣ Testing /week command...');
    await bot.sendMessage(testChatId, '/week');
    console.log('✅ /week command sent\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 6: /month command
    console.log('6️⃣ Testing /month command...');
    await bot.sendMessage(testChatId, '/month');
    console.log('✅ /month command sent\n');

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 7: /orders command
    console.log('7️⃣ Testing /orders command...');
    await bot.sendMessage(testChatId, '/orders');
    console.log('✅ /orders command sent\n');

    console.log('🎉 All test commands sent! Check your Telegram for responses.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBotCommands(); 