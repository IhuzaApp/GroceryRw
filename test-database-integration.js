// Test script for database integration with Telegram bot
const TelegramService = require('./src/lib/telegramService.ts');

async function testDatabaseIntegration() {
  console.log('🧪 Testing Database Integration...');
  
  try {
    // Test 1: Get shopper by Telegram ID
    console.log('\n📝 Test 1: Getting shopper by Telegram ID...');
    const testTelegramId = '7871631863'; // Replace with actual Telegram ID from bot logs
    
    const shopper = await TelegramService.getShopperByTelegramId(testTelegramId);
    
    if (shopper) {
      console.log('✅ Shopper found:', {
        id: shopper.id,
        name: shopper.full_name,
        status: shopper.status,
        telegramId: shopper.telegram_id
      });
    } else {
      console.log('❌ No shopper found for Telegram ID:', testTelegramId);
    }
    
    // Test 2: Send message to shopper (if found)
    if (shopper) {
      console.log('\n📱 Test 2: Sending test message to shopper...');
      
      const messageResult = await TelegramService.sendMessageToShopper(
        shopper.id,
        '🧪 This is a test message from the database integration test!'
      );
      
      console.log('Message result:', messageResult ? '✅ Sent' : '❌ Failed');
      
      // Test 3: Send order notification
      console.log('\n🛒 Test 3: Sending order notification...');
      
      const orderResult = await TelegramService.sendOrderNotification(shopper.id, {
        orderId: "TEST-123",
        shopName: "Test Shop",
        total: 29.99,
        status: "Assigned"
      });
      
      console.log('Order notification result:', orderResult ? '✅ Sent' : '❌ Failed');
      
      // Test 4: Send status update
      console.log('\n📱 Test 4: Sending status update...');
      
      const statusResult = await TelegramService.sendStatusUpdate(shopper.id, 'online');
      
      console.log('Status update result:', statusResult ? '✅ Sent' : '❌ Failed');
    }
    
    console.log('\n✅ All database integration tests completed!');
    console.log('\n📋 To test with real data:');
    console.log('1. Start the bot: node bot.js');
    console.log('2. Send /start to @PlaseraBot with a shopper ID');
    console.log('3. Update the testTelegramId variable with the actual chat ID');
    console.log('4. Run this test again');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseIntegration(); 