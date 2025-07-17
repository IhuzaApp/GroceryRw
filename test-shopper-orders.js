const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

async function testShopperOrders() {
  console.log('🧪 Testing Shopper Orders Debug...\n');

  // Test data
  const testShopperId = '067a1b10-f886-4d15-921f-0b27b440800c';

  try {
    // First, let's check what shopper data we get
    console.log('1️⃣ Testing shopper data...');
    const shopperResponse = await fetch(`${API_BASE_URL}/api/telegram/bot-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_by_telegram_id',
        telegramId: '7871631863'
      })
    });

    const shopperResult = await shopperResponse.json();
    console.log('Shopper data:', JSON.stringify(shopperResult, null, 2));

    if (shopperResult.success && shopperResult.shopper) {
      const shopper = shopperResult.shopper;
      console.log(`\n📊 Shopper Info:`);
      console.log(`   ID: ${shopper.id}`);
      console.log(`   User ID: ${shopper.user_id}`);
      console.log(`   Name: ${shopper.full_name}`);
      console.log(`   Status: ${shopper.status}`);

      // Now let's test the week earnings with this shopper ID
      console.log('\n2️⃣ Testing week earnings with shopper ID...');
      const weekResponse = await fetch(`${API_BASE_URL}/api/telegram/week-earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopperId: shopper.id
        })
      });

      const weekResult = await weekResponse.json();
      console.log('Week result:', JSON.stringify(weekResult, null, 2));

      // Let's also test with the user_id to see if that works
      console.log('\n3️⃣ Testing week earnings with user ID...');
      const weekUserResponse = await fetch(`${API_BASE_URL}/api/telegram/week-earnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopperId: shopper.user_id
        })
      });

      const weekUserResult = await weekUserResponse.json();
      console.log('Week result (with user_id):', JSON.stringify(weekUserResult, null, 2));

    } else {
      console.log('❌ No shopper found');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testShopperOrders(); 