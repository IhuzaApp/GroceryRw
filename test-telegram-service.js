// Test script for Telegram Service
const TelegramService = require('./src/lib/telegramService.ts');

async function testTelegramService() {
  console.log('🧪 Testing Telegram Service...');
  
  // Test chat ID (replace with actual chat ID from bot test)
  const testChatId = '123456789'; // Replace with actual chat ID
  
  try {
    // Test 1: Send simple message
    console.log('\n📝 Test 1: Sending simple message...');
    const result1 = await TelegramService.sendMessage(
      testChatId, 
      '🧪 This is a test message from PlaseraBot!'
    );
    console.log('Result:', result1 ? '✅ Success' : '❌ Failed');
    
    // Test 2: Send order notification
    console.log('\n🛒 Test 2: Sending order notification...');
    const result2 = await TelegramService.sendOrderNotification(testChatId, {
      orderId: "TEST-123",
      shopName: "Test Shop",
      total: 29.99,
      status: "Assigned"
    });
    console.log('Result:', result2 ? '✅ Success' : '❌ Failed');
    
    // Test 3: Send delivery update
    console.log('\n🚚 Test 3: Sending delivery update...');
    const result3 = await TelegramService.sendDeliveryUpdate(testChatId, {
      orderId: "TEST-123",
      status: "Out for delivery",
      estimatedTime: "10-15 minutes"
    });
    console.log('Result:', result3 ? '✅ Success' : '❌ Failed');
    
    // Test 4: Send earnings notification
    console.log('\n💰 Test 4: Sending earnings notification...');
    const result4 = await TelegramService.sendEarningsNotification(testChatId, {
      amount: 85.50,
      period: "Today",
      orderCount: 3
    });
    console.log('Result:', result4 ? '✅ Success' : '❌ Failed');
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 To get a real chat ID:');
    console.log('1. Send /start to @PlaseraBot');
    console.log('2. Check the bot.js terminal for the chat ID');
    console.log('3. Update the testChatId variable in this file');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTelegramService(); 