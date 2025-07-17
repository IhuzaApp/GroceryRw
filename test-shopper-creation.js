// Test script for shopper creation workflow
const fetch = require('node-fetch');

async function testShopperCreation() {
  console.log('🧪 Testing Shopper Creation Workflow...');
  
  try {
    // Test 1: Ensure shopper exists (this would normally be called from the frontend)
    console.log('\n📝 Test 1: Ensuring shopper exists...');
    
    // Note: This would normally be called with proper authentication
    // For testing, we'll simulate the API call
    const testUserId = 'test-user-id'; // Replace with actual user ID
    
    const response = await fetch('http://localhost:3000/api/telegram/ensure-shopper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Shopper ensured successfully!');
        console.log('📊 Shopper Details:', {
          id: result.shopper.id,
          name: result.shopper.full_name,
          status: result.shopper.status,
          isNew: result.isNew
        });
        
        // Test 2: Generate Telegram link
        console.log('\n🔗 Test 2: Generating Telegram link...');
        const telegramLink = `https://t.me/PlaseraBot?start=${result.shopper.id}`;
        console.log('📱 Telegram Link:', telegramLink);
        
        // Test 3: Simulate bot receiving the command
        console.log('\n🤖 Test 3: Simulating bot receiving /start command...');
        console.log(`Bot would receive: /start ${result.shopper.id}`);
        console.log('This would trigger the database update in bot.js');
        
      } else {
        console.log('❌ Failed to ensure shopper:', result.error);
      }
    } else {
      console.log('❌ API request failed:', response.status, response.statusText);
    }
    
    console.log('\n✅ Shopper creation workflow test completed!');
    console.log('\n📋 To test with real data:');
    console.log('1. Start your Next.js app: yarn dev');
    console.log('2. Log in as a user');
    console.log('3. Click "Connect Telegram" in the header');
    console.log('4. Check the console for the generated shopper ID');
    console.log('5. Use that ID to test the bot: /start {shopperId}');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testShopperCreation(); 